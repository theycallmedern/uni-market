# Changelog

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
