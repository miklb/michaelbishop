// Alias hyphenated frontmatter keys to underscore versions for Nunjucks compatibility
// Micropub creates `in-reply-to` and `mp-syndicate-to` which can't be used
// as Nunjucks variable names (hyphens are parsed as subtraction)

// A note's body, reduced to the words a link preview can show: no HTML (the
// hidden Bridgy anchors included), markdown links keep their text, bare URLs
// drop out because the linked page unfurls on its own.
function plainText(markdown = "") {
    return markdown
        .replace(/<[^>]+>/g, " ")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/https?:\/\/\S+/g, " ")
        .replace(/^[#>\s]+/gm, "")
        .replace(/[*`]+/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

// Cut at a word boundary and mark the cut.
function clip(text, max) {
    if (text.length <= max) return text;
    const cut = text.slice(0, max + 1).replace(/\s+\S*$/, "") || text.slice(0, max);
    return cut.replace(/[\s.,;:]+$/, "") + "…";
}

// metagen writes meta.title/desc straight into content="…" attributes with no
// escaping. A note containing a double quote produced malformed HTML that
// crashed 11ty's HTML transformer and took the whole build down.
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export default {
    eleventyComputed: {
        in_reply_to: (data) => data["in-reply-to"] || null,
        mp_syndicate_to: (data) => data["mp-syndicate-to"] || null,

        // Social card metadata.
        //
        // The directory data files carry values like `"url": "{{ page.url }}"`,
        // but Eleventy does NOT render template syntax inside data files —
        // `permalink` is special-cased, `meta` is not. Those strings shipped
        // verbatim, so every post on the site served
        // `<meta property="og:url" content="{{ page.url }}">` and every
        // article's og:image pointed at `og-{{ page.fileSlug }}.png`.
        // Computing them here is what the JSON was reaching for.
        meta: (data) => {
            const meta = { ...(data.meta || {}) };
            const base = data.site.url.replace(/\/$/, "");

            meta.url = `${base}${data.page.url}`;

            // Articles get a social card generated from their title and
            // excerpt by scripts/generate-og-images.js. That script keys off
            // the file's own frontmatter, so an explicit `meta.img` there
            // both skips generation and wins here.
            const isArticle = (data.page.inputPath || "").includes("/articles/");
            if (isArticle && !meta.img) {
                meta.img = `${base}/assets/img/og/og-${data.page.fileSlug}.png`;
            }
            if (isArticle && !meta.img_alt) {
                meta.img_alt = data.title || meta.title || "";
            }

            // Notes and replies have no title, so their <title>, og:title and
            // descriptions fell through to the site-wide defaults: every note
            // unfurled as "Bytes of Michael Bishop" with the old avatar. Use
            // the note's own words instead. Their image stays the site card
            // from _data/meta.json: the card generator is articles-only, and
            // a QuickPost note can't commit a PNG with itself.
            const isNote = /\/(notes|replies)\//.test(data.page.inputPath || "");
            if (isNote) {
                const text = plainText(data.page.rawInput);
                if (data.title || text) {
                    meta.title = escapeHtml(data.title || clip(text, 70));
                }
                if (text) {
                    meta.desc = escapeHtml(clip(text, 200));
                }
            }

            return meta;
        },
    },
};
