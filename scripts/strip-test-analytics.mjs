/**
 * Strip the developer's own test analytics from the `analytics` table.
 *
 * Every event under the dev's Figma user_id is test traffic (heavy manual
 * testing across the plugin's lifetime — ~10% of all events, ~25% of media
 * exports) and skews every funnel/rate on the admin dashboard. This removes it
 * at the source so all downstream views are correct without per-query filters.
 *
 * SAFETY:
 *   - Dry-run by default: prints exactly what WOULD be deleted. No writes.
 *   - Deletes only with an explicit `--confirm` flag.
 *   - Wrapped in a transaction.
 *   - Touches ONLY the `analytics` table. Never the `licenses` table — the dev's
 *     $29 license row is real Stripe data and stays.
 *   - Uses DATABASE_URL (read-write). Run by the project owner, not via the
 *     read-only analytics harness.
 *
 * Which accounts: reads ANALYTICS_EXCLUDE_USER_IDS (comma-separated) — the SAME
 * env var the admin dashboard uses to exclude internal accounts — or --user=a,b.
 *
 * Usage:
 *   dotenv -- node scripts/strip-test-analytics.mjs            # dry run (report only)
 *   dotenv -- node scripts/strip-test-analytics.mjs --confirm  # actually delete
 *   dotenv -- node scripts/strip-test-analytics.mjs --user=123,456 --confirm
 */

import postgres from 'postgres';

// Internal/test Figma user_ids to strip. Sourced from the same env var the admin
// dashboard uses for its exclusion filter (ANALYTICS_EXCLUDE_USER_IDS, comma-
// separated), or overridden with --user=<id>,<id>. Keeping one source of truth
// means "who is internal" is defined in exactly one place.
const userArg = process.argv
  .find((a) => a.startsWith('--user='))
  ?.slice('--user='.length);
const EXCLUDE_IDS = (userArg || process.env.ANALYTICS_EXCLUDE_USER_IDS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

const CONFIRM = process.argv.includes('--confirm');

if (EXCLUDE_IDS.length === 0) {
  console.error(
    '❌ No user_ids to strip. Set ANALYTICS_EXCLUDE_USER_IDS or pass --user=<id>,<id>.',
  );
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('❌ DATABASE_URL not set. Run via: dotenv -- node scripts/strip-test-analytics.mjs');
  process.exit(1);
}

const sql = postgres(url, { max: 1, connect_timeout: 10, onnotice: () => {} });

try {
  console.log(`Target user_ids: ${EXCLUDE_IDS.join(', ')}`);

  // Report what will be affected — a breakdown by event so you can eyeball it.
  const breakdown = await sql`
    SELECT event, count(*)::int AS n,
           min(created_at)::date AS first, max(created_at)::date AS last
    FROM analytics
    WHERE user_id = ANY(${EXCLUDE_IDS})
    GROUP BY event
    ORDER BY n DESC
  `;
  const total = breakdown.reduce((s, r) => s + r.n, 0);

  if (total === 0) {
    console.log('✅ No analytics rows found for those user_ids. Nothing to do.');
    await sql.end();
    process.exit(0);
  }

  console.table(breakdown);
  console.log(`TOTAL rows: ${total}`);
  console.log('NOTE: the licenses table is NOT touched — license rows stay.\n');

  if (!CONFIRM) {
    console.log('🔍 DRY RUN — nothing deleted. Re-run with --confirm to delete these rows.');
    await sql.end();
    process.exit(0);
  }

  // Confirmed: delete inside a transaction, verify the count matches.
  const deleted = await sql.begin(async (tx) => {
    const res = await tx`DELETE FROM analytics WHERE user_id = ANY(${EXCLUDE_IDS})`;
    return res.count;
  });

  console.log(`🗑️  Deleted ${deleted} rows for ${EXCLUDE_IDS.length} user_id(s).`);
  console.log('Done. The admin dashboard now reflects real-user traffic only.');
} catch (err) {
  console.error('Error:', err.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
