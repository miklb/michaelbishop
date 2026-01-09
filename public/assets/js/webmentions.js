/**
 * Client-side webmention fetcher
 * Supplements build-time webmentions with fresh data from webmention.io
 */

class WebmentionFetcher {
    constructor(options = {}) {
        this.domain = options.domain || 'michaelbishop.me';
        this.container = document.querySelector('.webmentions');
        this.debug = options.debug || false;
        
        // Use canonical URL for matching, not localhost
        const path = window.location.pathname.replace(/\/$/, '') + '/';
        this.target = `https://${this.domain}${path}`;
        this.existingIds = new Set();
        
        // Collect IDs of webmentions already rendered at build time
        // Check both id="webmention-{id}" (replies) and data-wm-id (facepile items)
        this.container?.querySelectorAll('[id^="webmention-"]').forEach(el => {
            const id = el.id.replace('webmention-', '');
            this.existingIds.add(id);
        });
        this.container?.querySelectorAll('[data-wm-id]').forEach(el => {
            this.existingIds.add(el.dataset.wmId);
        });

        if (this.debug) {
            console.log('[Webmentions] Debug Mode');
            console.log('[Webmentions] Target URL:', this.target);
            console.log('[Webmentions] Container found:', !!this.container);
            console.log('[Webmentions] Existing IDs:', Array.from(this.existingIds));
        }
    }

    async fetch() {
        if (!this.container) {
            if (this.debug) console.log('[Webmentions] No container found, exiting');
            return;
        }

        try {
            // Try both with and without .html extension
            const targets = [
                this.target,
                this.target.replace(/\.html$/, ''),
                this.target.endsWith('.html') ? this.target : this.target + '.html'
            ];
            const uniqueTargets = [...new Set(targets)];
            
            if (this.debug) {
                console.log('[Webmentions] Checking targets:', uniqueTargets);
            }

            const allMentions = [];
            
            // Fetch webmentions for all possible URL variations
            for (const target of uniqueTargets) {
                const url = `https://webmention.io/api/mentions.jf2?target=${encodeURIComponent(target)}&per-page=100`;
                if (this.debug) console.log('[Webmentions] Fetching from:', url);
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    if (this.debug) console.log('[Webmentions] Response not OK:', response.status, response.statusText);
                    continue;
                }
                
                const data = await response.json();
                const mentions = data.children || [];
                allMentions.push(...mentions);
                
                if (this.debug) {
                    console.log(`[Webmentions] Mentions for ${target}:`, mentions.length);
                }
            }
            
            // Deduplicate by wm-id
            const uniqueMentions = Array.from(
                new Map(allMentions.map(m => [m['wm-id'], m])).values()
            );
            
            if (this.debug) {
                console.log('[Webmentions] Total unique mentions received:', uniqueMentions.length);
                console.log('[Webmentions] Mention types:', uniqueMentions.map(m => m['wm-property']));
            }
            
            // Filter to only new mentions not rendered at build time
            const newMentions = uniqueMentions.filter(m => !this.existingIds.has(String(m['wm-id'])));
            
            if (this.debug) {
                console.log('[Webmentions] New mentions to render:', newMentions.length);
                if (newMentions.length > 0) {
                    console.log('[Webmentions] New mention details:', newMentions);
                }
            }
            
            if (newMentions.length > 0) {
                this.render(newMentions);
            } else if (this.debug) {
                console.log('[Webmentions] No new mentions to render');
            }
        } catch (error) {
            console.error('[Webmentions] Fetch failed:', error);
        }
    }

    render(mentions) {
        const likes = mentions.filter(m => m['wm-property'] === 'like-of');
        const reposts = mentions.filter(m => m['wm-property'] === 'repost-of');
        const replies = mentions.filter(m => m['wm-property'] === 'in-reply-to');
        const other = mentions.filter(m => m['wm-property'] === 'mention-of');

        if (likes.length) this.renderFacepile('Likes', likes, '.webmentions__facepile:has(h3:contains("Like"))');
        if (reposts.length) this.renderFacepile('Reposts', reposts, '.webmentions__facepile:has(h3:contains("Repost"))');
        if (replies.length) this.renderReplies(replies);
        if (other.length) this.renderReplies(other);
    }

    renderFacepile(type, mentions, existingSelector) {
        // Find or create facepile container
        let facepile = this.container.querySelector(`.webmentions__facepile--${type.toLowerCase()}`);
        
        if (!facepile) {
            // Look for existing facepile by heading text
            const headings = this.container.querySelectorAll('.webmentions__facepile h3');
            for (const h of headings) {
                if (h.textContent.includes(type.replace(/s$/, ''))) {
                    facepile = h.parentElement;
                    break;
                }
            }
        }

        if (!facepile) {
            // Create new facepile section
            facepile = document.createElement('div');
            facepile.className = `webmentions__facepile webmentions__facepile--${type.toLowerCase()}`;
            facepile.innerHTML = `<h3>${mentions.length} ${type}</h3>`;
            // Insert after h2
            const h2 = this.container.querySelector('h2');
            h2.after(facepile);
        } else {
            // Update count in heading
            const h3 = facepile.querySelector('h3');
            const currentCount = parseInt(h3.textContent) || 0;
            const singular = type.replace(/s$/, '');
            const newCount = currentCount + mentions.length;
            h3.textContent = `${newCount} ${newCount === 1 ? singular : type}`;
        }

        // Add new faces
        mentions.forEach(mention => {
            const id = mention['wm-id'];
            const photo = mention.author?.photo || '/assets/img/webmention.svg';
            const name = mention.author?.name || 'Anonymous';
            const url = mention.url || '';
            
            const html = url
                ? `<a class="h-card u-url link-u-exempt" href="${url}" target="_blank" rel="noopener noreferrer" data-wm-id="${id}">
                     <img src="${photo}" alt="${name}" width="48" height="48" loading="lazy">
                   </a>`
                : `<img src="${photo}" alt="${name}" width="48" height="48" loading="lazy" data-wm-id="${id}">`;
            
            facepile.insertAdjacentHTML('beforeend', html);
        });
    }

    renderReplies(mentions) {
        // Check if we need a heading
        const property = mentions[0]?.[' wm-property'];
        let heading = null;
        
        if (property === 'in-reply-to') {
            heading = 'Replies';
        } else if (property === 'mention-of') {
            heading = 'Mentions';
        }
        
        // Add heading if needed and doesn't exist
        if (heading) {
            const existingHeading = Array.from(this.container.querySelectorAll('h3')).find(h => h.textContent.includes(heading));
            if (!existingHeading) {
                const h3 = document.createElement('h3');
                h3.textContent = heading;
                this.container.appendChild(h3);
            }
        }
        
        mentions.forEach(mention => {
            const id = mention['wm-id'];
            const author = mention.author || {};
            const hasAuthor = author.name && author.name !== '';
            const photo = author.photo || '/assets/img/webmention.svg';
            const name = author.name || this.getSourceLabel(mention);
            const url = mention.url || '';
            const contentHtml = mention.content?.html || mention.content?.text || '';
            const published = mention.published 
                ? new Date(mention.published).toLocaleDateString('en-US', { 
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
                  })
                : '';

            const avatarHtml = `<img src="${photo}" alt="${name}" width="48" height="48" loading="lazy" ${!hasAuthor ? 'eleventy:ignore' : ''}>`;
            
            const html = `
                <article class="webmention webmention--fresh" id="webmention-${id}">
                    <div class="webmention__meta">
                        ${avatarHtml}
                        <span>
                            <a class="h-card u-url" href="${url}" target="_blank" rel="noopener noreferrer">
                                <strong class="p-name">${this.escapeHtml(name)}</strong>
                            </a>
                        </span>
                        ${published ? `<time class="postlist-date" datetime="${mention.published}">${published}</time>` : ''}
                    </div>
                    <div class="webmention__content">${contentHtml}</div>
                </article>
            `;
            
            this.container.insertAdjacentHTML('beforeend', html);
        });
    }

    getSourceLabel(mention) {
        const url = mention.url || '';
        const source = mention['wm-source'] || '';
        
        if (url.includes('bsky.app') || source.includes('bsky.brid.gy')) {
            return '<i class="fa-brands fa-bluesky"></i> via Bluesky';
        } else if (url.includes('mastodon') || source.includes('fed.brid.gy')) {
            return '<i class="fa-brands fa-mastodon"></i> via Mastodon';
        }
        return 'Anonymous';
    }

    escapeHtml(text) {
        // Only escape if it doesn't contain HTML tags already
        if (/<[a-z][\s\S]*>/i.test(text)) {
            return text;
        }
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Enable debug mode by adding ?debug-webmentions to the URL
    const debug = window.location.search.includes('debug-webmentions');
    const fetcher = new WebmentionFetcher({ debug });
    fetcher.fetch();
});
