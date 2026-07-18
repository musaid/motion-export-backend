import { data, useSearchParams, Form, useNavigation } from 'react-router';
import { analytics, licenses } from '~/database/schema';
import { requireAdmin } from '~/lib/auth.server';
import { desc, sql, like, eq, gte, and, notInArray } from 'drizzle-orm';
import type { Route } from './+types/analytics';
import { database } from '~/database/context';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';
import { Input } from '~/components/input';
import { Button } from '~/components/button';
import { Badge } from '~/components/badge';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '~/components/table';
import { Pagination } from '~/components/pagination';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { formatDate } from '~/lib/format';
import {
  BRAND,
  PALETTE,
  Section,
  StatCard,
  CountTooltip,
  Donut,
  CategoryBars,
  ActivityChart,
} from '~/components/admin-charts';

// ---------------------------------------------------------------------------
// GIF / WebM / APNG get stable, distinct colors so the hero media donut reads
// the same every render.
// ---------------------------------------------------------------------------
const FORMAT_COLORS: Record<string, string> = {
  gif: '#7dd3fc', // sky
  webm: '#eba3ed', // brand plum
  apng: '#fcd34d', // amber (brand new — stands out)
  Unknown: '#a1a1aa',
};

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const url = new URL(request.url);
  const event = url.searchParams.get('event') || '';
  const userId = url.searchParams.get('userId') || '';
  const licenseKey = url.searchParams.get('licenseKey') || '';
  const timeRange = url.searchParams.get('timeRange') || '7d';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 50;
  const offset = (page - 1) * limit;

  // Calculate time range
  const now = new Date();
  const timeRanges = {
    '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
    '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    all: new Date(0),
  };
  const timeRangeDate =
    timeRanges[timeRange as keyof typeof timeRanges] || timeRanges['7d'];

  // Exclude internal/test accounts from all analytics aggregates. Comma-separated
  // user_ids in ANALYTICS_EXCLUDE_USER_IDS (e.g. the team's own Figma ids). When
  // unset, nothing is excluded.
  const excludedUserIds = (process.env.ANALYTICS_EXCLUDE_USER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  // whereClause for the raw event LOG (respects the event/userId/licenseKey text
  // filters + time range + exclusions).
  const logConditions = [gte(analytics.createdAt, timeRangeDate.toISOString())];
  if (event) {
    logConditions.push(eq(analytics.event, event));
  }
  if (userId) {
    logConditions.push(like(analytics.userId, `%${userId}%`));
  }
  if (licenseKey) {
    logConditions.push(like(analytics.licenseKey, `%${licenseKey}%`));
  }
  if (excludedUserIds.length > 0) {
    logConditions.push(notInArray(analytics.userId, excludedUserIds));
  }
  const logWhere = and(...logConditions);

  // whereClause for the AGGREGATES (time range + exclusions only — the text
  // filters are for debugging the log, not for skewing the charts).
  const aggConditions = [gte(analytics.createdAt, timeRangeDate.toISOString())];
  if (excludedUserIds.length > 0) {
    aggConditions.push(notInArray(analytics.userId, excludedUserIds));
  }
  const whereClause = and(...aggConditions);

  // -- Raw event log (paginated, uses the text filters) ---------------------
  const analyticsData = await database()
    .select()
    .from(analytics)
    .where(logWhere)
    .orderBy(desc(analytics.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await database()
    .select({ count: sql<number>`count(*)` })
    .from(analytics)
    .where(logWhere);

  // -- Event type distribution (for the raw-log filter chips) ---------------
  const eventTypes = await database()
    .select({
      event: analytics.event,
      count: sql<number>`count(*)`,
    })
    .from(analytics)
    .where(whereClause)
    .groupBy(analytics.event)
    .orderBy(desc(sql`count(*)`));

  // -- KPI totals (in range) ------------------------------------------------
  const [kpi] = await database()
    .select({
      opens: sql<number>`count(*) FILTER (WHERE ${analytics.event} = 'plugin_opened')`,
      scans: sql<number>`count(*) FILTER (WHERE ${analytics.event} = 'scan_completed')`,
      codeExports: sql<number>`count(*) FILTER (WHERE ${analytics.event} = 'export_completed')`,
      mediaExports: sql<number>`count(*) FILTER (WHERE ${analytics.event} = 'media_export_completed')`,
      totalEvents: sql<number>`count(*)`,
    })
    .from(analytics)
    .where(whereClause);

  // Active licenses + revenue (all-time, from the licenses table — the funnel's
  // true end). Not time-scoped: "active licenses" is a standing count.
  const [licenseTotals] = await database()
    .select({
      active: sql<number>`count(*) FILTER (WHERE ${licenses.status} = 'active')`,
      revenue: sql<number>`COALESCE(SUM(${licenses.amount}) FILTER (WHERE ${licenses.status} = 'active'), 0)`,
    })
    .from(licenses);

  // -- Daily series (feeds BOTH KPI sparklines and the activity chart) -------
  // For 90d / all we bucket by ISO week to keep the series legible; otherwise day.
  const useWeek = timeRange === '90d' || timeRange === 'all';
  const bucket = useWeek ? 'week' : 'day';
  const dailySeries = await database()
    .select({
      period: sql<string>`to_char(date_trunc('${sql.raw(bucket)}', ${analytics.createdAt}), 'YYYY-MM-DD')`,
      opens: sql<number>`count(*) FILTER (WHERE ${analytics.event} = 'plugin_opened')`,
      scans: sql<number>`count(*) FILTER (WHERE ${analytics.event} = 'scan_completed')`,
      codeExports: sql<number>`count(*) FILTER (WHERE ${analytics.event} = 'export_completed')`,
      mediaExports: sql<number>`count(*) FILTER (WHERE ${analytics.event} = 'media_export_completed')`,
      events: sql<number>`count(*)`,
    })
    .from(analytics)
    .where(whereClause)
    .groupBy(sql`date_trunc('${sql.raw(bucket)}', ${analytics.createdAt})`)
    .orderBy(sql`date_trunc('${sql.raw(bucket)}', ${analytics.createdAt})`);

  // -- Acquisition funnel (distinct users per stage) ------------------------
  // Stage 3 (exported) = distinct users who did ANY export (code OR media).
  const [funnel] = await database()
    .select({
      opened: sql<number>`COUNT(DISTINCT ${analytics.userId}) FILTER (WHERE ${analytics.event} = 'plugin_opened')`,
      scanned: sql<number>`COUNT(DISTINCT ${analytics.userId}) FILTER (WHERE ${analytics.event} = 'scan_completed')`,
      exported: sql<number>`COUNT(DISTINCT ${analytics.userId}) FILTER (WHERE ${analytics.event} IN ('export_completed', 'media_export_completed'))`,
      purchaseClicked: sql<number>`COUNT(DISTINCT ${analytics.userId}) FILTER (WHERE ${analytics.event} = 'purchase_button_clicked')`,
    })
    .from(analytics)
    .where(whereClause);

  // Activated = real paid licenses in the same time window (funnel's true end).
  const [{ activated }] = await database()
    .select({
      activated: sql<number>`count(*) FILTER (WHERE ${licenses.status} = 'active')`,
    })
    .from(licenses)
    .where(gte(licenses.createdAt, timeRangeDate.toISOString()));

  const funnelStages = {
    opened: funnel?.opened || 0,
    scanned: funnel?.scanned || 0,
    exported: funnel?.exported || 0,
    purchaseClicked: funnel?.purchaseClicked || 0,
    activated: activated || 0,
  };

  // -- Media formats (hero donut) — gif / webm / apng -----------------------
  const mediaFormats = await database()
    .select({
      key: sql<string>`COALESCE(NULLIF(properties::jsonb->>'format', ''), 'Unknown')`,
      count: sql<number>`count(*)`,
    })
    .from(analytics)
    .where(and(whereClause, eq(analytics.event, 'media_export_completed')))
    .groupBy(sql`COALESCE(NULLIF(properties::jsonb->>'format', ''), 'Unknown')`)
    .orderBy(desc(sql`count(*)`));

  // -- Export scope — single / sequence / board (null => legacy) ------------
  const exportScope = await database()
    .select({
      key: sql<string>`COALESCE(NULLIF(properties::jsonb->>'scope', ''), 'Unknown (legacy)')`,
      count: sql<number>`count(*)`,
    })
    .from(analytics)
    .where(and(whereClause, eq(analytics.event, 'media_export_completed')))
    .groupBy(sql`COALESCE(NULLIF(properties::jsonb->>'scope', ''), 'Unknown (legacy)')`)
    .orderBy(desc(sql`count(*)`));

  // -- Animation types — smart-animate / figma-motion / ... -----------------
  const animationTypes = await database()
    .select({
      key: sql<string>`COALESCE(NULLIF(properties::jsonb->>'animationType', ''), 'Unknown')`,
      count: sql<number>`count(*)`,
    })
    .from(analytics)
    .where(and(whereClause, eq(analytics.event, 'media_export_completed')))
    .groupBy(sql`COALESCE(NULLIF(properties::jsonb->>'animationType', ''), 'Unknown')`)
    .orderBy(desc(sql`count(*)`));

  // -- Code frameworks — css / framer-motion / react / ... ------------------
  // From code exports (export_completed carries `framework`; code_copied too).
  const frameworks = await database()
    .select({
      key: sql<string>`COALESCE(NULLIF(properties::jsonb->>'framework', ''), 'Unknown')`,
      count: sql<number>`count(*)`,
    })
    .from(analytics)
    .where(
      and(
        whereClause,
        sql`${analytics.event} IN ('export_completed', 'code_copied')`,
        sql`properties::jsonb->>'framework' IS NOT NULL`,
      ),
    )
    .groupBy(sql`COALESCE(NULLIF(properties::jsonb->>'framework', ''), 'Unknown')`)
    .orderBy(desc(sql`count(*)`));

  // -- Version adoption -----------------------------------------------------
  // pluginVersion was historically an unreliable stale literal, but the
  // backfill-plugin-version.mjs script corrected it in place from each event's
  // date, so the column is now trustworthy — group by it directly. Rows with no
  // version (should be none after backfill) bucket as 'Unknown'.
  const versionAdoption = await database()
    .select({
      version: sql<string>`COALESCE(NULLIF(${analytics.properties}::jsonb->>'pluginVersion', ''), 'Unknown')`,
      count: sql<number>`count(*)`,
    })
    .from(analytics)
    .where(whereClause)
    .groupBy(sql`${analytics.properties}::jsonb->>'pluginVersion'`)
    .orderBy(desc(sql`count(*)`));

  return data({
    analytics: analyticsData,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
    eventTypes,
    timeRange,
    kpi: {
      opens: kpi?.opens || 0,
      scans: kpi?.scans || 0,
      totalExports: (kpi?.codeExports || 0) + (kpi?.mediaExports || 0),
      activeLicenses: licenseTotals?.active || 0,
      revenue: Number(licenseTotals?.revenue || 0),
      totalEvents: kpi?.totalEvents || 0,
    },
    dailySeries,
    funnelStages,
    mediaFormats,
    exportScope,
    animationTypes,
    frameworks,
    versionAdoption,
  });
}

// Acquisition funnel — stage counts + conversion % between stages.
function FunnelChart({
  data,
}: {
  data: {
    opened: number;
    scanned: number;
    exported: number;
    purchaseClicked: number;
    activated: number;
  };
}) {
  const stages = [
    { name: 'Plugin Opened', value: data.opened, color: '#7dd3fc' },
    { name: 'Scan Completed', value: data.scanned, color: '#86efac' },
    { name: 'Exported (any)', value: data.exported, color: BRAND },
    { name: 'Buy Clicked', value: data.purchaseClicked, color: '#fcd34d' },
    { name: 'Activated (paid)', value: data.activated, color: '#86efac' },
  ];
  const maxValue = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className="space-y-2 py-2">
      {stages.map((stage, index) => {
        const width = (stage.value / maxValue) * 100;
        const conversionRate =
          index > 0 && stages[index - 1].value > 0
            ? (stage.value / stages[index - 1].value) * 100
            : null;
        return (
          <motion.div
            key={stage.name}
            className="group relative"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-36 text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-shrink-0">
                {stage.name}
              </div>
              <div className="flex-1">
                <div
                  className="h-11 rounded-lg overflow-hidden relative"
                  style={{ width: `${Math.max(width, 4)}%` }}
                >
                  <div
                    className="h-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <div className="absolute inset-0 flex items-center px-3 text-sm font-semibold text-zinc-900/80">
                    {stage.value.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="w-16 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                {conversionRate !== null ? `${conversionRate.toFixed(1)}%` : ''}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function AdminAnalytics({ loaderData }: Route.ComponentProps) {
  const {
    analytics,
    pagination,
    eventTypes,
    timeRange,
    kpi,
    dailySeries,
    funnelStages,
    mediaFormats,
    exportScope,
    animationTypes,
    frameworks,
    versionAdoption,
  } = loaderData;
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const isNavigating = navigation.state === 'loading';

  const getEventColor = (event: string) => {
    if (event.includes('error') || event.includes('fail')) return 'red';
    if (event.includes('success') || event.includes('complete')) return 'green';
    if (event.includes('start') || event.includes('init')) return 'blue';
    if (event.includes('export')) return 'purple';
    if (event.includes('activate') || event.includes('verify')) return 'amber';
    return 'zinc';
  };

  const formatProperties = (properties: string | null) => {
    if (!properties) return '-';
    try {
      const parsed = JSON.parse(properties);
      return (
        <div className="text-xs space-y-1">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key}>
              <span className="font-medium text-zinc-600 dark:text-zinc-400">
                {key}:
              </span>{' '}
              <span className="text-zinc-900 dark:text-zinc-100">
                {typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value)}
              </span>
            </div>
          ))}
        </div>
      );
    } catch {
      return <span className="text-xs text-zinc-500">{properties}</span>;
    }
  };

  // Derive per-metric spark series from the shared daily series.
  const spark = (key: keyof (typeof dailySeries)[number]) =>
    dailySeries.map((d) => Number(d[key] as number));

  // Map DB rows to {name, count} for the categorical charts.
  const toCat = (rows: Array<{ key: string; count: number }>) =>
    rows.map((r) => ({ name: r.key, count: Number(r.count) }));

  const mediaFormatData = toCat(mediaFormats);
  const scopeData = toCat(exportScope);
  const animationData = toCat(animationTypes);
  const frameworkData = toCat(frameworks);
  const versionData = versionAdoption.map((r) => ({
    name: `v${r.version}`,
    count: Number(r.count),
  }));

  const figmaMotionShare = (() => {
    const total = animationData.reduce((s, d) => s + d.count, 0);
    const fm = animationData
      .filter((d) => d.name.startsWith('figma-motion'))
      .reduce((s, d) => s + d.count, 0);
    return total > 0 ? Math.round((fm / total) * 100) : 0;
  })();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <Heading>Analytics Dashboard</Heading>
        <Text className="mt-1">
          User behavior, engagement, and conversion — the deep hub.
        </Text>
      </div>

      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-2 items-center justify-between w-full">
        <div className="flex flex-wrap gap-2">
          {[
            { value: '24h', label: 'Last 24 Hours' },
            { value: '7d', label: 'Last 7 Days' },
            { value: '30d', label: 'Last 30 Days' },
            { value: '90d', label: 'Last 90 Days' },
            { value: 'all', label: 'All Time' },
          ].map((range) => (
            <Link key={range.value} to={`?timeRange=${range.value}`} prefetch="intent">
              {timeRange === range.value ? (
                <Button color="zinc" className="transition-all">
                  {range.label}
                </Button>
              ) : (
                <Button outline className="transition-all">
                  {range.label}
                </Button>
              )}
            </Link>
          ))}
        </div>
        <div className="ml-auto">
          {isNavigating ? (
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </div>
          ) : (
            <div className="h-6 w-24" />
          )}
        </div>
      </div>

      {/* 1. KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Opens"
          value={kpi.opens.toLocaleString()}
          series={spark('opens')}
          color="#7dd3fc"
          delay={0}
        />
        <StatCard
          label="Scans"
          value={kpi.scans.toLocaleString()}
          series={spark('scans')}
          color="#86efac"
          delay={0.05}
        />
        <StatCard
          label="Total Exports"
          value={kpi.totalExports.toLocaleString()}
          series={spark('mediaExports').map(
            (m, i) => m + Number(dailySeries[i]?.codeExports || 0),
          )}
          color={BRAND}
          delay={0.1}
        />
        <StatCard
          label="Active Licenses"
          value={kpi.activeLicenses.toLocaleString()}
          series={[]}
          color="#86efac"
          delay={0.15}
        />
        <StatCard
          label="Revenue"
          value={`$${kpi.revenue.toFixed(2)}`}
          series={[]}
          color="#fcd34d"
          delay={0.2}
        />
        <StatCard
          label="Events (range)"
          value={kpi.totalEvents.toLocaleString()}
          series={spark('events')}
          color="#c4b5fd"
          delay={0.25}
        />
      </div>

      {/* 2. Acquisition funnel */}
      <Section
        title="Acquisition Funnel"
        caption="Distinct users per stage. Exported = anyone who did a code OR media export. Activated = real paid licenses in range (buy-clicks are only intent)."
        delay={0.3}
      >
        <FunnelChart data={funnelStages} />
      </Section>

      {/* 3 + 4. Media formats (hero) + Export scope */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section
          title="Media Formats"
          caption="GIF / WebM / APNG from completed media exports. APNG is brand new."
          delay={0.35}
        >
          <Donut
            data={mediaFormatData}
            colorFor={(name, i) =>
              FORMAT_COLORS[name] || PALETTE[i % PALETTE.length]
            }
          />
        </Section>

        <Section
          title="Export Scope"
          caption="Single / sequence / board. Legacy events without a scope are bucketed as Unknown."
          delay={0.4}
        >
          <Donut
            data={scopeData}
            colorFor={(_name, i) => PALETTE[i % PALETTE.length]}
          />
        </Section>
      </div>

      {/* 5. Animation types */}
      <Section
        title="Animation Types"
        caption={`From completed media exports. Figma Motion is ~${figmaMotionShare}% — the newest capability.`}
        delay={0.45}
      >
        <CategoryBars data={animationData} color={BRAND} />
      </Section>

      {/* 6. Code frameworks */}
      <Section
        title="Code Frameworks"
        caption="Framework chosen on code exports (export_completed + code_copied)."
        delay={0.5}
      >
        <CategoryBars data={frameworkData} color="#86efac" />
      </Section>

      {/* 7. Activity over time */}
      <Section
        title="Activity Over Time"
        caption={
          timeRange === '90d' || timeRange === 'all'
            ? 'Weekly buckets — scans vs code exports vs media exports.'
            : 'Daily buckets — scans vs code exports vs media exports.'
        }
        delay={0.55}
      >
        <ActivityChart data={dailySeries} />
      </Section>

      {/* 8. Version adoption */}
      <Section
        title="Version Adoption"
        caption="Event volume by plugin release. Historical rows were corrected from each event's date (older builds mis-reported their version); the recorded version is now trustworthy."
        delay={0.6}
      >
        <CategoryBars data={versionData} color="#c4b5fd" />
      </Section>

      {/* Event Distribution (raw-log filter chips) */}
      <Section title="Event Distribution" delay={0.65}>
        <div className="flex flex-wrap gap-2">
          {eventTypes.slice(0, 15).map((type) => (
            <Link
              key={type.event}
              to={`?timeRange=${timeRange}&event=${type.event}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Badge color={getEventColor(type.event || '')} className="text-xs">
                {type.event}
              </Badge>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {type.count}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Filters */}
      <Section title="Debug: Event Log Filters" delay={0.7}>
        <Form method="get" className="flex flex-col lg:flex-row gap-4">
          <input type="hidden" name="timeRange" value={timeRange} />
          <Input
            type="text"
            name="event"
            defaultValue={searchParams.get('event') || ''}
            placeholder="Filter by event type..."
            className="flex-1 min-w-0"
          />
          <Input
            type="text"
            name="userId"
            defaultValue={searchParams.get('userId') || ''}
            placeholder="User ID..."
            className="lg:w-48"
          />
          <Input
            type="text"
            name="licenseKey"
            defaultValue={searchParams.get('licenseKey') || ''}
            placeholder="License key..."
            className="lg:w-48"
          />
          <div className="flex gap-2">
            <Button type="submit">Filter</Button>
            {(searchParams.get('event') ||
              searchParams.get('userId') ||
              searchParams.get('licenseKey')) && (
              <Link to={`/admin/analytics?timeRange=${timeRange}`}>
                <Button type="button" outline>
                  Clear
                </Button>
              </Link>
            )}
          </div>
        </Form>
      </Section>

      {/* Events Table */}
      <motion.div
        className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.75 }}
      >
        <div className="p-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
            Event Log
          </h3>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="pl-0">Event</TableHeader>
                <TableHeader>User ID</TableHeader>
                <TableHeader>License Key</TableHeader>
                <TableHeader>Properties</TableHeader>
                <TableHeader>IP Address</TableHeader>
                <TableHeader className="pr-0">Timestamp</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {analytics.map((record, index) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02, duration: 0.2 }}
                    className="border-b border-zinc-950/5 dark:border-white/5 last:border-0"
                  >
                    <TableCell className="pl-0">
                      <Badge color={getEventColor(record.event)} className="text-xs">
                        {record.event}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.userId ? (
                        <span className="font-mono text-xs">{record.userId}</span>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.licenseKey ? (
                        <span className="font-mono text-xs">
                          {record.licenseKey.substring(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {formatProperties(record.properties)}
                    </TableCell>
                    <TableCell>
                      {record.ip ? (
                        <span className="font-mono text-xs">{record.ip}</span>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-0 text-xs">
                      {formatDate(record.createdAt)}
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>

          {analytics.length === 0 && (
            <div className="text-center py-8">
              <Text className="text-zinc-500 dark:text-zinc-400">
                No analytics events found
              </Text>
            </div>
          )}
        </div>
      </motion.div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            {Array.from(
              { length: Math.min(pagination.totalPages, 10) },
              (_, i) => {
                const pageNum =
                  pagination.page <= 5
                    ? i + 1
                    : Math.min(
                        Math.max(i + pagination.page - 4, 1),
                        pagination.totalPages - 9 + i,
                      );

                if (pageNum > pagination.totalPages) return null;

                return (
                  <Link
                    key={pageNum}
                    to={`?page=${pageNum}&timeRange=${timeRange}${searchParams.get('event') ? `&event=${searchParams.get('event')}` : ''}${searchParams.get('userId') ? `&userId=${searchParams.get('userId')}` : ''}${searchParams.get('licenseKey') ? `&licenseKey=${searchParams.get('licenseKey')}` : ''}`}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      pageNum === pagination.page
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                        : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              },
            ).filter(Boolean)}
          </Pagination>
        </div>
      )}
    </div>
  );
}
