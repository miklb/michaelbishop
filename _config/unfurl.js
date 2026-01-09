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
        const result = await unfurl(url, {
            timeout: 5000,
            follow: 3
        });

        const processed = {
            url,
            title: result?.title || result?.open_graph?.title || null,
            description: result?.description || result?.open_graph?.description || null,
            image: result?.open_graph?.images?.[0]?.url || result?.twitter_card?.images?.[0]?.url || null,
            favicon: result?.favicon || null,
            siteName: result?.open_graph?.site_name || new URL(url).hostname
        };

        // Only return if we have at least a title
        if (processed.title) {
            unfurlCache.set(url, processed);
            return processed;
        }
        
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

    const imageHtml = metadata.image 
        ? `<img class="unfurl-card__image" src="${metadata.image}" alt="" loading="lazy" eleventy:ignore>`
        : '';

    const faviconHtml = metadata.favicon
        ? `<img class="unfurl-card__favicon" src="${metadata.favicon}" alt="" width="16" height="16" eleventy:ignore>`
        : '';

    // Use span instead of div to keep it inline-compatible
    const titleHtml = `<span class="unfurl-card__title">${faviconHtml} ${metadata.title}</span>`;
    const descHtml = metadata.description ? `<span class="unfurl-card__description">${metadata.description}</span>` : '';
    const siteHtml = `<span class="unfurl-card__site">${metadata.siteName}</span>`;
    
    return `<a href="${metadata.url}" class="unfurl-card link-u-exempt" target="_blank" rel="noopener noreferrer">${imageHtml}<span class="unfurl-card__content">${titleHtml}${descHtml}${siteHtml}</span></a>`;
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

export default function(eleventyConfig) {
    /**
     * Async filter to unfurl auto-linked URLs in note content
     * Usage: {{ content | unfurlUrls }}
     */
    eleventyConfig.addAsyncFilter("unfurlUrls", async function(content) {
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
