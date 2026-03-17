# UniMarket

WeChat Mini Program marketplace MVP for international students in Hangzhou.

Built to make housing, resale items, transport, and lightweight campus services easier to browse in a familiar WeChat-style flow.

## Overview

UniMarket is a local-first marketplace concept designed around how student communities already operate in China: quick discovery, lightweight trust signals, and handoff through WeChat.

This repository contains the MVP shell of that experience. Users can browse listings, save favorites, publish their own posts, manage a profile, open seller profiles, and report suspicious content. Admins can review reports and hide listings locally during moderation.

> [!IMPORTANT]
> This project is still MVP-scoped and local-first. There is no production backend, no payment flow, no real-time messaging, and no cloud sync in this repository.

## Why it exists

Most student marketplace activity in WeChat groups is fast but messy:

- posts disappear quickly
- listings are hard to filter
- seller identity is inconsistent
- moderation is usually manual and reactive

UniMarket explores a cleaner layer on top of that behavior without leaving the familiar WeChat handoff model.

## Current feature set

### Marketplace browsing

- home feed with search and category shortcuts
- category and results pages with sort, location, university, and price filtering
- saved listings with local persistence
- listing detail pages with image gallery, seller card, report actions, and WeChat handoff

### Seller workflows

- create listing flow with up to 5 photos
- reorderable images and cover-first media behavior
- category and subcategory selection with `Other (type your own)` support
- fixed city scope for Hangzhou MVP mode
- local listing editing and deletion from the `Listings` tab

### Profiles and trust

- editable user profile with avatar, name, university, WeChat ID, and bio
- separate seller profile page with reviews, listings, and share/copy actions
- university privacy handling for `None` and `Other`
- review-ready profile surfaces for marketplace trust building

### Moderation

- listing report creation from user-facing screens
- device-local admin access gate
- moderation inbox with `pending`, `reviewing`, `resolved`, and `dismissed` states
- visibility rules that hide resolved listings from regular users while keeping them reviewable for admins

## Product flow

### Buyer flow

1. Open the `Search` tab and browse categories or search directly.
2. Narrow results with sort, university, city, and price filters.
3. Open a listing and inspect seller details.
4. Save the post or copy the seller's WeChat ID to continue outside the Mini Program.

### Seller flow

1. Open the `Post` tab.
2. Add photos, category, price, title, and description.
3. Publish locally to the marketplace feed.
4. Manage existing listings from the `Listings` tab.

### Moderation flow

1. A user reports a listing or profile.
2. An admin unlocks local moderation access on device.
3. Reports are reviewed and status is updated.
4. Resolved violations can hide the associated listing from regular marketplace views.

## App structure

The current Mini Program registers these primary surfaces:

- `Search`: home feed and discovery
- `Saved`: locally bookmarked listings
- `Post`: create and edit listing flow
- `Listings`: seller inventory management
- `Profile`: account, admin tools, and profile editing

Supporting pages include category results, listing detail, moderation, and a dedicated seller profile page.

## Tech stack

| Layer | Technology |
| --- | --- |
| App shell | WeChat Mini Program |
| UI | WXML + WXSS |
| Runtime logic | JavaScript |
| Local persistence | `wx` storage APIs |
| Tooling | Node.js + shell check script |
| Dev environment | WeChat Developer Tools |
| Planned backend direction | Cloudflare Workers + D1 + R2 |

## Getting started

### Prerequisites

- WeChat Developer Tools
- Node.js
- Git

### Clone the repo

```bash
git clone https://github.com/theycallmedern/uni-market.git
cd uni-market
```

### Run the repository check

```bash
npm install
npm run check
```

### Open in WeChat DevTools

Open the repository folder in WeChat Developer Tools and compile the Mini Program locally.

## Project structure

| Path | Purpose |
| --- | --- |
| `miniprogram/app.json` | Global page registration, window config, and custom tab bar setup |
| `miniprogram/pages/index` | Home feed, discovery, and filter entry points |
| `miniprogram/pages/category` | Category-specific listing views |
| `miniprogram/pages/results` | Result list with filtering and sorting controls |
| `miniprogram/pages/favorites` | Saved listings and cleanup actions |
| `miniprogram/pages/create` | Create and edit listing form |
| `miniprogram/pages/messages` | Seller inventory management |
| `miniprogram/pages/listing` | Listing detail, gallery, save, report, and WeChat contact handoff |
| `miniprogram/pages/user-profile` | Seller profile, reviews, and seller listings |
| `miniprogram/pages/profile` | Personal profile, profile editing, and admin access |
| `miniprogram/pages/moderation` | Moderation inbox and report state management |
| `miniprogram/custom-tab-bar` | Custom tab bar UI |
| `miniprogram/components` | Shared UI such as header and photo viewer |
| `miniprogram/data/market.js` | Local marketplace dataset and feed helpers |
| `miniprogram/utils/profile.js` | Profile normalization and persistence |
| `miniprogram/utils/reports.js` | Report storage and moderation helpers |
| `miniprogram/utils/saved.js` | Saved listing persistence |
| `miniprogram/utils/reviews.js` | Review storage and seller summary helpers |
| `scripts/check.sh` | Repository syntax and consistency check |

## Privacy and security

UniMarket is intentionally local-first right now:

- listings created in this MVP are stored on device
- saved items are stored on device
- profile fields and moderation state are stored on device
- there is no production sync layer in this repository

Please do not commit:

- real personal data
- private WeChat IDs from real users
- secrets or tokens
- sensitive screenshots

For repository-level guidance, see [SECURITY.md](./SECURITY.md).

> [!WARNING]
> The admin unlock flow in this MVP is client-side only and is not production-safe. Real moderation and role checks should move behind authenticated backend logic.

## Development notes

Before shipping changes:

- run `npm run check`
- verify the relevant flow in WeChat Developer Tools
- retest at least the surfaces touched by the change

For current product-facing updates, see [CHANGELOG.md](./CHANGELOG.md). For contribution guidance, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Roadmap

- [x] Local marketplace MVP shell
- [x] Listing create, edit, and save flows
- [x] Profile editing with avatar upload
- [x] Seller profile and review surfaces
- [x] Report and admin moderation workflow
- [ ] Backend-backed auth and role management
- [ ] Cloud media storage
- [ ] Production messaging or inbox layer
- [ ] Server-enforced moderation and sync

## License

This project is licensed under the [MIT License](./LICENSE).
