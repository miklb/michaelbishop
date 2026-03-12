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
 */
function renderUnfurlCard(metadata) {
    if (!metadata) return '';

    const cardClass = metadata.isBluesky ? 'unfurl-card unfurl-card--bluesky link-u-exempt' : 'unfurl-card link-u-exempt';

    if (metadata.isBluesky) {
        const avatarHtml = metadata.image
            ? `<img class="unfurl-card__avatar" src="${metadata.image}" alt="" width="48" height="48" loading="lazy" eleventy:ignore>`
            : '';
        const titleHtml = `<span class="unfurl-card__title">${metadata.title}</span>`;
        const descHtml = metadata.description ? `<span class="unfurl-card__description">${metadata.description}</span>` : '';

        return `<a href="${metadata.url}" class="${cardClass}" target="_blank" rel="noopener noreferrer">${avatarHtml}<span class="unfurl-card__content">${titleHtml}${descHtml}</span></a>`;
    }

    const imageHtml = metadata.image 
        ? `<img class="unfurl-card__image" src="${metadata.image}" alt="" loading="lazy" eleventy:ignore>`
        : '';

    const faviconHtml = metadata.favicon
        ? `<img class="unfurl-card__favicon" src="${metadata.favicon}" alt="" width="16" height="16" eleventy:ignore>`
        : '';

    const titleHtml = `<span class="unfurl-card__title">${faviconHtml} ${metadata.title}</span>`;
    const descHtml = metadata.description ? `<span class="unfurl-card__description">${metadata.description}</span>` : '';
    const siteHtml = `<span class="unfurl-card__site">${metadata.siteName}</span>`;
    
    return `<a href="${metadata.url}" class="${cardClass}" target="_blank" rel="noopener noreferrer">${imageHtml}<span class="unfurl-card__content">${titleHtml}${descHtml}${siteHtml}</span></a>`;
}

/**
 * Find auto-linkified URLs (where href === link text)
 * markdown-it with linkify:true creates: <a href="https://...">https://...</a>
 * We want to replace these with unfurl cards
 */
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
            matches.push({
                fullMatch: match[0],
                url: href,
                index: match.index
            });
        }
    }
    
    return matches;
}

/**
 * Core unfurl processing function
 */
export async function processUnfurl(content) {
    if (!content || typeof content !== 'string') {
        return content;
    }

    const autoLinkedUrls = findAutoLinkedUrls(content);
    
    if (autoLinkedUrls.length === 0) {
        return content;
    }

    // Fetch metadata for all URLs in parallel
    const metadataPromises = autoLinkedUrls.map(({ url }) => getUrlMetadata(url));
    const metadataResults = await Promise.all(metadataPromises);

    // Build replacement array with positions
    const replacements = [];
    for (let i = 0; i < autoLinkedUrls.length; i++) {
        const { fullMatch, index } = autoLinkedUrls[i];
        const metadata = metadataResults[i];

        if (metadata) {
            const card = renderUnfurlCard(metadata);
            replacements.push({
                start: index,
                end: index + fullMatch.length,
                replacement: card
            });
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
        return processUnfurl(content);
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
