CREATE TABLE IF NOT EXISTS listing_views (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  viewer_user_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS profile_views (
  id TEXT PRIMARY KEY,
  seller_user_id TEXT NOT NULL,
  viewer_user_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_listing_views_listing_created_at
ON listing_views(listing_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profile_views_seller_created_at
ON profile_views(seller_user_id, created_at DESC);
