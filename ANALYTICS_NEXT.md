# Analytics — Next Iteration (deferred)

Ideas parked for a future round. **Not** part of the current dashboard rebuild,
which is dashboard-query-only (no plugin or backend-ingest changes).

## Plugin event enrichment (additive JSON properties — non-breaking)

The `analytics` table stores an arbitrary `properties` JSON blob, so new keys need
no schema change — they simply start populating for new events and appear in the
dashboard once queried. Candidates, highest-value first:

- **`media_export_completed` — matte background choice.** Add `background`
  (`transparent` | `#ffffff` | `#000000`) so we can see how often users pick a
  solid matte vs transparent for GIF. Emitted in
  `src/lib/events/handlers/media-handlers.ts`.
- **`media_export_completed` — encode path.** Add `encoder`
  (`webcodecs` | `mediarecorder`) for WebM so we can measure how often the
  WebCodecs bridge is used vs the fallback (perf/quality signal).
- **`media_export_completed` — export scale & fps.** Add `scale` and `fps`
  (already known at call site in `use-plugin.ts`) to understand output sizes.
- **`media_export_completed` — fidelity tier.** For Motion, add
  `fidelity` (`pixel-accurate` | `approximated`) from `classifyMotionFidelity`,
  to correlate "approximated" exports with any drop-off.
- **`export_completed` (code) — framework already sent?** Confirm `framework`
  and `scope` (single/all) ride on code exports; if not, add them for a code
  format-adoption view symmetric to media.

## Why deferred

Enrichment only populates going forward, so it can't backfill history — better to
ship the dashboard against existing data first, then layer these in and let them
accumulate.
