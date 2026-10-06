#!/usr/bin/env node

/**
 * Scaffold a new print (or photo) post from an Apple Photos export.
 *
 * Usage:
 *   npm run print -- ~/Desktop/sheepshead.jpg "Sheepshead, October"
 *   npm run print -- ~/Desktop/dock.jpg "Dock at dusk" --photo
 *   npm run print -- ~/Desktop/old-print.jpg "Pinfish" --no-syndicate
 *
 * The source image is re-encoded through sharp into content/img/<prints|photos>/,
 * which does three jobs at once:
 *
 *   1. Strips EXIF. Sharp drops metadata unless told to keep it, so GPS
 *      coordinates and camera serials from the Photos app never land in a
 *      public git repo. Apple Photos keeps location on export unless you
 *      untick it, and this repo already has committed images carrying
 *      "iPhone 13 Pro Max" in their EXIF.
 *   2. Caps the long edge, so a 10MB original doesn't get committed.
 *   3. Leaves a sane master for eleventy-img to derive responsive variants
 *      from at build time.
 *
 * Originals stay in Photos — this writes a web master, not an archive copy.
 */

import { writeFile, access, mkdir } from 'fs/promises'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// Long edge in px for the committed master. eleventy-img derives 400/800/1200/1800
// from this, so there's no reason to carry more than the largest derivative plus
// a little headroom.
const MAX_EDGE = 2400
const JPEG_QUALITY = 82

const argv = process.argv.slice(2)
const flags = new Set(argv.filter(a => a.startsWith('--')))
const positional = argv.filter(a => !a.startsWith('--'))

const isPhoto = flags.has('--photo') || flags.has('--photos')
// Backfilling old work shouldn't spray the timeline: --no-syndicate omits the
// Bridgy anchors, which is what send-webmentions.js keys off.
const syndicate = !flags.has('--no-syndicate')

const kind = isPhoto ? 'photos' : 'prints'
const [sourceArg, ...titleParts] = positional
const title = titleParts.join(' ').trim()

if (!sourceArg || !title) {
    console.error('Usage: npm run print -- <image path> "Title" [--photo] [--no-syndicate]')
    process.exit(1)
}

const source = resolve(sourceArg.replace(/^~/, process.env.HOME ?? '~'))

try {
    await access(source)
} catch {
    console.error(`No such image: ${source}`)
    process.exit(1)
}

const slugify = s =>
    s
        .toLowerCase()
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

const slug = slugify(title)
const postDir = join(root, 'content', kind)
const imgDir = join(root, 'content', 'img', kind)
const postFile = join(postDir, `${slug}.md`)
const imgFile = join(imgDir, `${slug}.jpg`)

try {
    await access(postFile)
    console.error(`Already exists: content/${kind}/${slug}.md`)
    process.exit(1)
} catch {
    // doesn't exist — good
}

await mkdir(postDir, { recursive: true })
await mkdir(imgDir, { recursive: true })

// Re-encode. `rotate()` with no argument applies the EXIF orientation before
// the metadata is dropped, so a portrait phone shot doesn't come out sideways.
const { width, height } = await sharp(source)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(imgFile)

// Local time with UTC offset (e.g. 2026-10-05T09:12:00-04:00). Dates must be
// explicit in frontmatter — "git Created" resolves to build time on Workers
// Builds' shallow clones.
const now = new Date()
const pad = n => String(n).padStart(2, '0')
const tzOffset = -now.getTimezoneOffset()
const sign = tzOffset >= 0 ? '+' : '-'
const offset = `${sign}${pad(Math.floor(Math.abs(tzOffset) / 60))}:${pad(Math.abs(tzOffset) % 60)}`
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}${offset}`

// The src is input-dir-absolute on purpose. eleventy-img resolves a leading
// slash against the input dir, so /img/prints/x.jpg finds content/img/prints/x.jpg
// on disk and the transform plugin rewrites the tag. A *relative* src would
// resolve against this markdown file's own directory and silently fail.
const bridgy = syndicate
    ? `
<a class="u-bridgy-fed" href="https://fed.brid.gy/" hidden="from-humans"></a>
<a class="u-bridgy" href="https://brid.gy/publish/bluesky"></a>
`
    : ''

const body = `---
date: ${date}
title: ${title}
photo: /img/${kind}/${slug}.jpg
meta:
  title: ${title}
  desc:
  img: https://michaelbishop.me/img/${kind}/${slug}.jpg
  img_alt: ${title}
---

<img class="u-photo" src="/img/${kind}/${slug}.jpg" alt="${title}">


${bridgy}`

await writeFile(postFile, body)

console.log(`Created content/${kind}/${slug}.md`)
console.log(`Wrote   content/img/${kind}/${slug}.jpg  (${width}×${height}, EXIF stripped)`)
if (!syndicate) console.log('        no Bridgy anchors — this one will not syndicate')

// Open in VS Code with the cursor on the blank line under the image
const open = spawnSync('code', ['-g', `${postFile}:14`], { stdio: 'inherit' })
if (open.error) console.log('(could not launch `code` — open the file manually)')
