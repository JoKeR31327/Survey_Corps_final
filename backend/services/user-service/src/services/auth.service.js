const userModel = require("../models/user.model");
const { hashPassword, comparePassword } = require("../utils/crypto");
const { signToken } = require("../utils/jwt");
const { v4: uuidv4 } = require("uuid");

exports.register = async ({ email, password }) => {
  const passwordHash = await hashPassword(password);
  await userModel.createUser({
    id: uuidv4(),
    email,
    passwordHash
  });
};

exports.login = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) throw new Error("Invalid credentials");

  return signToken({ sub: user.id, email: user.email });
};
