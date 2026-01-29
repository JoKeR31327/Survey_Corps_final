exports.findAll = async () =>
  (await require("../config/db").query("SELECT * FROM inventory")).rows;

exports.findById = async (id) =>
  (await require("../config/db").query(
    "SELECT * FROM inventory WHERE product_id=$1", [id]
  )).rows[0];

exports.lockById = async (client, id) =>
  (await client.query(
    "SELECT * FROM inventory WHERE product_id=$1 FOR UPDATE", [id]
  )).rows[0];

exports.decrement = async (client, id, qty) =>
  client.query(
    "UPDATE inventory SET available_stock=available_stock-$1 WHERE product_id=$2",
    [qty, id]
  );
