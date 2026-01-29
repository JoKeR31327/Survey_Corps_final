import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import { apiRequest, authRequest } from "../api/client";
import { INVENTORY_API, ORDER_API, USER_API } from "../api/config";
import { getToken } from "../utils/storage";

const SERVICES = [
  { key: "user", name: "User Service", url: `${USER_API}/health`, logName: "user-service" },
  { key: "order", name: "Order Service", url: `${ORDER_API}/health`, logName: "order-service" },
  { key: "inventory", name: "Inventory Service", url: `${INVENTORY_API}/health`, logName: "inventory-service" }
];

const LOGS_URL = (serviceName) =>
  `https://console.cloud.google.com/logs/query?project=warehouse-485805&query=${encodeURIComponent(
    `resource.type="cloud_run_revision"\nresource.labels.service_name="${serviceName}"`
  )}`;

export default function Dashboard({ go, back }) {
  const [samples, setSamples] = useState({});
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState({});

  const recordSample = (key, latencyMs, ok) => {
    setSamples((prev) => {
      const now = Date.now();
      const next = { ...(prev[key] || []), [now]: latencyMs };
      const trimmed = Object.entries(next)
        .filter(([ts]) => now - Number(ts) <= 30000)
        .reduce((acc, [ts, val]) => ({ ...acc, [ts]: val }), {});
      return { ...prev, [key]: trimmed };
    });
    setStatuses((prev) => ({ ...prev, [key]: ok ? "UP" : "DOWN" }));
  };

  const avgLatency = (key) => {
    const data = samples[key] || {};
    const values = Object.values(data);
    if (values.length === 0) return null;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all(
      SERVICES.map(async (svc) => {
        const start = performance.now();
        try {
          await apiRequest(svc.url);
          const latency = Math.round(performance.now() - start);
          recordSample(svc.key, latency, true);
        } catch {
          const latency = Math.round(performance.now() - start);
          recordSample(svc.key, latency, false);
        }
      })
    );
    setLoading(false);
  };

  const fetchLogs = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await authRequest(`${ORDER_API}/api/monitor/logs?limit=20`, token);
      setLogs(data);
    } catch {
      setLogs({});
    }
  };

  useEffect(() => {
    fetchAll();
    fetchLogs();
    const id = setInterval(fetchAll, 5000);
    const logId = setInterval(fetchLogs, 10000);
    return () => {
      clearInterval(id);
      clearInterval(logId);
    };
  }, []);

  const cards = useMemo(
    () =>
      SERVICES.map((svc) => {
        const avg = avgLatency(svc.key);
        const isSlow = avg !== null && avg > 1000;
        return {
          ...svc,
          avg,
          isSlow,
          status: statuses[svc.key] || "UNKNOWN"
        };
      }),
    [samples, statuses]
  );

  const sparkline = (key) => {
    const data = samples[key] || {};
    const points = Object.entries(data)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([, v]) => v);
    if (points.length === 0) return "";
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const width = 160;
    const height = 40;
    return points
      .map((v, i) => {
        const x = (i / Math.max(points.length - 1, 1)) * width;
        const y = height - ((v - min) / Math.max(max - min, 1)) * height;
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header go={go} back={back} isAdmin />
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>📈 Monitoring Dashboard</h2>
          <button className="secondary-btn" onClick={fetchAll} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
          {cards.map((svc) => (
            <div key={svc.key} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ marginBottom: "6px" }}>{svc.name}</h3>
                  <p style={{ color: "#7f8c8d", fontSize: "12px" }}>{svc.url}</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span className={`status-pill ${svc.status === "UP" ? "status-up" : "status-down"}`}>
                    {svc.status}
                  </span>
                  <span className={`status-pill ${svc.isSlow ? "status-failed" : "status-confirmed"}`}>
                    {svc.avg === null ? "—" : `${svc.avg} ms`}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: "12px" }}>
                <svg width="160" height="40" className="sparkline">
                  <polyline
                    fill="none"
                    stroke="#667eea"
                    strokeWidth="2"
                    points={sparkline(svc.key)}
                  />
                </svg>
              </div>
              <div style={{ marginTop: "12px", display: "flex", gap: "12px" }}>
                <a
                  className="secondary-btn"
                  href={LOGS_URL(svc.logName)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Logs
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: "24px" }}>
          <h3 style={{ marginBottom: "10px" }}>📜 Cloud Run Logs (latest)</h3>
          <div className="log-panel">
            {Object.keys(logs).length === 0 ? (
              <p style={{ color: "#7f8c8d" }}>Log in to view logs.</p>
            ) : (
              <ul>
                {Object.entries(logs).flatMap(([svc, entries]) =>
                  entries.map((entry, idx) => (
                    <li key={`${svc}-${idx}`}>
                      [{new Date(entry.timestamp).toLocaleTimeString()}] {svc} • {entry.severity || "INFO"} • {entry.text || JSON.stringify(entry.json)}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>

        <p style={{ marginTop: "20px", color: "#7f8c8d" }}>
          Alert rule: turns red when average response time is over 1000ms in the last 30 seconds.
        </p>
      </div>
    </div>
  );
}
