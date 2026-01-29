const pool = require("../config/db");

module.exports = async (_, res) => {
  try {
    await pool.query("SELECT 1");
    await pool.query("SELECT 1 FROM inventory LIMIT 1");
    await pool.query("SELECT 1 FROM inventory_transactions LIMIT 1");
    res.json({ status: "UP", db: "OK" });
  } catch (err) {
    res.status(500).json({
      status: "DOWN",
      db: "ERROR",
      message: err.message
    });
  }
};
