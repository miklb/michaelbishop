# Internet Home of Michael Bishop

Cranking this bad boy back up.

I've thought long and hard on how **I** want to make websites for **me**. This is where I've landed. Eleventy as a static site generator, PostCSS for styling, served on Cloudflare Workers Static Assets. I am borrowing heavily from work I've previously done with Jekyll-IndieWeb.

It's an IndieWeb site at heart: posts are `h-entry` microformats, webmentions flow through [webmention.io](https://webmention.io), and [Bridgy](https://brid.gy) syndicates notes and replies to Bluesky and the fediverse. After years of trying Micropub servers and clients, I landed somewhere simpler — publishing is just markdown committed to `main`, and everything downstream is automated.

## Posting

Content is git-based: markdown lands on `main`, Cloudflare Workers Builds
deploys, and a GitHub Action syndicates to Bluesky/the fediverse via
[Bridgy](https://brid.gy). Three ways in:

- **[QuickPost](app/)** — a native macOS menu bar app for quick notes and
  replies (copy a `bsky.app` link, click, type, ⌘↩). See [app/README.md](app/README.md).
- `npm run note -- "slug"` + `npm run post` — terminal/VS Code flow for notes.
- Plain markdown in `content/` committed by hand — articles and everything else.

See a bug? Please [open an issue](https://github.com/miklb/michaelbishop/issues).

Reference:

[Eleventy](https://www.11ty.dev)

[PostCSS](https://postcss.org)

[Jekyll IndieWeb](https://github.com/miklb/jekyll-indieweb)

[Eleventy Base Blog](https://github.com/11ty/eleventy-base-blog)

[Smix Eleventy Starter](https://github.com/MaybeThisIsRu/smix-eleventy-starter)

[Last.fm Listening Page](https://xavibenjamin.com/2020/07/how-i-made-my-badass-listening-to-section/)
