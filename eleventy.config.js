
import { InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import markdownIt from "markdown-it";
import markdownItFootnote from "markdown-it-footnote";
import metagen from 'eleventy-plugin-metagen';

import pluginFilters from "./_config/filters.js";

// Add markdown-it configuration with footnotes
const markdownItOptions = {
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
};

const markdownLib = markdownIt(markdownItOptions).use(markdownItFootnote);

export default async function(eleventyConfig) {


    // Set markdown library
    eleventyConfig.setLibrary("md", markdownLib);
    
    // Create a collection for RSS feed that only includes content posts (not pages/archives)
    eleventyConfig.addCollection("feedContent", function(collectionApi) {
        return collectionApi.getAll().filter(item => {
            // Exclude navigation pages and archives
            return !item.data.eleventyNavigation && !item.inputPath.includes("/archives.html");
        });
    });
    
    // Create a collection for archives page that excludes navigation pages and generated files
    eleventyConfig.addCollection("archivePosts", function(collectionApi) {
        return collectionApi.getAll()
            .filter(item => {
                // Only include markdown/html content posts (notes, articles)
                // Exclude: navigation pages, generated files (feed.xml, robots.txt, manifest), archives.html itself
                const isNavPage = item.data.eleventyNavigation;
                const isArchivesPage = item.inputPath.includes("/archives.html");
                const isGeneratedFile = item.inputPath.includes("/public/") || 
                                       item.outputPath.endsWith(".xml") || 
                                       item.outputPath.endsWith(".txt") ||
                                       item.outputPath.endsWith(".webmanifest");
                
                return !isNavPage && !isArchivesPage && !isGeneratedFile;
            })
            .sort((a, b) => {
                // Sort by date, newest first
                return b.date - a.date;
            });
    });

    // Copy the contents of the `public` folder to the output folder
    // For example, `./public/css/` ends up in `_site/css/`
    eleventyConfig .addPassthroughCopy({
            "./public/": "/"
        })
        .addPassthroughCopy("./content/feed/pretty-atom-feed.xsl");

    // Official plugins
    eleventyConfig.addPlugin(pluginSyntaxHighlight, {
        preAttributes: { tabindex: 0 }
    });
    eleventyConfig.addPlugin(metagen);
    eleventyConfig.addPlugin(pluginNavigation);
    eleventyConfig.addPlugin(HtmlBasePlugin);
    eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
    eleventyConfig.addPlugin(feedPlugin, {
        type: "atom", // or "rss", "json"
        outputPath: "/feed.xml",
        stylesheet: "pretty-atom-feed.xsl",
        collection: {
            name: "feedContent",  // Use custom collection instead of "all"
            limit: 0,
        },
        metadata: {
            language: "en",
            title: "Blog Title",
            subtitle: "Full content feed for Michael Bishop's web log.",
            base: "https://michaelbishop.me/",
            author: {
                name: "Michael Bishop",
            }
        }
    });

    // Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
    eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
        // File extensions to process in _site folder
        extensions: "html",

        // Output formats for each image.
        formats: ["avif", "webp", "auto"],
        urlPath: "/assets/img/",

        // widths: ["auto"],

        defaultAttributes: {
            // e.g. <img loading decoding> assigned on the HTML tag will override these values.
            loading: "lazy",
            decoding: "async",
        }
    });

	eleventyConfig.addPlugin(pluginFilters);
}

export const config = {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: [
        "md",
		"njk",
		"html",
		"liquid",
		"11ty.js",
    ],

    // These are all optional:
    dir: {
        input: "content",          // default: "."
        includes: "../_includes",  // default: "_includes" (`input` relative)
        data: "../_data",          // default: "_data" (`input` relative)
        output: "_site"
    },
};