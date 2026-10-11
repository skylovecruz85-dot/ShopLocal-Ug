import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createBoostOrdersHandler } from './api/boost-orders';
import marketplaceHandler from './api/marketplace';
import authHandler from './api/auth/[...all]';
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
      const env = loadEnv(server.config.mode, process.cwd(), '');
      const handler = createBoostOrdersHandler(env);
      server.middlewares.use('/api/boost-orders', (request, response, next) => {
        void handler(request, response).catch(next);
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), localBoostOrdersApi(), {
      name: 'shoplocal-auth-marketplace-api',
      configureServer(server) {
        server.middlewares.use('/api/auth', (request, response, next) => {
          void authHandler(request, response).catch(next);
        });
        server.middlewares.use('/api/marketplace', (request, response, next) => {
          void parseJsonBody(request).then(() => marketplaceHandler(request, response)).catch(next);
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
