# Changelog

## 0.4.0 - 2026-03-27

- shipped the production backend rollout:
  - deployed Cloudflare Worker production API on `https://api.clauseon.tech`
  - added production D1 + KV bindings and production deploy/migration commands
  - configured backend-signed Cloudinary uploads for listing photos
  - finalized WeChat legal-domain setup for API and image upload/download
- completed the backend-first listing architecture:
  - removed old CloudBase selector/client dead code
  - switched service access through the runtime API layer and backend client
  - kept `develop` on the dev backend and `trial/release` on the production API
- added listing lifecycle improvements:
  - new 30-day auto-archive lifecycle for listings
  - archive restore flow for expired listings
  - backend + local fallback support for `expiresAt` / archived visibility rules
- improved marketplace and inventory UX:
  - address display on preview cards
  - promoted listings pinned only in category flows, not on the home latest feed
  - improved empty-state CTA on unavailable listing screens
  - tightened listing language validation to English or Chinese only
- cleaned the repository for release:
  - removed old demo seed listings and cleared dev/production listing data
  - deleted generated presentation/pdf/html export leftovers from the repo
  - refreshed README and release documentation for the production state

## 0.3.0 - 2026-03-18

- expanded marketplace and inventory workflows:
  - added listing sold/archive lifecycle with sale source tracking (`UniMarket` vs outside)
  - added sold-on-UniMarket counters in profile surfaces
  - added collapsible archive UX in `Listings`
- improved listing creation quality:
  - added item condition support (`Used`, `Like new`, `New`, `Refurbished`, `For parts`)
  - tightened price guardrails (digits only, max 6 digits, normalized currency)
  - improved draft handling and fixed discard behavior to prevent unwanted draft restore prompts
- refreshed marketplace taxonomy:
  - removed `Jobs` category
  - reordered primary categories and added `Other`
  - updated subcategory image sets across categories
- standardized app architecture and quality tooling:
  - moved storage safety helpers to shared `utils/storage.js`
  - added centralized message constants module for consistent UI copy
  - added shared validation and UI feedback utilities
  - added smoke tests for core stores and marketplace flow
  - added GitHub Actions CI workflow running `npm run check`
- updated repository documentation and README branding/style

## 0.2.0 - 2026-03-17

- added report and admin moderation workflow:
  - user report creation from listing detail
  - admin-only moderation page with statuses (`pending`, `reviewing`, `resolved`, `dismissed`)
  - listing visibility rules linked to moderation status (`resolved` can hide listings)
- added admin access gate in profile with local device unlock flow
- improved create/edit listing flow:
  - photo preview and photo reorder arrows
  - cover-first image behavior
  - subcategory `Other (type your own)` with validation
  - fixed location to `Hangzhou` for one-city MVP scope
- added profile editing enhancements:
  - avatar upload and removal
  - editable user profile fields with local persistence
  - fixed city policy and WeChat/university profile defaults for posting
- added Hangzhou university picker model with `None` and `Other` privacy behavior
- refreshed profile and home UI with UniMarket branding and uploaded logo integration
- updated README to product-documentation format with current feature scope

## 0.1.0 - 2026-03-16

- initialized the `UniMarket` WeChat Mini Program MVP
- built the home feed with search, categories, and quick filters
- added all-categories navigation and category detail flows
- added results filtering with sorting, location, university, and price controls
- added listing details with gallery, save action, and WeChat contact copy
- added saved listings flow
- added local listing creation through the `Post` screen
- added profile management for user-created listings
- added repository documentation, contribution guidance, and security policy
