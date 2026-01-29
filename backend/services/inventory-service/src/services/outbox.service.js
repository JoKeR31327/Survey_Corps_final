const outboxModel = require("../models/outbox.model");
const { ORDER_SERVICE_URL, ORDER_CALLBACK_SECRET, OUTBOX_RETRY_MS, OUTBOX_MAX_ATTEMPTS } = require("../config/env");

const sendCallback = async (orderId, status) => {
  if (!ORDER_SERVICE_URL || !ORDER_CALLBACK_SECRET) {
    throw new Error("Missing ORDER_SERVICE_URL or ORDER_CALLBACK_SECRET");
  }

  const response = await fetch(`${ORDER_SERVICE_URL}/api/orders/${orderId}/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-callback-token": ORDER_CALLBACK_SECRET
    },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Callback failed: ${response.status} ${text}`);
  }
};

exports.enqueue = async (client, orderId, status) =>
  outboxModel.create(client, { orderId, orderStatus: status });

exports.processOnce = async ({ limit = 25 } = {}) => {
  const client = await outboxModel.pool.connect();
  try {
    await client.query("BEGIN");
    const events = await outboxModel.fetchDue(client, OUTBOX_MAX_ATTEMPTS, limit);

    for (const event of events) {
      try {
        await sendCallback(event.order_id, event.order_status);
        await outboxModel.markDelivered(client, event.id);
      } catch (err) {
        await outboxModel.markFailed(client, event.id, err.message, OUTBOX_RETRY_MS);
      }
    }

    await client.query("COMMIT");
    return events.length;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.startWorker = ({ intervalMs = OUTBOX_RETRY_MS } = {}) => {
  const tick = async () => {
    try {
      await exports.processOnce();
    } catch (err) {
      console.error("Outbox worker error", err);
    }
  };

  tick();
  return setInterval(tick, intervalMs);
};
