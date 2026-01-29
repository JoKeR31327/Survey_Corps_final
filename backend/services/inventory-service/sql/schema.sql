CREATE TABLE inventory (
  product_id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  available_stock INT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inventory_transactions (
  order_id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  quantity INT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
