const app = require("./app");
const { HTTP_PORT } = require("./config/env");

app.listen(HTTP_PORT, () => {
  console.log(`Order Service running on port ${HTTP_PORT}`);
});
