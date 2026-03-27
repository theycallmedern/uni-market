# Cloudflare bootstrap

This repository now runs a deployed Cloudflare Worker backend for UniMarket.

## Created resources

- D1 database: `unimarket-dev`
- D1 database: `unimarket-prod`
- KV namespace: `UNIMARKET_CACHE`
- KV namespace: production `UNIMARKET_CACHE`
- Worker: `unimarket-api-dev`
- Worker: `unimarket-api`

## Production URLs

- Dev Worker:
  - `https://unimarket-api-dev.mishabeliako.workers.dev`
- Production Worker:
  - `https://api.clauseon.tech`

## Applied D1 migrations

- `0001_initial.sql`
- `0002_external_image_urls.sql`
- `0003_listing_sale_source.sql`
- `0004_request_review_uniqueness.sql`
- `0005_engagement_events.sql`
- `0006_visibility_preferences.sql`
- `0007_listing_archive_lifecycle.sql`

## Backend commands

```bash
npm run cf:d1:migrate:dev
npm run cf:deploy:dev
npm run cf:d1:migrate:prod
npm run cf:deploy:prod
```

## Current storage approach

The backend does not depend on `R2` for the current production slice.

- Listing images can be stored as external `https://...` URLs in D1
- Cloudinary is the current signed upload provider
- `R2` can be added later as an internal storage provider without changing the listing API shape
- The schema supports both `external` and future `r2` image providers

## Current API surface

The Worker currently exposes:

- `GET /health`
- `GET /me`
- `PUT /me/profile`
- `GET /me/listings`
- `GET /me/saved`
- `GET /me/visibility`
- `POST /auth/wechat/login`
- `GET /listings`
- `POST /listings`
- `GET /listings/:id`
- `PATCH /listings/:id`
- `DELETE /listings/:id`
- `POST /listings/:id/mark-sold`
- `POST /listings/:id/restore`
- moderation / review / promotion endpoints

This is no longer just a scaffold: it is the production API used by `trial` and `release` Mini Program builds.

## Current release notes

- production deploy verified on `api.clauseon.tech`
- WeChat legal domains configured for API + Cloudinary
- listing lifecycle now includes 30-day auto-archive via `expires_at`
