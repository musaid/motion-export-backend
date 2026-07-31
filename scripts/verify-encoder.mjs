/**
 * Post-deploy smoke check for the WebCodecs encoder page.
 *
 * The encoder bridge fails SOFT by design — if /encoder is unreachable the
 * plugin silently falls back to MediaRecorder. That makes an outage invisible
 * from the outside, so it needs an explicit check. Run after every deploy:
 *
 *   pnpm run verify:encoder                       # checks production
 *   BASE_URL=http://localhost:3000 pnpm run verify:encoder
 *
 * Exits non-zero on failure so CI can gate on it.
 */
const BASE_URL = process.env.BASE_URL || 'https://motionexport.com';
const url = `${BASE_URL.replace(/\/$/, '')}/encoder`;

const fail = (msg) => {
  console.error(`[verify-encoder] FAIL — ${msg}`);
  process.exit(1);
};

let res;
try {
  res = await fetch(url);
} catch (err) {
  fail(`could not reach ${url}: ${err.message}`);
}

if (res.status !== 200) {
  fail(
    `${url} returned ${res.status} (expected 200).\n` +
      '  The WebCodecs path is DOWN and every video export is falling back to\n' +
      '  MediaRecorder. Run `pnpm run sync:encoder`, rebuild, and redeploy.',
  );
}

const csp = res.headers.get('content-security-policy') || '';
if (!csp.includes('frame-ancestors')) {
  fail(`${url} is missing the frame-ancestors CSP header (got: "${csp}")`);
}
for (const origin of ['https://www.figma.com', 'https://figma.com']) {
  if (!csp.includes(origin)) {
    fail(`frame-ancestors does not allow ${origin} (got: "${csp}")`);
  }
}

const html = await res.text();
if (!html.includes('encoder.js')) {
  fail('/encoder did not return the encoder document (no encoder.js reference)');
}

const jsRes = await fetch(`${url}/encoder.js`).catch((err) =>
  fail(`could not fetch encoder.js: ${err.message}`),
);
if (jsRes.status !== 200) {
  fail(`${url}/encoder.js returned ${jsRes.status} (expected 200)`);
}

console.log(`[verify-encoder] OK — ${url} serving (${res.status}), CSP set, encoder.js reachable`);
