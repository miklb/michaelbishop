import { handleSubmit } from './handlers/submit.js';
import { handleUpload } from './handlers/upload.js';
import { handlePostDeploy } from './handlers/post-deploy.js';
import { handleWebmentions } from './handlers/webmentions.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight for admin UI
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': url.origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // API routes (only reached for paths matching run_worker_first: ["/api/*"])
    if (url.pathname === '/api/submit' && request.method === 'POST') {
      return handleSubmit(request, env, ctx);
    }
    if (url.pathname === '/api/upload' && request.method === 'POST') {
      return handleUpload(request, env, ctx);
    }
    if (url.pathname === '/api/post-deploy' && request.method === 'POST') {
      return handlePostDeploy(request, env, ctx);
    }

    // No matching API route
    return new Response('Not found', { status: 404 });
  },

  // Cron trigger for webmention discovery
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleWebmentions(env));
  },
};
