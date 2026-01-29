const express = require("express");
const orderRoutes = require("./routes/order.routes");

const app = express();
app.use(express.json());

app.use("/api/orders", orderRoutes);

app.get("/health", (_, res) => res.send("OK"));

module.exports = app;
