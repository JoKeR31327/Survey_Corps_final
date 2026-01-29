export default function Header({ go }) {
  return (
    <header style={{ padding: "20px", borderBottom: "2px solid #000" }}>
      <nav>
        <button onClick={() => go("main")} style={{ marginRight: "10px" }}>
          Products
        </button>
        <button onClick={() => go("cart")} style={{ marginRight: "10px" }}>
          Cart
        </button>
        <button onClick={() => go("orders")} style={{ marginRight: "10px" }}>
          Orders
        </button>
        <button onClick={() => go("login")}>Logout</button>
      </nav>
    </header>
  );
}
