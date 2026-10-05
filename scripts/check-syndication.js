#!/usr/bin/env node

/**
 * Assert that posts which should have syndicated actually did.
 *
 * The syndication pipeline has several stages that can each no-op quietly
 * (see REDESIGN-NOTES.md and app/README.md for two that did). A green CI run
 * means "no step raised an error", not "the post is on Bluesky". This checks
 * the outcome instead of the steps.
 *
 * Usage:
 *   node scripts/check-syndication.js <file>...   # CI: fail on ANY miss
 *   node scripts/check-syndication.js             # sweep: fail on RECENT misses
 *   node scripts/check-syndication.js --fail-within 14 --since 60
 *
 * With explicit paths we just tried to syndicate those posts, so any missing
 * syndication URL is a failure.
 *
 * With no paths it sweeps. Two windows, because "actionable" and "worth
 * mentioning" are different: posts older than --since (default 30 days) are
 * ignored entirely — most predate this automation and will never have a
 * syndication URL — and of the rest, only misses newer than --fail-within
 * (default 7 days) fail the run. In between you get a notice without the
 * build going red forever over a post you have decided not to chase.
 *
 * Deliberately standalone rather than importing send-webmentions.js, which
 * calls main() at import time and would start POSTing to Bridgy.
 */

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import matter from 'gray-matter'

const POST_DIRS = ['content/notes', 'content/replies', 'content/prints', 'content/photos']

const args = process.argv.slice(2)
let failWithinDays = 7
let sinceDays = 30
const paths = []
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--fail-within') {
    failWithinDays = Number(args[++i])
    if (!Number.isFinite(failWithinDays)) {
      console.error('--fail-within needs a number of days')
      process.exit(2)
    }
  } else if (args[i] === '--since') {
    sinceDays = Number(args[++i])
    if (!Number.isFinite(sinceDays)) {
      console.error('--since needs a number of days')
      process.exit(2)
    }
  } else if (args[i].startsWith('--')) {
    console.error(`Unknown flag: ${args[i]}`)
    process.exit(2)
  } else {
    paths.push(args[i])
  }
}
const explicit = paths.length > 0

/**
 * Does this post expect a syndication URL back?
 *
 * Only brid.gy/publish/* returns a Location header worth recording.
 * fed.brid.gy federates without handing back a URL, so a post carrying only
 * u-bridgy-fed is not a miss. Mirrors syndicationTargets() in
 * send-webmentions.js — keep the two in step.
 */
function expectsSyndication(frontmatter, body) {
  const fm = frontmatter['mp-syndicate-to']
  if (fm) {
    const targets = Array.isArray(fm) ? fm : [fm]
    return targets.some(t => String(t).includes('brid.gy/publish'))
  }
  return /class="u-bridgy"\s+href="https:\/\/brid\.gy\/publish/.test(body)
}

function hasSyndication(frontmatter) {
  const s = frontmatter.syndication
  if (!s) return false
  return Array.isArray(s) ? s.length > 0 : String(s).trim().length > 0
}

async function collectFiles() {
  if (explicit) return paths.filter(p => p.endsWith('.md'))
  const found = []
  for (const dir of POST_DIRS) {
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true, recursive: true })
    } catch {
      continue // directory may not exist yet
    }
    for (const e of entries) {
      if (e.isFile() && e.name.endsWith('.md')) found.push(join(e.parentPath ?? e.path, e.name))
    }
  }
  return found
}

const DAY = 24 * 60 * 60 * 1000
const misses = []

for (const filePath of await collectFiles()) {
  let raw
  try {
    raw = await readFile(filePath, 'utf-8')
  } catch {
    console.error(`✗ Unreadable: ${filePath}`)
    process.exit(1)
  }
  const { data, content: body } = matter(raw)
  if (!expectsSyndication(data, body)) continue
  if (hasSyndication(data)) continue

  const when = data.date ? new Date(data.date) : null
  const ageDays = when && !Number.isNaN(when.valueOf())
    ? Math.floor((Date.now() - when.valueOf()) / DAY)
    : null
  // Sweeping: anything beyond --since is pre-automation history, not a miss.
  if (!explicit && ageDays !== null && ageDays > sinceDays) continue
  misses.push({ filePath, ageDays })
}

if (misses.length === 0) {
  console.log(explicit
    ? `✓ All ${paths.length} post(s) carry a syndication URL.`
    : `✓ No post from the last ${sinceDays} days is missing a syndication URL.`)
  process.exit(0)
}

misses.sort((a, b) => (a.ageDays ?? 1e9) - (b.ageDays ?? 1e9))

// In explicit mode every miss is fresh by definition.
const failing = explicit
  ? misses
  : misses.filter(m => m.ageDays !== null && m.ageDays <= failWithinDays)
const stale = misses.filter(m => !failing.includes(m))

for (const m of failing) {
  const age = m.ageDays === null ? 'undated' : `${m.ageDays}d old`
  console.log(`::error file=${m.filePath}::Expected a syndication URL but found none (${age}). It is on the site but never reached Bluesky.`)
  console.error(`✗ ${m.filePath} (${age})`)
}
for (const m of stale) {
  const age = m.ageDays === null ? 'undated' : `${m.ageDays}d old`
  console.log(`::notice file=${m.filePath}::No syndication URL, but older than ${failWithinDays}d — not failing. Syndicate manually or leave it.`)
  console.error(`· ${m.filePath} (${age}, not failing)`)
}

if (failing.length > 0) {
  console.error(`\n${failing.length} post(s) published to the site but never syndicated.`)
  console.error('Re-run for one post with:  npm run webmention -- <file>')
  process.exit(1)
}
process.exit(0)
