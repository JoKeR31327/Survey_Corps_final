const pool = require("../config/db");

exports.find = async (orderId) =>
  (await pool.query(
    "SELECT * FROM inventory_transactions WHERE order_id=$1",
    [orderId]
  )).rows[0];

exports.create = async (client, data) =>
  client.query(
    "INSERT INTO inventory_transactions VALUES ($1,$2,$3,$4,NOW())",
    [data.orderId, data.productId, data.quantity, data.status]
  );
