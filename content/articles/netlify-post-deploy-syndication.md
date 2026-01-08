---
title: Automating Bridgy Syndication with Netlify Functions
excerpt: A Netlify Function that sends webmentions to Bridgy after deploy and commits syndication URLs back to your repo.
permalink: "/article/netlify-post-deploy-syndication.html"
tags:
  - IndieWeb
  - webmentions
  - Netlify
  - Bridgy
  - Micropub
  - pinned

meta:
  title: Automating Bridgy Syndication with Netlify Functions
  desc: A Netlify Function that sends webmentions to Bridgy after deploy and commits syndication URLs back to your repo.
  img: https://michaelbishop.me/assets/img/og-image-bridgy-syndication-netlify.png
  img_alt: Automating Bridgy Syndication with Netlify Functions
---

I have been exploring ways to easily post to the site and syndicate to Bluesky for a few years. The obvious solution is [Micropub](https://micropub.spec.indieweb.org/) and [Bridgy](https://brid.gy) however the missing piece was how to automate all of the steps. The other thing I wanted was to avoid including the post link in the syndicated note. That creates a problem for Bridgy to "discover" the notes for backfeed. It requires a syndication link. Years ago using Jekyll I wired up (hacked) a solution using Travis CI to get the response from Bridgy and commit it back to the repo. Until last week, I hadn't found a solution to replicate that workflow.

Thanks to discovering [benjifs/serverless-micropub](https://github.com/benjifs/serverless-micropub) I revisited the idea and built a Netlify Function to handle the last mile.

## The Problem

When you post via Micropub with `mp-syndicate-to` targets, the post gets created with the syndication targets in frontmatter. But nothing actually _sends_ those webmentions. And even if it did, you'd want the syndication URLs (the Bluesky post URL, the Fediverse post URL) written back to your content for display and for Bridgy's backfeed to work.

## The Solution

A background function triggered by Netlify's deploy webhook:

1. After a successful deploy, Netlify hits `/post-deploy`
2. The function queries GitHub for recently changed content files
3. For each file with `mp-syndicate-to` but no `syndication` yet, it sends webmentions to Bridgy
4. Captures the syndication URLs from Bridgy's response
5. Commits the updated frontmatter back to the repo
6. **That commit triggers another build**, and the rebuilt post now displays "Also posted on" links

The whole loop closes automatically. Post from your Micropub client, wait for two builds (initial post, then syndication update), and your content shows up on Bluesky and Mastodon with the syndication links displayed on your site.

## How It Works

The function looks for frontmatter like this:

```yaml
mp-syndicate-to:
  - "https://fed.brid.gy/"
  - "https://brid.gy/publish/bluesky"
```

After sending webmentions, it adds:

```yaml
syndication:
  - "https://bsky.app/profile/me.bsky.social/post/abc123"
```

In your template, you can then render these as `u-syndication` links. Here's the Liquid I'm using:

{% raw %}

```liquid
{%- if syndication -%}
  <div class="syndication-links">
    <p>Also posted on:</p>
    <ul>
      {%- for url in syndication -%}
        <li>
          {%- if url contains 'bsky.app' -%}
            <a href="{{ url }}" class="u-syndication" rel="syndication">Bluesky</a>
          {%- elsif url contains 'mastodon' -%}
            <a href="{{ url }}" class="u-syndication" rel="syndication">Fediverse</a>
          {%- else -%}
            <a href="{{ url }}" class="u-syndication" rel="syndication">{{ url }}</a>
          {%- endif -%}
        </li>
      {%- endfor -%}
    </ul>
  </div>
{%- endif -%}
```

{% endraw %}

The key bits in the function:

- Uses the GitHub API to scan recent commits for changed `.md` files
- Parses YAML frontmatter to find syndication targets
- Sends standard webmentions to Bridgy endpoints
- Bridgy returns the syndication URL in the response (Location header or JSON body)
- Commits the updated file back via GitHub API

## Setup

You'll need:

- **Environment variables**: `ME`, `GITHUB_TOKEN`, `GITHUB_USER`, `GITHUB_REPO`
- **Netlify redirect**: `/post-deploy` → `/.netlify/functions/post-deploy`
- **Deploy webhook**: Netlify Dashboard → Notifications → Outgoing webhook on deploy succeeded

## The Code

I've extracted this into a standalone repo you can adapt for your own site:

**[miklb/netlify-post-deploy-syndication](https://github.com/miklb/netlify-post-deploy-syndication)**

It's a single function file with clearly marked configuration sections. Customize `getPostUrl()` for your permalink structure and `getBridgyEndpoint()` for your syndication targets.

## Why This Approach

The function approach hits the sweet spot—runs automatically, has access to GitHub for read/write, and logs are easy to check in the Netlify dashboard.

It pairs nicely with serverless-micropub. The micropub function handles creating posts, this function handles syndicating them. Clean separation.

## A Note on Webmentions in Post Content

There's another piece to the puzzle: sending webmentions for links _within_ your post content. For that I'm using [netlify-plugin-webmentions](https://github.com/CodeFoodPixels/netlify-plugin-webmentions), which scans your feed after each build and sends webmentions to any mentioned URLs.

However, I ran into an issue where URL timeouts during webmention discovery would fail the entire build. Not great when you're linking to a slow site or one that's temporarily down.

I've forked the plugin to log warnings instead of throwing errors: **[miklb/netlify-plugin-webmentions](https://github.com/miklb/netlify-plugin-webmentions)**

To use the fork:

```bash
npm install -D github:miklb/netlify-plugin-webmentions
```

Then in `netlify.toml`:

```toml
[[plugins]]
package = "netlify-plugin-webmentions"
```

This overrides the Netlify app plugin with the forked version. I've submitted a PR to the upstream project, but in the meantime the fork keeps my builds from failing due to external site issues.

## The Full Flow

1. **Post via Micropub** → serverless-micropub commits to GitHub
2. **First build** → Post goes live, netlify-plugin-webmentions sends webmentions for linked content
3. **Deploy webhook** → post-deploy function sends webmentions to Bridgy
4. **Bridgy responds** → Function commits syndication URLs to frontmatter
5. **Second build** → Post now shows "Also posted on" links, Bridgy can discover for backfeed
