const { fetchServiceLogs } = require("../services/logging.service");

const SERVICES = ["order-service", "inventory-service", "user-service"];

exports.getLogs = async (req, res) => {
  const { service, limit } = req.query;
  const limitNum = Number(limit) || 20;

  const list = service ? [service] : SERVICES;
  const payload = {};

  for (const svc of list) {
    payload[svc] = await fetchServiceLogs(svc, limitNum);
  }

  res.json(payload);
};
