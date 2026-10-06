import { unfurl } from 'unfurl.js';
import EleventyFetch from "@11ty/eleventy-fetch";

// Cache for unfurled URLs to avoid re-fetching during build
const unfurlCache = new Map();

/**
 * Fetch and cache URL metadata
 * Uses EleventyFetch for persistent caching across builds
 */
async function getUrlMetadata(url) {
    // Skip internal links, anchors, and common non-content URLs
    if (
        url.startsWith('#') ||
        url.startsWith('/') ||
        url.includes('brid.gy') ||
        url.includes('fed.brid.gy') ||
        url.includes('webmention.io')
    ) {
        return null;
    }

    // Check in-memory cache first
    if (unfurlCache.has(url)) {
        return unfurlCache.get(url);
    }

    try {
        console.log(`[unfurl] Fetching: ${url}`);
        const result = await unfurl(url, {
            timeout: 10000,
            follow: 3
        });

        const isBluesky = url.includes('bsky.app');

        const processed = {
            url,
            title: result?.title || result?.open_graph?.title || null,
            description: result?.description || result?.open_graph?.description || null,
            image: result?.open_graph?.images?.[0]?.url || result?.twitter_card?.images?.[0]?.url || null,
            favicon: result?.favicon || null,
            siteName: result?.open_graph?.site_name || new URL(url).hostname,
            isBluesky
        };

        // Only return if we have at least a title
        if (processed.title) {
            console.log(`[unfurl] Success: ${url}`);
            unfurlCache.set(url, processed);
            return processed;
        }
        
        console.log(`[unfurl] No title found for: ${url}`);
        unfurlCache.set(url, null);
        return null;
    } catch (error) {
        console.warn(`[unfurl] Failed to unfurl ${url}:`, error.message);
        unfurlCache.set(url, null);
        return null;
    }
}

/**
 * Generate HTML card for unfurled URL
 *
 * With `cite: true` (note bodies), non-Bluesky cards carry microformats
 * (`u-quotation-of h-cite` + p-name/p-summary/u-photo/u-url). Bridgy
 * parses the citation into an AS1 attachment and granary converts it to
 * an app.bsky.embed.external — so the same OG fetch that renders the
 * local card also produces the Bluesky link preview. Bluesky-post cards
 * are deliberately excluded: an h-cite of a bsky.app URL would syndicate
 * as a quote post (embed.record), which notifies the quoted author —
 * enable that on purpose someday, not as a side effect.
 */
function renderUnfurlCard(metadata, { cite = false } = {}) {
    if (!metadata) return '';

    const isCite = cite && !metadata.isBluesky;
    const citeClass = isCite ? ' u-quotation-of h-cite' : '';
    const cardClass = metadata.isBluesky
        ? 'unfurl-card unfurl-card--bluesky link-u-exempt'
        : `unfurl-card link-u-exempt${citeClass}`;

    if (metadata.isBluesky) {
        const avatarHtml = metadata.image
            ? `<img class="unfurl-card__avatar" src="${metadata.image}" alt="" width="48" height="48" loading="lazy" eleventy:ignore>`
            : '';
        const titleHtml = `<span class="unfurl-card__title">${metadata.title}</span>`;
        const descHtml = metadata.description ? `<span class="unfurl-card__description">${metadata.description}</span>` : '';

        return `<a href="${metadata.url}" class="${cardClass}" target="_blank" rel="noopener noreferrer">${avatarHtml}<span class="unfurl-card__content">${titleHtml}${descHtml}</span></a>`;
    }

    const urlDataHtml = isCite ? `<data class="u-url" value="${metadata.url}"></data>` : '';

    const imageHtml = metadata.image
        ? `<img class="unfurl-card__image${isCite ? ' u-photo' : ''}" src="${metadata.image}" alt="" loading="lazy" eleventy:ignore>`
        : '';

    const faviconHtml = metadata.favicon
        ? `<img class="unfurl-card__favicon" src="${metadata.favicon}" alt="" width="16" height="16" eleventy:ignore>`
        : '';

    const titleHtml = `<span class="unfurl-card__title${isCite ? ' p-name' : ''}">${faviconHtml} ${metadata.title}</span>`;
    const descHtml = metadata.description ? `<span class="unfurl-card__description${isCite ? ' p-summary' : ''}">${metadata.description}</span>` : '';
    const siteHtml = `<span class="unfurl-card__site">${metadata.siteName}</span>`;

    return `<a href="${metadata.url}" class="${cardClass}" target="_blank" rel="noopener noreferrer">${urlDataHtml}${imageHtml}<span class="unfurl-card__content">${titleHtml}${descHtml}${siteHtml}</span></a>`;
}

/**
 * Find auto-linkified URLs (where href === link text)
 * markdown-it with linkify:true creates: <a href="https://...">https://...</a>
 * We want to replace these with unfurl cards
 */
const BSKY_API = 'https://public.api.bsky.app/xrpc';
const bskyCache = new Map();

const escapeHtml = s =>
    String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

/** https://bsky.app/profile/<handle-or-did>/post/<rkey> → its parts, or null. */
function parseBlueskyPostUrl(url) {
    const m = String(url).match(
        /^https:\/\/bsky\.app\/profile\/([^/?#]+)\/post\/([A-Za-z0-9]+)/
    );
    return m ? { actor: decodeURIComponent(m[1]), rkey: m[2] } : null;
}

/**
 * Fetch a post through the public AT Protocol API so a bare Bluesky link can
 * render as the actual post — author, text, images, timestamp — rather than
 * an OG scrape of bsky.app. Build-time only: no third-party script, nothing
 * for the reader to load.
 *
 * Returns null on any failure so the caller falls back to the OG card.
 */
async function getBlueskyPost(url) {
    if (bskyCache.has(url)) return bskyCache.get(url);

    const parts = parseBlueskyPostUrl(url);
    if (!parts) return null;

    try {
        let did = parts.actor;
        if (!did.startsWith('did:')) {
            const res = await fetch(
                `${BSKY_API}/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(did)}`
            );
            if (!res.ok) throw new Error(`resolveHandle ${res.status}`);
            did = (await res.json()).did;
        }

        const uri = `at://${did}/app.bsky.feed.post/${parts.rkey}`;
        const res = await fetch(`${BSKY_API}/app.bsky.feed.getPosts?uris=${encodeURIComponent(uri)}`);
        if (!res.ok) throw new Error(`getPosts ${res.status}`);

        const post = (await res.json()).posts?.[0];
        if (!post?.record) throw new Error('post not found');

        console.log(`[bsky] Embedded: ${url}`);
        bskyCache.set(url, post);
        return post;
    } catch (error) {
        console.warn(`[bsky] Could not embed ${url}: ${error.message}`);
        bskyCache.set(url, null);
        return null;
    }
}

/**
 * Rich text: Bluesky stores links, mentions and hashtags as "facets" with
 * byte offsets into the UTF-8 text, NOT JS string indices. Slicing the
 * string directly corrupts any post containing an emoji or an accent, so
 * this walks a Buffer and decodes each span.
 */
function renderPostText(record) {
    const text = record.text || '';
    const facets = (record.facets ?? [])
        .filter(f => f?.index && Number.isInteger(f.index.byteStart))
        .sort((a, b) => a.index.byteStart - b.index.byteStart);

    const bytes = Buffer.from(text, 'utf8');
    let cursor = 0;
    let out = '';

    for (const facet of facets) {
        const { byteStart, byteEnd } = facet.index;
        if (byteStart < cursor || byteEnd > bytes.length) continue;

        out += escapeHtml(bytes.subarray(cursor, byteStart).toString('utf8'));
        const label = escapeHtml(bytes.subarray(byteStart, byteEnd).toString('utf8'));
        const feature = facet.features?.[0];
        const type = feature?.$type ?? '';

        let href = null;
        if (type.endsWith('#link')) href = feature.uri;
        else if (type.endsWith('#mention')) href = `https://bsky.app/profile/${feature.did}`;
        else if (type.endsWith('#tag')) href = `https://bsky.app/hashtag/${encodeURIComponent(feature.tag)}`;

        out += href ? `<a href="${escapeHtml(href)}">${label}</a>` : label;
        cursor = byteEnd;
    }

    out += escapeHtml(bytes.subarray(cursor).toString('utf8'));
    return out;
}

const bskyImg = (src, alt, cls) =>
    `<img class="${cls}" src="${escapeHtml(src)}" alt="${escapeHtml(alt || '')}" loading="lazy" decoding="async" eleventy:ignore>`;

/**
 * Render whatever the post carries: photos, a link card (which is what the
 * Latest Earworm posts produce), a video thumbnail, or a quoted post.
 * Unknown embed types render nothing rather than breaking the page.
 */
function renderPostEmbed(embed) {
    if (!embed) return '';
    const type = embed.$type ?? '';

    if (type.startsWith('app.bsky.embed.images')) {
        const imgs = (embed.images ?? [])
            .map(i => bskyImg(i.thumb, i.alt, 'bsky-post__image'))
            .join('');
        return imgs ? `<div class="bsky-post__media">${imgs}</div>` : '';
    }

    if (type.startsWith('app.bsky.embed.external')) {
        const e = embed.external ?? {};
        const thumb = e.thumb ? bskyImg(e.thumb, '', 'bsky-card__thumb') : '';
        const desc = e.description
            ? `<span class="bsky-card__desc">${escapeHtml(e.description)}</span>`
            : '';
        let host = '';
        try { host = new URL(e.uri).hostname.replace(/^www\./, ''); } catch {}
        return `<a class="bsky-card" href="${escapeHtml(e.uri || '#')}">${thumb}` +
            `<span class="bsky-card__body">` +
            `<span class="bsky-card__title">${escapeHtml(e.title || e.uri || '')}</span>` +
            desc +
            (host ? `<span class="bsky-card__host">${escapeHtml(host)}</span>` : '') +
            `</span></a>`;
    }

    if (type.startsWith('app.bsky.embed.video')) {
        return embed.thumbnail
            ? `<div class="bsky-post__media">${bskyImg(embed.thumbnail, embed.alt, 'bsky-post__image')}</div>`
            : '';
    }

    if (type.startsWith('app.bsky.embed.recordWithMedia')) {
        return renderPostEmbed(embed.media) + renderPostEmbed(embed.record);
    }

    if (type.startsWith('app.bsky.embed.record')) {
        const rec = embed.record ?? {};
        const who = rec.author?.handle;
        const txt = rec.value?.text;
        if (!who || !txt) return '';
        return `<blockquote class="bsky-post__quote">` +
            `<cite>@${escapeHtml(who)}</cite>` +
            `<span>${escapeHtml(txt)}</span>` +
            `</blockquote>`;
    }

    return '';
}

/**
 * Render a real post embed.

 *
 * No `h-cite` / `u-quotation-of`, for the same reason renderUnfurlCard
 * excludes them for Bluesky URLs: citing a bsky.app post makes granary
 * syndicate it as a quote post (embed.record), which notifies the quoted
 * author. Enable that deliberately someday, not as a side effect of
 * embedding.
 *
 * Images carry `eleventy:ignore` so the image transform leaves the Bluesky
 * CDN alone at build time.
 */
function renderBlueskyPost(post, url) {
    const author = post.author ?? {};
    const name = escapeHtml(author.displayName || author.handle || 'Unknown');
    const handle = escapeHtml(author.handle || '');
    const text = renderPostText(post.record);

    const avatar = author.avatar
        ? `<img class="bsky-post__avatar" src="${escapeHtml(author.avatar)}" alt="" width="40" height="40" loading="lazy" decoding="async" eleventy:ignore>`
        : '';

    const figure = renderPostEmbed(post.embed);

    const created = post.record.createdAt;
    const stamp = created
        ? `<time class="bsky-post__date" datetime="${escapeHtml(created)}">${new Date(created).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</time>`
        : '';

    return [
        `<figure class="bsky-post link-u-exempt">`,
        `<a class="bsky-post__author" href="https://bsky.app/profile/${handle}">`,
        avatar,
        `<span class="bsky-post__name">${name}</span>`,
        `<span class="bsky-post__handle">@${handle}</span>`,
        `</a>`,
        `<div class="bsky-post__text">${text}</div>`,
        figure,
        `<figcaption class="bsky-post__meta">`,
        `<a href="${escapeHtml(url)}">${stamp || 'View on Bluesky'}</a>`,
        `</figcaption>`,
        `</figure>`
    ].join('');
}

function findAutoLinkedUrls(content) {
    // Match <a> tags where the href equals the text content (auto-linked bare URLs)
    const pattern = /<a href="(https?:\/\/[^"]+)">(https?:\/\/[^<]+)<\/a>/g;
    const matches = [];
    let match;
    
    while ((match = pattern.exec(content)) !== null) {
        const href = match[1];
        const text = match[2];
        
        // Only match if href and text are the same (or text is href with trailing punctuation stripped)
        if (href === text || href === text.replace(/[.,;:!?]+$/, '')) {
            // A link alone in its own paragraph can be replaced by block
            // content; one mid-sentence cannot.
            const before = content.slice(0, match.index).match(/<p>\s*$/);
            const after = content.slice(match.index + match[0].length).match(/^\s*<\/p>/);
            matches.push({
                fullMatch: match[0],
                url: href,
                index: match.index,
                alone: Boolean(before && after),
                openLen: before ? before[0].length : 0,
                closeLen: after ? after[0].length : 0
            });
        }
    }
    
    return matches;
}

/**
 * Core unfurl processing function
 */
export async function processUnfurl(content, { cite = false } = {}) {
    if (!content || typeof content !== 'string') {
        return content;
    }

    const autoLinkedUrls = findAutoLinkedUrls(content);

    if (autoLinkedUrls.length === 0) {
        return content;
    }

    // Resolve every URL in parallel. A Bluesky post URL becomes a real post
    // embed via the AT Protocol; anything else (including a Bluesky profile
    // or feed URL) falls back to the OG unfurl card, as does a post whose
    // API lookup fails.
    const resolved = await Promise.all(
        autoLinkedUrls.map(async ({ url, alone }) => {
            // Embed only a link that stands alone in its paragraph — the
            // usual convention, and the only place block content is valid.
            // A Bluesky link mid-sentence stays an inline unfurl card.
            if (alone && parseBlueskyPostUrl(url)) {
                const post = await getBlueskyPost(url);
                if (post) return { kind: 'bsky', post, url };
            }
            return { kind: 'card', metadata: await getUrlMetadata(url) };
        })
    );

    // Build replacement array with positions
    const replacements = [];
    for (let i = 0; i < autoLinkedUrls.length; i++) {
        const { fullMatch, index } = autoLinkedUrls[i];
        const item = resolved[i];

        const markup = item.kind === 'bsky'
            ? renderBlueskyPost(item.post, item.url)
            : item.metadata && renderUnfurlCard(item.metadata, { cite });

        if (markup) {
            let start = index;
            let end = index + fullMatch.length;

            // The embed is a <figure>; markdown-it wrapped the bare URL in a
            // <p>. Block content inside a paragraph is invalid — the browser
            // closes the <p> early and strands a </p> — so swallow the
            // paragraph the link had to itself. Unfurl cards are anchors and
            // stay exactly where they are.
            if (item.kind === 'bsky') {
                start -= autoLinkedUrls[i].openLen;
                end += autoLinkedUrls[i].closeLen;
            }

            replacements.push({ start, end, replacement: markup });
        }
    }

    // Apply replacements in reverse order to preserve positions
    let result = content;
    for (let i = replacements.length - 1; i >= 0; i--) {
        const { start, end, replacement } = replacements[i];
        result = result.substring(0, start) + replacement + result.substring(end);
    }

    return result;
}

/**
 * RSS-specific unfurl processing - creates simple text links without card markup
 * Format: <a href="url">Site Name - Page Title</a>
 * Only processes HTML inside <content type="html"> sections to preserve XML structure
 */
export async function processUnfurlForRSS(content) {
    if (!content || typeof content !== 'string') {
        return content;
    }

    // Process only inside <content type="html">...</content> blocks
    // The HTML inside these blocks is entity-encoded in the Atom XML
    const contentBlockPattern = /(<content type="html">)([\s\S]*?)(<\/content>)/g;
    const blocks = [];
    let match;

    while ((match = contentBlockPattern.exec(content)) !== null) {
        blocks.push({
            start: match.index + match[1].length,
            end: match.index + match[1].length + match[2].length,
            encoded: match[2]
        });
    }

    if (blocks.length === 0) {
        return content;
    }

    // Process each content block: decode, find URLs, replace, re-encode
    let result = content;
    for (let i = blocks.length - 1; i >= 0; i--) {
        const block = blocks[i];
        let decoded = block.encoded
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&');

        const autoLinkedUrls = findAutoLinkedUrls(decoded);
        if (autoLinkedUrls.length === 0) continue;

        const metadataPromises = autoLinkedUrls.map(({ url }) => getUrlMetadata(url));
        const metadataResults = await Promise.all(metadataPromises);

        const replacements = [];
        for (let j = 0; j < autoLinkedUrls.length; j++) {
            const { fullMatch, url, index } = autoLinkedUrls[j];
            const metadata = metadataResults[j];
            if (metadata) {
                const linkText = `${metadata.siteName} - ${metadata.title}`;
                const simpleLink = `<a href="${metadata.url}">${linkText}</a>`;
                replacements.push({ start: index, end: index + fullMatch.length, replacement: simpleLink });
            }
        }

        for (let j = replacements.length - 1; j >= 0; j--) {
            const { start, end, replacement } = replacements[j];
            decoded = decoded.substring(0, start) + replacement + decoded.substring(end);
        }

        // Re-encode only this content block
        const reEncoded = decoded
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

        result = result.substring(0, block.start) + reEncoded + result.substring(block.end);
    }

    return result;
}

export default function(eleventyConfig) {
    /**
     * Async filter to unfurl auto-linked URLs in note content
     * Usage: {{ content | unfurlUrls }}
     */
    eleventyConfig.addAsyncFilter("unfurlUrls", async function(content) {
        return processUnfurl(content, { cite: true });
    });

    /**
     * Shortcode for manual unfurling
     * Usage: {% unfurl "https://example.com" %}
     */
    eleventyConfig.addAsyncShortcode("unfurl", async function(url) {
        const metadata = await getUrlMetadata(url);
        return renderUnfurlCard(metadata);
    });
}
