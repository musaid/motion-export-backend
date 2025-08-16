import { type InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
  timestamp,
  serial,
} from 'drizzle-orm/pg-core';

const timestampConfig = { mode: 'string' } as const;

export const licenses = pgTable(
  'licenses',
  {
    id: serial('id').primaryKey(),
    key: text('key').notNull(),
    email: text('email').notNull(),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSessionId: text('stripe_session_id'),
    figmaUserId: text('figma_user_id'),
    amount: real('amount'),
    currency: text('currency'),
    status: text('status').default('active'),
    purchasedAt: timestamp('purchased_at', timestampConfig).defaultNow(),
    activations: text('activations').default('[]'),
    metadata: text('metadata').default('{}'),
    createdAt: timestamp('created_at', timestampConfig).defaultNow(),
    updatedAt: timestamp('updated_at', timestampConfig).defaultNow(),
  },
  (tbl) => [
    uniqueIndex('licenses_key_idx').on(tbl.key),
    index('licenses_email_idx').on(tbl.email),
    index('licenses_stripe_customer_idx').on(tbl.stripeCustomerId),
    index('licenses_figma_user_idx').on(tbl.figmaUserId),
    index('licenses_status_idx').on(tbl.status),
    index('licenses_created_at_idx').on(tbl.createdAt),
  ],
);

export const usageAnalytics = pgTable(
  'usage_analytics',
  {
    id: serial('id').primaryKey(),
    event: text('event').notNull(),
    userId: text('user_id'),
    licenseKey: text('license_key'),
    properties: text('properties'),
    ip: text('ip'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', timestampConfig).defaultNow(),
  },
  (tbl) => [
    index('usage_analytics_event_idx').on(tbl.event),
    index('usage_analytics_user_idx').on(tbl.userId),
    index('usage_analytics_license_idx').on(tbl.licenseKey),
    index('usage_analytics_created_at_idx').on(tbl.createdAt),
  ],
);

export const dailyUsage = pgTable(
  'daily_usage',
  {
    id: serial('id').primaryKey(),
    deviceId: text('device_id').notNull(),
    date: text('date').notNull(),
    exportCount: integer('export_count').default(0),
    createdAt: timestamp('created_at', timestampConfig).defaultNow(),
  },
  (tbl) => [
    uniqueIndex('daily_usage_device_date_idx').on(tbl.deviceId, tbl.date),
    index('daily_usage_device_idx').on(tbl.deviceId),
    index('daily_usage_date_idx').on(tbl.date),
    index('daily_usage_created_at_idx').on(tbl.createdAt),
  ],
);

export const adminUsers = pgTable(
  'admin_users',
  {
    id: serial('id').primaryKey(),
    username: text('username').notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', timestampConfig).defaultNow(),
  },
  (tbl) => [uniqueIndex('admin_users_username_idx').on(tbl.username)],
);

// Types
export type License = InferSelectModel<typeof licenses>;
export type NewLicense = InferSelectModel<typeof licenses>;
export type UsageAnalytic = InferSelectModel<typeof usageAnalytics>;
export type DailyUsage = InferSelectModel<typeof dailyUsage>;
