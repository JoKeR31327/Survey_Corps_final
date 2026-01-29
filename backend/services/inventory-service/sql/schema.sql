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

CREATE TABLE IF NOT EXISTS inventory_outbox (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL,
  order_status TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMP NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMP NULL,
  last_error TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_outbox_next_retry
  ON inventory_outbox (next_retry_at)
  WHERE delivered_at IS NULL;
