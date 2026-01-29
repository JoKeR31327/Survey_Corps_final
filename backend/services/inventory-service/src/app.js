const express = require("express");
const routes = require("./routes");
const taskRoutes = require("./routes/tasks.routes");
const health = require("./health/health.controller");
const errorHandler = require("./middlewares/error.middleware");

const app = express();
app.use(express.json());

// Root health check (Cloud Run friendly)
app.get("/health", health);

// Cloud Tasks entrypoints (root, not under /api)
app.use("/tasks", taskRoutes);

app.use("/api", routes);
app.use(errorHandler);

module.exports = app;
