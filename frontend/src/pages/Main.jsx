import { useState } from "react";
import Header from "../components/Header";

export default function Main({ go }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

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

        <div className="empty-state">
          <h3>No products yet</h3>
          <p>
            Products will be displayed here once they're added to the system.
          </p>
          <p style={{ fontSize: "14px", marginTop: "12px" }}>
            Use the search bar above to find products when they become
            available.
          </p>
        </div>
      </div>
    </div>
  );
}
