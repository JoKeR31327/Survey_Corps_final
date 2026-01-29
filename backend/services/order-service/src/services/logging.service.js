const { Logging } = require("@google-cloud/logging");
const { PROJECT_ID } = require("../config/env");

const logging = new Logging({ projectId: PROJECT_ID });

const buildFilter = (serviceName) =>
  `resource.type="cloud_run_revision" AND resource.labels.service_name="${serviceName}"`;

exports.fetchServiceLogs = async (serviceName, limit = 20) => {
  const [entries] = await logging.getEntries({
    filter: buildFilter(serviceName),
    orderBy: "timestamp desc",
    pageSize: limit
  });

  return entries.map((entry) => {
    const data = entry.data || {};
    return {
      timestamp: entry.metadata?.timestamp || null,
      severity: entry.metadata?.severity || null,
      text: data.message || entry.metadata?.textPayload || data.textPayload || null,
      json: data.jsonPayload || null
    };
  });
};
