# Security Policy

## Supported Versions

Only the latest state of the `main` branch is currently treated as supported.

At the moment that means:

- `main` — supported
- older commits and local experiments — unsupported

## Sensitive Data In This Project

This repository is a local-first WeChat Mini Program MVP.

Treat the following as sensitive:

- any future Mini Program `AppSecret`
- Cloudflare API tokens, account IDs, or database credentials
- local testing screenshots containing real personal data
- private WeChat IDs or phone numbers collected during testing
- real housing addresses, identity information, or contract photos
- any backend environment file introduced later
- local-only WeChat Developer Tools private config

Do not publish any of the above in public issues.

## Local-First Scope

The current repository:

- does not include a production backend
- does not include payments
- stores MVP-created listings locally for testing
- stores saved listings locally for testing
- stores profile fields and moderation reports locally for testing
- uses a local admin unlock flow for moderation tools

The most realistic risks right now are:

- accidentally committing secrets later
- exposing personal student data in screenshots or test fixtures
- publishing local-only WeChat configuration that should remain private
- treating local-only admin logic as production-grade authorization

## Known MVP Security Limitations

The moderation/admin access model in this MVP is intentionally local and prototype-only.

- admin unlock is device-local
- role checks are client-side
- moderation control is not backed by server authentication

Do not treat this as production-ready access control.

Before production deployment, move permissions and moderation state to a backend-authenticated system.

## Safe Reporting

If you discover a security issue, report it privately instead of opening a public issue with sensitive details.

Include:

- a short description
- impact
- clear reproduction steps
- whether credentials or personal student data are involved

## Good Security Practices

When working in this repo:

- never commit a real `AppSecret`
- never commit Cloudflare credentials
- keep `project.private.config.json` local-only
- use synthetic or scrubbed screenshots in documentation
- prefer test data that does not identify real students
- do not publish real admin credentials in docs, issues, screenshots, or commits

## Disclosure Expectations

Please allow reasonable time to review and fix a valid report before publishing full details.
