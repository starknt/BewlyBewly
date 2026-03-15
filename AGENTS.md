# AGENTS.md

## Cursor Cloud specific instructions

### Overview

BewlyBewly is a Manifest V3 browser extension that redesigns the Bilibili (bilibili.com) UI. Built with Vue 3, TypeScript, Vite, and pnpm. No backend services or databases are required — it's entirely client-side.

### Key commands

See `package.json` scripts for the full list. The most commonly used:

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev build for Chrome/Edge (watch mode, HMR on port 3303) |
| `pnpm dev-firefox` | Dev build for Firefox |
| `pnpm build` | Production build → `extension/` |
| `pnpm lint` | ESLint |
| `pnpm test -- --run` | Vitest unit tests (non-watch mode) |
| `pnpm typecheck` | vue-tsc type checking |

### Running the extension in Chrome

1. Start `pnpm dev` in background
2. Launch Chrome: `google-chrome --no-first-run --disable-default-apps --no-sandbox --load-extension=/workspace/extension https://www.bilibili.com/ &`
3. The extension injects content scripts into `*.bilibili.com` pages — there is no popup action in the toolbar

### Gotchas

- `pnpm dev` runs 4 parallel sub-processes (`dev:prepare`, `dev:web`, `dev:js`, `dev:bg`). It takes ~15 seconds for all to stabilize. Wait until the Vite dev server prints "ready" and the content script build completes before loading the extension.
- The `postinstall` hook runs `npx simple-git-hooks` to set up a pre-commit hook (`pnpm lint-staged`). This is harmless but produces output during `pnpm install`.
- Node.js deprecation warnings (`DEP0180`, `DEP0040`) appear during lint/test/build — these are benign and from upstream dependencies.
- The project requires `shamefully-hoist=true` in `.npmrc` (already configured).
- Testing the extension requires internet access to bilibili.com since it modifies live pages.
