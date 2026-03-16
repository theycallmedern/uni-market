# UniMarket

<p align="center">
  <strong>WeChat Mini Program marketplace MVP for international students in Hangzhou.</strong>
</p>

<p align="center">
  Built to make student housing, resale items, transport, and local services easier to discover inside a familiar WeChat flow.
</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-MVP-111111?style=flat-square">
  <img alt="Platform" src="https://img.shields.io/badge/platform-WeChat%20Mini%20Program-07C160?style=flat-square">
  <img alt="Scope" src="https://img.shields.io/badge/focus-student%20marketplace-1f2937?style=flat-square">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-1f2937?style=flat-square">
  <img alt="Security" src="https://img.shields.io/badge/security-local--first-1f2937?style=flat-square">
</p>

<p align="center">
  <code>WeChat DevTools</code>
  <code>Mini Program</code>
  <code>Marketplace MVP</code>
  <code>Student-first UX</code>
  <code>Cloudflare-ready</code>
</p>

## Overview

UniMarket is a marketplace concept for international students in China, starting with Hangzhou.

The current repository contains the front-end MVP built as a native WeChat Mini Program. It focuses on the product flow that matters first:

- browse listings from the home feed
- jump into category-specific exploration
- filter and sort search results
- open a listing detail page
- save listings locally
- publish a new listing through the in-app form
- manage your own listings from the profile

The goal is to validate the student marketplace experience before connecting the project to a production backend.

> [!IMPORTANT]
> This repository is currently front-end-first and local-first. There is no production backend, payment flow, or real message transport enabled yet.

## Current Product Scope

### Implemented screens

- `Home` with search, category cards, quick filters, and latest listings
- `All Categories` overview screen
- category detail pages with subcategory discovery
- `Results` with search, sort, location, university, and price filters
- `Listing Details` with gallery, seller block, save action, and WeChat contact copy
- `Saved` listings screen
- `Post` form for creating local listings
- `Profile` with `My Listings` and delete actions

### Current data model

The MVP uses a local mock-data layer plus local storage for user-created listings and saved items.

That means:

- seeded demo listings are bundled in the project
- newly created listings are stored locally
- saved listings are stored locally
- no cloud sync exists yet

## Why It Exists

International students often already coordinate through WeChat groups, but chat threads are not a great marketplace.

Listings get buried quickly, category browsing is weak, search is limited, and trust signals are inconsistent. UniMarket exists to turn that messy flow into a dedicated student marketplace experience inside the app ecosystem people already use every day.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Product shell | WeChat Mini Program |
| UI | WXML + WXSS |
| Page logic | JavaScript |
| Local tooling | WeChat Developer Tools |
| Local persistence | WeChat local storage |
| Planned backend direction | Cloudflare Workers + D1 + R2 |

## Getting Started

### Prerequisites

- WeChat Developer Tools
- a valid Mini Program `AppID` or local test setup
- macOS, Windows, or Linux with Git and Node.js installed

### Open the project in WeChat DevTools

1. Clone the repository.
2. Open the project root in VS Code:

```bash
git clone https://github.com/theycallmedern/uni-market.git
cd uni-market
```

3. Open the same folder in WeChat Developer Tools:

```text
/path/to/uni-market
```

4. Compile the Mini Program from DevTools.

### Local checks

Run the repository validation script:

```bash
npm run check
```

## Project Structure

| Path | Purpose |
| --- | --- |
| [`miniprogram/app.json`](./miniprogram/app.json) | Global Mini Program configuration and `tabBar` |
| [`miniprogram/pages/index`](./miniprogram/pages/index) | Home feed and quick filters |
| [`miniprogram/pages/category`](./miniprogram/pages/category) | All categories and category detail views |
| [`miniprogram/pages/results`](./miniprogram/pages/results) | Search results, sorting, and filtering |
| [`miniprogram/pages/listing`](./miniprogram/pages/listing) | Listing detail page |
| [`miniprogram/pages/create`](./miniprogram/pages/create) | New listing form |
| [`miniprogram/pages/favorites`](./miniprogram/pages/favorites) | Saved listings |
| [`miniprogram/pages/profile`](./miniprogram/pages/profile) | Profile and user-published listings |
| [`miniprogram/data/market.js`](./miniprogram/data/market.js) | Shared local data layer |
| [`miniprogram/utils/saved.js`](./miniprogram/utils/saved.js) | Saved listing storage helpers |
| [`scripts/check.sh`](./scripts/check.sh) | Basic repository validation |
| [`scripts/generate_tabbar_icons.swift`](./scripts/generate_tabbar_icons.swift) | Tab bar icon generation script |

## Privacy And Security

UniMarket is currently designed as a local-first MVP.

- no production backend is bundled here
- do not commit any `AppSecret`, API key, Cloudflare token, or private environment value
- do not commit real student personal data, phone numbers, or private WeChat IDs from testing
- do not commit screenshots containing real addresses, identity documents, or private chats
- keep `project.private.config.json` local only

For expectations and reporting guidance, see [SECURITY.md](./SECURITY.md).

## Development Notes

- runtime pages currently rely on `.js`, `.wxml`, and `.wxss`
- some `.ts` and `.scss` files remain from the initial project template and are not the primary runtime source of truth
- product behavior should be validated in WeChat Developer Tools after each meaningful UI change

## Roadmap

- connect the marketplace to a real backend
- add editable listings
- add a usable inbox flow
- support moderation and reporting
- support real image upload and storage
- add authentication and verified student signals
- move from pure mock data to live data

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening pull requests or large changes.

## Changelog

Product-facing changes are tracked in [CHANGELOG.md](./CHANGELOG.md).

## License

This project is licensed under the [MIT License](./LICENSE).
