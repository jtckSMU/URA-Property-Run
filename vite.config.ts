import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import 'dotenv/config';

function serverlessApiPlugin(): Plugin {
  return {
    name: 'serverless-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) {
          return next();
        }

        try {
          const urlObj = new URL(req.url, 'http://localhost');
          const pathname = urlObj.pathname;

          let handlerModule;
          if (pathname === '/api/health') {
            handlerModule = await import('./api/health');
          } else if (pathname === '/api/token') {
            handlerModule = await import('./api/token');
          } else if (pathname === '/api/properties/ping' || pathname === '/api/ping') {
            handlerModule = await import('./api/properties/ping');
          } else if (pathname === '/api/properties/transactions' || pathname === '/api/ura') {
            handlerModule = await import('./api/ura');
          } else {
            handlerModule = await import('./api/index');
          }

          // Attach query params to req
          const queryParams: Record<string, string> = {};
          urlObj.searchParams.forEach((val, key) => {
            queryParams[key] = val;
          });
          (req as any).query = queryParams;

          // Helper methods on res
          if (!(res as any).json) {
            (res as any).json = (data: any) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            };
          }

          if (!(res as any).status) {
            (res as any).status = (code: number) => {
              res.statusCode = code;
              return res;
            };
          }

          const handler = handlerModule.default || handlerModule;
          return await handler(req, res);
        } catch (err: unknown) {
          console.error('[Serverless API Error]:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              status: 'error',
              message: err instanceof Error ? err.message : 'Serverless handler execution failed',
            })
          );
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serverlessApiPlugin()],
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
