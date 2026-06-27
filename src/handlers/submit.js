// Post creation via GitHub API
// Supports note, reply, and article post types with correct frontmatter

// --- HTML Sanitizer (from existing submit.js) ---
const ALLOWED_TAGS = {
  'a': ['href', 'class'],
  'span': ['class'],
  'strong': [],
  'b': [],
  'em': [],
  'i': [],
  'br': [],
  'ol': [],
  'ul': [],
  'li': [],
  'code': [],
  'pre': [],
  'blockquote': [],
  'img': ['src', 'alt'],
  'p': [],
};

const ALLOWED_CLASSES = [
  'u-bridgy-fed',
  'u-bridgy',
];

function sanitizeHtml(html) {
  if (!html) return '';

  let clean = html;
  let prev = '';
  while (clean !== prev) {
    prev = clean;
    clean = clean
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  }

  let result = '';
  let i = 0;

  while (i < clean.length) {
    if (clean[i] === '<') {
      const tagMatch = clean.slice(i).match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/);
      if (tagMatch) {
        const fullTag = tagMatch[0];
        const tagName = tagMatch[1].toLowerCase();
        const isClosing = fullTag.startsWith('</');

        if (Object.prototype.hasOwnProperty.call(ALLOWED_TAGS, tagName)) {
          if (isClosing) {
            result += `</${tagName}>`;
          } else if (tagName === 'br') {
            result += '<br>';
          } else {
            const allowedAttrs = ALLOWED_TAGS[tagName];
            let newTag = `<${tagName}`;

            for (const attr of allowedAttrs) {
              const attrMatch = fullTag.match(new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, 'i'));
              if (attrMatch) {
                if (attr === 'class') {
                  const classes = attrMatch[1].split(/\s+/)
                    .filter(c => ALLOWED_CLASSES.includes(c))
                    .join(' ');
                  if (classes) newTag += ` class="${classes}"`;
                } else if (attr === 'href') {
                  const href = attrMatch[1];
                  if (/^https?:\/\//.test(href)) {
                    newTag += ` href="${href}"`;
                  }
                } else if (attr === 'src') {
                  const src = attrMatch[1];
                  if (/^https?:\/\//.test(src)) {
                    newTag += ` src="${src}"`;
                  }
                } else if (attr === 'alt') {
                  newTag += ` alt="${attrMatch[1].replace(/"/g, '&quot;')}"`;
                }
              }
            }

            newTag += '>';
            result += newTag;
          }
          i += fullTag.length;
          continue;
        } else {
          i += fullTag.length;
          continue;
        }
      }
      result += '&lt;';
      i++;
    } else if (clean[i] === '>') {
      result += '&gt;';
      i++;
    } else {
      result += clean[i];
      i++;
    }
  }

  return result;
}

function sanitizeTitle(title) {
  if (!title) return '';
  return title
    .replace(/<[^>]*>/g, '')
    .replace(/"/g, '\\"')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// --- Frontmatter Generators ---

function buildNoteFrontmatter(data) {
  const lines = ['---'];
  lines.push('type: entry');

  if (data.syndicateTo && data.syndicateTo.length > 0) {
    lines.push('mp-syndicate-to:');
    for (const target of data.syndicateTo) {
      lines.push(`  - '${target}'`);
    }
  }

  lines.push(`date: '${data.date}'`);
  if (data.tags && data.tags.length > 0) {
    lines.push('tags:');
    for (const tag of data.tags) {
      lines.push(`  - ${tag}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

function buildReplyFrontmatter(data) {
  const lines = ['---'];
  lines.push('type: entry');
  lines.push(`in-reply-to: '${data.inReplyTo}'`);

  if (data.syndicateTo && data.syndicateTo.length > 0) {
    if (data.syndicateTo.length === 1) {
      lines.push(`mp-syndicate-to: '${data.syndicateTo[0]}'`);
    } else {
      lines.push('mp-syndicate-to:');
      for (const target of data.syndicateTo) {
        lines.push(`  - '${target}'`);
      }
    }
  }

  lines.push(`date: '${data.date}'`);
  lines.push('---');
  return lines.join('\n');
}

function buildArticleFrontmatter(data) {
  const lines = ['---'];
  lines.push(`title: "${data.title}"`);
  lines.push(`permalink: "/article/${data.slug}.html"`);
  lines.push('date: git Created');

  const tags = ['article', ...(data.tags || [])];
  lines.push('tags:');
  for (const tag of tags) {
    lines.push(`  - ${tag}`);
  }

  const desc = data.body.replace(/<[^>]*>/g, '').slice(0, 150).trim();
  lines.push('meta:');
  lines.push(`  title: ${data.title}`);
  lines.push(`  desc: "${desc}"`);
  lines.push('  url: "{{ page.url }}"');
  lines.push('---');
  return lines.join('\n');
}

// --- Main Handler ---

export async function handleSubmit(request, env, ctx) {
  try {
    const data = await request.json();
    const { type, body } = data;

    if (!type || !body) {
      return Response.json({ error: 'Missing required fields: type, body' }, { status: 400 });
    }

    const validTypes = ['note', 'reply', 'article'];
    if (!validTypes.includes(type)) {
      return Response.json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 });
    }

    if (type === 'reply' && !data['in-reply-to']) {
      return Response.json({ error: 'Reply requires in-reply-to URL' }, { status: 400 });
    }

    if (type === 'article' && !data.title) {
      return Response.json({ error: 'Article requires title' }, { status: 400 });
    }

    const now = new Date();
    const date = now.toISOString();
    const timestamp = Date.now();

    const syndicateTo = data['mp-syndicate-to'] || [];
    const tags = data.tags || [];
    const cleanBody = body; // Body is markdown, minimal sanitization needed

    let frontmatter;
    let filePath;
    let fileSlug;

    switch (type) {
      case 'note': {
        fileSlug = String(timestamp);
        filePath = `content/notes/${fileSlug}.md`;
        frontmatter = buildNoteFrontmatter({ date, syndicateTo, tags });
        break;
      }
      case 'reply': {
        fileSlug = String(timestamp);
        filePath = `content/replies/${fileSlug}.md`;
        frontmatter = buildReplyFrontmatter({
          date,
          inReplyTo: data['in-reply-to'],
          syndicateTo,
        });
        break;
      }
      case 'article': {
        const cleanTitle = sanitizeTitle(data.title);
        fileSlug = slugify(cleanTitle);
        filePath = `content/articles/${fileSlug}.md`;
        frontmatter = buildArticleFrontmatter({
          title: cleanTitle,
          slug: fileSlug,
          body: cleanBody,
          tags,
        });
        break;
      }
    }

    // Assemble photo markdown if provided
    let photoMarkdown = '';
    if (data.photos && data.photos.length > 0) {
      photoMarkdown = data.photos.map(url => `![](${url})`).join('\n') + '\n\n';
    }

    const content = `${frontmatter}\n${photoMarkdown}${cleanBody}\n`;

    // GitHub API: create file
    const owner = env.GITHUB_USER;
    const repo = env.GITHUB_REPO;
    const token = env.GITHUB_PAT;

    if (!token) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    // Check if file exists (for updates)
    let sha = null;
    const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=main`;
    const existingFile = await fetch(getFileUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CF-Workers-michaelbishop',
      },
    });

    if (existingFile.ok) {
      const fileData = await existingFile.json();
      sha = fileData.sha;
    }

    const payload = {
      message: type === 'article' ? `Add article: ${data.title}` : `Add ${type}: ${fileSlug}`,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: 'main',
    };
    if (sha) payload.sha = sha;

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'CF-Workers-michaelbishop',
        },
        body: JSON.stringify(payload),
      });
    } catch (fetchErr) {
      console.error('GitHub API fetch failed:', fetchErr);
      return Response.json({
        error: 'Unable to connect to GitHub. Please try again.',
      }, { status: 502 });
    }

    if (!response.ok) {
      let errorDetails = 'Unknown error';
      try {
        const error = await response.json();
        errorDetails = error.message || JSON.stringify(error);
      } catch {
        errorDetails = await response.text();
      }

      const userMessage = response.status === 401
        ? 'GitHub authentication failed.'
        : response.status === 404
        ? 'Repository not found.'
        : response.status === 422
        ? 'Invalid content or file conflict.'
        : 'Failed to save to GitHub.';

      return Response.json({ error: userMessage, details: errorDetails }, { status: 500 });
    }

    const result = await response.json();

    // Compute expected post URL
    const dirToPath = { notes: 'note', replies: 'replies', articles: 'article' };
    const pathSegment = dirToPath[type === 'note' ? 'notes' : type === 'reply' ? 'replies' : 'articles'];
    const postUrl = `${env.ME}/${pathSegment}/${fileSlug}.html`;

    return Response.json({
      success: true,
      slug: fileSlug,
      commit: result.commit.sha,
      url: postUrl,
      file: filePath,
    });
  } catch (err) {
    console.error('Submit error:', err);
    return Response.json({
      error: 'An unexpected error occurred.',
      details: err.message,
    }, { status: 500 });
  }
}
