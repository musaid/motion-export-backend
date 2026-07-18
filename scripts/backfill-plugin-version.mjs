/**
 * Backfill the true plugin version onto historical analytics rows.
 *
 * WHY: until v10.0.0 the plugin's config.ts version was a hardcoded literal that
 * was only updated sporadically, so `properties.pluginVersion` is unreliable —
 * e.g. "6.0.0" was stamped on every event from 2026-01-12 to 2026-07-17, spanning
 * the v6/v7/v8/v9 store releases. The event's created_at IS trustworthy, so we
 * resolve the real release from the date (against the Figma store publish dates
 * recorded in motion-export-plugin/RELEASE_NOTES.md) and rewrite pluginVersion in
 * place. After this runs, the column can be trusted and the dashboard can GROUP
 * BY it directly instead of reconstructing at read time.
 *
 * SAFETY:
 *   - Dry-run by default: prints exactly what WOULD change (before→after by era).
 *     No writes without --confirm.
 *   - Wrapped in a single transaction; verifies the updated count.
 *   - Touches ONLY analytics.properties.pluginVersion. Every other property key
 *     is preserved (JSON merge, not overwrite). The licenses table is untouched.
 *   - IDEMPOTENT: the target value is derived purely from created_at, so a second
 *     run finds nothing left to change.
 *   - Uses DATABASE_URL (read-write). Run by the project owner, not the read-only
 *     analytics harness.
 *
 * Usage:
 *   pnpm run backfill:version           # dry run (report only, no writes)
 *   pnpm run backfill:version:confirm   # apply
 */

import postgres from 'postgres';

// Release timeline — Figma store publish date → true semantic version. Newest
// first; an event belongs to the newest release whose date is <= the event date.
// KEEP IN SYNC with motion-export-plugin/RELEASE_NOTES.md on every release.
// (v8.1.0 is folded into the v8.0.0 era; v3/v9 never bumped package.json but v9
// shipped to the store on 2026-06-30 — that boundary is what users actually ran.)
const RELEASES = [
  { version: '10.0.0', from: '2026-07-18' },
  { version: '9.0.0', from: '2026-06-30' },
  { version: '8.0.0', from: '2026-04-25' },
  { version: '7.0.0', from: '2026-03-22' },
  { version: '6.0.0', from: '2026-01-10' },
  { version: '5.0.0', from: '2025-12-21' },
  { version: '4.0.0', from: '2025-12-13' },
  { version: '2.0.0', from: '2025-11-09' },
  { version: '1.0.0', from: '2025-08-30' },
];

// SQL CASE mapping created_at → true version. Single-table query on `analytics`,
// so the bare `created_at` reference is unambiguous.
function releaseCase(col = 'created_at') {
  const clauses = RELEASES.map(
    (r) => `WHEN ${col} >= '${r.from}' THEN '${r.version}'`,
  ).join('\n    ');
  // Anything older than the earliest boundary is the earliest release.
  return `CASE\n    ${clauses}\n    ELSE '${RELEASES[RELEASES.length - 1].version}'\n  END`;
}

const CONFIRM = process.argv.includes('--confirm');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    '❌ DATABASE_URL not set. Run via: dotenv -- node scripts/backfill-plugin-version.mjs',
  );
  process.exit(1);
}

const sql = postgres(url, { max: 1, connect_timeout: 10, onnotice: () => {} });
const CASE = releaseCase('created_at');

try {
  // Report: current recorded pluginVersion → resolved true version, with counts.
  // Only rows where the two DIFFER need a write.
  const preview = await sql.unsafe(`
    SELECT
      COALESCE(properties::jsonb->>'pluginVersion', '(null)') AS current_version,
      (${CASE}) AS resolved_version,
      count(*)::int AS n,
      min(created_at)::date AS first,
      max(created_at)::date AS last
    FROM analytics
    GROUP BY 1, 2
    ORDER BY min(created_at)
  `);

  const changing = preview.filter(
    (r) => r.current_version !== r.resolved_version,
  );
  const toChange = changing.reduce((s, r) => s + r.n, 0);
  const totalRows = preview.reduce((s, r) => s + r.n, 0);

  console.log('Resolved version by era (from created_at):');
  console.table(
    preview.map((r) => ({
      recorded: r.current_version,
      resolved: r.resolved_version,
      rows: r.n,
      first: r.first,
      last: r.last,
      change: r.current_version !== r.resolved_version ? '→ update' : 'ok',
    })),
  );
  console.log(`Total rows: ${totalRows}   Rows needing update: ${toChange}`);

  if (toChange === 0) {
    console.log('✅ Nothing to change — pluginVersion already matches the timeline.');
    await sql.end();
    process.exit(0);
  }

  if (!CONFIRM) {
    console.log(
      '\n🔍 DRY RUN — no writes. Re-run with --confirm to rewrite pluginVersion on the rows marked "→ update".',
    );
    await sql.end();
    process.exit(0);
  }

  // Confirmed: merge the resolved version into properties (JSON concat preserves
  // every other key), only for rows that actually differ. One transaction.
  const updated = await sql.begin(async (tx) => {
    const res = await tx.unsafe(`
      UPDATE analytics
      SET properties = (
        COALESCE(properties::jsonb, '{}'::jsonb)
        || jsonb_build_object('pluginVersion', (${CASE}))
      )::text
      WHERE COALESCE(properties::jsonb->>'pluginVersion', '') IS DISTINCT FROM (${CASE})
    `);
    return res.count;
  });

  console.log(`\n✅ Updated ${updated} rows. pluginVersion now reflects the true release.`);

  // Verify: re-run the diff — should be zero remaining.
  const [{ remaining }] = await sql.unsafe(`
    SELECT count(*)::int AS remaining
    FROM analytics
    WHERE COALESCE(properties::jsonb->>'pluginVersion', '') IS DISTINCT FROM (${CASE})
  `);
  console.log(
    remaining === 0
      ? '✔ Verified: every row now matches the timeline (idempotent — safe to re-run).'
      : `⚠ ${remaining} rows still differ — investigate before trusting the column.`,
  );
} catch (err) {
  console.error('Error:', err.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
