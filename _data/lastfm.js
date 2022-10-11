const EleventyFetch = require("@11ty/eleventy-fetch");
require('dotenv').config();

const API_KEY = process.env.LFM_API_KEY;

module.exports = async function() {
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=miklb&api_key=${API_KEY}&limit=10&format=json`;

    /* This returns a promise */
    return EleventyFetch(url, {
        duration: "1h", // save for 1 hour
        type: "json" // we’ll parse JSON for you
    });
};