const fs = require("fs");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const { EleventyRenderPlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(eleventyNavigationPlugin);
    eleventyConfig.addPlugin(EleventyRenderPlugin);

    eleventyConfig.setBrowserSyncConfig({
        middleware: [
            function(req, res, next) {
                if (/^[^.]+$/.test(req.url)) {
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                }
                next();
            }
        ]
    });
};