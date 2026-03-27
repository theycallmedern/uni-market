ALTER TABLE listing_images ADD COLUMN image_url TEXT NOT NULL DEFAULT '';
ALTER TABLE listing_images ADD COLUMN storage_provider TEXT NOT NULL DEFAULT 'external';

UPDATE listing_images
SET storage_provider = CASE
  WHEN TRIM(COALESCE(r2_key, '')) = '' THEN 'external'
  ELSE 'r2'
END;
