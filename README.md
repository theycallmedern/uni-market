# UniMarket

<p align="center">
  <img src="./miniprogram/assets/brand/unimarket-logo.png" alt="UniMarket logo" width="112" />
</p>

<p align="center">
  <strong>Local-first WeChat Mini Program marketplace for international students in Hangzhou.</strong>
</p>

<p align="center">
  UniMarket helps students buy, sell, and discover housing, items, electronics, transport, study resources, services, and everything else in one clean flow.
</p>

<p align="center">
  <a href="https://github.com/theycallmedern/uni-market/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/theycallmedern/uni-market/ci.yml?style=flat-square&label=checks"></a>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-1f2937?style=flat-square"></a>
  <a href="./SECURITY.md"><img alt="Security" src="https://img.shields.io/badge/security-local--first-1f2937?style=flat-square"></a>
</p>

<p align="center">
  <code>WeChat Mini Program</code>
  <code>Local storage MVP</code>
  <code>Create + Archive listings</code>
  <code>Seller profiles + reviews</code>
  <code>Moderation inbox</code>
</p>

## Overview

UniMarket is a student-focused marketplace shell for WeChat.

The project is intentionally local-first at MVP stage: listings, saved items, profile data, and moderation state are stored on device via `wx` storage APIs.

> [!IMPORTANT]
> This repository does not include a production backend, payments, cloud sync, or real in-app chat. Seller contact is handled through WeChat ID handoff.

### Why it exists

Student marketplace activity in group chats is fast, but hard to manage:

- posts disappear quickly
- filtering and search are weak
- seller trust context is fragmented
- moderation is reactive

UniMarket explores a cleaner marketplace layer while keeping a familiar WeChat-first handoff.

## Key Features

- **Category-first discovery**: `Items`, `Electronics`, `Transport`, `Study`, `Services`, and `Other`.
- **Subcategory exploration**: dedicated image cards per subcategory with updated visual packs.
- **Create and edit flow**: draft support, up to 5 photos, custom subcategory, and condition selection (`Used`, `Like new`, `New`, `Refurbished`, `For parts`).
- **Listing lifecycle**: mark as sold, choose sale source (`on UniMarket` vs `somewhere else`), and auto-move sold listings to archive.
- **Seller insights**: sold-on-UniMarket counters shown in listings/profile surfaces.
- **Saved flow**: local favorites with unavailable cleanup actions.
- **Trust and moderation**: listing/profile reports, admin moderation statuses, and client-side visibility controls.
- **Input guardrails**: strict price validation (digits only, max 6), WeChat ID validation, and normalized text handling.
- **Shared core utilities**: unified storage helpers, validation helpers, and feedback (toast/modal) wrappers for consistent UX.

## Product Flow

### Buyer flow

1. Open `Search`, browse categories, or use filters.
2. Open listing details with photos, condition chips, and seller card.
3. Save listing or copy seller WeChat ID to continue in WeChat.
4. Copy listing address directly from the detail page.

### Seller flow

1. Open `Post`, fill title, price, category/subcategory, condition, address, and photos.
2. Publish listing (price is normalized with currency).
3. Manage inventory in `Listings`: open, edit, mark sold, relist, delete.
4. Sold listings move to archive; active feed stays clean.

### Moderation flow

1. User reports a listing or profile.
2. Admin unlocks local moderation access.
3. Admin updates report status (`pending`, `reviewing`, `resolved`, `dismissed`).
4. Resolved listing reports can hide listings from regular feeds.

## Tech Stack

| Layer | Technology |
| --- | --- |
| App shell | WeChat Mini Program |
| UI | WXML + WXSS |
| Runtime | JavaScript |
| Data persistence | `wx` local storage |
| Quality checks | Node.js + `scripts/check.sh` + smoke tests |
| CI | GitHub Actions (`.github/workflows/ci.yml`) |
| Planned backend direction | Cloudflare Workers + D1 + R2 |

## Getting Started

### Prerequisites

- WeChat Developer Tools
- Node.js
- Git

### Clone

```bash
git clone https://github.com/theycallmedern/uni-market.git
cd uni-market
```

### Install and run checks

```bash
npm install
npm run check
```

`npm run check` currently runs:

- JavaScript syntax checks across `miniprogram/` and `scripts/`
- lightweight smoke tests for core stores and marketplace flow scenarios

### Open in WeChat DevTools

Open repository root in WeChat Developer Tools with Mini Program root set to:

```text
miniprogram/
```

## Project Structure

| Path | Purpose |
| --- | --- |
| [`miniprogram/pages/index`](./miniprogram/pages/index) | Home feed and discovery |
| [`miniprogram/pages/category`](./miniprogram/pages/category) | Category-level browsing |
| [`miniprogram/pages/results`](./miniprogram/pages/results) | Search/filter/sort results |
| [`miniprogram/pages/favorites`](./miniprogram/pages/favorites) | Saved listings management |
| [`miniprogram/pages/create`](./miniprogram/pages/create) | Create/edit listing flow with draft and validation |
| [`miniprogram/pages/messages`](./miniprogram/pages/messages) | Seller inventory and archive |
| [`miniprogram/pages/listing`](./miniprogram/pages/listing) | Listing detail, actions, and reporting |
| [`miniprogram/pages/user-profile`](./miniprogram/pages/user-profile) | Public/own profile, reviews, and profile reports |
| [`miniprogram/pages/profile`](./miniprogram/pages/profile) | Profile overview and admin entry |
| [`miniprogram/pages/moderation`](./miniprogram/pages/moderation) | Moderation inbox and status updates |
| [`miniprogram/data/market.js`](./miniprogram/data/market.js) | Core market dataset and listing lifecycle |
| [`miniprogram/utils/storage.js`](./miniprogram/utils/storage.js) | Safe local storage wrappers |
| [`miniprogram/utils/validation.js`](./miniprogram/utils/validation.js) | Shared validators/normalizers |
| [`miniprogram/utils/ui-feedback.js`](./miniprogram/utils/ui-feedback.js) | Unified toast/modal wrappers |
| [`miniprogram/constants/messages.js`](./miniprogram/constants/messages.js) | Centralized UI text constants |
| [`scripts/smoke-test.js`](./scripts/smoke-test.js) | Core smoke tests |
| [`scripts/check.sh`](./scripts/check.sh) | Local quality gate |

## Privacy and Security

UniMarket is intentionally local-first in this MVP:

- listings are stored locally
- profile and saved state are stored locally
- moderation state is stored locally
- there is no production sync layer in this repository

For repository-level security policy and reporting guidance, see [SECURITY.md](./SECURITY.md).

> [!WARNING]
> Admin unlock and moderation authorization are client-side MVP mechanics only and are not production-grade access control.

## Development

### Local checks

```bash
npm run check
```

### Before merging

- verify changed flows in WeChat DevTools
- update docs when user-facing behavior changes
- add or adjust smoke tests when store/business logic changes

For contribution conventions, see [CONTRIBUTING.md](./CONTRIBUTING.md).  
For product-facing update history, see [CHANGELOG.md](./CHANGELOG.md).

## Roadmap

- [x] Local marketplace MVP shell
- [x] Listing lifecycle with sold/archive behavior
- [x] Seller profile and review surfaces
- [x] Moderation inbox and report statuses
- [x] Shared validation/storage/feedback utilities
- [x] Core smoke tests + CI quality gate
- [ ] Backend-backed auth and moderation roles
- [ ] Cloud media and multi-device sync
- [ ] Native map/radius discovery around campus
- [ ] Production messaging and server-enforced trust signals

## License

This project is licensed under the [MIT License](./LICENSE).
