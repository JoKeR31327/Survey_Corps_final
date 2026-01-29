const pool = require("../config/db");

exports.create = async ({ orderId, userId, productId, quantity, status }) => {
  await pool.query(
    `INSERT INTO orders (order_id, user_id, product_id, quantity, status)
     VALUES ($1, $2, $3, $4, $5)`,
    [orderId, userId, productId, quantity, status]
  );
};

exports.updateStatus = async (orderId, status) => {
  await pool.query(
    `UPDATE orders SET status = $1 WHERE order_id = $2`,
    [status, orderId]
  );
};

exports.findByUser = async (userId) => {
  const { rows } = await pool.query(
    `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
};
