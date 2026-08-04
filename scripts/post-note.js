#!/usr/bin/env node

/**
 * Publish pending content: commit anything new/changed under content/ and
 * push to main. Cloudflare Workers Builds deploys, then the syndicate
 * workflow sends webmentions to Bridgy.
 *
 * Usage:
 *   npm run post                     → commit message from the note filename(s)
 *   npm run post -- "custom message" → custom commit message
 */

import { execFileSync } from 'child_process'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const git = args =>
    execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()

const status = git(['status', '--porcelain', '--', 'content/'])
if (!status) {
    console.log('Nothing to publish — no changes under content/.')
    process.exit(0)
}

const files = status
    .split('\n')
    .map(line => line.slice(3))
    .filter(Boolean)

const custom = process.argv.slice(2).join(' ').trim()
const slugs = files.map(f => basename(f).replace(/\.md$/, '')).join(', ')
const message = custom || `Note: ${slugs}`

git(['add', '--', 'content/'])
git(['commit', '-m', message])
console.log(`Committed: ${message}`)

execFileSync('git', ['push'], { cwd: root, stdio: 'inherit' })
console.log('Pushed — Workers Builds will deploy, syndication follows in CI.')
