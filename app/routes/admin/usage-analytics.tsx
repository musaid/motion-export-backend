import { data, useSearchParams, Form } from 'react-router';
import { analytics } from '~/database/schema';
import { requireAdmin } from '~/lib/auth.server';
import { desc, sql, like, eq } from 'drizzle-orm';
import type { Route } from './+types/usage-analytics';
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

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const url = new URL(request.url);
  const event = url.searchParams.get('event') || '';
  const userId = url.searchParams.get('userId') || '';
  const licenseKey = url.searchParams.get('licenseKey') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 50;
  const offset = (page - 1) * limit;

  // Build query with filters
  const conditions = [];
  if (event) {
    conditions.push(eq(analytics.event, event));
  }
  if (userId) {
    conditions.push(like(analytics.userId, `%${userId}%`));
  }
  if (licenseKey) {
    conditions.push(like(analytics.licenseKey, `%${licenseKey}%`));
  }

  const whereClause =
    conditions.length > 0
      ? sql`${conditions.map((c) => sql`(${c})`).reduce((acc, curr) => sql`${acc} AND ${curr}`)}`
      : undefined;

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

  // Get event types
  const eventTypes = await database()
    .select({
      event: analytics.event,
      count: sql<number>`count(*)`,
    })
    .from(analytics)
    .groupBy(analytics.event)
    .orderBy(desc(sql`count(*)`));

  // Get stats for last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [last24hStats] = await database()
    .select({
      totalEvents: sql<number>`count(*)`,
      uniqueUsers: sql<number>`COUNT(DISTINCT ${analytics.userId})`,
      uniqueLicenses: sql<number>`COUNT(DISTINCT ${analytics.licenseKey})`,
    })
    .from(analytics)
    .where(sql`${analytics.createdAt} >= ${oneDayAgo}`);

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
      last24h: last24hStats || {
        totalEvents: 0,
        uniqueUsers: 0,
        uniqueLicenses: 0,
      },
    },
  });
}

export default function AdminUsageAnalytics({
  loaderData,
}: Route.ComponentProps) {
  const { analytics, pagination, eventTypes, stats } = loaderData;
  const [searchParams] = useSearchParams();

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

  return (
    <div className="space-y-8">
      <div>
        <Heading>Usage Analytics Events</Heading>
        <Text className="mt-1">
          Track all plugin events and user interactions
        </Text>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6">
          <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Events (Last 24h)
          </Text>
          <p className="text-2xl font-semibold text-zinc-900 dark:text-white mt-2">
            {stats.last24h.totalEvents.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6">
          <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Active Users (Last 24h)
          </Text>
          <p className="text-2xl font-semibold text-zinc-900 dark:text-white mt-2">
            {stats.last24h.uniqueUsers.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6">
          <Text className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Active Licenses (Last 24h)
          </Text>
          <p className="text-2xl font-semibold text-zinc-900 dark:text-white mt-2">
            {stats.last24h.uniqueLicenses.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Event Types Summary */}
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
          Event Distribution
        </h3>
        <div className="flex flex-wrap gap-2">
          {eventTypes.slice(0, 10).map((type) => (
            <Link
              key={type.event}
              to={`?event=${type.event}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Badge
                color={getEventColor(type.event || '')}
                className="text-xs"
              >
                {type.event}
              </Badge>
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {type.count}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6">
        <Form method="get" className="flex flex-col lg:flex-row gap-4">
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
              <Link to="/admin/usage-analytics">
                <Button type="button" outline>
                  Clear
                </Button>
              </Link>
            )}
          </div>
        </Form>
      </div>

      {/* Events Table */}
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
        <div className="p-6">
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
              {analytics.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="pl-0">
                    <Badge
                      color={getEventColor(record.event)}
                      className="text-xs"
                    >
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
                    {record.createdAt
                      ? new Date(record.createdAt).toLocaleString()
                      : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
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
                    to={`?page=${pageNum}${searchParams.get('event') ? `&event=${searchParams.get('event')}` : ''}${searchParams.get('userId') ? `&userId=${searchParams.get('userId')}` : ''}${searchParams.get('licenseKey') ? `&licenseKey=${searchParams.get('licenseKey')}` : ''}`}
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
