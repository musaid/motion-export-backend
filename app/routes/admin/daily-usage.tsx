import { data, useSearchParams, Form } from 'react-router';
import { dailyUsage } from '~/database/schema';
import { requireAdmin } from '~/lib/auth.server';
import { desc, sql, like } from 'drizzle-orm';
import type { Route } from './+types/daily-usage';
import { database } from '~/database/context';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';
import { Input } from '~/components/input';
import { Button } from '~/components/button';
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

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const date = url.searchParams.get('date') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 50;
  const offset = (page - 1) * limit;

  // Build query with filters
  const conditions = [];
  if (search) {
    conditions.push(like(dailyUsage.deviceId, `%${search}%`));
  }
  if (date) {
    conditions.push(like(dailyUsage.date, `${date}%`));
  }

  const whereClause =
    conditions.length > 0
      ? sql`${conditions.map((c) => sql`(${c})`).reduce((acc, curr) => sql`${acc} AND ${curr}`)}`
      : undefined;

  const usageData = await database()
    .select()
    .from(dailyUsage)
    .where(whereClause)
    .orderBy(desc(dailyUsage.createdAt))
    .limit(limit)
    .offset(offset);

  // Get total count
  const [{ count }] = await database()
    .select({ count: sql<number>`count(*)` })
    .from(dailyUsage)
    .where(whereClause);

  // Get summary stats
  const [stats] = await database()
    .select({
      totalExports: sql<number>`COALESCE(SUM(${dailyUsage.exportCount}), 0)`,
      uniqueDevices: sql<number>`COUNT(DISTINCT ${dailyUsage.deviceId})`,
      avgExportsPerDevice: sql<number>`COALESCE(AVG(${dailyUsage.exportCount}), 0)`,
    })
    .from(dailyUsage);

  // Get today's stats
  const today = new Date().toISOString().split('T')[0];
  const [todayStats] = await database()
    .select({
      todayExports: sql<number>`COALESCE(SUM(${dailyUsage.exportCount}), 0)`,
      todayDevices: sql<number>`COUNT(DISTINCT ${dailyUsage.deviceId})`,
    })
    .from(dailyUsage)
    .where(sql`${dailyUsage.date} = ${today}`);

  return data({
    usage: usageData,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
    stats: {
      ...stats,
      todayExports: todayStats?.todayExports || 0,
      todayDevices: todayStats?.todayDevices || 0,
    },
  });
}

export default function AdminDailyUsage({ loaderData }: Route.ComponentProps) {
  const { usage, pagination, stats } = loaderData;
  const [searchParams] = useSearchParams();

  return (
    <div className="space-y-8">
      <div>
        <Heading>Daily Usage Analytics</Heading>
        <Text className="mt-1">
          Track daily export usage across all devices
        </Text>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6">
          <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Total Exports
          </Text>
          <p className="text-2xl font-semibold text-zinc-900 dark:text-white mt-2">
            {stats.totalExports.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6">
          <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Unique Devices
          </Text>
          <p className="text-2xl font-semibold text-zinc-900 dark:text-white mt-2">
            {stats.uniqueDevices.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6">
          <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Today's Exports
          </Text>
          <p className="text-2xl font-semibold text-zinc-900 dark:text-white mt-2">
            {stats.todayExports.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6">
          <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Today's Active Devices
          </Text>
          <p className="text-2xl font-semibold text-zinc-900 dark:text-white mt-2">
            {stats.todayDevices.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6">
        <Form method="get" className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            name="search"
            defaultValue={searchParams.get('search') || ''}
            placeholder="Search by device ID..."
            className="flex-1 min-w-0"
          />
          <Input
            type="date"
            name="date"
            defaultValue={searchParams.get('date') || ''}
            className="sm:w-48"
          />
          <div className="flex gap-2">
            <Button type="submit">Filter</Button>
            {(searchParams.get('search') || searchParams.get('date')) && (
              <Link to="/admin/daily-usage">
                <Button type="button" outline>
                  Clear
                </Button>
              </Link>
            )}
          </div>
        </Form>
      </div>

      {/* Usage Table */}
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        <div className="p-6">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="pl-0">Device ID</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Export Count</TableHeader>
                <TableHeader className="pr-0">Created At</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {usage.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-sm pl-0">
                    {record.deviceId}
                  </TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>
                    <span
                      className={
                        record.exportCount && record.exportCount > 100
                          ? 'text-orange-600 dark:text-orange-400 font-semibold'
                          : ''
                      }
                    >
                      {record.exportCount || 0}
                    </span>
                  </TableCell>
                  <TableCell className="pr-0">
                    {record.createdAt
                      ? new Date(record.createdAt).toLocaleString()
                      : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {usage.length === 0 && (
            <div className="text-center py-8">
              <Text className="text-zinc-500 dark:text-zinc-400">
                No usage data found
              </Text>
            </div>
          )}
        </div>
      </div>

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
                    to={`?page=${pageNum}${searchParams.get('search') ? `&search=${searchParams.get('search')}` : ''}${searchParams.get('date') ? `&date=${searchParams.get('date')}` : ''}`}
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
