CREATE TABLE IF NOT EXISTS hidden_listings (
  user_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, listing_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blocked_sellers (
  user_id TEXT NOT NULL,
  seller_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, seller_key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_hidden_listings_user_created_at
ON hidden_listings(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blocked_sellers_user_created_at
ON blocked_sellers(user_id, created_at DESC);
