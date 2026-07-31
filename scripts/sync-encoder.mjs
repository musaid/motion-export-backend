/**
 * Sync the WebCodecs encoder page from the plugin repo into public/encoder/.
 *
 * The encoder page is BUILT in the plugin repo (it imports the plugin's own
 * renderer modules, so exported video is pixel-identical to the in-plugin
 * preview) but SERVED from here. That cross-repo hop used to be a manual `cp`
 * documented only in WEBCODECS_BRIDGE_PLAN.md — it was skipped, and production
 * silently fell back to MediaRecorder for three weeks.
 *
 * public/encoder/ is COMMITTED, so the Docker build (whose context is this repo
 * only — the plugin repo is not reachable from it) needs no cross-repo access.
 * This script is therefore a local developer tool, deliberately NOT wired into
 * `pnpm run build`: run it whenever the plugin's encoder changes, then commit
 * the result.
 *
 *   cd ../motion-export-plugin && npm run build:encoder
 *   cd ../motion-export-backend && pnpm run sync:encoder && git add public/encoder
 *
 * Vite copies public/encoder/ into build/client/encoder/ at build time, which is
 * what server.js serves and what the Docker runner stage ships.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(here, '../../motion-export-plugin/dist-encoder');
const outDir = resolve(here, '../public/encoder');
// encoder.html ONLY — the JS bundle is embedded inside it. Do not copy
// encoder.js: an external module is fetched with CORS semantics and is blocked
// from the null-origin plugin iframe, so shipping it would only risk serving a
// stale copy at a path nothing should be requesting.
const FILES = ['encoder.html'];

const missing = FILES.filter((f) => !existsSync(resolve(srcDir, f)));
if (missing.length > 0) {
  console.error(
    `[sync-encoder] Missing ${missing.join(', ')} in ${srcDir}\n` +
      '  Build it first:  cd ../motion-export-plugin && npm run build:encoder',
  );
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
for (const f of FILES) {
  copyFileSync(resolve(srcDir, f), resolve(outDir, f));
}
console.log(`[sync-encoder] Copied ${FILES.join(' + ')} → public/encoder/`);
