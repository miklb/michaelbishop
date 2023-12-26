const EleventyFetch = require("@11ty/eleventy-fetch");
require('dotenv').config();

const API_KEY = process.env.WEBMENTION_IO_TOKEN;

module.exports = async function() {
    const url = `https://webmention.io/api/mentions.jf2?token=${API_KEY}&domain=michaelbishop.me&per-page=100`;

    /* This returns a promise */
    return EleventyFetch(url, {
        duration: "1h", // save for 1 hour
        type: "json" // we’ll parse JSON for you
    });
};