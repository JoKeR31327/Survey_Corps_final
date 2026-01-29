const inventoryModel = require("../models/inventory.model");
const transactionModel = require("../models/transaction.model");
const outboxService = require("./outbox.service");
const chaos = require("./chaos.service");
const pool = require("../config/db");
const { CHAOS_POST_COMMIT_FAIL, CHAOS_FAIL_MODULO } = require("../config/env");

exports.getProducts = () => inventoryModel.findAll();
exports.getProduct = (id) => inventoryModel.findById(id);

exports.reserveStock = async ({ orderId, productId, quantity }) => {
  await chaos.maybeDelay(orderId);

  const existing = await transactionModel.find(orderId);
  if (existing)
    return { success: existing.status === "SUCCESS", replay: true };

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const product = await inventoryModel.lockById(client, productId);
    if (!product || product.available_stock < quantity) {
      await transactionModel.create(client, {
        orderId, productId, quantity, status: "FAILED"
      });
      await outboxService.enqueue(client, orderId, "FAILED");
      await client.query("COMMIT");
      if (CHAOS_POST_COMMIT_FAIL) {
        const orderNum = Number(orderId.replace(/\D/g, "")) || 0;
        if (orderNum % CHAOS_FAIL_MODULO === 0) {
          throw new Error("Simulated post-commit crash");
        }
      }
      return { success: false };
    }

    await inventoryModel.decrement(client, productId, quantity);
    await transactionModel.create(client, {
      orderId, productId, quantity, status: "SUCCESS"
    });
    await outboxService.enqueue(client, orderId, "CONFIRMED");

    await client.query("COMMIT");
    if (CHAOS_POST_COMMIT_FAIL) {
      const orderNum = Number(orderId.replace(/\D/g, "")) || 0;
      if (orderNum % CHAOS_FAIL_MODULO === 0) {
        throw new Error("Simulated post-commit crash");
      }
    }
    return { success: true };

  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};
