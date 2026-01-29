import { clearToken } from "../utils/storage";

export default function Header({ go, isAdmin = false }) {
  const userNavItems = [
    { label: "Products", page: "main", icon: "📦" },
    { label: "Cart", page: "cart", icon: "🛒" },
    { label: "Orders", page: "orders", icon: "📋" },
  ];

  const adminNavItems = [{ label: "Dashboard", page: "admin", icon: "📊" }];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <header>
      <nav>
        <div
          style={{
            display: "flex",
            gap: "26px",
            flex: 1,
            alignItems: "center",
          }}
        >
          {isAdmin && (
            <span
              style={{ fontSize: "18px", fontWeight: "600", color: "white" }}
            >
              ⚙️ Admin Panel
            </span>
          )}
          {navItems.map((item) => (
            <button
              key={item.page}
              onClick={() => go(item.page)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            clearToken();
            go("login");
          }}
        >
          🚪 Logout
        </button>
      </nav>
    </header>
  );
}
