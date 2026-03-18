# Contributing

## Development Setup

1. Clone the repository.
2. Open the root folder in VS Code.
3. Open the same folder in WeChat Developer Tools.
4. Use the configured Mini Program root:

```text
miniprogram/
```

## Core Workflow

- make UI and logic changes in the repository files
- compile and verify in WeChat Developer Tools
- keep runtime edits aligned with the active `.js`, `.wxml`, and `.wxss` files
- keep local-only configuration out of git

## Checks

Run the lightweight repository validation:

```bash
npm run check
```

This command includes:

- syntax checks for runtime files
- smoke tests for core stores and marketplace lifecycle flow

CI runs the same check on push and pull requests via GitHub Actions.

## Manual Verification (MVP)

For user-facing changes, verify the relevant flow in WeChat Developer Tools:

- Home browsing and filters
- Create/edit listing (including photos)
- Profile save flow (including avatar and university privacy behavior)
- Report submission and moderation status update (when touching moderation logic)

## Documentation

Before merging user-facing changes:

- update `README.md` if the product flow changed
- update `SECURITY.md` if sensitive-data handling changed
- update `CHANGELOG.md` for meaningful product-visible changes
- update screenshots or branding references if UI identity changed

## Guidelines

- keep changes focused
- prefer simple Mini Program flows over unnecessary abstraction
- avoid committing private test data
- keep the MVP usable in WeChat DevTools at every stage
- preserve the current product direction: student marketplace first, platform complexity later
- keep one-city MVP assumptions explicit when changing location logic

## Pull Requests

Please include:

- a short product summary
- what pages were changed
- what commands or checks you ran
- whether the change affects local data or future backend assumptions
- a short note on which manual flow(s) you re-tested in WeChat DevTools
