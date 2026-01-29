const pool = require("../config/db");
const { v4: uuid } = require("uuid");
const STATES = require("../domain/order.state");

exports.createOrder = async ({ userId, idempotencyKey }) => {
  const id = uuid();

  await pool.query(
    `INSERT INTO orders (id, user_id, status, idempotency_key)
     VALUES ($1,$2,$3,$4)`,
    [id, userId, STATES.CREATED, idempotencyKey]
  );

  return { id, status: STATES.CREATED };
};

exports.getOrder = async (id) => {
  const result = await pool.query(
    "SELECT * FROM orders WHERE id=$1",
    [id]
  );
  return result.rows[0];
};
