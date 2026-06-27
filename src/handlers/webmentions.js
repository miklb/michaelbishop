// Webmention discovery via RSS feed, triggered by cron
// Replaces netlify-plugin-webmentions (@remy/webmention)

export async function handleWebmentions(env) {
  const siteUrl = (env.ME || 'https://michaelbishop.me').replace(/\/$/, '');
  const feedUrl = `${siteUrl}/feed.xml`;
  const limit = 3; // Process last N entries per run

  console.log(`Discovering webmentions from ${feedUrl}, limit=${limit}`);

  try {
    const response = await fetch(feedUrl, {
      headers: { 'User-Agent': 'CF-Workers-webmention-discovery' },
    });

    if (!response.ok) {
      console.error(`Failed to fetch feed: ${response.status}`);
      return;
    }

    const xml = await response.text();
    const entries = parseEntries(xml, limit);
    console.log(`Found ${entries.length} entries to check`);

    let sent = 0;
    let errors = 0;

    for (const entry of entries) {
      const links = extractLinks(entry.content);

      for (const targetUrl of links) {
        // Skip internal links and known syndication targets
        if (targetUrl.startsWith(siteUrl)) continue;
        if (targetUrl.includes('brid.gy')) continue;
        if (targetUrl.includes('fed.brid.gy')) continue;

        const endpoint = await discoverWebmentionEndpoint(targetUrl);
        if (!endpoint) continue;

        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              source: entry.url,
              target: targetUrl,
            }),
          });

          console.log(`Sent ${entry.url} → ${endpoint} (${res.status})`);
          sent++;
        } catch (err) {
          console.log(`Error sending to ${endpoint}: ${err.message}`);
          errors++;
        }
      }
    }

    console.log(`Webmention discovery complete: ${sent} sent, ${errors} errors`);
  } catch (err) {
    console.error('Webmention discovery failed:', err);
  }
}

// Simple XML parser for Atom feed entries
function parseEntries(xml, limit) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null && entries.length < limit) {
    const entryXml = match[1];

    const linkMatch = entryXml.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/);
    const contentMatch = entryXml.match(/<content[^>]*>([\s\S]*?)<\/content>/);

    if (linkMatch) {
      entries.push({
        url: linkMatch[1],
        content: contentMatch ? decodeXmlEntities(contentMatch[1]) : '',
      });
    }
  }

  return entries;
}

function decodeXmlEntities(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Extract href values from HTML content
function extractLinks(html) {
  const links = new Set();
  const linkRegex = /href=["'](https?:\/\/[^"']+)["']/g;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    links.add(match[1]);
  }

  return Array.from(links);
}

// Discover webmention endpoint for a target URL
async function discoverWebmentionEndpoint(targetUrl) {
  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'CF-Workers-webmention-discovery' },
      redirect: 'follow',
    });

    if (!response.ok) return null;

    // Check Link header first
    const linkHeader = response.headers.get('link');
    if (linkHeader) {
      const wmMatch = linkHeader.match(/<([^>]+)>;\s*rel=["']?webmention["']?/);
      if (wmMatch) {
        return resolveUrl(wmMatch[1], targetUrl);
      }
    }

    // Check HTML for <link rel="webmention">
    const html = await response.text();
    const htmlMatch = html.match(/<link[^>]*rel=["']webmention["'][^>]*href=["']([^"']+)["'][^>]*>/);
    if (htmlMatch) {
      return resolveUrl(htmlMatch[1], targetUrl);
    }

    // Also check reverse attribute order
    const htmlMatch2 = html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']webmention["'][^>]*>/);
    if (htmlMatch2) {
      return resolveUrl(htmlMatch2[1], targetUrl);
    }

    return null;
  } catch {
    return null;
  }
}

function resolveUrl(endpoint, base) {
  try {
    return new URL(endpoint, base).href;
  } catch {
    return null;
  }
}
