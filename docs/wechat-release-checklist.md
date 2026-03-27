# WeChat Release Checklist

## 1. Cloudflare backend

- Production Worker is deployed as `unimarket-api`.
- Production custom domain is live:
  - `https://api.clauseon.tech`
- Production D1 and KV are bound.
- D1 migrations have been applied through `0007_listing_archive_lifecycle.sql`.
- Production secrets / vars required:
  - `JWT_SECRET`
  - `WECHAT_APP_ID`
  - `WECHAT_APP_SECRET`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

## 2. Mini Program API routing

- `develop` builds use the dev backend:
  - `https://unimarket-api-dev.mishabeliako.workers.dev`
- `trial` and `release` builds use the production backend:
  - `https://api.clauseon.tech`

This switch is handled in `miniprogram/services/api/config.js`.

## 3. WeChat console domains

Add these domains before review:

- `request 合法域名`
  - `https://api.clauseon.tech`
- `uploadFile 合法域名`
  - `https://api.cloudinary.com`
- `downloadFile 合法域名` / image domain
  - `https://res.cloudinary.com`

Current approved service category:

- `工具 > 信息查询`

## 4. Release flow

1. Run `npm run check`.
2. Run `npm run cf:deploy:prod`.
3. Verify login, profile, listing read/write, image upload, and archive/restore flows in WeChat DevTools.
4. In WeChat DevTools, click `Upload`.
5. In the WeChat mini program console, issue a `体验版` build for testing.
6. On phone, verify:
   - feed and category browse
   - create / edit / delete listing
   - save / unsave
   - image upload
   - archive restore flow
7. After final verification, `提交审核`.
8. When review passes, `发布`.

## 5. What needs review

- Backend-only changes do not require WeChat review.
- Mini program code changes require a new upload.
- Public user-facing mini program updates require review before release.

## 6. Current release status

- production backend: ready
- production legal domains: configured
- service category: approved
- next real gate: successful `Upload` + `体验版` verification on phone
