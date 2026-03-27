# Backend Readiness Checklist

This document started as a pre-backend planning note. It is now a snapshot of what is already backended and what still intentionally remains local.

## 1. What is server truth today

These flows now run through the Cloudflare Worker backend for `trial` and `release` builds:

- Listings
  - create, edit, delete, relist, sold state
  - 30-day auto-archive and restore lifecycle
- Profiles
- Saved items
- Reports and moderation
- Reviews
- Seller Pro and paid promotion
- Analytics / counters
- Admin access

These are still intentionally local:

- theme: `uiThemeMode`
- locale: `appLocale`
- draft UX state: `marketCreateDraftV1`
- temporary navigation state: `marketCreateMode`

## 2. Biggest remaining release risks

- WeChat review / category fit
  - The current approved category is broad (`工具 > 信息查询`), which is workable but not an ideal semantic fit for a student marketplace.
- Authentication depth
  - Backend session handling exists, but production confidence still depends on final end-to-end checks inside real WeChat `体验版`.
- Payment / monetization safety
  - Promotion and Seller Pro request workflows exist, but no in-app payment verification is implemented yet.
- Local-dev parity
  - `develop` still uses the dev backend while some UI-only helpers fall back to local storage behavior.

## 3. What is already implemented

The current backend stack includes:

1. WeChat-auth-backed session layer in the Worker
2. Listings CRUD with ownership checks
3. Profile read/update
4. Saved listings
5. Visibility preferences
6. Reports and moderation queues
7. Reviews
8. Seller Pro / promotion request storage
9. Listing analytics counters
10. 30-day archive lifecycle via `expires_at`

## 4. Recommended backend data model

Suggested core tables for Cloudflare Workers + D1:

- `users`
  - `id`
  - `wechat_openid`
  - `union_id` if available later
  - `role`
  - `status`
  - `created_at`
- `profiles`
  - `user_id`
  - `display_name`
  - `wechat_id`
  - `campus`
  - `city`
  - `avatar_url`
  - `bio`
  - `joined_at`
- `listings`
  - `id`
  - `user_id`
  - `title`
  - `price_value`
  - `price_label`
  - `location`
  - `address`
  - `university`
  - `category_id`
  - `subcategory`
  - `condition`
  - `description`
  - `status`
  - `is_sold`
  - `sold_on_unimarket`
  - `expires_at`
  - `created_at`
  - `updated_at`
- `listing_images`
  - `id`
  - `listing_id`
  - `image_url` for MVP
  - `r2_key` later if storage moves into Cloudflare
  - `sort_order`
- `saved_listings`
  - `user_id`
  - `listing_id`
  - `created_at`
- `reports`
  - `id`
  - `reporter_user_id`
  - `target_type`
  - `listing_id`
  - `profile_user_id`
  - `reason`
  - `note`
  - `status`
  - `created_at`
  - `reviewed_at`
  - `reviewed_by`
- `reviews`
  - `id`
  - `listing_id`
  - `seller_user_id`
  - `reviewer_user_id`
  - `rating`
  - `comment`
  - `created_at`
- `promotion_requests`
  - `id`
  - `listing_id`
  - `user_id`
  - `plan_id`
  - `status`
  - `created_at`
  - `reviewed_at`
  - `reviewed_by`
- `seller_pro_subscriptions`
  - `id`
  - `user_id`
  - `status`
  - `granted_at`
  - `expires_at`
  - `granted_by`

## 5. Current API surface

Current primary endpoints:

- `POST /auth/wechat/login`
- `GET /me`
- `PUT /me/profile`
- `GET /me/listings`
- `GET /me/saved`
- `GET /me/visibility`
- `GET /listings`
- `GET /listings/:id`
- `POST /listings`
- `PATCH /listings/:id`
- `DELETE /listings/:id`
- `POST /listings/:id/mark-sold`
- `POST /listings/:id/restore`
- `POST /listings/:id/save`
- `DELETE /listings/:id/save`
- `POST /reports`
- `GET /moderation/reports`
- `PATCH /moderation/reports/:id`
- `POST /promotions/requests`
- `GET /moderation/promotion-requests`
- `PATCH /moderation/promotion-requests/:id`
- `POST /reviews`
- `GET /profiles/by-listing/:id`

## 6. Frontend architecture status

The Mini Program now uses the runtime service layer in `miniprogram/services/api/`.

- backend reads/writes route through:
  - `backend-client.js`
  - `remote.js`
  - `runtime-*` adapters
- local fallback is still present for safety/dev ergonomics
- pages no longer need to know whether data came from storage or HTTP

## 7. Authentication decisions to lock early

Before implementation, decide these rules:

- keep Mini Program auth on `wx.login -> backend bearer token`
- keep backend ownership rules for edit/delete/archive/relist
- keep admin privileges role-backed, not device-passcode-backed
- decide later whether public seller identity should stay WeChat-first or move to stronger masked/contact-gated flows

## 8. Media upload plan

Current approach:

- Mini Program requests a signed payload from the Worker
- images upload directly to Cloudinary
- Worker stores resulting public URLs in D1
- `R2` remains optional future infrastructure, not a current blocker

## 9. Migration order

Completed major order:

1. Added runtime service layer in the Mini Program
2. Added backend auth/session flow
3. Moved profiles + listings CRUD to backend
4. Added moderation, saved, reviews, Seller Pro, and analytics backend slices
5. Added archive lifecycle migration (`expires_at`)

Current practical next step is not architecture work, but WeChat `体验版 -> 审核 -> 发布`.
5. Move saved items to backend
6. Move reports and moderation to backend
7. Move reviews to backend
8. Move promotions / Seller Pro / payments to backend
9. Rebuild analytics as server-side events

## 10. What can be done today in this repo

Highest-value prep tasks right now:

- Add `services/` wrappers so pages stop calling storage-backed domain functions directly
- Define shared payload shapes for listing/profile/report/review requests
- Replace hardcoded admin passcode logic with a temporary role abstraction
- Separate demo seed data from user-created listing logic
- Prepare image upload abstraction so local images and future R2 uploads use the same interface
- Add an `.env.example` for planned backend configuration

## 11. Practical scope for the next backend sprint

If the goal is "prepare for publishability", the best first sprint is:

- WeChat auth
- profile read/write
- listings CRUD
- saved listings
- moderation reports

That is enough to replace the most dangerous device-local product logic without overbuilding too early.
