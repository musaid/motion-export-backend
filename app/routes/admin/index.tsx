import type { Route } from './+types/index';
import { requireAdmin } from '~/lib/auth.server';
import { database } from '~/database/context';
import { licenses, analytics, usage } from '~/database/schema';
import { desc, sql, gte, eq } from 'drizzle-orm';
import { Heading } from '~/components/heading';
import { Text } from '~/components/text';
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
import { Link } from 'react-router';
import { formatDateOnly } from '~/lib/format';
import {
  BRAND,
  Section,
  StatCard,
  CategoryBars,
} from '~/components/admin-charts';

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);

  // Date calculations
  const now = new Date();
  const today = now.toISOString().split('T')[0];
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
      devices: sql<number>`count(distinct figma_user_id)`,
    })
    .from(usage)
    .where(
      gte(
        usage.createdAt,
        new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      ),
    );

  const [yesterdayUsage] = await database()
    .select({
      exports: sql<number>`count(*)`,
    })
    .from(usage)
    .where(
      sql`${usage.createdAt} >= ${new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()} AND ${usage.createdAt} < ${new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()}`,
    );

  // Free-pool stats (folded-in Usage page). The `usage` table tracks per-user
  // lifetime free exports: `export_count` is the CODE pool (max 5),
  // `media_export_count` is the MEDIA pool (max 2). One row per distinct
  // figma_user_id, so counting rows counts free users.
  const [freePool] = await database()
    .select({
      freeUsers: sql<number>`count(*)`,
      totalCodeExports: sql<number>`COALESCE(SUM(${usage.exportCount}), 0)`,
      totalMediaExports: sql<number>`COALESCE(SUM(${usage.mediaExportCount}), 0)`,
      codeExhausted: sql<number>`count(*) filter (where ${usage.exportCount} >= 5)`,
      mediaExhausted: sql<number>`count(*) filter (where ${usage.mediaExportCount} >= 2)`,
    })
    .from(usage);

  // Get recent licenses with more details
  const recentLicenses = await database()
    .select()
    .from(licenses)
    .orderBy(desc(licenses.purchasedAt))
    .limit(10);

  // Get usage stats with event breakdown
  const eventBreakdown = await database()
    .select({
      event: analytics.event,
      count: sql<number>`count(*)`,
    })
    .from(analytics)
    .where(gte(analytics.createdAt, sevenDaysAgo.toISOString()))
    .groupBy(analytics.event)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  // Get hourly activity for today
  const hourlyActivity = await database()
    .select({
      hour: sql<number>`EXTRACT(HOUR FROM created_at::timestamp)`,
      count: sql<number>`count(*)`,
    })
    .from(analytics)
    .where(gte(analytics.createdAt, new Date(today).toISOString()))
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
      freePool: {
        freeUsers: Number(freePool?.freeUsers || 0),
        totalCodeExports: Number(freePool?.totalCodeExports || 0),
        totalMediaExports: Number(freePool?.totalMediaExports || 0),
        codeExhausted: Number(freePool?.codeExhausted || 0),
        mediaExhausted: Number(freePool?.mediaExhausted || 0),
      },
    },
    recentLicenses,
    eventBreakdown,
    hourlyActivity: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: Number(hourlyActivity.find((h) => h.hour === hour)?.count || 0),
    })),
  };
}

export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { stats, recentLicenses, eventBreakdown, hourlyActivity } = loaderData;
  const { licenses: lic, usage: use, freePool } = stats;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Exhaustion rates — guard against a 0-user divide.
  const codeExhaustionRate =
    freePool.freeUsers > 0
      ? Math.round((freePool.codeExhausted / freePool.freeUsers) * 100)
      : 0;
  const mediaExhaustionRate =
    freePool.freeUsers > 0
      ? Math.round((freePool.mediaExhausted / freePool.freeUsers) * 100)
      : 0;

  // Today's activity as {name, count} for CategoryBars (24 hourly buckets).
  const hourlyData = hourlyActivity.map((h) => ({
    name: `${String(h.hour).padStart(2, '0')}`,
    count: h.count,
  }));

  // Top events (7d) as {name, count}.
  const eventData = eventBreakdown.map((e) => ({
    name: e.event || 'unknown',
    count: Number(e.count),
  }));

  const growthArrow =
    use.exportGrowth > 0 ? '↑' : use.exportGrowth < 0 ? '↓' : '→';

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Heading>Dashboard Overview</Heading>
          <Text className="mt-1">
            Business at a glance — licenses, revenue, and the free pool.
          </Text>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/licenses">
            <Button outline>View Licenses</Button>
          </Link>
          <Link to="/admin/analytics">
            <Button>Analytics</Button>
          </Link>
        </div>
      </div>

      {/* 1. KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label={`Active Licenses (of ${lic.total.toLocaleString()})`}
          value={lic.active.toLocaleString()}
          series={[]}
          color="#86efac"
          delay={0}
        />
        <StatCard
          label={`Revenue (mo ${formatCurrency(lic.monthlyRevenue)})`}
          value={formatCurrency(lic.revenue)}
          series={[]}
          color="#fcd34d"
          delay={0.05}
        />
        <StatCard
          label="Activation Rate"
          value={`${lic.activationRate}%`}
          series={[]}
          color="#7dd3fc"
          delay={0.1}
        />
        <StatCard
          label="New This Week"
          value={lic.weeklyNew.toLocaleString()}
          series={[]}
          color="#c4b5fd"
          delay={0.15}
        />
        <StatCard
          label={`Today's Exports (${growthArrow}${Math.abs(use.exportGrowth)}%)`}
          value={use.todayExports.toLocaleString()}
          series={[]}
          color={BRAND}
          delay={0.2}
        />
        <StatCard
          label="Free Users"
          value={freePool.freeUsers.toLocaleString()}
          series={[]}
          color="#5eead4"
          delay={0.25}
        />
      </div>

      {/* 2. Free Pool */}
      <Section
        title="Free Pool"
        caption="Lifetime free exports per user. Code pool caps at 5, media pool caps at 2. Exhaustion = users who hit the cap (upgrade pressure)."
        delay={0.3}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <PoolMeter
            label="Code exports"
            cap={5}
            total={freePool.totalCodeExports}
            exhausted={freePool.codeExhausted}
            rate={codeExhaustionRate}
            freeUsers={freePool.freeUsers}
            color="#86efac"
          />
          <PoolMeter
            label="Media exports"
            cap={2}
            total={freePool.totalMediaExports}
            exhausted={freePool.mediaExhausted}
            rate={mediaExhaustionRate}
            freeUsers={freePool.freeUsers}
            color={BRAND}
          />
        </div>
      </Section>

      {/* 3. Activity today */}
      <Section
        title="Activity Today"
        caption="Events per hour (UTC) across today."
        delay={0.35}
      >
        <CategoryBars data={hourlyData} color="#7dd3fc" height={220} />
      </Section>

      {/* 4. Top events (7d) */}
      <Section
        title="Top Events (7 days)"
        caption="Most frequent tracked events over the last 7 days."
        delay={0.4}
      >
        <CategoryBars data={eventData} color={BRAND} height={220} />
      </Section>

      {/* 5. Recent licenses */}
      <Section
        title="Recent Licenses"
        caption="The 10 most recent purchases."
        delay={0.45}
      >
        {recentLicenses.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="pl-0">Email</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="pr-0">Purchased</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentLicenses.map((license) => (
                <TableRow key={license.id}>
                  <TableCell className="pl-0">
                    <span className="text-zinc-900 dark:text-white">
                      {license.email}
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatCurrency(license.amount || 0)}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="pr-0 text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDateOnly(license.purchasedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <Text className="text-zinc-500 dark:text-zinc-400">
              No licenses yet
            </Text>
          </div>
        )}
      </Section>
    </div>
  );
}

// Paired free-pool meter: total used + how many users hit the cap.
function PoolMeter({
  label,
  cap,
  total,
  exhausted,
  rate,
  freeUsers,
  color,
}: {
  label: string;
  cap: number;
  total: number;
  exhausted: number;
  rate: number;
  freeUsers: number;
  color: string;
}) {
  return (
    <div className="rounded-lg ring-1 ring-zinc-950/5 dark:ring-white/10 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          cap {cap}
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">
          {total.toLocaleString()}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          total exports used
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          <span>
            {exhausted.toLocaleString()} of {freeUsers.toLocaleString()} exhausted
          </span>
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">
            {rate}%
          </span>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full"
            style={{ width: `${Math.min(100, rate)}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}
