import { useState } from "react";
import Header from "../components/Header";
import { authRequest } from "../api/client";
import { ORDER_API } from "../api/config";
import {
  clearCart,
  getCart,
  getToken,
  removeFromCart,
  setCart as setCartStorage
} from "../utils/storage";

export default function Cart({ go, back }) {
  const [cart, setCart] = useState(getCart());
  const [placing, setPlacing] = useState(false);
  const [results, setResults] = useState([]);

  const updateQuantity = (productId, delta) => {
    const next = cart.map((item) => {
      if (item.product_id !== productId) return item;
      const nextQty = Math.max(1, (item.quantity || 1) + delta);
      return { ...item, quantity: nextQty };
    });
    setCart(next);
    setCartStorage(next);
  };

  const placeOrders = async () => {
    const token = getToken();
    if (!token) {
      alert("Please log in first.");
      go("login");
      return;
    }

    setPlacing(true);
    const out = [];
    for (const item of cart) {
      try {
        const data = await authRequest(`${ORDER_API}/api/orders`, token, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: item.product_id,
            quantity: item.quantity
          })
        });
        out.push({ product_id: item.product_id, status: data.status });
      } catch (err) {
        out.push({ product_id: item.product_id, status: "ERROR", message: err.message });
      }
    }
    setResults(out);
    clearCart();
    setCart([]);
    setPlacing(false);
  };
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header go={go} back={back} />
      <div className="container">
        <h2>🛒 Shopping Cart</h2>

        {cart.length === 0 ? (
          <div className="empty-state">
            <h3>Your cart is empty</h3>
            <p>Add products from the catalog to get started.</p>
            <button
              onClick={() => go("main")}
              className="primary-btn"
              style={{ maxWidth: "300px", margin: "20px auto 0" }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {cart.map((item) => (
              <div key={item.product_id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ marginBottom: "6px" }}>{item.product_name}</h3>
                    <p style={{ color: "#7f8c8d" }}>ID: {item.product_id}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontWeight: 600, marginBottom: "6px" }}>
                      Qty: {item.quantity}
                    </p>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        className="secondary-btn"
                        style={{ padding: "8px 12px" }}
                        onClick={() => updateQuantity(item.product_id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        ➖
                      </button>
                      <button
                        className="secondary-btn"
                        style={{ padding: "8px 12px" }}
                        onClick={() => updateQuantity(item.product_id, 1)}
                      >
                        ➕
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  className="secondary-btn"
                  style={{ marginTop: "10px" }}
                  onClick={() => setCart(removeFromCart(item.product_id))}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              className="primary-btn"
              onClick={placeOrders}
              disabled={placing}
            >
              {placing ? "Placing orders..." : "Place Orders"}
            </button>
          </div>
        )}

        {results.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h3>Order Results</h3>
            <ul>
              {results.map((r) => (
                <li key={r.product_id}>
                  {r.product_id}: {r.status}
                  {r.message ? ` (${r.message})` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
