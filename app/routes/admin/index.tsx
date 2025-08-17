import { Link } from 'react-router';
import type { Route } from './+types/index';
import { requireAdmin } from '~/lib/auth.server';
import { database } from '~/database/context';
import { licenses, usageAnalytics } from '~/database/schema';
import { desc, sql, gte } from 'drizzle-orm';

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Dashboard
        </h1>
        <Link
          to="/admin/licenses"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Manage Licenses
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Total Licenses
          </div>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            {licenseStats.total}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Active Licenses
          </div>
          <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
            {licenseStats.active}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Total Revenue
          </div>
          <div className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            ${licenseStats.revenue.toFixed(2)}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Active Users (30d)
          </div>
          <div className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
            {usageStats.uniqueUsers}
          </div>
        </div>
      </div>

      {/* Recent Licenses */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Recent Licenses
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  License Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {recentLicenses.map((license) => (
                <tr key={license.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-zinc-900 dark:text-white">
                    {license.key}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                    {license.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-white">
                    ${license.amount?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        license.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {license.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                    {license.purchasedAt
                      ? new Date(license.purchasedAt).toLocaleDateString()
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Usage Analytics (Last 30 Days)
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Total Events
            </div>
            <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              {usageStats.totalEvents.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Avg Events per User
            </div>
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