const axios = require("axios");
const { INVENTORY_HTTP_URL } = require("../config/env");

exports.getProducts = async (_, res, next) => {
  try {
    const { data } = await axios.get(`${INVENTORY_HTTP_URL}/api/products`);
    res.json(data);
  } catch (e) {
    res.status(503).json({ message: "Products unavailable" });
  }
};
