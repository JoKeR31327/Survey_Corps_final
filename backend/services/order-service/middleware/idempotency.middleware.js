const pool = require("../config/db");

module.exports = async (req, res, next) => {
  const key = req.headers["idempotency-key"];
  if (!key) return res.status(400).json({ error: "Missing Idempotency-Key" });

  const existing = await pool.query(
    "SELECT id FROM orders WHERE idempotency_key=$1",
    [key]
  );

  if (existing.rows.length) {
    return res.status(200).json({
      orderId: existing.rows[0].id,
      message: "Duplicate request – order already created"
    });
  }

  req.idempotencyKey = key;
  next();
};
