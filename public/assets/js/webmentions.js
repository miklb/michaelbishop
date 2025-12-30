/**
 * Client-side webmention fetcher
 * Supplements build-time webmentions with fresh data from webmention.io
 */

class WebmentionFetcher {
    constructor(options = {}) {
        this.domain = options.domain || 'michaelbishop.me';
        this.container = document.querySelector('.webmentions');
        
        // Use canonical URL for matching, not localhost
        const path = window.location.pathname.replace(/\/$/, '') + '/';
        this.target = `https://${this.domain}${path}`;
        this.existingIds = new Set();
        
        // Collect IDs of webmentions already rendered at build time
        this.container?.querySelectorAll('[id^="webmention-"]').forEach(el => {
            const id = el.id.replace('webmention-', '');
            this.existingIds.add(id);
        });
    }

    async fetch() {
        if (!this.container) return;

        try {
            const url = `https://webmention.io/api/mentions.jf2?target=${encodeURIComponent(this.target)}&per-page=100`;
            const response = await fetch(url);
            
            if (!response.ok) return;
            
            const data = await response.json();
            const mentions = data.children || [];
            
            // Filter to only new mentions not rendered at build time
            const newMentions = mentions.filter(m => !this.existingIds.has(String(m['wm-id'])));
            
            if (newMentions.length > 0) {
                this.render(newMentions);
            }
        } catch (error) {
            console.log('[Webmentions] Fetch failed:', error.message);
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
            const photo = mention.author?.photo || '/assets/img/webmention.svg';
            const name = mention.author?.name || 'Anonymous';
            const url = mention.url || '';
            
            const html = url
                ? `<a class="h-card u-url link-u-exempt" href="${url}" target="_blank" rel="noopener noreferrer">
                     <img src="${photo}" alt="${name}" width="48" height="48" loading="lazy">
                   </a>`
                : `<img src="${photo}" alt="${name}" width="48" height="48" loading="lazy">`;
            
            facepile.insertAdjacentHTML('beforeend', html);
        });
    }

    renderReplies(mentions) {
        mentions.forEach(mention => {
            const id = mention['wm-id'];
            const photo = mention.author?.photo || '/assets/img/webmention.svg';
            const name = mention.author?.name || 'Anonymous';
            const url = mention.url || '';
            const content = mention.content?.text || '';
            const published = mention.published 
                ? new Date(mention.published).toLocaleDateString('en-US', { 
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
                  })
                : '';

            const html = `
                <article class="webmention webmention--fresh" id="webmention-${id}">
                    <div class="webmention__meta">
                        <img src="${photo}" alt="${name}" width="48" height="48" loading="lazy">
                        <span>
                            <a class="h-card u-url" href="${url}" target="_blank" rel="noopener noreferrer">
                                <strong class="p-name">${name}</strong>
                            </a>
                        </span>
                        ${published ? `<time class="postlist-date" datetime="${mention.published}">${published}</time>` : ''}
                    </div>
                    <div>${content}</div>
                </article>
            `;
            
            this.container.insertAdjacentHTML('beforeend', html);
        });
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const fetcher = new WebmentionFetcher();
    fetcher.fetch();
});
