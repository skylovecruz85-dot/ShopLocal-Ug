import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

function parseJsonBody(request: import('node:http').IncomingMessage): Promise<void> {
  const requestWithBody = request as import('node:http').IncomingMessage & { body?: unknown };
  return new Promise((resolve, reject) => {
    if (request.method === 'GET' || request.method === 'HEAD' || requestWithBody.body) return resolve();
    let raw = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => { raw += chunk; });
    request.on('end', () => {
      try { requestWithBody.body = raw ? JSON.parse(raw) : {}; resolve(); } catch { requestWithBody.body = {}; resolve(); }
    });
    request.on('error', reject);
  });
}

function localBoostOrdersApi(): Plugin {
  return {
    name: 'shoplocal-boost-orders-api',
    configureServer(server) {
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), localBoostOrdersApi(), {
      name: 'shoplocal-auth-marketplace-api',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          response.setHeader('X-Content-Type-Options', 'nosniff');
          response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
          response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
          next();
        });
        const env = loadEnv(server.config.mode, process.cwd(), '');
        Object.assign(process.env, env);
        const handlers = Promise.all([import('./api/health'), import('./api/auth/[...all]'), import('./api/marketplace'), import('./api/payments/webhook'), import('./api/uploads')]);
        server.middlewares.use('/api/health', (request, response, next) => {
          void handlers.then(([health]) => health.default(request, response)).catch(next);
        });
        server.middlewares.use('/api/auth', (request, response, next) => {
          void handlers.then(([, auth]) => auth.default(request, response)).catch(next);
        });
        server.middlewares.use('/api/marketplace', (request, response, next) => {
          const originalUrl = request.url ?? '/';
          request.url = `/api/marketplace${originalUrl}`;
          void parseJsonBody(request).then(() => handlers).then(([, , marketplace]) => marketplace.default(request, response)).catch(next);
        });
        server.middlewares.use('/api/payments/webhook', (request, response, next) => {
          void parseJsonBody(request).then(() => handlers).then(([, , , webhook]) => webhook.default(request, response)).catch(next);
        });
        server.middlewares.use('/api/uploads', (request, response, next) => {
          void handlers.then(([, , , , upload]) => upload.default(request, response)).catch(next);
        });
      },
    }],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
