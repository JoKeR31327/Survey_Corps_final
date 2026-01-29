const pool = require("../config/db");

exports.create = async (client, data) =>
  client.query(
    "INSERT INTO inventory_outbox (order_id, order_status) VALUES ($1,$2)",
    [data.orderId, data.orderStatus]
  );

exports.fetchDue = async (client, maxAttempts, limit) =>
  (await client.query(
    `SELECT * FROM inventory_outbox
     WHERE delivered_at IS NULL
       AND next_retry_at <= NOW()
       AND attempts < $1
     ORDER BY id
     LIMIT $2
     FOR UPDATE SKIP LOCKED`,
    [maxAttempts, limit]
  )).rows;

exports.markDelivered = async (client, id) =>
  client.query(
    "UPDATE inventory_outbox SET delivered_at=NOW(), last_error=NULL WHERE id=$1",
    [id]
  );

exports.markFailed = async (client, id, errorMessage, retryMs) =>
  client.query(
    "UPDATE inventory_outbox SET attempts=attempts+1, last_error=$2, next_retry_at=NOW() + ($3 || ' milliseconds')::interval WHERE id=$1",
    [id, errorMessage, retryMs]
  );

exports.pool = pool;
