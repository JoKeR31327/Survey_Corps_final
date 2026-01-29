module.exports = (err, req, res, _) => {
  console.error(err);
  res.status(400).json({ message: err.message || "Error" });
};
