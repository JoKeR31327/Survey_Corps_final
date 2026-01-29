import { useEffect, useState } from "react";
import Header from "../components/Header";
import { apiRequest } from "../api/client";
import { INVENTORY_API } from "../api/config";

export default function Admin({ go, back }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setStatus("loading");
      setError("");
      try {
        const data = await apiRequest(`${INVENTORY_API}/api/products`);
        setProducts(data);
        setStatus("ready");
      } catch (err) {
        setError(err.message || "Failed to load inventory");
        setStatus("error");
      }
    };
    load();
  }, []);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header go={go} back={back} isAdmin={true} />
      <div className="container">
        <h2>⚙️ Admin Dashboard</h2>

        <div style={{ marginBottom: "20px" }}>
          <p style={{ color: "#7f8c8d" }}>
            Inventory is read-only in this demo.
          </p>
        </div>

        <div>
          <h3 style={{ marginBottom: "20px", fontSize: "20px" }}>
            📊 Product Inventory
          </h3>
          {status === "loading" && (
            <div className="empty-state">
              <p>Loading inventory…</p>
            </div>
          )}
          {status === "error" && (
            <div className="empty-state">
              <p>{error}</p>
            </div>
          )}
          {status === "ready" && products.length === 0 ? (
            <div className="empty-state">
              <p>No products yet. Add your first product above!</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "20px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f0f2f5",
                      borderBottom: "2px solid #e0e6ed",
                    }}
                  >
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                      }}
                    >
                      Product Name
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        fontWeight: "600",
                      }}
                    >
                      Quantity
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        fontWeight: "600",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.product_id}
                      style={{
                        borderBottom: "1px solid #e0e6ed",
                        transition: "background-color 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f8f9fb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <td style={{ padding: "12px" }}>
                        {product.product_name}
                        <div style={{ color: "#7f8c8d", fontSize: "12px" }}>
                          {product.product_id}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: "600",
                        }}
                      >
                        {product.available_stock}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        —
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
