#!/usr/bin/env node

/**
 * Scaffold a new article in content/articles/ and open it in VS Code.
 *
 * Usage:
 *   npm run article -- "Announcing Latest Earworm"
 *   npm run article -- "Announcing Latest Earworm" --no-syndicate
 *
 * Articles are the long-form type: they carry a title and an excerpt, and the
 * OG card is generated from the title at build time by
 * scripts/generate-og-images.js. That script skips any post whose frontmatter
 * already sets `meta.img`, so this template deliberately leaves it out —
 * articles.json supplies the generated card's URL.
 */

import { writeFile, access, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const articlesDir = join(root, 'content', 'articles')

const argv = process.argv.slice(2)
const flags = new Set(argv.filter(a => a.startsWith('--')))
const title = argv.filter(a => !a.startsWith('--')).join(' ').trim()
const syndicate = !flags.has('--no-syndicate')

if (!title) {
    console.error('Usage: npm run article -- "Title of the piece" [--no-syndicate]')
    process.exit(1)
}

// Matches scripts/new-note.js and scripts/new-print.js.
const slugify = s =>
    s
        .toLowerCase()
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

const slug = slugify(title)
if (!slug) {
    console.error('Title reduces to nothing sluggable.')
    process.exit(1)
}

const file = join(articlesDir, `${slug}.md`)

try {
    await access(file)
    console.error(`Already exists: content/articles/${slug}.md`)
    process.exit(1)
} catch {
    // doesn't exist — good
}

await mkdir(articlesDir, { recursive: true })

// Local time with UTC offset. Dates must be explicit in frontmatter —
// "git Created" resolves to build time on Workers Builds' shallow clones.
const now = new Date()
const pad = n => String(n).padStart(2, '0')
const tzOffset = -now.getTimezoneOffset()
const sign = tzOffset >= 0 ? '+' : '-'
const offset = `${sign}${pad(Math.floor(Math.abs(tzOffset) / 60))}:${pad(Math.abs(tzOffset) % 60)}`
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}${offset}`

// YAML-safe: quote the title if it carries a colon or a quote.
const yamlStr = s => (/[:#'"]/.test(s) ? `"${s.replace(/"/g, '\\"')}"` : s)

const bridgy = syndicate
    ? `

<a class="u-bridgy-fed" href="https://fed.brid.gy/" hidden="from-humans"></a>
<a class="u-bridgy" href="https://brid.gy/publish/bluesky"></a>
`
    : '\n'

const body = `---
title: ${yamlStr(title)}
excerpt:
date: ${date}
permalink: "/articles/${slug}/"
tags:
  - article
meta:
  title: ${yamlStr(title)}
  desc:
---

${bridgy}`

await writeFile(file, body)

console.log(`Created content/articles/${slug}.md`)
console.log(`URL     /articles/${slug}/`)
console.log(`OG card generated from the title at build time`)
if (!syndicate) console.log('        no Bridgy anchors — this one will not syndicate')

// Cursor on the excerpt, which is the field most easily forgotten.
const open = spawnSync('code', ['-g', `${file}:2`], { stdio: 'inherit' })
if (open.error) console.log('(could not launch `code` — open the file manually)')
