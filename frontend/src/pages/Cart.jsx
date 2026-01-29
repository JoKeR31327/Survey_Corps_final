import Header from "../components/Header";

export default function Cart({ go }) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header go={go} />
      <div className="container">
        <h2>🛒 Shopping Cart</h2>

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
      </div>
    </div>
  );
}
