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
  // redirect:'manual' is essential. The plugin requests exactly this URL and
  // frames the response — it does NOT follow redirects the way a browser
  // address bar does. Following them here would report the eventual 200 and
  // hide a 301 whose headers break framing (which is exactly what shipped:
  // express.static's directory redirect returned a CSP with no frame-ancestors,
  // Figma refused the frame, and the iframe died before reaching the page).
  res = await fetch(url, { redirect: 'manual' });
} catch (err) {
  fail(`could not reach ${url}: ${err.message}`);
}

if (res.status >= 300 && res.status < 400) {
  fail(
    `${url} returned ${res.status} → ${res.headers.get('location')}\n` +
      '  The plugin frames this exact URL and does not follow redirects; the\n' +
      '  redirect response also drops frame-ancestors, so Figma blocks the\n' +
      '  frame. Serve /encoder directly (express.static needs redirect:false).',
  );
}

if (res.status !== 200) {
  fail(
    `${url} returned ${res.status} (expected 200).\n` +
      '  The WebCodecs path is DOWN and every video export is falling back to\n' +
      '  MediaRecorder. Run `pnpm run sync:encoder`, rebuild, and redeploy.',
  );
}

const csp = res.headers.get('content-security-policy') || '';
// There must be NO frame-ancestors directive and NO X-Frame-Options. The plugin
// UI is a sandboxed OPAQUE-ORIGIN iframe between figma.com and this page;
// frame-ancestors checks every ancestor and an opaque origin matches no source
// expression — not even '*'. Any value blocks the encoder outright and silently
// drops every export to MediaRecorder. Assert the absence so a well-meaning
// "security hardening" pass can't reintroduce a total outage.
if (/frame-ancestors/i.test(csp)) {
  fail(
    `${url} sends a frame-ancestors directive ("${csp}").\n` +
      '  It must send NONE: the plugin UI iframe has an opaque (null) origin,\n' +
      "  which matches no source expression — including '*'. Any value here\n" +
      '  blocks the encoder and forces the MediaRecorder fallback.',
  );
}
const xfo = res.headers.get('x-frame-options');
if (xfo) {
  fail(`${url} sends X-Frame-Options: ${xfo} — it must send none (same reason).`);
}

const html = await res.text();

// The bundle must be EMBEDDED, not referenced. An external `type="module"`
// script is fetched with CORS semantics, so from the null-origin plugin iframe
// it is rejected unless the server sends Access-Control-Allow-Origin — and the
// rejection is silent (onload fires, the module never runs, the handshake times
// out). Verified in-browser. Assert the inline form so a future "let's split the
// bundle out again" refactor fails here instead of in production.
if (/<script[^>]*\bsrc=/i.test(html)) {
  fail(
    '/encoder references an external script.\n' +
      '  The bundle must be inlined: a module fetched from the null-origin\n' +
      '  plugin iframe is blocked by CORS, silently, and the encoder never\n' +
      '  starts. Rebuild with `npm run build:encoder` in the plugin repo.',
  );
}
if (!/postMessage/.test(html)) {
  fail('/encoder does not contain the embedded encoder bundle (no postMessage found)');
}

const kb = (html.length / 1024).toFixed(0);
console.log(
  `[verify-encoder] OK — ${url} serving (${res.status}), no frame-ancestors, bundle embedded (${kb}KB)`,
);
