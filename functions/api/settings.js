// Settings API - reads and updates _data/settings.json

export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    const token = env.GITHUB_PAT;
    if (!token) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    const owner = 'miklb';
    const repo = 'poynor-agenda-review';
    const filePath = 'src/_data/settings.json';

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=main`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Cloudflare-Pages-Function'
        }
      }
    );

    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    const data = await response.json();
    const content = JSON.parse(atob(data.content));
    
    return Response.json({ settings: content, sha: data.sha });
  } catch (err) {
    console.error('Settings fetch error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { settings, sha } = await request.json();

    if (!settings) {
      return Response.json({ error: 'Missing settings data' }, { status: 400 });
    }

    const token = env.GITHUB_PAT;
    if (!token) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    // Sanitize settings
    const cleanSettings = {
      siteTitle: sanitizeText(settings.siteTitle) || 'Poynor Agenda Review',
      siteDescription: sanitizeText(settings.siteDescription) || '',
      authorName: sanitizeText(settings.authorName) || '',
      social: {
        twitter: sanitizeUrl(settings.social?.twitter),
        linkedin: sanitizeUrl(settings.social?.linkedin),
        email: sanitizeEmail(settings.social?.email)
      }
    };

    const owner = 'miklb';
    const repo = 'poynor-agenda-review';
    const filePath = 'src/_data/settings.json';

    // Get current SHA if not provided
    let currentSha = sha;
    if (!currentSha) {
      const getResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=main`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Cloudflare-Pages-Function'
          }
        }
      );
      if (getResponse.ok) {
        const fileData = await getResponse.json();
        currentSha = fileData.sha;
      }
    }

    const content = JSON.stringify(cleanSettings, null, 2) + '\n';

    const payload = {
      message: 'Update site settings',
      content: btoa(unescape(encodeURIComponent(content))),
      branch: 'main'
    };

    if (currentSha) {
      payload.sha = currentSha;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Cloudflare-Pages-Function'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('GitHub API error:', error);
      return Response.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Settings save error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

function sanitizeText(text) {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').trim().slice(0, 200);
}

function sanitizeUrl(url) {
  if (!url) return '';
  url = url.trim();
  // Only allow http/https URLs
  if (url && !url.match(/^https?:\/\//i)) {
    url = 'https://' + url;
  }
  try {
    new URL(url);
    return url;
  } catch {
    return '';
  }
}

function sanitizeEmail(email) {
  if (!email) return '';
  email = email.trim();
  // Basic email validation
  if (email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return email;
  }
  return '';
}
