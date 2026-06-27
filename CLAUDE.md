# michaelbishop.me — project guidance

Personal blog and IndieWeb home. 11ty v3 static site served on **Cloudflare
Workers Static Assets** (not Pages, not Netlify). This file is canonical for this
repo and overrides anything in the global `~/.claude/CLAUDE.md` (the Tampa
Monitor conventions there do **not** apply here).

## Stack

- **11ty v3**, ESM, **Nunjucks** templates. Input `content/`, output `_site/`,
  includes/layouts in `_includes/`. Config in `eleventy.config.js` + `_config/`.
- **Cloudflare Workers** via `wrangler` (`wrangler.jsonc`). Currently
  **assets-only** (no Worker entry point) — `not_found_handling: "404-page"`
  serves `_site/404.html`.
- **Node is pinned to 26** (`.nvmrc`, `engines`). Track **bleeding-edge 11ty** —
  upgrading 11ty is welcome; if a dep blocks a Node/11ty bump, replace the dep,
  don't pin back.
- CSS via PostCSS (`postcss-preset-env`, `cssnano`). OG card images generated at
  build time.

### Don't reintroduce `node-canvas`

OG images (`scripts/generate-og-images.js`) use **`@napi-rs/canvas`**, not the
`canvas` package. `node-canvas` ships native binaries tied to the Node ABI and
breaks on new Node releases (`ERR_DLOPEN_FAILED` on Node 26). `@napi-rs/canvas`
ships N-API prebuilds that are ABI-stable across Node versions — that's what lets
us pin Node 26 and stay current. Same API surface (`createCanvas`, `loadImage`,
`ctx.*`, `toBuffer`). If you ever need richer text/SVG, prefer `satori`+`resvg`
over going back to `node-canvas`.

## Posting model (how content goes live)

Git-based: write markdown → commit to `main` → `.github/workflows/deploy.yml`
builds (`npm run build`), deploys (`wrangler deploy`), then syndicates.

- **Post types**: `content/notes/`, `content/replies/`, `content/articles/`.
  Microformats2 (`h-entry`) + Bridgy Fed / Bridgy Bluesky. Reply context and
  Bridgy content-separation live in `_includes/layouts/article.njk`
  (see `PORTING-GUIDE.md`).
- **Syndication**: `scripts/send-webmentions.js` (`npm run webmention`) sends
  webmentions to Bridgy and writes captured syndication URLs back to frontmatter.
  CI passes **changed files as args** to scope it to new posts; run with no args
  for a recent-posts scan (handy for backfill).
- Captured syndication URLs are committed back with `[skip ci]` to avoid a
  rebuild loop.

## Deploy / preview commands

This site is **Workers, not Pages** — the global `/deploy-preview` and
`/port-component` skills don't apply. Use wrangler directly:

```bash
npm run build && npx wrangler deploy           # production
npm run build && npx wrangler versions upload  # preview URL (no traffic)
npm run dev:cf                                  # 11ty watch + wrangler dev
```

CI needs repo secrets `CF_API_TOKEN` and `CF_ACCOUNT_ID`.

## Deferred / future direction

- **Micropub + `/admin` posting UI on a Worker** — scaffolding exists
  (`src/worker.js`, `src/handlers/*`, `functions/api/`, `content/pages/admin/`)
  but is **not** wired into the static deploy. Full plan:
  `CLOUDFLARE-WORKERS-PORT.md` (Phases 2–5: Worker entry, R2 uploads, CF Access,
  cron webmentions).
- **Content backfill** — importing/normalizing older posts.
- **Photo galleries from Apple Photos** — publishing image sets from the user's
  Apple Photos library. Will land on a future branch; likely wants R2 for
  originals + `eleventy-img` responsive variants. Keep an eye on EXIF/GPS
  stripping when this lands.

`netlify/`, `netlify.toml`, and the `netlify-*` dirs are kept only for rollback
until the DNS cutover from Netlify is verified; remove them afterward.
