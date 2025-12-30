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

async function findRecentPosts(dir, limit = 5) {
  const posts = []
  const entries = await readdir(dir, { withFileTypes: true, recursive: true })
  
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const filePath = join(entry.path, entry.name)
      const content = await readFile(filePath, 'utf-8')
      const { data } = matter(content)
      
      if (data['mp-syndicate-to']) {
        posts.push({ filePath, frontmatter: data, file: entry.name })
      }
    }
  }
  
  // Sort by date, most recent first
  posts.sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date))
  return posts.slice(0, limit)
}

async function main() {
  console.log('🔗 Sending webmentions to Bridgy...\n')
  
  const recentPosts = await findRecentPosts('./content/notes', 3)
  
  for (const post of recentPosts) {
    const targets = post.frontmatter['mp-syndicate-to'] || []
    
    // Skip if already syndicated (has syndication URLs)
    if (post.frontmatter.syndication && post.frontmatter.syndication.length > 0) {
      console.log(`\nSkipping (already syndicated): ${post.file}`)
      continue
    }
    
    // Construct post URL (this assumes notes use timestamp slugs)
    const slug = post.file.replace('.md', '')
    const postUrl = `${SITE_URL}/notes/${slug}/`
    
    console.log(`\nPost: ${postUrl}`)
    
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
