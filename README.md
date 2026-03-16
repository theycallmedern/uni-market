# UniMarket

<p align="center">
  <img src="./miniprogram/assets/brand/unimarket-logo.png" alt="UniMarket logo" width="112" />
</p>

<p align="center">
  <strong>WeChat Mini Program marketplace MVP for international students in Hangzhou.</strong>
</p>

<p align="center">
  Built to make student housing, resale items, transport, and campus services easier to discover in a familiar WeChat flow.
</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-MVP-111111?style=flat-square">
  <img alt="Platform" src="https://img.shields.io/badge/platform-WeChat%20Mini%20Program-07C160?style=flat-square">
  <img alt="City" src="https://img.shields.io/badge/city-Hangzhou-1f2937?style=flat-square">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-1f2937?style=flat-square">
  <img alt="Security" src="https://img.shields.io/badge/security-local--first-1f2937?style=flat-square">
</p>

<p align="center">
  <code>WeChat Mini Program</code>
  <code>Local-first MVP</code>
  <code>Student marketplace</code>
  <code>Admin moderation</code>
  <code>Profile + listing workflows</code>
</p>

## Overview

UniMarket is a marketplace concept for international students in China, starting with a single-city MVP in Hangzhou.

The project is intentionally product-first: it focuses on day-to-day marketplace behavior before introducing a production backend.

The current repository contains a working Mini Program flow for browsing, saving, posting, editing, reporting, and moderating listings using local data and local device storage.

> [!IMPORTANT]
> UniMarket is currently local-first and MVP-scoped. There is no production backend, payment processing, or cloud sync in this repository.

### Why it exists

Most student marketplace activity in WeChat happens in chat groups, where posts are easy to miss and hard to manage.

UniMarket exists to provide:

- clearer listing discovery
- better category and filter navigation
- consistent listing details and contact handoff
- lightweight moderation controls for community safety

## Key Features

- **Home feed and category discovery**: browse latest listings, switch categories, and open result views quickly.
- **Search and filtering**: filter by university, sort options, and listing metadata on dedicated result screens.
- **Saved listings**: bookmark listings locally and revisit them later.
- **Create + edit listing flow**:
  - up to 5 photos with preview, reorder arrows, and cover-first behavior
  - category + subcategory picker with `Other (type your own)` support
  - fixed city (`Hangzhou`) and university picker validation
- **Profile editing**:
  - editable profile fields and avatar upload
  - university privacy behavior for `None` / `Other`
  - fixed city policy for one-city MVP mode
- **Report and moderation system**:
  - listing reports from users
  - admin-only moderation page with status updates (`pending`, `reviewing`, `resolved`, `dismissed`)
  - resolved violations can hide listings from feed visibility
- **Role-aware listing visibility**:
  - hidden listings are blocked for regular users
  - admin can still review hidden content
  - owner can open their own hidden listing and see hidden-state notice

## Product Flow

### Buyer flow

1. Open home feed and browse categories.
2. Use search and filters to narrow results.
3. Open listing detail.
4. Save listings or copy WeChat contact for handoff.

### Seller flow

1. Open `Post`.
2. Add photos, category, pricing, and listing details.
3. Publish listing to local feed.
4. Manage or edit listing in `Listings`.

### Moderation flow

1. User reports listing from listing detail page.
2. Admin unlocks admin access on device.
3. Admin reviews reports and updates report status.
4. Confirmed violations (`resolved`) can hide affected listings in feed views.

## Tech Stack

| Layer | Technology |
| --- | --- |
| App shell | WeChat Mini Program |
| UI | WXML + WXSS |
| Runtime logic | JavaScript |
| Local persistence | `wx` local storage APIs |
| Dev environment | WeChat Developer Tools |
| Backend direction | Cloudflare Workers + D1 + R2 (planned) |

## Getting Started

### Prerequisites

- WeChat Developer Tools
- Node.js (for repository checks)
- Git

### Clone and open

```bash
git clone https://github.com/theycallmedern/uni-market.git
cd uni-market
```

Open `/path/to/uni-market` in WeChat Developer Tools and compile.

### Local repository check

```bash
npm install
npm run check
```

## Usage

### Listing creation and editing

- Use the `Post` tab to create listings.
- Use the `Listings` tab to edit or delete your listings.
- Location is fixed to `Hangzhou` for MVP scope.
- University is selected from a predefined Hangzhou list.

### Profile and identity fields

- Edit profile in `Profile`.
- You can set avatar, name, university, WeChat ID, and bio.
- If university is `None` or `Other`, university is treated as private in public listing surfaces.

### Admin moderation access

- Admin tools are available only after admin unlock on the current device.
- Admin controls live in the bottom admin section of `Profile`.
- Reports are managed from the moderation page.

> [!WARNING]
> The current admin passcode flow is client-side MVP logic and is not production-safe. For production, move role checks and moderation permissions to a backend-authenticated system.

## Project Structure

| Path | Purpose |
| --- | --- |
| [`miniprogram/app.json`](./miniprogram/app.json) | Global page registration and tab bar config |
| [`miniprogram/pages/index`](./miniprogram/pages/index) | Home feed, categories, and quick filters |
| [`miniprogram/pages/results`](./miniprogram/pages/results) | Search results and advanced filtering |
| [`miniprogram/pages/listing`](./miniprogram/pages/listing) | Listing detail, save/report actions |
| [`miniprogram/pages/create`](./miniprogram/pages/create) | Create/edit listing form |
| [`miniprogram/pages/messages`](./miniprogram/pages/messages) | My listings management |
| [`miniprogram/pages/profile`](./miniprogram/pages/profile) | Profile editing and admin entry point |
| [`miniprogram/pages/moderation`](./miniprogram/pages/moderation) | Admin report review and status updates |
| [`miniprogram/data/market.js`](./miniprogram/data/market.js) | Local listing model and feed/category helpers |
| [`miniprogram/utils/reports.js`](./miniprogram/utils/reports.js) | Report storage and moderation decorators |
| [`miniprogram/utils/admin.js`](./miniprogram/utils/admin.js) | Device-local admin access gate |
| [`miniprogram/utils/profile.js`](./miniprogram/utils/profile.js) | Profile normalization and persistence |
| [`miniprogram/utils/universities.js`](./miniprogram/utils/universities.js) | Hangzhou university list and privacy helpers |
| [`miniprogram/assets/brand/unimarket-logo.png`](./miniprogram/assets/brand/unimarket-logo.png) | UniMarket brand logo used in UI |
| [`scripts/check.sh`](./scripts/check.sh) | JS syntax validation for repo scripts/pages |

## Privacy and Security

UniMarket is currently a local-first MVP:

- listings created in this MVP are stored locally on device
- saved items and profile fields are stored locally
- no production server sync is active in this repository

Please avoid committing:

- real personal data
- private WeChat IDs from real users
- private keys or secrets
- sensitive screenshots

For policy and reporting expectations, see [SECURITY.md](./SECURITY.md).

## Development

When contributing or iterating:

- run `npm run check` before commit
- verify behavior in WeChat Developer Tools
- test key flows after UI updates:
  - browse and filter
  - create/edit listing
  - profile save
  - report + moderation status update

## Roadmap

- [x] Local marketplace MVP shell
- [x] Listing create/edit and save flows
- [x] Profile editing with avatar upload
- [x] Report + admin moderation status workflow
- [ ] Backend-connected auth and role management
- [ ] Real media upload/storage service
- [ ] Production messaging/inbox
- [ ] Server-side moderation enforcement

## Contributing

Contributions are welcome.

If you plan a significant change, open an issue first so implementation can stay aligned with the product direction and MVP scope.

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening large pull requests.

## Changelog

Product-facing updates are tracked in [CHANGELOG.md](./CHANGELOG.md).

## License

This project is licensed under the [MIT License](./LICENSE).
