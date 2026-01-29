import { useState } from "react";
import Header from "../components/Header";

export default function Admin({ go }) {
  const [products, setProducts] = useState([
    { id: 1, name: "Product A", quantity: 10 },
    { id: 2, name: "Product B", quantity: 5 },
  ]);
  const [formData, setFormData] = useState({ name: "", quantity: "" });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (formData.name && formData.quantity) {
      const newProduct = {
        id: Date.now(),
        name: formData.name,
        quantity: parseInt(formData.quantity),
      };
      setProducts([...products, newProduct]);
      setFormData({ name: "", quantity: "" });
    }
  };

  const handleQuantityChange = (id, delta) => {
    setProducts(
      products.map((product) =>
        product.id === id
          ? { ...product, quantity: Math.max(1, product.quantity + delta) }
          : product,
      ),
    );
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header go={go} isAdmin={true} />
      <div className="container">
        <h2>⚙️ Admin Dashboard</h2>

        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "20px" }}>
            ➕ Add New Product
          </h3>
          <form onSubmit={handleAddProduct}>
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "20px",
                alignItems: "stretch",
              }}
            >
              <input
                type="text"
                placeholder="Product name..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                style={{ flex: 1, height: "60px" }}
              />
              <input
                type="number"
                placeholder="Quantity..."
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                style={{ width: "120px", height: "60px" }}
              />
              <button
                type="submit"
                className="primary-btn"
                style={{ width: "auto", padding: "0 32px", height: "60px" }}
              >
                Add Product
              </button>
            </div>
          </form>
        </div>

        <div>
          <h3 style={{ marginBottom: "20px", fontSize: "20px" }}>
            📊 Product Inventory
          </h3>
          {products.length === 0 ? (
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
                      key={product.id}
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
                      <td style={{ padding: "12px" }}>{product.name}</td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: "600",
                        }}
                      >
                        {product.quantity}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          display: "flex",
                          gap: "8px",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() => handleQuantityChange(product.id, -1)}
                          className="secondary-btn"
                          style={{
                            padding: "8px 12px",
                            fontSize: "14px",
                          }}
                          disabled={product.quantity === 1}
                        >
                          ➖
                        </button>
                        <button
                          onClick={() => handleQuantityChange(product.id, 1)}
                          className="secondary-btn"
                          style={{
                            padding: "8px 12px",
                            fontSize: "14px",
                          }}
                        >
                          ➕
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="secondary-btn"
                          style={{
                            padding: "8px 12px",
                            fontSize: "14px",
                            color: "#e74c3c",
                            borderColor: "#e74c3c",
                          }}
                        >
                          🗑️
                        </button>
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
