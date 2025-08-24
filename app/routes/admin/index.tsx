import type { Route } from './+types/index';
import { requireAdmin } from '~/lib/auth.server';
import { database } from '~/database/context';
import { licenses, usageAnalytics } from '~/database/schema';
import { desc, sql, gte } from 'drizzle-orm';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';
import { Button } from '~/components/button';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from '~/components/table';
import { Badge } from '~/components/badge';

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);

  // Get stats for dashboard
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get license stats
  const [licenseStats] = await database()
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where status = 'active')`,
      revenue: sql<number>`sum(amount) filter (where status = 'active')`,
    })
    .from(licenses);

  // Get recent licenses
  const recentLicenses = await database()
    .select()
    .from(licenses)
    .orderBy(desc(licenses.purchasedAt))
    .limit(5);

  // Get usage stats for last 30 days
  const [usageStats] = await database()
    .select({
      totalEvents: sql<number>`count(*)`,
      uniqueUsers: sql<number>`count(distinct user_id)`,
    })
    .from(usageAnalytics)
    .where(gte(usageAnalytics.createdAt, thirtyDaysAgo.toISOString()));

  return {
    licenseStats: {
      total: Number(licenseStats?.total || 0),
      active: Number(licenseStats?.active || 0),
      revenue: Number(licenseStats?.revenue || 0),
    },
    recentLicenses,
    usageStats: {
      totalEvents: Number(usageStats?.totalEvents || 0),
      uniqueUsers: Number(usageStats?.uniqueUsers || 0),
    },
  };
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { licenseStats, recentLicenses, usageStats } = loaderData;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Heading>Dashboard</Heading>
          <Text className="mt-1">
            Monitor your licenses and usage analytics
          </Text>
        </div>
        <Button href="/admin/licenses">Manage Licenses</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <Text className="text-sm font-medium">Total Licenses</Text>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            {licenseStats.total}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <Text className="text-sm font-medium">Active Licenses</Text>
          <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            {licenseStats.active}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <Text className="text-sm font-medium">Total Revenue</Text>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            ${licenseStats.revenue.toFixed(2)}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <Text className="text-sm font-medium">Active Users (30d)</Text>
          <div className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
            {usageStats.uniqueUsers}
          </div>
        </div>
      </div>

      {/* Recent Licenses */}
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Recent Licenses
          </h2>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>License Key</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Date</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentLicenses.map((license) => (
              <TableRow key={license.id}>
                <TableCell className="font-mono text-sm">
                  {license.key}
                </TableCell>
                <TableCell>{license.email}</TableCell>
                <TableCell>${license.amount?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>
                  <Badge color={license.status === 'active' ? 'green' : 'zinc'}>
                    {license.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {license.purchasedAt
                    ? new Date(license.purchasedAt).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Usage Stats */}
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Usage Analytics (Last 30 Days)
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Text className="text-sm font-medium">Total Events</Text>
            <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              {usageStats.totalEvents.toLocaleString()}
            </div>
          </div>
          <div>
            <Text className="text-sm font-medium">Avg Events per User</Text>
            <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              {usageStats.uniqueUsers > 0
                ? Math.round(usageStats.totalEvents / usageStats.uniqueUsers)
                : 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
