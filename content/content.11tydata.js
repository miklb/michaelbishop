// Alias hyphenated frontmatter keys to underscore versions for Nunjucks compatibility
// Micropub creates `in-reply-to` and `mp-syndicate-to` which can't be used
// as Nunjucks variable names (hyphens are parsed as subtraction)
export default {
    eleventyComputed: {
        in_reply_to: (data) => data["in-reply-to"] || null,
        mp_syndicate_to: (data) => data["mp-syndicate-to"] || null,
    }
};
