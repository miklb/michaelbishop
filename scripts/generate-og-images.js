#!/usr/bin/env node

/**
 * Generate Open Graph social card images for articles
 * Adds post title to a base OG image template
 * Run before Eleventy build: npm run og-images
 */

import { createCanvas, registerFont, loadImage } from 'canvas';
import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, basename } from 'path';
import matter from 'gray-matter';

// Configuration
const CONFIG = {
    baseImage: 'public/assets/img/og-image.png',
    outputDir: 'public/assets/img/og',
    articlesDir: 'content/articles',
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
async function generateOgImage(title, outputPath, baseImageBuffer) {
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
    
    // Calculate starting Y position (from bottom, accounting for multiple lines)
    let textY = baseImage.height - CONFIG.textFromBottom;
    
    // If multiple lines, adjust starting position so text ends at the right spot
    if (lines.length > 1) {
        textY = baseImage.height - CONFIG.textFromBottom - (lines.length - 1) * lineHeight;
    }
    
    // Draw each line
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], CONFIG.textX, textY + (i * lineHeight));
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
        
        // Skip if already generated (for faster rebuilds)
        if (existsSync(outputPath)) {
            console.log(`⏭ Already exists: ${outputFilename}`);
            skipped++;
            continue;
        }
        
        try {
            await generateOgImage(frontmatter.title, outputPath, baseImageBuffer);
            generated++;
        } catch (error) {
            console.error(`❌ Error generating ${file}:`, error.message);
        }
    }
    
    console.log(`\n✅ Done! Generated: ${generated}, Skipped: ${skipped}`);
}

main().catch(console.error);
