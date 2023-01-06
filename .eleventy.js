const fs = require("fs");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const { EleventyRenderPlugin } = require("@11ty/eleventy");
const metagen = require('eleventy-plugin-metagen');
const pluginRss = require("@11ty/eleventy-plugin-rss");
const Image = require('@11ty/eleventy-img');
const outdent = require('outdent');
const xmlFiltersPlugin = require('eleventy-xml-plugin');

/** Maps a config of attribute-value pairs to an HTML string representing those same attribute-value pairs.
 * There's also this, but it's ESM only: https://github.com/sindresorhus/stringify-attributes
 */
const stringifyAttributes = (attributeMap) => {
    return Object.entries(attributeMap)
        .map(([attribute, value]) => {
            if (typeof value === 'undefined') return '';
            return `${attribute}="${value}"`;
        })
        .join(' ');
};


module.exports = function(eleventyConfig) {

    eleventyConfig.addPlugin(eleventyNavigationPlugin);
    eleventyConfig.addPlugin(EleventyRenderPlugin);
    eleventyConfig.addPlugin(metagen);
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addShortcode('image', imageShortcode);
    eleventyConfig.addShortcode('hwimage', hwimageShortcode);
    eleventyConfig.addPlugin(xmlFiltersPlugin);

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
// From https://www.aleksandrhovhannisyan.com/blog/eleventy-image-plugin/



// eleventy shortcode extending imageShortcode

const hwimageShortcode = async(src, alt) => {

    const hwimage = await imageShortcode({ src, alt, widths: [200, 400] });
    return hwimage;
}

const imageShortcode = async(
    src,
    alt,
    className = undefined,
    widths = [400, 800, 1280],
    formats = ['webp', 'jpeg'],
    sizes = '100vw'
) => {
    const imageMetadata = await Image(src, {
        widths: [...widths, null],
        formats: [...formats, null],
        outputDir: '_site/assets/img',
        urlPath: '/assets/img',
    });

    const sourceHtmlString = Object.values(imageMetadata)
        // Map each format to the source HTML markup
        .map((images) => {
            // The first entry is representative of all the others
            // since they each have the same shape
            const { sourceType } = images[0];

            // Use our util from earlier to make our lives easier
            const sourceAttributes = stringifyAttributes({
                type: sourceType,
                // srcset needs to be a comma-separated attribute
                srcset: images.map((image) => image.srcset).join(', '),
                sizes,
            });

            // Return one <source> per format
            return `<source ${sourceAttributes}>`;
        })
        .join('\n');

    const getLargestImage = (format) => {
        const images = imageMetadata[format];
        return images[images.length - 1];
    }

    const largestUnoptimizedImg = getLargestImage(formats[0]);
    const imgAttributes = stringifyAttributes({
        src: largestUnoptimizedImg.url,
        width: largestUnoptimizedImg.width,
        height: largestUnoptimizedImg.height,
        alt,
        loading: 'lazy',
        decoding: 'async',
    });
    const imgHtmlString = `<img ${imgAttributes}>`;

    const pictureAttributes = stringifyAttributes({
        class: className,
    });
    const picture = `<picture ${pictureAttributes}>
    ${sourceHtmlString}
    ${imgHtmlString}
  </picture>`;

    return outdent `${picture}`;
};