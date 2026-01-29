import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import { apiRequest } from "../api/client";
import { INVENTORY_API } from "../api/config";
import { addToCart } from "../utils/storage";

export default function Main({ go }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    const load = async () => {
      setStatus("loading");
      setError("");
      try {
        const data = await apiRequest(`${INVENTORY_API}/api/products`);
        setProducts(data);
        setStatus("ready");
      } catch (err) {
        setError(err.message || "Failed to load products");
        setStatus("error");
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.product_name?.toLowerCase().includes(q) ||
        p.product_id?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header go={go} />
      <div className="container">
        <h2>📦 Products Catalog</h2>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by product name, ID, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="primary-btn">
            🔍 Search
          </button>
        </form>

        {status === "loading" && (
          <div className="empty-state">
            <h3>Loading products…</h3>
          </div>
        )}
        {status === "error" && (
          <div className="empty-state">
            <h3>Failed to load products</h3>
            <p>{error}</p>
          </div>
        )}
        {status === "ready" && filtered.length === 0 && (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try a different search.</p>
          </div>
        )}
        {status === "ready" && filtered.length > 0 && (
          <div style={{ display: "grid", gap: "16px" }}>
            {filtered.map((p) => (
              <div key={p.product_id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ marginBottom: "6px" }}>{p.product_name}</h3>
                    <p style={{ color: "#7f8c8d" }}>ID: {p.product_id}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 600 }}>Stock: {p.available_stock}</p>
                  </div>
                </div>
                <button
                  className="primary-btn"
                  style={{ marginTop: "12px" }}
                  onClick={() => {
                    addToCart({
                      product_id: p.product_id,
                      product_name: p.product_name,
                      quantity: 1
                    });
                    go("cart");
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
