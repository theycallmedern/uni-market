# UniMarket

<p align="center">
  <img src="./miniprogram/assets/brand/unimarket-logo.png" alt="UniMarket logo" width="112" />
</p>

<p align="center">
  <strong>Backend-enabled WeChat Mini Program marketplace for international students in Hangzhou.</strong>
</p>

<p align="center">
  UniMarket turns scattered chat-based buying and selling into a focused marketplace flow with discovery, trust signals, seller tooling, and moderation-ready controls.
</p>

<p align="center">
  <a href="https://github.com/theycallmedern/uni-market/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/theycallmedern/uni-market/ci.yml?branch=main&style=flat-square&label=build"></a>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-111827?style=flat-square"></a>
  <img alt="Version" src="https://img.shields.io/badge/version-0.4.0-111827?style=flat-square">
  <img alt="Platform" src="https://img.shields.io/badge/platform-WeChat%20Mini%20Program-07C160?style=flat-square">
  <img alt="Status" src="https://img.shields.io/badge/status-production%20api%20live-1F2937?style=flat-square">
</p>

<p align="center">
  <code>WeChat Mini Program</code>
  <code>JavaScript</code>
  <code>WXML + WXSS</code>
  <code>Cloudflare Workers + D1</code>
  <code>Cloudinary uploads</code>
  <code>Dark mode</code>
  <code>Moderation tooling</code>
</p>

## ✨ Elevator Pitch

UniMarket is a marketplace shell designed for student communities that still coordinate heavily through WeChat.

Instead of forcing a backend-first marketplace too early, the project focuses on what matters first:

- faster discovery across housing, items, electronics, study resources, services, and transport
- cleaner posting and seller inventory management
- richer seller trust context through profiles, reviews, saves, and seller insights
- moderation flows that work behind a real backend boundary

> [!IMPORTANT]
> The Mini Program now runs against a deployed Cloudflare Worker backend for `trial` and `release` builds. `develop` still uses a dev backend, and a few UX-only preferences remain device-local by design (theme, locale, draft/navigation state).

## 🎥 Demo

Interactive walkthrough assets are intentionally omitted from the repository for now. Use WeChat DevTools to explore the current MVP flow locally.

## 🚀 Features

- **Category-first discovery** for `Housing`, `Items`, `Electronics`, `Transport`, `Study`, `Services`, and `Other`
- **Fast marketplace browsing** with search, category pages, results filters, subcategory exploration, and promoted listings
- **Create + edit listing flow** with photo uploads, draft recovery, custom subcategories, price normalization, and condition selection
- **Seller inventory management** with open, edit, relist, mark-sold, delete, and archive flows
- **30-day listing lifecycle** with automatic archive after 30 days and one-tap restore from archive
- **Seller profiles and reviews** with trust states, listing history, review summaries, and public/private profile views
- **Seller Pro surfaces** with insights, saved/view counts, listing performance, and premium-style profile presentation
- **Backend moderation tooling** for listing reports, profile reports, hidden content states, and admin review actions
- **Dark theme support** across core screens including profile, settings, listing flows, search, categories, and results
- **Production API routing** with `develop -> dev workers.dev` and `trial/release -> api.clauseon.tech`
- **Backend-signed image uploads** through Cloudinary without exposing secrets inside the Mini Program
- **Saved flow and visibility preferences** with cleanup mechanics for unavailable listings and blocked sellers
- **Shared UX infrastructure** for validation, storage, tab bar sync, feedback modals/toasts, and smoke-test coverage

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| App shell | WeChat Mini Program |
| UI | WXML + WXSS |
| Runtime | JavaScript |
| Backend | Cloudflare Workers |
| Database | Cloudflare D1 |
| Cache / prefs sync | Cloudflare KV |
| Media uploads | Cloudinary |
| Persistence | Backend + selective `wx` local storage |
| Tooling | Node.js, shell scripts, WeChat DevTools |
| Quality gate | `scripts/check.sh`, smoke tests, syntax checks |
| CI | GitHub Actions |
| Production API | `https://api.clauseon.tech` |

## 📦 Installation

### Prerequisites

- WeChat Developer Tools
- Node.js 18+ recommended
- Git

### Clone the repository

```bash
git clone https://github.com/theycallmedern/uni-market.git
cd uni-market
```

### Install dependencies

```bash
npm install
```

### Run local quality checks

```bash
npm run check
```

`npm run check` currently runs:

- JavaScript syntax validation across `miniprogram/` and `scripts/`
- smoke tests for listings, saved state, category-to-results flow, and inventory mechanics

## ▶️ Usage

### Open in WeChat DevTools

Set the Mini Program root to:

```text
miniprogram/
```

### Typical developer workflow

```bash
# 1. install deps
npm install

# 2. run checks before opening DevTools
npm run check

# 3. open the repo in WeChat DevTools
# Mini Program root: miniprogram/
```

### Typical product flow

1. Open `Search` and browse by category or search query.
2. Open a listing and inspect photos, chips, seller card, and saved state.
3. Switch to `Post` to create or edit a listing.
4. Manage active and sold inventory in `Listings`.
5. Open `Profile` and `Settings` to manage public profile, theme, and admin access.

## 🧩 API / CLI

UniMarket does not expose a public third-party API or end-user CLI.

The developer-facing commands are intentionally small:

| Command | Purpose |
| --- | --- |
| `npm run check` | Run syntax checks + smoke tests |
| `bash scripts/check.sh` | Direct quality-gate script |
| `node scripts/smoke-test.js` | Run smoke scenarios explicitly |
| `node scripts/worker-smoke-test.js` | Run Worker/API smoke scenarios |
| `npm run cf:d1:migrate:dev` | Apply dev D1 migrations |
| `npm run cf:d1:migrate:prod` | Apply production D1 migrations |
| `npm run cf:deploy:dev` | Deploy dev Worker |
| `npm run cf:deploy:prod` | Deploy production Worker |

### Example listing shape

```js
{
  id: 1773928375491,
  title: "logo",
  price: "250 RMB",
  location: "Hangzhou",
  university: "Zhejiang University",
  categoryId: "other",
  subcategory: "Other items",
  condition: "New",
  isSold: false,
  isArchived: false,
  expiresAt: "2026-04-26T12:00:00.000Z",
  seller: {
    name: "demo_anna",
    wechat: "demo_anna",
    city: "Hangzhou"
  }
}
```

## 🗂 Project Structure

```text
uni-market/
├── .github/                    # CI workflows and repository automation
├── docs/
│   └── screenshots/            # README visual assets
├── miniprogram/
│   ├── assets/                 # brand, tab bar, and subcategory media
│   ├── components/             # shared UI components
│   ├── custom-tab-bar/         # custom navigation shell
│   ├── data/                   # local fallback store + marketplace helpers
│   ├── pages/
│   │   ├── index/              # home feed
│   │   ├── category/           # category browsing
│   │   ├── results/            # filtered results
│   │   ├── favorites/          # saved listings
│   │   ├── create/             # create/edit listing flow
│   │   ├── listing/            # listing detail
│   │   ├── messages/           # seller inventory + archive
│   │   ├── user-profile/       # public / own seller profile
│   │   ├── profile/            # account overview
│   │   ├── settings/           # theme + admin settings
│   │   └── moderation/         # moderation inbox
│   ├── services/api/           # runtime API adapters and backend clients
│   ├── utils/                  # storage, validation, stats, saved state
│   └── constants/              # centralized UI copy
├── scripts/
│   ├── check.sh                # local quality gate
│   ├── smoke-test.js           # Mini Program smoke scenarios
│   └── worker-smoke-test.js    # Worker/API smoke scenarios
├── worker/                     # Cloudflare Worker and D1 migrations
├── README.md
└── package.json
```

## ⚙️ Configuration

The repository uses checked-in config plus Cloudflare secrets/vars.

### Current local configuration model

| Key | Where it lives | Purpose |
| --- | --- | --- |
| WeChat App ID | `project.config.json` / DevTools | Mini Program project binding |
| Dev backend vars | `.dev.vars.example` | Local reference for Worker secrets/vars |
| Cloudflare envs | `wrangler.toml` | Worker, D1, KV bindings |
| Local theme mode | `wx` storage | Light / dark theme persistence |
| Locale | `wx` storage | App language |
| Draft listing data | `wx` storage | Restore unfinished listing flow |

### Active backend secrets / vars

```bash
JWT_SECRET=
WECHAT_APP_ID=
WECHAT_APP_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## 🧪 Testing

Run the full local check suite:

```bash
npm run check
```

Or run the underlying pieces directly:

```bash
node --check miniprogram/pages/create/create.js
node scripts/smoke-test.js
bash scripts/check.sh
```

What is covered today:

- storage and validation paths
- category-to-results filtering
- create/edit listing logic
- favorites flow
- listing and profile-related state transitions
- Worker API auth/listing/media-ready flows

## 🚢 Deployment

Current deployment target is WeChat Mini Program `trial/release` backed by Cloudflare Workers.

### Deploy backend

```bash
npm run cf:d1:migrate:prod
npm run cf:deploy:prod
```

### WeChat release

1. Run `npm run check`
2. Upload the Mini Program bundle in WeChat DevTools
3. Issue a `体验版`
4. Verify create/edit/delete, save, archive/restore, and image upload on phone
5. Submit for review

```bash
# open project in WeChat DevTools
# use Preview or simulator inside the IDE
```

### Release path today

1. Run `npm run check`
2. Validate changed flows in WeChat DevTools
3. Upload via WeChat DevTools
4. Promote build through the Mini Program console

### Planned production direction

- backend-backed auth and moderation roles
- cloud image storage
- multi-device sync
- server-enforced reporting and visibility rules

## 🛣 Roadmap

- [x] Local marketplace MVP shell
- [x] Category and results browsing
- [x] Create/edit flow with drafts and validation
- [x] Saved listings and listing lifecycle
- [x] Seller profile, reviews, and insights
- [x] Local moderation inbox
- [x] Dark theme foundation across major surfaces
- [x] Shared smoke tests + CI
- [ ] Backend sync and authenticated roles
- [ ] Cloud media pipeline
- [ ] Real messaging and notifications
- [ ] Search ranking and recommendation tuning
- [ ] Campus-aware map and geo discovery

## 🤝 Contributing

Contributions are welcome, especially around product polish, Mini Program ergonomics, testing, and local-first architecture improvements.

Before opening a PR:

1. Run `npm run check`
2. Validate changed flows in WeChat DevTools
3. Update docs when user-facing behavior changes
4. Keep changes focused and avoid unrelated reformatting

See:

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- [SECURITY.md](./SECURITY.md)

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

## 👥 Authors / Credits

- **Misha Belakov** — product direction, concept, and implementation
- **Contributors** — UI, logic, docs, testing, and polish improvements

Additional credits:

- subcategory artwork and UI assets live in `miniprogram/assets/`
- listing demo imagery currently mixes bundled assets and remote placeholders used for MVP presentation
