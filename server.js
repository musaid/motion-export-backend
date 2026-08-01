import compression from 'compression';
import express from 'express';
import morgan from 'morgan';

// Short-circuit the type-checking of the built output.
const BUILD_PATH = './build/server/index.js';
const DEVELOPMENT = process.env.NODE_ENV === 'development';
const PORT = Number.parseInt(process.env.PORT || '3000');

const app = express();

app.use(compression());
app.disable('x-powered-by');

// NOTE: /encoder no longer exists. It served the WebCodecs encoder page for
// the plugin's bridge, which is permanently dead — the Figma plugin UI iframe
// is an insecure context (opaque origin; secure-context status inherits from
// ancestors), so VideoEncoder can never exist in it or in anything it frames,
// and popups inherit the sandbox so window.open cannot escape either. Current
// plugin versions encode in-plugin and never request this URL. Old v10.0.0
// clients that still do get a 404 and fall back after their handshake timeout.
// Do not resurrect this route; see the plugin repo's
// src/lib/media/native-video-export.ts for the replacement.

if (DEVELOPMENT) {
  console.log('Starting development server');
  const viteDevServer = await import('vite').then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    }),
  );
  app.use(viteDevServer.middlewares);
  app.use(async (req, res, next) => {
    try {
      const source = await viteDevServer.ssrLoadModule('./server/app.ts');
      return await source.app(req, res, next);
    } catch (error) {
      if (typeof error === 'object' && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
} else {
  console.log('Starting production server');
  app.use(
    '/assets',
    express.static('build/client/assets', { immutable: true, maxAge: '1y' }),
  );
  app.use(morgan('tiny'));
  app.use(express.static('build/client', { maxAge: '1h' }));
  app.use(await import(BUILD_PATH).then((mod) => mod.app));
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
