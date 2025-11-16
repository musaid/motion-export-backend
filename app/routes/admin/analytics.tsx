import { data, useSearchParams, Form, useNavigation } from 'react-router';
import { analytics } from '~/database/schema';
import { requireAdmin } from '~/lib/auth.server';
import { desc, sql, like, eq, gte, and } from 'drizzle-orm';
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
    'all': new Date(0),
  };
  const timeRangeDate =
    timeRanges[timeRange as keyof typeof timeRanges] || timeRanges['7d'];

  // Build query with filters
  const conditions = [gte(analytics.createdAt, timeRangeDate.toISOString())];
  if (event) {
    conditions.push(eq(analytics.event, event));
  }
  if (userId) {
    conditions.push(like(analytics.userId, `%${userId}%`));
  }
  if (licenseKey) {
    conditions.push(like(analytics.licenseKey, `%${licenseKey}%`));
  }

  const whereClause = and(...conditions);

  const analyticsData = await database()
    .select()
    .from(analytics)
    .where(whereClause)
    .orderBy(desc(analytics.createdAt))
    .limit(limit)
    .offset(offset);

  // Get total count
  const [{ count }] = await database()
    .select({ count: sql<number>`count(*)` })
    .from(analytics)
    .where(whereClause);

  // Get event types distribution
  const eventTypes = await database()
    .select({
      event: analytics.event,
      count: sql<number>`count(*)`,
    })
    .from(analytics)
    .where(whereClause)
    .groupBy(analytics.event)
    .orderBy(desc(sql`count(*)`));

  // Get stats for selected time range
  const [rangeStats] = await database()
    .select({
      totalEvents: sql<number>`count(*)`,
      uniqueUsers: sql<number>`COUNT(DISTINCT ${analytics.userId})`,
      uniqueLicenses: sql<number>`COUNT(DISTINCT ${analytics.licenseKey})`,
    })
    .from(analytics)
    .where(whereClause);

  // Get hourly breakdown for last 24h (for time-series chart)
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const hourlyData = await database()
    .select({
      hour: sql<string>`to_char(date_trunc('hour', ${analytics.createdAt}), 'YYYY-MM-DD HH24:00')`,
      count: sql<number>`count(*)`,
    })
    .from(analytics)
    .where(gte(analytics.createdAt, last24h.toISOString()))
    .groupBy(sql`date_trunc('hour', ${analytics.createdAt})`)
    .orderBy(sql`date_trunc('hour', ${analytics.createdAt})`);

  // Get framework breakdown from code_copied and code_downloaded events
  const frameworkData = await database()
    .select({
      framework: sql<string>`
        CASE
          WHEN properties::jsonb->>'framework' IS NOT NULL
          THEN properties::jsonb->>'framework'
          ELSE 'unknown'
        END
      `,
      count: sql<number>`count(*)`,
    })
    .from(analytics)
    .where(
      and(
        whereClause,
        sql`${analytics.event} IN ('code_copied', 'code_downloaded')`,
      ),
    )
    .groupBy(sql`properties::jsonb->>'framework'`)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Get conversion funnel data
  const funnelQuery = await database()
    .select({
      event: analytics.event,
      count: sql<number>`COUNT(DISTINCT ${analytics.userId})`,
    })
    .from(analytics)
    .where(
      and(
        whereClause,
        sql`${analytics.event} IN ('plugin_opened', 'scan_completed', 'export_completed', 'code_copied', 'license_modal_opened', 'purchase_button_clicked')`,
      ),
    )
    .groupBy(analytics.event);

  const funnelStages = {
    plugin_opened: 0,
    scan_completed: 0,
    export_completed: 0,
    code_copied: 0,
    license_modal_opened: 0,
    purchase_button_clicked: 0,
  };

  funnelQuery.forEach((item) => {
    if (item.event && item.event in funnelStages) {
      funnelStages[item.event as keyof typeof funnelStages] = item.count;
    }
  });

  // Get animation type breakdown from scan_completed events
  const animationTypesData = await database()
    .select({
      properties: analytics.properties,
    })
    .from(analytics)
    .where(
      and(whereClause, eq(analytics.event, 'scan_completed')),
    )
    .limit(1000);

  const animationTypeCount: Record<string, number> = {};
  animationTypesData.forEach((record) => {
    try {
      const props = JSON.parse(record.properties || '{}');
      if (props.animationTypes && Array.isArray(props.animationTypes)) {
        props.animationTypes.forEach((type: string) => {
          animationTypeCount[type] = (animationTypeCount[type] || 0) + 1;
        });
      }
    } catch (e) {
      // Skip invalid JSON
    }
  });

  const animationTypes = Object.entries(animationTypeCount)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Get average scan duration
  const scanDurations = await database()
    .select({
      avgDuration: sql<number>`AVG((properties::jsonb->>'scanDuration')::numeric)`,
      minDuration: sql<number>`MIN((properties::jsonb->>'scanDuration')::numeric)`,
      maxDuration: sql<number>`MAX((properties::jsonb->>'scanDuration')::numeric)`,
    })
    .from(analytics)
    .where(
      and(
        whereClause,
        eq(analytics.event, 'scan_completed'),
        sql`properties::jsonb->>'scanDuration' IS NOT NULL`,
      ),
    );

  return data({
    analytics: analyticsData,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
    eventTypes,
    stats: {
      range: rangeStats || {
        totalEvents: 0,
        uniqueUsers: 0,
        uniqueLicenses: 0,
      },
    },
    timeRange,
    hourlyData,
    frameworkData,
    funnelStages,
    animationTypes,
    scanDurations: scanDurations[0] || {
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
    },
  });
}

function TimeSeriesChart({ data }: { data: Array<{ hour: string; count: number }> }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-zinc-400">
        No data available for the last 24 hours
      </div>
    );
  }

  // Fill in missing hours for the last 24 hours
  const now = new Date();
  const hours24 = Array.from({ length: 24 }, (_, i) => {
    const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    time.setMinutes(0, 0, 0);
    return time;
  });

  const dataMap = new Map(
    data.map((item) => [new Date(item.hour).getTime(), item.count])
  );

  const filledData = hours24.map((time) => ({
    hour: time.toISOString(),
    count: dataMap.get(time.getTime()) || 0,
    hourLabel: time.getHours(),
  }));

  const maxCount = Math.max(...filledData.map((d) => d.count), 1);
  const minCount = 0;
  const range = maxCount || 1;

  return (
    <div className="relative h-48 flex items-end gap-1 px-2 pb-6">
      {filledData.map((item, index) => {
        const height = (item.count / range) * 100;

        return (
          <motion.div
            key={item.hour}
            className="group relative flex-1 flex flex-col items-center min-w-0"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: index * 0.015, duration: 0.3 }}
          >
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm hover:from-blue-600 hover:to-blue-500 transition-colors relative"
              style={{ height: `${Math.max(height, item.count > 0 ? 3 : 1)}%` }}
            >
              {item.count > 0 && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none z-10 shadow-lg">
                  <div className="font-semibold">{item.count} events</div>
                  <div className="text-[10px] opacity-75">{item.hourLabel}:00</div>
                </div>
              )}
            </div>
            {index % 4 === 0 && (
              <div className="text-[10px] text-zinc-400 mt-1 absolute -bottom-5">
                {item.hourLabel}h
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function FrameworkChart({ data }: { data: Array<{ framework: string; count: number }> }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-zinc-400">
        No framework data available
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const colors = [
    'from-purple-500 to-purple-400',
    'from-blue-500 to-blue-400',
    'from-green-500 to-green-400',
    'from-amber-500 to-amber-400',
    'from-red-500 to-red-400',
    'from-pink-500 to-pink-400',
    'from-indigo-500 to-indigo-400',
    'from-teal-500 to-teal-400',
    'from-orange-500 to-orange-400',
    'from-cyan-500 to-cyan-400',
  ];

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const percentage = (item.count / total) * 100;

        return (
          <motion.div
            key={item.framework}
            className="group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {item.framework || 'unknown'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {item.count.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 min-w-[3rem] text-right">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${colors[index % colors.length]} group-hover:opacity-80 transition-opacity`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: index * 0.05 + 0.1, duration: 0.5 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function FunnelChart({
  data,
}: {
  data: {
    plugin_opened: number;
    scan_completed: number;
    export_completed: number;
    code_copied: number;
    license_modal_opened: number;
    purchase_button_clicked: number;
  };
}) {
  const stages = [
    { name: 'Plugin Opened', value: data.plugin_opened, color: 'from-blue-500 to-blue-400' },
    { name: 'Scan Completed', value: data.scan_completed, color: 'from-green-500 to-green-400' },
    {
      name: 'Export Completed',
      value: data.export_completed,
      color: 'from-purple-500 to-purple-400',
    },
    { name: 'Code Copied', value: data.code_copied, color: 'from-amber-500 to-amber-400' },
    {
      name: 'License Modal',
      value: data.license_modal_opened,
      color: 'from-pink-500 to-pink-400',
    },
    {
      name: 'Purchase Click',
      value: data.purchase_button_clicked,
      color: 'from-red-500 to-red-400',
    },
  ];

  const maxValue = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className="space-y-2 py-4">
      {stages.map((stage, index) => {
        const width = (stage.value / maxValue) * 100;
        const conversionRate =
          index > 0 && stages[index - 1].value > 0
            ? (stage.value / stages[index - 1].value) * 100
            : 100;

        return (
          <motion.div
            key={stage.name}
            className="group relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-zinc-700 dark:text-zinc-300 flex-shrink-0">
                {stage.name}
              </div>
              <div className="flex-1 relative">
                <div
                  className="h-12 rounded-lg overflow-hidden relative"
                  style={{ width: `${Math.max(width, 5)}%` }}
                >
                  <motion.div
                    className={`h-full bg-gradient-to-r ${stage.color} group-hover:scale-105 transition-transform origin-left`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.08 + 0.2, duration: 0.5 }}
                  />
                  <div className="absolute inset-0 flex items-center px-3 text-white text-sm font-semibold">
                    {stage.value.toLocaleString()}
                  </div>
                </div>
              </div>
              {index > 0 && (
                <div className="w-20 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                  {conversionRate.toFixed(1)}%
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function AnimationTypesChart({ data }: { data: Array<{ type: string; count: number }> }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-8 flex items-center justify-center text-sm text-zinc-400">
        No animation type data available
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const colors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-amber-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];

  return (
    <div className="flex items-center gap-4 h-8">
      <AnimatePresence>
        {data.map((item, index) => {
          const percentage = (item.count / total) * 100;

          return (
            <motion.div
              key={item.type}
              className={`group relative h-full ${colors[index % colors.length]} hover:opacity-80 transition-opacity rounded-sm`}
              style={{ width: `${percentage}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              exit={{ width: 0 }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
            >
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-2 rounded text-xs whitespace-nowrap pointer-events-none z-10">
                <div className="font-semibold">{item.type}</div>
                <div className="text-zinc-300 dark:text-zinc-600">
                  {item.count} ({percentage.toFixed(1)}%)
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default function AdminAnalytics({ loaderData }: Route.ComponentProps) {
  const {
    analytics,
    pagination,
    eventTypes,
    stats,
    timeRange,
    hourlyData,
    frameworkData,
    funnelStages,
    animationTypes,
    scanDurations,
  } = loaderData;
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();

  // Check if we're navigating (React Router v7 provides this)
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
              <span className="font-medium text-zinc-600 dark:text-zinc-400">{key}:</span>{' '}
              <span className="text-zinc-900 dark:text-zinc-100">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      );
    } catch {
      return <span className="text-xs text-zinc-500">{properties}</span>;
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <div>
        <Heading>Analytics Dashboard</Heading>
        <Text className="mt-1">
          Comprehensive insights into user behavior, engagement, and conversion metrics
        </Text>
      </div>

      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-2 items-center">
        {isNavigating && (
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
        )}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg p-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Text className="text-sm font-medium text-blue-100">Total Events</Text>
          <motion.p
            className="text-3xl font-bold mt-2"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {stats.range.totalEvents.toLocaleString()}
          </motion.p>
        </motion.div>
        <motion.div
          className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-lg p-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Text className="text-sm font-medium text-green-100">Active Users</Text>
          <motion.p
            className="text-3xl font-bold mt-2"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            {stats.range.uniqueUsers.toLocaleString()}
          </motion.p>
        </motion.div>
        <motion.div
          className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg p-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Text className="text-sm font-medium text-purple-100">Active Licenses</Text>
          <motion.p
            className="text-3xl font-bold mt-2"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            {stats.range.uniqueLicenses.toLocaleString()}
          </motion.p>
        </motion.div>
      </div>

      {/* Hourly Activity Chart */}
      <motion.div
        className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-6">
          Activity Over Last 24 Hours
        </h3>
        <TimeSeriesChart data={hourlyData} />
      </motion.div>

      {/* User Journey Funnel */}
      <motion.div
        className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
          User Journey Funnel
        </h3>
        <Text className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Track user progression from plugin open to purchase
        </Text>
        <FunnelChart data={funnelStages} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Framework Usage */}
        <motion.div
          className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
            Framework Preference
          </h3>
          <FrameworkChart data={frameworkData} />
        </motion.div>

        {/* Scan Performance */}
        <motion.div
          className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
            Scan Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Average Duration
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                {scanDurations.avgDuration ? `${Math.round(scanDurations.avgDuration)}ms` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Fastest Scan</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {scanDurations.minDuration ? `${Math.round(scanDurations.minDuration)}ms` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Slowest Scan</span>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                {scanDurations.maxDuration ? `${Math.round(scanDurations.maxDuration)}ms` : 'N/A'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Animation Types Distribution */}
      <motion.div
        className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
          Animation Types Detected
        </h3>
        <AnimationTypesChart data={animationTypes} />
        <div className="mt-4 flex flex-wrap gap-2">
          {animationTypes.map((item, index) => {
            const colors = [
              'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
              'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
              'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
              'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
              'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
              'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200',
              'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200',
              'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200',
            ];
            return (
              <span
                key={item.type}
                className={`px-2 py-1 rounded-md text-xs font-medium ${colors[index % colors.length]}`}
              >
                {item.type}: {item.count}
              </span>
            );
          })}
        </div>
      </motion.div>

      {/* Event Types Summary */}
      <motion.div
        className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      >
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
          Event Distribution
        </h3>
        <div className="flex flex-wrap gap-2">
          {eventTypes.slice(0, 15).map((type, index) => (
            <motion.div
              key={type.event}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.03, duration: 0.2 }}
            >
              <Link
                to={`?timeRange=${timeRange}&event=${type.event}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <Badge color={getEventColor(type.event || '')} className="text-xs">
                  {type.event}
                </Badge>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">{type.count}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
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
      </motion.div>

      {/* Events Table */}
      <motion.div
        className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.9 }}
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
                    <TableCell className="max-w-xs">{formatProperties(record.properties)}</TableCell>
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
              <Text className="text-zinc-500 dark:text-zinc-400">No analytics events found</Text>
            </div>
          )}
        </div>
      </motion.div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => {
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
            }).filter(Boolean)}
          </Pagination>
        </div>
      )}
    </div>
  );
}
