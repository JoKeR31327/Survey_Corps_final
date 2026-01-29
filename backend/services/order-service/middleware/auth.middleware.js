const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_PUBLIC_KEY);
    req.user = { id: payload.sub };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
