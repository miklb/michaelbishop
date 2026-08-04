#!/usr/bin/env node

/**
 * Scaffold a new note in content/notes/ and open it in VS Code.
 *
 * Usage:
 *   npm run note                        → content/notes/note-YYYY-MM-DD-HHMM.md
 *   npm run note -- "Twilight Cardinals" → content/notes/twilight-cardinals.md
 */

import { writeFile, access } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const notesDir = join(root, 'content', 'notes')

const input = process.argv.slice(2).join(' ').trim()

const slugify = s =>
    s
        .toLowerCase()
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

const now = new Date()
const pad = n => String(n).padStart(2, '0')
const fallback = `note-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`

const slug = input ? slugify(input) : fallback
const file = join(notesDir, `${slug}.md`)

try {
    await access(file)
    console.error(`Already exists: content/notes/${slug}.md`)
    process.exit(1)
} catch {
    // doesn't exist — good
}

// Local time with UTC offset (e.g. 2026-08-03T20:38:00-04:00). Dates must be
// explicit in frontmatter — "git Created" resolves to build time on Workers
// Builds' shallow clones.
const tzOffset = -now.getTimezoneOffset()
const sign = tzOffset >= 0 ? '+' : '-'
const offset = `${sign}${pad(Math.floor(Math.abs(tzOffset) / 60))}:${pad(Math.abs(tzOffset) % 60)}`
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}${offset}`

const body = `---
date: ${date}
tags:
  - note
---



<a class="u-bridgy-fed" href="https://fed.brid.gy/" hidden="from-humans"></a>
<a class="u-bridgy" href="https://brid.gy/publish/bluesky"></a>
`

await writeFile(file, body)
console.log(`Created content/notes/${slug}.md`)

// Open in VS Code with the cursor on the blank line after the frontmatter
const open = spawnSync('code', ['-g', `${file}:5`], { stdio: 'inherit' })
if (open.error) console.log('(could not launch `code` — open the file manually)')
