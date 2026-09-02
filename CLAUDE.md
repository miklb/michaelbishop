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

Git-based: write markdown → commit to `main` → **Cloudflare Workers Builds**
(native Git integration) runs `npm run build` and `wrangler deploy` →
`.github/workflows/syndicate.yml` syndicates to Bridgy.

- **Local posting**: `npm run note -- "slug"` scaffolds a note and opens it in
  VS Code; `npm run post` commits everything under `content/` and pushes. Both
  are also VS Code tasks ("New note", "Publish post").
- **QuickPost** (`app/`): native SwiftUI menu bar app for notes + replies —
  writes the file, commits just it, rebase-pushes to `main`. Its templates in
  `app/Sources/QuickPost/PostService.swift` must stay in sync with
  `scripts/new-note.js` and the Bridgy link conventions; build with
  `app/build.sh` (CLT only, no Xcode). See `app/README.md`.
- **Dates must be explicit in frontmatter.** Workers Builds uses a shallow
  clone, so 11ty's `"git Created"` / `"git Last Modified"` silently resolve to
  build time in production (every post dated "today"). The `"git Created"`
  defaults in `content/*/*.json` are a local-only fallback — every committed
  post carries a real `date:`, the note scaffolder and snippets stamp one, and
  never rely on git dates for anything user-visible.
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

## Deploy / preview

Deploys run on **Cloudflare Workers Builds** (dashboard → the `michaelbishop`
Worker → Builds), triggered by pushes to `main`. Build command **must** be
`npm run build` (the `_site/` output is gitignored, so it doesn't exist until the
build runs); deploy command is `npx wrangler deploy`, reading `wrangler.jsonc`;
version command `npx wrangler versions upload` (branch/PR previews).
**No GitHub `CF_*` secrets** — the GitHub App connection authenticates builds.

### Build-time secrets (Workers Builds)

These are consumed by Node during `npm run build` (11ty `_data/` fetches), **not**
by the runtime Worker — set them as **Build variables and secrets** in Workers
Builds, not as Worker runtime secrets. Locally they live in the gitignored `.env`.

| Name | Used by | Purpose |
| --- | --- | --- |
| `LFM_API_KEY` | `_data/lastfm.js` | LastFM listening data on `/listening.html` |
| `WEBMENTION_IO_TOKEN` | `_data/webmentions.js` | webmention.io counts/data on posts |

If a Workers Build runs **without** these, the build still succeeds but that data
comes back empty/unauthorized and silently disappears from the live site —
re-trigger a build after the secrets are set.

This site is **Workers, not Pages** — the global `/deploy-preview` and
`/port-component` skills don't apply. For local checks:

```bash
npm run build && npx wrangler deploy           # manual production deploy
npm run build && npx wrangler versions upload  # preview URL (no traffic)
npm run dev:cf                                  # 11ty watch + wrangler dev
```

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

