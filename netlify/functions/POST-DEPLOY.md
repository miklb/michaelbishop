# Post-Deploy Webmention Syndication

A Netlify Function that automatically sends webmentions to Bridgy services after a successful deploy, then commits syndication URLs back to the source files.

This function is designed to work alongside [serverless-micropub](https://github.com/benjifs/serverless-micropub) to complete the syndication workflow.

## How It Fits

```
Micropub Client → serverless-micropub → GitHub Commit → Netlify Build
                                                              ↓
                                                        post-deploy.js
                                                              ↓
                                                    Bridgy Webmentions
                                                              ↓
                                                  Syndication URLs → GitHub
```

When you publish via Micropub with `mp-syndicate-to` targets, this function:

1. Detects the new content after deploy
2. Sends webmentions to Bridgy endpoints
3. Captures syndication URLs from responses
4. Commits updated frontmatter back to your repo

## Setup

### Environment Variables

| Variable       | Description                                             |
| -------------- | ------------------------------------------------------- |
| `ME`           | Your site's canonical URL (e.g., `https://example.com`) |
| `GITHUB_TOKEN` | GitHub Personal Access Token with `repo` scope          |
| `GITHUB_USER`  | GitHub username                                         |
| `GITHUB_REPO`  | Repository name                                         |

### Netlify Configuration

Add to `netlify.toml`:

```toml
[[redirects]]
from = "/post-deploy"
to = "/.netlify/functions/post-deploy"
status = 200
```

### Deploy Notification Webhook

1. Go to **Netlify Dashboard → Site settings → Notifications**
2. Click **Add notification → Outgoing webhook**
3. Event: **Deploy succeeded**
4. URL: `https://your-site.netlify.app/post-deploy`

## Frontmatter

The function looks for `mp-syndicate-to` in your post frontmatter and adds `syndication` after successful webmentions:

**Before:**

```yaml
---
date: 2025-01-08T10:30:00
mp-syndicate-to:
  - "https://fed.brid.gy/"
  - "https://brid.gy/publish/bluesky"
---
```

**After:**

```yaml
---
date: 2025-01-08T10:30:00
mp-syndicate-to:
  - "https://fed.brid.gy/"
  - "https://brid.gy/publish/bluesky"
syndication:
  - "https://bsky.app/profile/example.bsky.social/post/abc123"
---
```

## Supported Targets

| Target                            | Bridgy Endpoint                      |
| --------------------------------- | ------------------------------------ |
| `https://fed.brid.gy/`            | `https://fed.brid.gy/webmention`     |
| `https://brid.gy/publish/bluesky` | `https://brid.gy/publish/webmention` |

### Adding More Targets

Extend the `sendWebmention()` function:

```javascript
if (target.includes("brid.gy/publish/mastodon")) {
  endpoint = "https://brid.gy/publish/webmention";
}
```

## Customization

### URL Structure

Adjust `getPostUrl()` to match your site's permalink structure:

```javascript
function getPostUrl(filePath) {
  // content/notes/1234.md → /notes/1234/
  // content/articles/foo.md → /article/foo/
  const match = filePath.match(/content\/(notes|articles)\/(.+)\.md$/);
  if (!match) return null;

  const type = match[1] === "notes" ? "notes" : "article";
  const slug = match[2];
  return `${SITE_URL}/${type}/${slug}/`;
}
```

### Time Window

By default, the function checks commits from the last hour. Adjust in `getRecentContentFiles()`:

```javascript
const since = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour
```

## Debugging

Check function logs in **Netlify Dashboard → Functions → post-deploy → Logs**

Common log messages:

- `"already syndicated"` — File already has `syndication` field (skipped)
- `"no syndication targets"` — No `mp-syndicate-to` in frontmatter
- `"Unknown target"` — Target URL not recognized

## Bridgy Setup

### Bridgy Fed (Fediverse)

Add these redirects for ActivityPub discovery:

```toml
[[redirects]]
from = "/.well-known/host-meta*"
to = "https://fed.brid.gy/.well-known/host-meta:splat"
status = 302

[[redirects]]
from = "/.well-known/webfinger*"
to = "https://fed.brid.gy/.well-known/webfinger"
status = 302
```

### Bridgy Bluesky

Connect your Bluesky account at [brid.gy](https://brid.gy/).

## License

MIT
