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
// repo via `npm run build:encoder`, synced into public/encoder/ by
// `pnpm run sync:encoder`) that the plugin loads in a nested iframe to encode
// alpha-preserving, frame-accurate video.
// It must stay framable by the plugin's null-origin iframe, which means no
// frame-ancestors and no X-Frame-Options on this route (see below).
// See WEBCODECS_BRIDGE_PLAN.md.
//
// Served from the BUILD OUTPUT, not from public/. Vite copies public/ into
// build/client/ at build time, and the Docker runner stage only copies build/ —
// so a path into public/ resolves in dev but 404s in production. That exact
// dev/prod split silently disabled the WebCodecs path in production for three
// weeks (every export fell back to MediaRecorder). Keep this pointed at
// build/client and verify with `pnpm run verify:encoder` after deploy.
const ENCODER_DIR = process.cwd() + '/build/client/encoder';
app.use(
  '/encoder',
  (req, res, next) => {
    // Deliberately NO frame-ancestors directive, and it must not be added back.
    //
    // The chain is figma.com → plugin UI iframe → this page, and the plugin UI
    // is a sandboxed OPAQUE-ORIGIN frame. frame-ancestors checks every ancestor
    // and an opaque origin serializes to "null", which matches no source
    // expression — not a host-source, and not even '*'. Verified in-browser
    // with a null-origin parent: no directive = loads, '*' = blocked,
    // figma.com = blocked. Any value here disables the encoder outright and
    // every export silently falls back to MediaRecorder.
    //
    // The framing gate is therefore the postMessage origin check in the encoder
    // page. It has no cookies, storage, or credentials and connect-src 'none',
    // so the residual exposure is compute, not data.
    //
    // X-Frame-Options is NOT set here for the same reason: it has no syntax for
    // an opaque-origin parent either, and would re-break framing.
    next();
  },
  // redirect:false is load-bearing. express.static treats a bare directory path
  // as a redirect to the trailing-slash form, and that 301 carried the encoder
  // HTML's own CSP, so the iframe collapsed to chrome-error://chromewebdata/
  // and every later request from it was blocked as a cross-origin load.
  // Serving /encoder directly from the route below avoids the hop entirely.
  express.static(ENCODER_DIR, { maxAge: '1h', redirect: false }),
);
app.get('/encoder', (req, res) => {
  const file = ENCODER_DIR + '/encoder.html';
  // 404 (not 500) when the page isn't deployed yet, so deploy-order skew doesn't
  // spam error logs — the plugin falls back to MediaRecorder either way.
  if (!existsSync(file)) {
    console.error(
      '[encoder] MISSING at %s — WebCodecs export is disabled and all video ' +
        'exports will fall back to MediaRecorder. Run `pnpm run sync:encoder` ' +
        'in the backend repo and redeploy.',
      file,
    );
    return res.status(404).end();
  }
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
