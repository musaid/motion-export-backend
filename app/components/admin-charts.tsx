// ---------------------------------------------------------------------------
// Shared admin chart components. Extracted from analytics.tsx so the dashboard
// and analytics pages render the same clean zinc/Catalyst-style charts.
//
// These are client components (recharts + motion/react). NOTE: recharts
// ResponsiveContainers keep their explicit px `height` + `minWidth={0}` — a
// deliberate fix; do NOT reintroduce height="100%".
// ---------------------------------------------------------------------------
import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

// Plum (#eba3ed) is the brand accent; the rest are muted complements.
export const BRAND = '#eba3ed';
export const PALETTE = [
  '#eba3ed',
  '#7dd3fc',
  '#86efac',
  '#fcd34d',
  '#fca5a5',
  '#c4b5fd',
  '#5eead4',
  '#f9a8d4',
];

// Small reusable wrapper matching the existing section styling.
export function Section({
  title,
  caption,
  delay = 0,
  children,
}: {
  title: string;
  caption?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      {caption ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-4">
          {caption}
        </p>
      ) : (
        <div className="mb-4" />
      )}
      {children}
    </motion.div>
  );
}

// KPI stat card with an inline sparkline.
export function StatCard({
  label,
  value,
  series,
  color,
  delay,
}: {
  label: string;
  value: string;
  series: number[];
  color: string;
  delay: number;
}) {
  const data = series.map((v, i) => ({ i, v }));
  return (
    <motion.div
      className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white tabular-nums">
        {value}
      </p>
      <div className="h-8 mt-2">
        {data.length > 1 ? (
          <ResponsiveContainer width="100%" minWidth={0} height={32}>
            <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full" />
        )}
      </div>
    </motion.div>
  );
}

// Generic tooltip for pie / bar charts keyed on {name, count}.
export function CountTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: any[];
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const pct = total > 0 ? ((p.count / total) * 100).toFixed(1) : '0';
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 shadow-lg">
      <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
        {p.name}
      </div>
      <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
        {p.count.toLocaleString()} ({pct}%)
      </div>
    </div>
  );
}

// Donut with legend for {name, count} data + a color resolver.
export function Donut({
  data,
  colorFor,
}: {
  data: Array<{ name: string; count: number }>;
  colorFor: (name: string, index: number) => string;
}) {
  if (!data.length) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-zinc-400">
        No data available
      </div>
    );
  }
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="w-full sm:w-1/2 h-56">
        <ResponsiveContainer width="100%" minWidth={0} height={224}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="count"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colorFor(entry.name, index)} />
              ))}
            </Pie>
            <Tooltip content={<CountTooltip total={total} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full sm:w-1/2 space-y-2">
        {data.map((entry, index) => {
          const pct = total > 0 ? ((entry.count / total) * 100).toFixed(1) : '0';
          return (
            <div key={entry.name} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: colorFor(entry.name, index) }}
              />
              <span className="text-zinc-700 dark:text-zinc-300 flex-1 truncate">
                {entry.name}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400 tabular-nums">
                {entry.count.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 w-12 text-right tabular-nums">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Horizontal-ish bar chart for {name, count} categorical data.
export function CategoryBars({
  data,
  color = BRAND,
  height = 240,
}: {
  data: Array<{ name: string; count: number }>;
  color?: string;
  height?: number;
}) {
  if (!data.length) {
    return (
      <div className="h-24 flex items-center justify-center text-sm text-zinc-400">
        No data available
      </div>
    );
  }
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <ResponsiveContainer width="100%" minWidth={0} height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgb(228 228 231)"
          opacity={0.3}
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fill: 'rgb(113 113 122)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          tick={{ fill: 'rgb(113 113 122)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={36}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(161,161,170,0.1)' }}
          content={<CountTooltip total={total} />}
        />
        <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} maxBarSize={64} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Stacked activity chart — scans / code exports / media exports over time.
export function ActivityChart({
  data,
}: {
  data: Array<{
    period: string;
    scans: number;
    codeExports: number;
    mediaExports: number;
  }>;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-sm text-zinc-400">
        No data available
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" minWidth={0} height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="a-scans" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="a-code" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#86efac" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#86efac" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="a-media" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={BRAND} stopOpacity={0.5} />
            <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgb(228 228 231)"
          opacity={0.3}
          vertical={false}
        />
        <XAxis
          dataKey="period"
          tick={{ fill: 'rgb(113 113 122)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: 'rgb(113 113 122)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={40}
          allowDecimals={false}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 shadow-lg">
                <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  {payload[0].payload.period}
                </div>
                {payload.map((entry: any) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {entry.name}:
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {entry.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="scans"
          stackId="1"
          stroke="#7dd3fc"
          strokeWidth={1.5}
          fill="url(#a-scans)"
          name="Scans"
        />
        <Area
          type="monotone"
          dataKey="codeExports"
          stackId="1"
          stroke="#86efac"
          strokeWidth={1.5}
          fill="url(#a-code)"
          name="Code exports"
        />
        <Area
          type="monotone"
          dataKey="mediaExports"
          stackId="1"
          stroke={BRAND}
          strokeWidth={1.5}
          fill="url(#a-media)"
          name="Media exports"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
