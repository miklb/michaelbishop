// Photo upload to R2 bucket

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml',
]);

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function handleUpload(request, env, ctx) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return Response.json({
        error: `Unsupported file type: ${file.type}`,
      }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return Response.json({
        error: `File too large. Max ${MAX_SIZE / 1024 / 1024}MB.`,
      }, { status: 400 });
    }

    // Generate a unique key: YYYY/MM/filename-hash.ext
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Extract extension from filename or content type
    const originalName = file.name || 'upload';
    const ext = originalName.includes('.')
      ? originalName.split('.').pop().toLowerCase()
      : file.type.split('/')[1];

    // Generate short hash from file content for uniqueness
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = new Uint8Array(hashBuffer);
    const hashHex = Array.from(hashArray.slice(0, 6))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Clean the original filename for use in the key
    const baseName = originalName
      .replace(/\.[^/.]+$/, '') // Remove extension
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);

    const key = `${year}/${month}/${baseName}-${hashHex}.${ext}`;

    await env.MEDIA_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

    const mediaUrl = env.MEDIA_URL || 'https://media.michaelbishop.me';
    const url = `${mediaUrl}/${key}`;

    return Response.json({ url, key });
  } catch (err) {
    console.error('Upload error:', err);
    return Response.json({
      error: 'Upload failed.',
      details: err.message,
    }, { status: 500 });
  }
}
