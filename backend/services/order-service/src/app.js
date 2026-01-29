const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const health = require("./health/health.controller");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

// Root health check (Cloud Run friendly)
app.get("/health", health);

app.use("/api", routes);
app.use(errorHandler);

module.exports = app;
