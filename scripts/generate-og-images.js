#!/usr/bin/env node

/**
 * Generate Open Graph social card images for articles
 * Adds post title to a base OG image template
 * Run before Eleventy build: npm run og-images
 */

import { createCanvas, loadImage } from '@napi-rs/canvas';
import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { createHash } from 'crypto';
import { existsSync } from 'fs';
import { join, basename } from 'path';
import matter from 'gray-matter';

// Configuration
const CONFIG = {
    baseImage: 'public/assets/img/og-image.png',
    outputDir: 'public/assets/img/og',
    articlesDir: 'content/articles',
    // Fingerprints of what each card was drawn from. Kept out of public/,
    // which is passthrough-copied to the site root.
    manifest: 'scripts/.og-manifest.json',
    siteUrl: 'https://michaelbishop.me',
    
    // Text styling
    textColor: '#F5F2E8',
    fontSizes: {
        short: 60,      // < 20 chars
        medium: 52,     // 20-35 chars
        long: 45,       // 35-50 chars
        veryLong: 38    // > 50 chars
    },
    fontFamily: 'Courier New, Courier, monospace',

    // Excerpt, drawn under the title
    excerptColor: 'rgba(245, 242, 232, 0.72)',
    excerptFontSize: 26,
    excerptLineHeight: 34,
    excerptGap: 24,
    excerptMaxLines: 3,
    
    // Text position (from left edge, from bottom)
    textX: 450,
    textFromBottom: 150,
    
    // Max text width for wrapping
    maxTextWidth: 700,
    lineHeight: 70,
};

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
async function generateOgImage(title, excerpt, outputPath, baseImageBuffer) {
    // Load base image
    const baseImage = await loadImage(baseImageBuffer);
    
    // Create canvas matching image dimensions
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext('2d');
    
    // Draw base image
    ctx.drawImage(baseImage, 0, 0);
    
    // Calculate dynamic font size based on title length
    const fontSize = calculateFontSize(title);
    const lineHeight = fontSize + 10;
    
    // Configure text
    ctx.fillStyle = CONFIG.textColor;
    ctx.font = `${fontSize}px "${CONFIG.fontFamily}"`;
    ctx.textBaseline = 'bottom';
    
    // Wrap text if needed
    const lines = wrapText(ctx, title, CONFIG.maxTextWidth);

    // Measure the excerpt in its own font before laying anything out, so the
    // title and excerpt can be bottom-anchored as one block.
    let excerptLines = [];
    if (excerpt) {
        ctx.font = `${CONFIG.excerptFontSize}px "${CONFIG.fontFamily}"`;
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

    // Bottom-anchor the whole block: the last line sits textFromBottom up
    // from the bottom edge, and the title rises to make room for the excerpt.
    const blockBottom = baseImage.height - CONFIG.textFromBottom;
    let textY = blockBottom - excerptBlock - (lines.length - 1) * lineHeight;

    // Draw the title
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], CONFIG.textX, textY + (i * lineHeight));
    }

    // Draw the excerpt
    if (excerptLines.length) {
        ctx.fillStyle = CONFIG.excerptColor;
        ctx.font = `${CONFIG.excerptFontSize}px "${CONFIG.fontFamily}"`;
        const excerptTop = textY + (lines.length - 1) * lineHeight + CONFIG.excerptGap;
        for (let i = 0; i < excerptLines.length; i++) {
            ctx.fillText(excerptLines[i], CONFIG.textX, excerptTop + ((i + 1) * CONFIG.excerptLineHeight));
        }
    }
    
    // Save image
    const buffer = canvas.toBuffer('image/png');
    await writeFile(outputPath, buffer);
    
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
const force = process.argv.includes('--force');

async function main() {
    console.log('🖼️  Generating OG images for articles...\n');
    
    // Ensure output directory exists
    if (!existsSync(CONFIG.outputDir)) {
        await mkdir(CONFIG.outputDir, { recursive: true });
    }
    
    // Load base image once
    if (!existsSync(CONFIG.baseImage)) {
        console.error(`❌ Base image not found: ${CONFIG.baseImage}`);
        console.error('   Please add your 1200x630 base image.');
        process.exit(1);
    }
    
    const baseImageBuffer = await readFile(CONFIG.baseImage);

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

        if (!force && existsSync(outputPath) && manifest[slug] === fingerprint) {
            console.log(`⏭ Up to date: ${outputFilename}`);
            skipped++;
            continue;
        }

        try {
            await generateOgImage(frontmatter.title, excerpt, outputPath, baseImageBuffer);
            manifest[slug] = fingerprint;
            generated++;
        } catch (error) {
            console.error(`❌ Error generating ${file}:`, error.message);
        }
    }
    
    await writeFile(CONFIG.manifest, JSON.stringify(manifest, null, 2) + '\n');

    console.log(`\n✅ Done! Generated: ${generated}, Skipped: ${skipped}`);
}

main().catch(err => {
    // Exit non-zero: this runs as the first half of `npm run build`, and a
    // logged-but-swallowed error would let a broken build continue.
    console.error(err);
    process.exit(1);
});
