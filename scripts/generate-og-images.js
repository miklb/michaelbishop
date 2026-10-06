#!/usr/bin/env node

/**
 * Generate Open Graph social card images for articles
 * Adds post title to a base OG image template
 * Run before Eleventy build: npm run og-images
 */

import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { createHash } from 'crypto';
import { existsSync } from 'fs';
import { join, basename, resolve } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

// Configuration
const CONFIG = {
    // The card is drawn from scratch — no baked base image — so it tracks the
    // site's design rather than an exported PNG. Dark in both colour schemes
    // by choice: social feeds are mostly dark, and it keeps the halftone
    // portrait reading as ink on paper inverted.
    portrait: 'public/assets/img/favicon.png',
    outputDir: 'public/assets/img/og',
    articlesDir: 'content/articles',
    manifest: 'scripts/.og-manifest.json',
    siteUrl: 'https://michaelbishop.me',

    width: 1200,
    height: 630,

    // Ink palette, matching public/assets/css/darkmode.css
    ground: '#16171A',
    textColor: '#EDE8DE',
    mutedColor: '#8F8A80',
    accentColor: '#E0663F',
    ruleColor: '#3A3D42',

    fontSizes: { short: 60, medium: 54, long: 46, veryLong: 40 },
    fontFamily: 'Newsreader',
    excerptFontFamily: 'IBM Plex Mono',

    mastheadSize: 44,
    taglineSize: 20,
    taglineTracking: 5,

    excerptColor: 'rgba(237, 232, 222, 0.72)',
    excerptFontSize: 24,
    excerptLineHeight: 34,
    excerptGap: 22,
    excerptMaxLines: 3,

    portraitSize: 420,
    textX: 520,
    textFromBottom: 120,
    maxTextWidth: 620,
    lineHeight: 70,
};

// Register the self-hosted fonts so the card is set in the same faces as the
// site. Without this the canvas falls back to Courier New, which is what the
// cards used before the reskin.
for (const file of [
    'newsreader-latin-wght-normal.woff2',
    'ibm-plex-mono-latin-400-normal.woff2',
]) {
    const path = join('public/assets/fonts', file);
    if (existsSync(path)) GlobalFonts.registerFromPath(path);
}

/**
 * Calculate font size based on title length
 */
function calculateFontSize(title) {
    const len = title.length;
    
    if (len < 20) return CONFIG.fontSizes.short;
    if (len < 35) return CONFIG.fontSizes.medium;
    if (len < 50) return CONFIG.fontSizes.long;
    return CONFIG.fontSizes.veryLong;
}

/**
 * Wrap text to fit within maxWidth
 */
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
}

/**
 * Generate OG image for a single article
 */
/** Draw text with manual letter spacing — canvas has no tracking control. */
function fillTracked(ctx, text, x, y, tracking) {
    let cursor = x;
    for (const ch of text) {
        ctx.fillText(ch, cursor, y);
        cursor += ctx.measureText(ch).width + tracking;
    }
    return cursor - tracking - x;
}

function measureTracked(ctx, text, tracking) {
    let w = 0;
    for (const ch of text) w += ctx.measureText(ch).width + tracking;
    return w - tracking;
}

async function generateOgImage(title, excerpt, outputPath, portraitImage) {
    const canvas = createCanvas(CONFIG.width, CONFIG.height);
    const ctx = canvas.getContext('2d');

    // Ground
    ctx.fillStyle = CONFIG.ground;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

    // Masthead, centred across the top
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = CONFIG.textColor;
    ctx.font = `${CONFIG.mastheadSize}px "${CONFIG.fontFamily}"`;
    const name = 'Bytes of Michael Bishop';
    ctx.fillText(name, (CONFIG.width - ctx.measureText(name).width) / 2, 92);

    ctx.fillStyle = CONFIG.mutedColor;
    ctx.font = `${CONFIG.taglineSize}px "${CONFIG.excerptFontFamily}"`;
    const tagline = 'a personal web log'.toUpperCase();
    const taglineW = measureTracked(ctx, tagline, CONFIG.taglineTracking);
    fillTracked(ctx, tagline, (CONFIG.width - taglineW) / 2, 132, CONFIG.taglineTracking);

    // Portrait, bleeding off the bottom-left
    if (portraitImage) {
        ctx.drawImage(
            portraitImage,
            60,
            CONFIG.height - CONFIG.portraitSize,
            CONFIG.portraitSize,
            CONFIG.portraitSize
        );
    }

    // Title
    const fontSize = calculateFontSize(title);
    const lineHeight = fontSize + 10;
    ctx.fillStyle = CONFIG.textColor;
    ctx.font = `${fontSize}px "${CONFIG.fontFamily}"`;
    ctx.textBaseline = 'bottom';
    const lines = wrapText(ctx, title, CONFIG.maxTextWidth);

    let excerptLines = [];
    if (excerpt) {
        ctx.font = `${CONFIG.excerptFontSize}px "${CONFIG.excerptFontFamily}"`;
        excerptLines = wrapText(ctx, excerpt, CONFIG.maxTextWidth);
        if (excerptLines.length > CONFIG.excerptMaxLines) {
            excerptLines = excerptLines.slice(0, CONFIG.excerptMaxLines);
            excerptLines[excerptLines.length - 1] =
                excerptLines[excerptLines.length - 1].replace(/[\s.,;:]+$/, '') + '…';
        }
        ctx.font = `${fontSize}px "${CONFIG.fontFamily}"`;
    }

    const excerptBlock = excerptLines.length
        ? CONFIG.excerptGap + excerptLines.length * CONFIG.excerptLineHeight
        : 0;
    const blockBottom = CONFIG.height - CONFIG.textFromBottom;
    const textY = blockBottom - excerptBlock - (lines.length - 1) * lineHeight;

    // Vermilion kicker rule above the title — the site's one accent
    ctx.fillStyle = CONFIG.accentColor;
    ctx.fillRect(CONFIG.textX, textY - fontSize - 26, 48, 3);

    ctx.fillStyle = CONFIG.textColor;
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], CONFIG.textX, textY + (i * lineHeight));
    }

    if (excerptLines.length) {
        ctx.fillStyle = CONFIG.excerptColor;
        ctx.font = `${CONFIG.excerptFontSize}px "${CONFIG.excerptFontFamily}"`;
        const top = textY + (lines.length - 1) * lineHeight + CONFIG.excerptGap;
        for (let i = 0; i < excerptLines.length; i++) {
            ctx.fillText(excerptLines[i], CONFIG.textX, top + ((i + 1) * CONFIG.excerptLineHeight));
        }
    }

    await writeFile(outputPath, canvas.toBuffer('image/png'));
    console.log(`✓ Generated: ${outputPath}`);
}

/**
 * Create slug from title for filename
 */
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Main function
 */
const forceFlag = process.argv.includes('--force');

// Cards are committed assets. On CI we ship exactly what is in git and only
// draw one that is missing — never redraw an existing card.
//
// Canvas rasterises text differently on Linux than on macOS, so regenerating
// on the builder produces a byte-different PNG from the committed one even
// when it looks identical. That changes the etag on every deploy, which is
// how the live cards drifted away from every committed version and got stuck
// behind a stale cache. Generating only what is missing keeps a forgotten
// commit from shipping a broken og:image without reintroducing the drift.
// Workers Builds sets WORKERS_CI; GitHub Actions sets CI and GITHUB_ACTIONS.
const isCI = Boolean(
    process.env.CI || process.env.WORKERS_CI || process.env.GITHUB_ACTIONS
);

/**
 * Also called from eleventy.config.js on `eleventy.before`, so cards refresh
 * during `npm start` too — not only on a full `npm run build`.
 */
export async function generateOgImages({ force = forceFlag } = {}) {
    console.log(isCI
        ? '🖼️  CI: shipping committed social cards; drawing only missing ones.\n'
        : '🖼️  Generating OG images for articles...\n');
    
    // Ensure output directory exists
    if (!existsSync(CONFIG.outputDir)) {
        await mkdir(CONFIG.outputDir, { recursive: true });
    }
    
    // The portrait is the only external asset; everything else is drawn.
    let portraitImage = null;
    if (existsSync(CONFIG.portrait)) {
        portraitImage = await loadImage(await readFile(CONFIG.portrait));
    } else {
        console.log(`⚠ Portrait not found (${CONFIG.portrait}); cards will be type only.`);
    }

    // Previously drawn fingerprints, slug → hash of (title, excerpt).
    let manifest = {};
    if (existsSync(CONFIG.manifest)) {
        try {
            manifest = JSON.parse(await readFile(CONFIG.manifest, 'utf-8'));
        } catch {
            console.log('⚠ Unreadable manifest, regenerating everything.');
        }
    }
    
    // Read all article files
    const files = await readdir(CONFIG.articlesDir);
    const markdownFiles = files.filter(f => f.endsWith('.md'));
    
    let generated = 0;
    let skipped = 0;
    
    for (const file of markdownFiles) {
        const filePath = join(CONFIG.articlesDir, file);
        const content = await readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);
        
        // Skip if no title
        if (!frontmatter.title) {
            console.log(`⚠ Skipped (no title): ${file}`);
            skipped++;
            continue;
        }
        
        // Skip if custom og image already set
        if (frontmatter.meta?.img) {
            console.log(`⏭ Skipped (has custom img): ${file}`);
            skipped++;
            continue;
        }
        
        // Generate filename from article slug
        const slug = basename(file, '.md');
        const outputFilename = `og-${slug}.png`;
        const outputPath = join(CONFIG.outputDir, outputFilename);
        
        const excerpt = frontmatter.excerpt || frontmatter.meta?.desc || '';

        // Regenerate only when what the card is DRAWN FROM changes. mtime is
        // the wrong signal twice over: fixing a typo in the body would rewrite
        // a 300KB binary for no visual change, and a fresh CI clone stamps
        // every file with checkout time, making the comparison a coin flip.
        const fingerprint = createHash('sha256')
            .update(`${frontmatter.title}\u0000${excerpt}`)
            .digest('hex')
            .slice(0, 16);

        if (isCI && existsSync(outputPath)) {
            // Shipping the committed card as-is.
            skipped++;
            continue;
        }

        if (!force && existsSync(outputPath) && manifest[slug] === fingerprint) {
            console.log(`⏭ Up to date: ${outputFilename}`);
            skipped++;
            continue;
        }

        if (isCI) {
            console.log(`::warning file=${filePath}::No social card committed for this post; drawing one on the builder. Run \`npm run og-images\` locally and commit the PNG.`);
        }

        try {
            await generateOgImage(frontmatter.title, excerpt, outputPath, portraitImage);
            manifest[slug] = fingerprint;
            generated++;
        } catch (error) {
            console.error(`❌ Error generating ${file}:`, error.message);
        }
    }
    
    if (!isCI) {
        await writeFile(CONFIG.manifest, JSON.stringify(manifest, null, 2) + '\n');
    }

    console.log(`\n✅ Done! Generated: ${generated}, Skipped: ${skipped}`);
}

// Only self-run when invoked directly; importing it must not start a build.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    generateOgImages().catch(err => {
        console.error(err);
        process.exit(1);
    });
}
