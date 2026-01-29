import { useState } from "react";
import Header from "../components/Header";

export default function Main({ go }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // Search functionality will be added later
    console.log("Searching for:", searchQuery);
  };

  return (
    <div>
      <Header go={go} />
      <div className="container">
        <h2>Products</h2>

        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "20px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
          <button type="submit" style={{ marginBottom: "20px" }}>
            Search
          </button>
        </form>

        <p>Products will be displayed here</p>
      </div>
    </div>
  );
}
