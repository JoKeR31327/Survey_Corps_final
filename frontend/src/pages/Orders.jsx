import Header from "../components/Header";

export default function Orders({ go }) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header go={go} />
      <div className="container">
        <h2>📋 Order History</h2>

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
      </div>
    </div>
  );
}
