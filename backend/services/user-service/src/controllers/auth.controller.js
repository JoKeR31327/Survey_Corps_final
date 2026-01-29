const authService = require("../services/auth.service");

exports.register = async (req, res, next) => {
  try {
    await authService.register(req.body);
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const token = await authService.login(req.body);
    res.json({ token });
  } catch (err) {
    next(err);
  }
};
