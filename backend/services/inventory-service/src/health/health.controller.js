const pool = require("../config/db");

module.exports = async (_, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "UP" });
  } catch {
    res.status(500).json({ status: "DOWN" });
  }
};
