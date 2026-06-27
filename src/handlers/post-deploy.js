// Post-deploy syndication: sends webmentions to Bridgy targets
// Ported from netlify/functions/post-deploy.js

export async function handlePostDeploy(request, env, ctx) {
  // Verify deploy secret
  const authHeader = request.headers.get('Authorization');
  const expectedToken = env.DEPLOY_SECRET;
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const siteUrl = (env.ME || 'https://michaelbishop.me').replace(/\/$/, '');
  const repoPath = `${env.GITHUB_USER}/${env.GITHUB_REPO}`;
  const token = env.GITHUB_PAT;

  if (!token) {
    return Response.json({ error: 'No GitHub token configured' }, { status: 500 });
  }

  try {
    const files = await getRecentContentFiles(repoPath, token);
    console.log('Found recent files:', files);
    const results = [];

    for (const file of files) {
      const result = await processFile(file, repoPath, token, siteUrl);
      if (result) results.push(result);
    }

    return Response.json({ processed: results.length, results });
  } catch (error) {
    console.error('Post-deploy error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function getRecentContentFiles(repoPath, token) {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const response = await fetch(
    `https://api.github.com/repos/${repoPath}/commits?since=${since}&path=content`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CF-Workers-michaelbishop',
      },
    },
  );

  if (!response.ok) return [];

  const commits = await response.json();
  const files = new Set();

  for (const commit of commits.slice(0, 5)) {
    const detailRes = await fetch(commit.url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CF-Workers-michaelbishop',
      },
    });

    if (detailRes.ok) {
      const detail = await detailRes.json();
      for (const file of detail.files || []) {
        if (
          file.filename.startsWith('content/') &&
          file.filename.endsWith('.md') &&
          file.status !== 'removed'
        ) {
          files.add(file.filename);
        }
      }
    }
  }

  return Array.from(files);
}

function decodeBase64(str) {
  return new TextDecoder().decode(
    Uint8Array.from(atob(str), c => c.charCodeAt(0)),
  );
}

function encodeBase64(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}

async function processFile(filePath, repoPath, token, siteUrl) {
  const response = await fetch(
    `https://api.github.com/repos/${repoPath}/contents/${filePath}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CF-Workers-michaelbishop',
      },
    },
  );

  if (!response.ok) return null;

  const fileData = await response.json();
  const content = decodeBase64(fileData.content);

  // Parse frontmatter
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const frontmatter = match[1];
  const body = match[2];

  // Skip if already syndicated
  if (frontmatter.includes('syndication:')) {
    return { file: filePath, status: 'skipped', reason: 'already syndicated' };
  }

  // Check for syndicate-to targets
  const singleValueMatch = frontmatter.match(/mp-syndicate-to:\s*['"]?([^\n'"]+)['"]?/);
  const arrayMatch = frontmatter.match(/mp-syndicate-to:\s*\n((?:\s+-\s+.+\n?)*)/);

  if (!singleValueMatch && !arrayMatch) {
    return { file: filePath, status: 'skipped', reason: 'no syndication targets' };
  }

  const postUrl = getPostUrl(filePath, siteUrl);
  if (!postUrl) return null;

  const syndicationUrls = [];
  let targets = [];

  if (singleValueMatch && !arrayMatch) {
    targets = [singleValueMatch[1].trim()];
  } else if (arrayMatch) {
    targets = arrayMatch[1].match(/-\s+(.+)/g)?.map(t =>
      t.replace(/^-\s+/, '').replace(/^['"]|['"]$/g, '').trim(),
    ) || [];
  }

  for (const targetUrl of targets) {
    const syndicationUrl = await sendWebmention(postUrl, targetUrl);
    if (syndicationUrl) {
      syndicationUrls.push(syndicationUrl);
    }
  }

  if (syndicationUrls.length === 0) {
    return { file: filePath, status: 'no-syndication-urls' };
  }

  // Update file with syndication URLs
  const syndicationYaml = syndicationUrls.length === 1
    ? `syndication: "${syndicationUrls[0]}"`
    : `syndication:\n${syndicationUrls.map(u => `  - '${u}'`).join('\n')}`;

  const newFrontmatter = frontmatter + '\n' + syndicationYaml;
  const newContent = `---\n${newFrontmatter}\n---\n${body}`;

  await updateFile(filePath, newContent, fileData.sha, repoPath, token);

  return { file: filePath, status: 'syndicated', urls: syndicationUrls };
}

function getPostUrl(filePath, siteUrl) {
  const match = filePath.match(/content\/(\w+)\/(.+)\.md$/);
  if (!match) return null;

  const dir = match[1];
  const slug = match[2];

  const dirToPath = {
    notes: 'note',
    articles: 'article',
    replies: 'replies',
  };

  const pathSegment = dirToPath[dir];
  if (!pathSegment) return null;

  return `${siteUrl}/${pathSegment}/${slug}.html`;
}

async function sendWebmention(source, target) {
  let endpoint;
  if (target.includes('fed.brid.gy')) {
    endpoint = 'https://fed.brid.gy/webmention';
  } else if (target.includes('brid.gy/publish/bluesky')) {
    endpoint = 'https://brid.gy/publish/webmention';
  } else {
    console.log('Unknown syndication target:', target);
    return null;
  }

  console.log(`Sending webmention: source=${source}, target=${target}, endpoint=${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ source, target }),
    });

    console.log(`Webmention response: status=${response.status}`);

    const location = response.headers.get('location');
    if (location && !location.includes('brid.gy')) {
      return location;
    }

    if (response.status === 201) {
      try {
        const data = await response.json();
        if (data.url) return data.url;
      } catch {
        // Response not JSON
      }
    }

    return null;
  } catch (error) {
    console.error(`Webmention failed for ${source}:`, error.message);
    return null;
  }
}

async function updateFile(filePath, content, sha, repoPath, token) {
  const response = await fetch(
    `https://api.github.com/repos/${repoPath}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'CF-Workers-michaelbishop',
      },
      body: JSON.stringify({
        message: `Add syndication URLs to ${filePath.split('/').pop()}`,
        content: encodeBase64(content),
        sha,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update ${filePath}: ${error}`);
  }
}
