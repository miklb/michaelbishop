# Redesign — open items

Working notes for the Ink & Ledger pass. Delete this file when the list is empty.

## Where this left off (2026-10-04)

Direction **A · Ink & Ledger** was chosen from three prototypes
(https://claude.ai/artifact/FmGSrHcjCqU2F3aXmQuqDH). Paper and ink, hairline
rules, one vermilion accent in both colour schemes, Newsreader + IBM Plex Mono
self-hosted. Home page is now the log — a reverse-chronological stream of every
post type — and the pinned-article grid is gone.

Two earlier attempts are dead ends worth not repeating: the 2026-06-30 washi/
hanko re-skin (simulated paper texture in the chrome; never committed) and
anything that puts the drop shadows back.

## Open

### Decide
- **`he/him · Tampa, FL`** in the h-card masthead is pitched very quiet —
  `--font-size--1`, mono, `--text2`, inline after the name. Either give it its
  own line or fold it back into the bio sentence.
- **The backfilled print.** `content/prints/sheepshead-december.md` was created
  to exercise the pipeline, then re-dated to the print's real date (2022-12-22)
  and stripped of its Bridgy anchors so it would not announce itself as new.
  Keep it, re-date it, or delete it (and `content/img/prints/sheepshead-december.jpg`).
- **Home page copy** in `content/index.html` was edited: the executive-chef /
  throughline line folded in, `gyotaku` linked to `/prints/`, the bare
  tampamonitor.com URL turned into a link, and the standalone `tampa, fl` and
  `he/him` paragraphs dropped now that the masthead carries them. Review the voice.

### Build
- **PostCSS still never runs.** `postcss.config.js`, `postcss-cli`, `cssnano`,
  `postcss-preset-env` and `@jgarber/eleventy-plugin-postcss` are all installed
  and both `README.md` and `CLAUDE.md` claim CSS goes through it, but nothing
  registers the plugin — `public/` is passthrough-copied raw. The browser now
  makes serial requests for **11** `@import`ed stylesheets. Either register the
  plugin (bundle + minify) or remove the dead deps and correct both docs.
- **`--grid-max-width: 77.5rem` is unused.** The site is one centred column
  now (`--measure`), and although `.site-grid` is still a 12-column grid, every
  child spans all 12. The grid and its gutter variables could collapse.
- **`/bio.html` and `/listening.html`** have not been looked at in the new type
  scale. They use `layouts/default.njk`, which also has a latent bug: its
  `<time>` reads `post.date`, an undefined variable in that layout, so the
  `datetime` attribute renders empty.
- **`.single-post` subgrid** (`layout.css`) targets `grid-template-columns: subgrid`
  on an element whose parent is not a grid, so it silently does nothing. Harmless
  today, but it is why `.content-wrap` spanning 5 columns has no effect.

### Microformats
- **Webmention authors parse as top-level `h-card`s** on article pages (five on
  the Netlify post). They sit outside the `h-entry` in `webmentions.njk`, so a
  parser reads the page as one entry plus five loose people rather than an entry
  with comments. Fixing it means restructuring `webmentions.njk` to nest them as
  `p-comment` / `h-cite`.
- Verified correct as of this commit, by parsing the built HTML with
  `microformats-parser`: `/` is one `h-card` plus a named `h-feed` whose entries
  each carry `published`, `author`, `content`, `url`; single posts carry
  `published`, `url`, `author` (all three were missing before this pass); prints
  carry entry-level `u-photo`; notes stay correctly nameless.

### Prints / photos
- **The first real syndication is unverified.** A print's hidden
  `e-bridgy-bluesky-content` override now contains the whole `<picture>`, so
  `u-photo` appears twice in the entry. Whether granary reads that as one image
  or two only shows up on a live post. For the first print, run with
  `--no-syndicate`, check the live page, then add the two Bridgy anchors and
  commit again so the first syndication is deliberate.
- **`/photos` is an empty room.** Same intake path (`npm run print -- <file>
  "Title" --photo`), nothing posted yet.
- **Older originals still carry EXIF.** `content/img/` holds committed images
  with Apple camera metadata (`cardinals-feeding.jpeg`, `sheepshead-12-23.jpeg`
  and others). New prints and photos go through sharp and come out clean, but
  the existing ones were never stripped — and they are in a public repo.
- **The OG card script ignores prints.** `scripts/generate-og-images.js`
  hard-codes `content/articles`, which is fine: a print's `meta.img` points at
  the print itself. Worth knowing if prints ever need generated cards.

### Content hygiene (pre-existing, unrelated to the design)
- `content/notes/gyotaku_updates_3-15.md` — a stray `"` in the `<img>` tag makes
  markdown-it escape the whole thing, so the page shows literal markup, and the
  escaped junk also went into the hidden Bluesky div and syndicated as text.
  The `src` is wrong too (relative, resolves against the note's own directory).
- `_data/site.json` — `author.url` points at `/about-me/`, which 404s; the page
  is `/bio.html`. Host is `www.` in some files and bare in others.
  `_data/meta.json` has `twitter_card_type: "summmary"`.
- ~11 of 107 notes are Micropub/QuickPost test posts, and they are in the
  archive and the feed.
- Tag hygiene: 68 distinct tags, case variants (`IndieWeb`/`indieweb`/`Indieweb`,
  `CSS`/`css`, `Gyotaku`/`gyotaku`), a typo (`accessiblity`), a blank `" "` tag,
  and `11ty` split from `Eleventy`. Nothing renders tags today, so this only
  matters if tag pages ever land.

## Gotcha worth not rediscovering

`unfurlUrls` is an **async** Nunjucks filter, and Nunjucks runs neither macros
nor `{% include %}` through its async code path. Calling it in either returns an
empty string **and empties the whole template, with no build error**. It works
in `{% set %}` at the top level of a template, which is why the stream and
archive precompute `itemBody` and `_includes/entry.njk` just prints it. Do not
"tidy" that into the partial.
