#!/usr/bin/env node

/**
 * Send webmentions to Bridgy and capture syndication URLs
 * Run after build to syndicate new posts
 */

import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import matter from 'gray-matter'

const SITE_URL = 'https://michaelbishop.me'

// Bridgy endpoints
const BRIDGY_FED_ENDPOINT = 'https://fed.brid.gy/webmention'
const BRIDGY_PUBLISH_ENDPOINT = 'https://brid.gy/publish/webmention'

async function sendWebmention(source, target, endpoint) {
  const formData = new URLSearchParams()
  formData.append('source', source)
  formData.append('target', target)
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    })
    
    const responseText = await response.text()
    
    if (response.ok) {
      const location = response.headers.get('Location')
      console.log(`✓ Sent webmention: ${source} → ${target}`)
      if (location) {
        console.log(`  Syndication URL: ${location}`)
        return location
      }
    } else if (response.status === 400 && responseText.includes('already published')) {
      // Post was already syndicated in a previous run
      console.log(`⚠ Already published: ${source} → ${target}`)
      // Try to extract the syndication URL from the error if available
      // Note: You can manually add syndication URLs to frontmatter for these posts
      return null
    } else {
      console.log(`✗ Failed: ${source} → ${target} (${response.status})`)
      console.log(`  Response: ${responseText.substring(0, 200)}`)
    }
  } catch (error) {
    console.log(`✗ Error: ${error.message}`)
  }
  
  return null
}

async function updatePostWithSyndicationUrls(filePath, urls) {
  const content = await readFile(filePath, 'utf-8')
  const parsed = matter(content)
  
  // Add syndication URLs to frontmatter
  if (!parsed.data.syndication) {
    parsed.data.syndication = []
  }
  
  // Add new URLs (avoid duplicates)
  for (const url of urls) {
    if (url && !parsed.data.syndication.includes(url)) {
      parsed.data.syndication.push(url)
    }
  }
  
  // Write back to file
  const updated = matter.stringify(parsed.content, parsed.data)
  await writeFile(filePath, updated, 'utf-8')
  console.log(`  ✓ Updated ${filePath} with syndication URLs`)
}

/**
 * Syndication targets for a post: the `mp-syndicate-to` frontmatter (legacy,
 * written by Micropub) or the u-bridgy / u-bridgy-fed links hand-written posts
 * carry in their body. Bridgy Publish requires that body link to be present on
 * the live page anyway, so the body is the source of truth.
 */
function syndicationTargets(frontmatter, body) {
  const fm = frontmatter['mp-syndicate-to']
  if (fm) return Array.isArray(fm) ? fm : [fm]
  const targets = []
  if (/class="u-bridgy-fed"/.test(body)) targets.push('https://fed.brid.gy/')
  if (/class="u-bridgy"\s+href="https:\/\/brid\.gy\/publish\/bluesky/.test(body)) {
    targets.push('https://brid.gy/publish/bluesky')
  }
  return targets
}

// Poll until the post page is actually serving — Workers Builds deploys
// asynchronously after the push, and Bridgy fetches the source URL live.
async function waitForUrl(url, timeoutMs = 5 * 60 * 1000, intervalMs = 10 * 1000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'HEAD' })
      if (res.ok) return true
    } catch {
      // network hiccup — keep polling
    }
    console.log(`  … waiting for ${url} to deploy`)
    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }
  return false
}

async function findRecentPosts(dir, limit = 5) {
  const posts = []
  const entries = await readdir(dir, { withFileTypes: true, recursive: true })

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const filePath = join(entry.path, entry.name)
      const content = await readFile(filePath, 'utf-8')
      const { data, content: body } = matter(content)

      const targets = syndicationTargets(data, body)
      if (targets.length > 0) {
        posts.push({ filePath, frontmatter: data, targets, file: entry.name })
      }
    }
  }

  // Sort by date, most recent first
  posts.sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date))
  return posts.slice(0, limit)
}

/**
 * Build the post list from an explicit set of file paths (e.g. the files
 * changed in a push). Only syndicatable posts under notes/ or replies/ with
 * `mp-syndicate-to` are kept. Used by CI to scope syndication to new posts
 * instead of re-scanning everything (which spams Bridgy with "already
 * published" responses).
 */
async function postsFromFiles(filePaths) {
  const posts = []
  for (const filePath of filePaths) {
    if (!filePath.endsWith('.md')) continue
    if (!/content\/(notes|replies)\//.test(filePath)) continue
    try {
      const content = await readFile(filePath, 'utf-8')
      const { data, content: body } = matter(content)
      const targets = syndicationTargets(data, body)
      if (targets.length > 0) {
        posts.push({ filePath, frontmatter: data, targets, file: filePath.split('/').pop() })
      }
    } catch (e) {
      console.log(`⚠ Skipping unreadable file: ${filePath}`)
    }
  }
  return posts
}

async function main() {
  console.log('🔗 Sending webmentions to Bridgy...\n')

  // If file paths are passed as args, only process those (CI: changed files).
  // Otherwise fall back to scanning recent posts (manual / backfill runs).
  const fileArgs = process.argv.slice(2)
  let postsToProcess

  if (fileArgs.length > 0) {
    console.log(`Scoped to ${fileArgs.length} changed file(s).`)
    postsToProcess = await postsFromFiles(fileArgs)
    if (postsToProcess.length === 0) {
      console.log('No syndicatable posts among the changed files. Nothing to do.')
      return
    }
  } else {
    // Scan both notes and replies directories
    const contentDirs = ['./content/notes', './content/replies']
    const recentPosts = []
    for (const dir of contentDirs) {
      try {
        const posts = await findRecentPosts(dir, 3)
        recentPosts.push(...posts)
      } catch (e) {
        // Directory may not exist yet
      }
    }
    // Sort combined results by date, take most recent
    recentPosts.sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date))
    postsToProcess = recentPosts.slice(0, 5)
  }
  
  for (const post of postsToProcess) {
    const targets = post.targets

    // Skip if already syndicated (has syndication URLs)
    if (post.frontmatter.syndication && post.frontmatter.syndication.length > 0) {
      console.log(`\nSkipping (already syndicated): ${post.file}`)
      continue
    }

    // Explicit permalink wins; otherwise the default /notes/<slug>/ scheme
    let postUrl
    if (post.frontmatter.permalink) {
      postUrl = `${SITE_URL}${post.frontmatter.permalink.startsWith('/') ? '' : '/'}${post.frontmatter.permalink}`
    } else {
      const slug = post.file.replace('.md', '')
      const contentType = post.filePath.includes('/replies/') ? 'replies' : 'notes'
      postUrl = `${SITE_URL}/${contentType}/${slug}/`
    }

    console.log(`\nPost: ${postUrl}`)

    if (!(await waitForUrl(postUrl))) {
      console.log(`✗ Gave up waiting for ${postUrl} — not deployed yet, skipping`)
      continue
    }
    
    const syndicationUrls = []
    
    for (const target of targets) {
      let syndicationUrl = null
      
      if (target.includes('brid.gy/publish/bluesky')) {
        syndicationUrl = await sendWebmention(postUrl, 'https://brid.gy/publish/bluesky', BRIDGY_PUBLISH_ENDPOINT)
      } else if (target.includes('fed.brid.gy')) {
        syndicationUrl = await sendWebmention(postUrl, 'https://fed.brid.gy/', BRIDGY_FED_ENDPOINT)
      }
      
      if (syndicationUrl) {
        syndicationUrls.push(syndicationUrl)
      }
    }
    
    // Update post with syndication URLs
    if (syndicationUrls.length > 0) {
      await updatePostWithSyndicationUrls(post.filePath, syndicationUrls)
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  console.log('\n✓ Done!')
}

main().catch(console.error)
