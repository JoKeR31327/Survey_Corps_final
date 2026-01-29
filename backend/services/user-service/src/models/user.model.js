const pool = require("../config/db");

exports.createUser = async ({ id, email, passwordHash }) => {
  await pool.query(
    "INSERT INTO users (id, email, password_hash) VALUES ($1,$2,$3)",
    [id, email, passwordHash]
  );
};

exports.findByEmail = async (email) => {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return rows[0];
};
