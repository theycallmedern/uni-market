DELETE FROM promotion_requests
WHERE status = 'pending'
  AND rowid NOT IN (
    SELECT MAX(rowid)
    FROM promotion_requests
    WHERE status = 'pending'
    GROUP BY listing_id
  );

DELETE FROM reviews
WHERE rowid NOT IN (
  SELECT MAX(rowid)
  FROM reviews
  GROUP BY listing_id, reviewer_user_id
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_promotion_requests_pending_listing_unique
ON promotion_requests(listing_id)
WHERE status = 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_listing_reviewer_unique
ON reviews(listing_id, reviewer_user_id);
