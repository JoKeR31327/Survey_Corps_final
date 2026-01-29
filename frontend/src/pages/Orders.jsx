import { useEffect, useState } from "react";
import Header from "../components/Header";
import { authRequest } from "../api/client";
import { ORDER_API } from "../api/config";
import { getToken } from "../utils/storage";

export default function Orders({ go }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const token = getToken();
      if (!token) {
        setStatus("unauth");
        return;
      }
      setStatus("loading");
      setError("");
      try {
        const data = await authRequest(`${ORDER_API}/api/orders`, token);
        setOrders(data);
        setStatus("ready");
      } catch (err) {
        setError(err.message || "Failed to load orders");
        setStatus("error");
      }
    };
    load();
  }, []);
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header go={go} />
      <div className="container">
        <h2>📋 Order History</h2>

        {status === "unauth" && (
          <div className="empty-state">
            <h3>Please log in</h3>
            <p>Log in to view your orders.</p>
            <button
              onClick={() => go("login")}
              className="primary-btn"
              style={{ maxWidth: "300px", margin: "20px auto 0" }}
            >
              Login
            </button>
          </div>
        )}
        {status === "loading" && (
          <div className="empty-state">
            <h3>Loading orders…</h3>
          </div>
        )}
        {status === "error" && (
          <div className="empty-state">
            <h3>Failed to load orders</h3>
            <p>{error}</p>
          </div>
        )}
        {status === "ready" && orders.length === 0 && (
          <div className="empty-state">
            <h3>No orders yet</h3>
            <p>Your completed orders will appear here.</p>
            <button
              onClick={() => go("main")}
              className="primary-btn"
              style={{ maxWidth: "300px", margin: "20px auto 0" }}
            >
              Start Shopping
            </button>
          </div>
        )}
        {status === "ready" && orders.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f0f2f5" }}>
                  <th style={{ padding: "12px", textAlign: "left" }}>Order ID</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Product</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Qty</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.order_id} style={{ borderBottom: "1px solid #e0e6ed" }}>
                    <td style={{ padding: "12px" }}>{o.order_id}</td>
                    <td style={{ padding: "12px" }}>{o.product_id}</td>
                    <td style={{ padding: "12px" }}>{o.quantity}</td>
                    <td style={{ padding: "12px" }}>{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
