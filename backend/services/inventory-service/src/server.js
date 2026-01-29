const app = require("./app");
const { HTTP_PORT } = require("./config/env");

app.listen(HTTP_PORT, () =>
  console.log(`Inventory HTTP running on ${HTTP_PORT}`)
);
