import type { Route } from './+types/index';
import { requireAdmin } from '~/lib/auth.server';
import { database } from '~/database/context';
import { licenses, usageAnalytics, usage } from '~/database/schema';
import { desc, sql, gte, eq } from 'drizzle-orm';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';
import { Button } from '~/components/button';
import { Badge } from '~/components/badge';
import { Link } from 'react-router';

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);

  // Date calculations
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get license stats with comparison
  const [licenseStats] = await database()
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where status = 'active')`,
      revenue: sql<number>`COALESCE(sum(amount) filter (where status = 'active'), 0)`,
      monthlyRevenue: sql<number>`COALESCE(sum(amount) filter (where status = 'active' and purchased_at >= ${thirtyDaysAgo.toISOString()}), 0)`,
      weeklyLicenses: sql<number>`count(*) filter (where purchased_at >= ${sevenDaysAgo.toISOString()})`,
    })
    .from(licenses);

  // Get lifetime usage stats (last 24h for comparison)
  const [todayUsage] = await database()
    .select({
      exports: sql<number>`count(*)`,
      devices: sql<number>`count(distinct device_id)`,
    })
    .from(usage)
    .where(gte(usage.createdAt, new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()));

  const [yesterdayUsage] = await database()
    .select({
      exports: sql<number>`count(*)`,
    })
    .from(usage)
    .where(sql`${usage.createdAt} >= ${new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()} AND ${usage.createdAt} < ${new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()}`);

  // Get recent licenses with more details
  const recentLicenses = await database()
    .select()
    .from(licenses)
    .orderBy(desc(licenses.purchasedAt))
    .limit(10);

  // Get usage stats with event breakdown
  const eventBreakdown = await database()
    .select({
      event: usageAnalytics.event,
      count: sql<number>`count(*)`,
    })
    .from(usageAnalytics)
    .where(gte(usageAnalytics.createdAt, sevenDaysAgo.toISOString()))
    .groupBy(usageAnalytics.event)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  // Get hourly activity for today
  const hourlyActivity = await database()
    .select({
      hour: sql<number>`EXTRACT(HOUR FROM created_at::timestamp)`,
      count: sql<number>`count(*)`,
    })
    .from(usageAnalytics)
    .where(gte(usageAnalytics.createdAt, new Date(today).toISOString()))
    .groupBy(sql`EXTRACT(HOUR FROM created_at::timestamp)`)
    .orderBy(sql`EXTRACT(HOUR FROM created_at::timestamp)`);

  // Get activation rate
  const [activationStats] = await database()
    .select({
      activated: sql<number>`count(*) filter (where activations != '[]')`,
      total: sql<number>`count(*)`,
    })
    .from(licenses)
    .where(eq(licenses.status, 'active'));

  const activationRate =
    activationStats?.total > 0
      ? Math.round((activationStats.activated / activationStats.total) * 100)
      : 0;

  // Calculate growth percentages
  const exportGrowth =
    yesterdayUsage?.exports > 0
      ? Math.round(
          (((todayUsage?.exports || 0) - yesterdayUsage.exports) /
            yesterdayUsage.exports) *
            100,
        )
      : 0;

  return {
    stats: {
      licenses: {
        total: Number(licenseStats?.total || 0),
        active: Number(licenseStats?.active || 0),
        revenue: Number(licenseStats?.revenue || 0),
        monthlyRevenue: Number(licenseStats?.monthlyRevenue || 0),
        weeklyNew: Number(licenseStats?.weeklyLicenses || 0),
        activationRate,
      },
      usage: {
        todayExports: Number(todayUsage?.exports || 0),
        todayDevices: Number(todayUsage?.devices || 0),
        exportGrowth,
      },
    },
    recentLicenses,
    eventBreakdown,
    hourlyActivity: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourlyActivity.find((h) => h.hour === hour)?.count || 0,
    })),
  };
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { stats, recentLicenses, eventBreakdown, hourlyActivity } = loaderData;

  // Find peak hour
  const peakHour = hourlyActivity.reduce(
    (max, curr) => (curr.count > max.count ? curr : max),
    hourlyActivity[0],
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getEventIcon = (event: string) => {
    if (event.includes('export')) return '📤';
    if (event.includes('activate') || event.includes('verify')) return '✅';
    if (event.includes('error') || event.includes('fail')) return '❌';
    if (event.includes('start') || event.includes('init')) return '🚀';
    return '📊';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Heading>Dashboard Overview</Heading>
          <Text className="mt-1 text-zinc-600 dark:text-zinc-400">
            Welcome back! Here's what's happening with Motion Export.
          </Text>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/licenses">
            <Button outline>View All Licenses</Button>
          </Link>
          <Link to="/admin/licenses">
            <Button>Create License</Button>
          </Link>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start justify-between">
            <div>
              <Text className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Active Licenses
              </Text>
              <div className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-100">
                {stats.licenses.active}
              </div>
              <div className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                of {stats.licenses.total} total
              </div>
            </div>
            <div className="text-2xl">📊</div>
          </div>
          <div className="mt-4 text-xs text-blue-700 dark:text-blue-300">
            {stats.licenses.activationRate}% activation rate
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-start justify-between">
            <div>
              <Text className="text-sm font-medium text-green-700 dark:text-green-300">
                Monthly Revenue
              </Text>
              <div className="mt-2 text-3xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(stats.licenses.monthlyRevenue)}
              </div>
              <div className="mt-1 text-sm text-green-600 dark:text-green-400">
                Total: {formatCurrency(stats.licenses.revenue)}
              </div>
            </div>
            <div className="text-2xl">💰</div>
          </div>
          <div className="mt-4 text-xs text-green-700 dark:text-green-300">
            {stats.licenses.weeklyNew} new this week
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start justify-between">
            <div>
              <Text className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Today's Exports
              </Text>
              <div className="mt-2 text-3xl font-bold text-purple-900 dark:text-purple-100">
                {stats.usage.todayExports.toLocaleString()}
              </div>
              <div className="mt-1 text-sm text-purple-600 dark:text-purple-400">
                {stats.usage.todayDevices} active devices
              </div>
            </div>
            <div className="text-2xl">📤</div>
          </div>
          <div className="mt-4 text-xs">
            <span
              className={`font-medium ${
                stats.usage.exportGrowth > 0
                  ? 'text-green-700 dark:text-green-300'
                  : stats.usage.exportGrowth < 0
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-purple-700 dark:text-purple-300'
              }`}
            >
              {stats.usage.exportGrowth > 0
                ? '↑'
                : stats.usage.exportGrowth < 0
                  ? '↓'
                  : '→'}{' '}
              {Math.abs(stats.usage.exportGrowth)}% vs yesterday
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-6 border border-amber-200 dark:border-amber-800">
          <div className="flex items-start justify-between">
            <div>
              <Text className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Peak Activity
              </Text>
              <div className="mt-2 text-3xl font-bold text-amber-900 dark:text-amber-100">
                {peakHour.hour}:00
              </div>
              <div className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                {peakHour.count} events
              </div>
            </div>
            <div className="text-2xl">⏰</div>
          </div>
          <div className="mt-4 text-xs text-amber-700 dark:text-amber-300">
            Most active hour today
          </div>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Recent Licenses
              </h2>
              <Link
                to="/admin/licenses"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {recentLicenses.slice(0, 5).map((license) => (
              <div
                key={license.id}
                className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {license.email}
                      </span>
                      <Badge
                        color={
                          license.status === 'active'
                            ? 'green'
                            : license.status === 'revoked'
                              ? 'red'
                              : 'zinc'
                        }
                        className="text-xs"
                      >
                        {license.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="font-mono text-xs">
                        {license.key.substring(0, 16)}...
                      </span>
                      {license.figmaUserId && (
                        <span className="text-xs">
                          Figma: {license.figmaUserId}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-zinc-900 dark:text-white">
                      {formatCurrency(license.amount || 0)}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {license.purchasedAt
                        ? new Date(license.purchasedAt).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Breakdown */}
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Top Events (7 days)
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {eventBreakdown.map((event, index) => (
              <div
                key={event.event}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {getEventIcon(event.event || '')}
                  </span>
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-white text-sm">
                      {event.event}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {event.count.toLocaleString()} events
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        index === 0
                          ? 'bg-blue-500'
                          : index === 1
                            ? 'bg-green-500'
                            : index === 2
                              ? 'bg-purple-500'
                              : index === 3
                                ? 'bg-amber-500'
                                : 'bg-zinc-400'
                      }`}
                      style={{
                        width: `${Math.min(100, (event.count / eventBreakdown[0].count) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 p-6 border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/licenses" className="group">
            <div className="p-4 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                Create License
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Issue a new license manually
              </div>
            </div>
          </Link>

          <Link to="/admin/daily-usage" className="group">
            <div className="p-4 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-green-300 dark:hover:border-green-700 transition-all hover:shadow-md">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-zinc-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
                Daily Usage
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                View export statistics
              </div>
            </div>
          </Link>

          <Link to="/admin/usage-analytics" className="group">
            <div className="p-4 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-md">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-medium text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                Event Analytics
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Track user interactions
              </div>
            </div>
          </Link>

          <a
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="p-4 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-amber-300 dark:hover:border-amber-700 transition-all hover:shadow-md">
              <div className="text-2xl mb-2">💳</div>
              <div className="font-medium text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                Stripe Dashboard
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Manage payments
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
