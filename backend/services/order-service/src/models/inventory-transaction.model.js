const pool = require("../config/db");

exports.findByOrderId = async (orderId) =>
  (await pool.query(
    "SELECT * FROM inventory_transactions WHERE order_id=$1",
    [orderId]
  )).rows[0];
