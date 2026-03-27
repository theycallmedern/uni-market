ALTER TABLE listings ADD COLUMN expires_at TEXT;

UPDATE listings
SET expires_at = DATETIME(created_at, '+30 days')
WHERE TRIM(COALESCE(expires_at, '')) = '';

CREATE INDEX IF NOT EXISTS idx_listings_status_expiry
ON listings(status, is_sold, expires_at, created_at DESC);
