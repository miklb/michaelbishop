// Alias hyphenated frontmatter keys to underscore versions for Nunjucks compatibility
// Micropub creates `in-reply-to` and `mp-syndicate-to` which can't be used
// as Nunjucks variable names (hyphens are parsed as subtraction)
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

            return meta;
        },
    },
};
