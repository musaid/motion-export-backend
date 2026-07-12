import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import { existsSync } from 'node:fs';

// Short-circuit the type-checking of the built output.
const BUILD_PATH = './build/server/index.js';
const DEVELOPMENT = process.env.NODE_ENV === 'development';
const PORT = Number.parseInt(process.env.PORT || '3000');

const app = express();

app.use(compression());
app.disable('x-powered-by');

// WebCodecs encoder page — a self-contained HTML+JS bundle (built in the plugin
// repo via `npm run build:encoder`, copied to public/encoder/) that the plugin
// loads in a nested iframe to encode alpha-preserving, frame-accurate video.
// Must be framable BY Figma but nowhere else, so we set frame-ancestors here
// rather than a global X-Frame-Options: DENY. See WEBCODECS_BRIDGE_PLAN.md.
app.use(
  '/encoder',
  (req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "frame-ancestors https://www.figma.com https://figma.com",
    );
    next();
  },
  express.static('public/encoder', { maxAge: '1h' }),
);
app.get('/encoder', (req, res) => {
  const file = process.cwd() + '/public/encoder/encoder.html';
  // 404 (not 500) when the page isn't deployed yet, so deploy-order skew doesn't
  // spam error logs — the plugin falls back to MediaRecorder either way.
  if (!existsSync(file)) return res.status(404).end();
  res.sendFile(file);
});

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
