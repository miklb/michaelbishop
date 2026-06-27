// Allowlist-based HTML sanitizer
// Add tags here to expand allowed formatting
const ALLOWED_TAGS = {
  'span': ['class'],      // For color classes
  'strong': [],           // Bold
  'b': [],                // Bold (alias)
  'em': [],               // Italic
  'i': [],                // Italic (alias)
  'br': [],               // Line breaks
  'ol': [],               // Ordered lists
  'li': [],               // List items
};

const ALLOWED_CLASSES = [
  'text-red',
  'text-blue', 
  'text-green',
  'text-orange',
  'aside-note',
];

function sanitizeHtml(html) {
  if (!html) return '';
  
  // Decode HTML entities once to normalize input for parsing.
  // Apply iteratively to catch double-encoding attempts.
  let clean = html;
  let prev = '';
  while (clean !== prev) {
    prev = clean;
    clean = clean
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  }
  
  // Build regex for allowed tags
  const tagNames = Object.keys(ALLOWED_TAGS).join('|');
  
  // Process the HTML character by character, keeping only allowed elements
  let result = '';
  let i = 0;
  
  while (i < clean.length) {
    if (clean[i] === '<') {
      // Found a tag - check if it's allowed
      const tagMatch = clean.slice(i).match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/);
      
      if (tagMatch) {
        const fullTag = tagMatch[0];
        const tagName = tagMatch[1].toLowerCase();
        const isClosing = fullTag.startsWith('</');
        
        if (ALLOWED_TAGS.hasOwnProperty(tagName)) {
          if (isClosing) {
            // Closing tags are simple
            result += `</${tagName}>`;
          } else if (tagName === 'br') {
            // Self-closing br
            result += '<br>';
          } else {
            // Opening tag - filter attributes
            const allowedAttrs = ALLOWED_TAGS[tagName];
            let newTag = `<${tagName}`;
            
            // Extract and filter attributes
            const attrMatch = fullTag.match(/class\s*=\s*["']([^"']+)["']/i);
            if (attrMatch && allowedAttrs.includes('class')) {
              // Filter class values to only allowed ones
              const classes = attrMatch[1].split(/\s+/)
                .filter(c => ALLOWED_CLASSES.includes(c))
                .join(' ');
              if (classes) {
                newTag += ` class="${classes}"`;
              }
            }
            
            newTag += '>';
            result += newTag;
          }
          i += fullTag.length;
          continue;
        } else {
          // Not allowed tag - skip it entirely
          i += fullTag.length;
          continue;
        }
      }
      // Malformed tag or < character - escape it
      result += '&lt;';
      i++;
    } else if (clean[i] === '>') {
      // Stray > - escape it
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
  // Strip all HTML, escape quotes for YAML
  return title
    .replace(/<[^>]*>/g, '')
    .replace(/"/g, '\\"')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

function sanitizeSlug(slug) {
  if (!slug) return null;
  // Only alphanumeric, hyphens allowed - no path traversal
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { title, date, body, slug } = await request.json();

    if (!title || !date || !body) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Sanitize all inputs
    const cleanTitle = sanitizeTitle(title);
    const cleanBody = sanitizeHtml(body);
    const cleanSlug = sanitizeSlug(slug);
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return Response.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Generate slug from date and title if new post
    const fileSlug = cleanSlug || `${date}-${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`;
    const filePath = `src/agendas/${fileSlug}.md`;

    // Build markdown content with frontmatter
    const content = `---
title: "${cleanTitle}"
date: ${date}
---

${cleanBody}
`;

    // GitHub API setup
    const owner = 'miklb';
    const repo = 'poynor-agenda-review';
    const branch = 'main';
    const token = env.GITHUB_PAT;

    if (!token) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    // Check if file exists (for updates, we need the SHA)
    let sha = null;
    const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    
    const existingFile = await fetch(getFileUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Cloudflare-Pages-Function'
      }
    });

    if (existingFile.ok) {
      const fileData = await existingFile.json();
      sha = fileData.sha;
    }

    // Create or update file
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const commitMessage = sha ? `Update: ${title}` : `Add: ${title}`;

    const payload = {
      message: commitMessage,
      content: btoa(unescape(encodeURIComponent(content))), // Base64 encode
      branch: branch
    };

    if (sha) {
      payload.sha = sha;
    }

    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Cloudflare-Pages-Function'
        },
        body: JSON.stringify(payload)
      });
    } catch (fetchErr) {
      console.error('GitHub API fetch failed:', fetchErr);
      return Response.json({ 
        error: 'Unable to connect to GitHub. Please try again.',
        details: fetchErr.message 
      }, { status: 502 });
    }

    if (!response.ok) {
      let errorDetails = 'Unknown error';
      try {
        const error = await response.json();
        errorDetails = error.message || JSON.stringify(error);
        console.error('GitHub API error:', response.status, error);
      } catch (parseErr) {
        errorDetails = await response.text();
        console.error('GitHub API error (non-JSON):', response.status, errorDetails);
      }
      
      const userMessage = response.status === 401 
        ? 'GitHub authentication failed. Check the API token.'
        : response.status === 404
        ? 'Repository not found. Check repo configuration.'
        : response.status === 422
        ? 'Invalid content. The file may have conflicts.'
        : 'Failed to save to GitHub. Please try again.';
        
      return Response.json({ 
        error: userMessage,
        details: errorDetails,
        status: response.status
      }, { status: 500 });
    }

    const result = await response.json();

    return Response.json({
      success: true,
      slug: fileSlug,
      commit: result.commit.sha
    });

  } catch (err) {
    console.error('Submit error:', err.name, err.message, err.stack);
    
    // Provide user-friendly error messages
    let userMessage = 'An unexpected error occurred. Please try again.';
    
    if (err instanceof SyntaxError) {
      userMessage = 'Invalid request data. Please refresh and try again.';
    } else if (err.message?.includes('fetch')) {
      userMessage = 'Network error. Please check your connection.';
    }
    
    return Response.json({ 
      error: userMessage,
      details: err.message 
    }, { status: 500 });
  }
}
