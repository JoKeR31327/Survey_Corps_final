const app = require("./app");
const { HTTP_PORT } = require("./config/env");

app.listen(HTTP_PORT, () => {
  console.log(`User Service running on port ${HTTP_PORT}`);
});
