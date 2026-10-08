import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createBoostOrdersHandler } from './api/boost-orders';
import { defineConfig, loadEnv, type Plugin } from 'vite';

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
    plugins: [react(), tailwindcss(), localBoostOrdersApi()],
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
