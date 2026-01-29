import { useEffect, useState } from "react";
import Header from "../components/Header";
import { apiRequest } from "../api/client";
import { INVENTORY_API, ORDER_API, USER_API } from "../api/config";

const SERVICES = [
  { key: "user", name: "User Service", url: `${USER_API}/health` },
  { key: "order", name: "Order Service", url: `${ORDER_API}/health` },
  { key: "inventory", name: "Inventory Service", url: `${INVENTORY_API}/health` }
];

export default function Health({ go, back }) {
  const [status, setStatus] = useState("loading");
  const [results, setResults] = useState([]);

  const load = async () => {
    setStatus("loading");
    const out = [];
    for (const svc of SERVICES) {
      try {
        const data = await apiRequest(svc.url);
        out.push({
          ...svc,
          ok: true,
          details: data
        });
      } catch (err) {
        out.push({
          ...svc,
          ok: false,
          details: { message: err.message }
        });
      }
    }
    setResults(out);
    setStatus("ready");
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header go={go} back={back} />
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>🩺 Service Health</h2>
          <button className="secondary-btn" onClick={load} disabled={status === "loading"}>
            {status === "loading" ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {status === "loading" && (
          <div className="empty-state">
            <h3>Checking services…</h3>
          </div>
        )}

        {status === "ready" && (
          <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
            {results.map((svc) => (
              <div key={svc.key} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ marginBottom: "6px" }}>{svc.name}</h3>
                    <p style={{ color: "#7f8c8d", fontSize: "12px" }}>{svc.url}</p>
                  </div>
                  <span className={`status-pill ${svc.ok ? "status-up" : "status-down"}`}>
                    {svc.ok ? "UP" : "DOWN"}
                  </span>
                </div>
                <pre style={{ marginTop: "12px", background: "#f8f9fb", padding: "12px", borderRadius: "8px", overflowX: "auto" }}>
                  {JSON.stringify(svc.details, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
