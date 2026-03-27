# Cloudinary setup for backend-signed Mini Program uploads

This project now supports publishing listing photos without Cloudflare R2.

## How it works

1. The Mini Program goes through the runtime uploader contract in [runtime-uploader.js](/Users/misabelakov/Documents/uni-market/miniprogram/services/media/runtime-uploader.js)
2. The Mini Program asks the Cloudflare Worker for a signed upload payload
3. The Worker signs Cloudinary upload params with the Cloudinary API secret
4. The Mini Program uploads the file directly to Cloudinary with that signed payload
5. Cloudinary returns public `https://...` image URLs
6. The app sends those URLs to the Cloudflare Worker
7. The Worker stores them in D1 as listing image URLs

## Configure the backend

Fill in Cloudflare worker secrets / vars:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- optionally `CLOUDINARY_FOLDER`

For local/dev reference, see [.dev.vars.example](/Users/misabelakov/Documents/uni-market/.dev.vars.example).

## Backend publish mode

In [miniprogram/services/api/config.js](/Users/misabelakov/Documents/uni-market/miniprogram/services/api/config.js):

- keep `USE_BACKEND_LISTING_READS = true`
- keep `USE_BACKEND_LISTING_WRITES = true` once signed Cloudinary upload is configured

## Current behavior

- Backend create and edit both use the uploader contract when backend writes are enabled
- If backend writes are enabled but upload is not ready, the app now stops with an explicit validation error instead of silently falling back to device-local publish
- The current provider is backend-signed Cloudinary upload; later this contract can be switched to R2 without changing the page logic
- Current WeChat legal domains required for media:
  - `uploadFile`: `https://api.cloudinary.com`
  - `downloadFile`: `https://res.cloudinary.com`
