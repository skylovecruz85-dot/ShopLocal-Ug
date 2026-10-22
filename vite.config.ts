import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

function parseJsonBody(request: import('node:http').IncomingMessage): Promise<void> {
  const requestWithBody = request as import('node:http').IncomingMessage & { body?: unknown; readableEnded?: boolean };
  return new Promise((resolve, reject) => {
    if (request.method === 'GET' || request.method === 'HEAD' || requestWithBody.body || request.readableEnded) return resolve();
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
        const handlers = Promise.all([import('./api/health.ts'), import('./api/auth/[...all].ts'), import('./api/marketplace.ts'), import('./api/payments/webhook.ts'), import('./api/uploads.ts'), import('./api/payments/pesapal.ts')]);
        server.middlewares.use('/api/health', (request, response, next) => {
          void handlers.then(([health]) => health.default(request, response)).catch(next);
        });
        server.middlewares.use('/api/auth', (request, response, next) => {
          const originalUrl = request.url ?? '/';
          request.url = `/api/auth${originalUrl.startsWith('/') ? originalUrl : `/${originalUrl}`}`;
          void parseJsonBody(request).then(() => handlers).then(([, auth]) => auth.default(request, response)).catch(next);
        });
        server.middlewares.use('/api/marketplace', (request, response, next) => {
          const originalUrl = request.url ?? '/';
          request.url = `/api/marketplace${originalUrl}`;
          void parseJsonBody(request).then(() => handlers).then(([, , marketplace]) => marketplace.default(request, response)).catch(next);
        });
        server.middlewares.use('/api/payments/webhook', (request, response, next) => {
          void parseJsonBody(request).then(() => handlers).then(([, , , webhook]) => webhook.default(request, response)).catch(next);
        });
        server.middlewares.use('/api/payments/pesapal/ipn', (request, response, next) => {
          void handlers.then(([, , , , , pesapal]) => pesapal.pesapalIpn(request, response)).catch(next);
        });
        server.middlewares.use('/api/payments/pesapal', (request, response, next) => {
          const originalUrl = request.url ?? '/';
          request.url = `/api/payments/pesapal${originalUrl}`;
          void parseJsonBody(request).then(() => handlers).then(([, , , , , pesapal]) => pesapal.default(request, response)).catch(next);
        });
        server.middlewares.use('/api/uploads', (request, response, next) => {
          void handlers.then(([, , , , upload]) => upload.default(request, response)).catch(next);
        });
      },
    }],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
