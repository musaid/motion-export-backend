// Release timeline — maps an event's date to the TRUE plugin release.
//
// Why this exists: until v10.0.0 the plugin's config.ts version was a hardcoded
// literal that was only updated sporadically, so the `pluginVersion` recorded on
// each analytics event is unreliable (e.g. "6.0.0" was stamped on every event
// from Jan–Jul 2026, spanning the v6/v7/v8/v9 store releases). The event's
// CREATED_AT is trustworthy, so we reconstruct the real release from the date
// against the Figma store publish dates.
//
// Dates are the store publish dates for each store version → the semantic
// version its release notes carry. Boundaries are half-open [from, nextFrom).
// From v10.0.0 onward the recorded pluginVersion is correct (single-source-of-
// truth fix), but date-inference still agrees, so we use dates uniformly.

export interface Release {
  /** Semantic version shown in release notes, e.g. "10.0.0". */
  version: string;
  /** Figma store "Version N" ordinal. */
  storeVersion: number;
  /** Store publish date (UTC, YYYY-MM-DD) — start of this release's era. */
  from: string;
  /** Short human label for the release headline. */
  label: string;
}

// Newest first. `from` is the publish date; an event belongs to the newest
// release whose `from` is <= the event date.
export const RELEASES: Release[] = [
  { version: '10.0.0', storeVersion: 9, from: '2026-07-18', label: 'APNG Everywhere + Crisper GIFs' },
  { version: '9.0.0',  storeVersion: 8, from: '2026-06-30', label: 'Figma Motion Support' },
  { version: '8.0.0',  storeVersion: 7, from: '2026-04-25', label: 'Sequence Export' },
  { version: '7.0.0',  storeVersion: 6, from: '2026-03-22', label: 'GIF + WebM Export' },
  { version: '6.0.0',  storeVersion: 5, from: '2026-01-10', label: 'User-Based Licensing' },
  { version: '4.0.0',  storeVersion: 4, from: '2025-12-13', label: 'Performance' },
  { version: '2.0.0',  storeVersion: 3, from: '2025-11-09', label: 'New Design' },
  // Store versions 1–2 (Aug 30 & Oct 11, 2025) predate meaningful release notes.
  { version: '1.0.0',  storeVersion: 1, from: '2025-08-30', label: 'Initial Release' },
];

const SORTED = [...RELEASES].sort((a, b) => (a.from < b.from ? 1 : -1));

/** The release in effect on a given event date (Date or ISO/DB string). */
export function releaseForDate(date: string | Date): Release {
  const iso = typeof date === 'string' ? date : date.toISOString();
  const day = iso.slice(0, 10);
  for (const r of SORTED) {
    if (day >= r.from) return r;
  }
  return SORTED[SORTED.length - 1];
}

/**
 * SQL CASE expression that resolves an analytics row's true release version from
 * created_at. Pass the created_at column reference as a raw SQL string so it can
 * be embedded in a Drizzle `sql` template. Returns a version string.
 */
export function releaseVersionSql(createdAtCol: string): string {
  const clauses = SORTED.map(
    (r) => `WHEN ${createdAtCol} >= '${r.from}' THEN '${r.version}'`,
  ).join(' ');
  const fallback = SORTED[SORTED.length - 1].version;
  return `CASE ${clauses} ELSE '${fallback}' END`;
}
