import { type InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

const timestampConfig = { mode: 'string' } as const;

export const licenses = pgTable(
  'licenses',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    key: text('key').notNull(), // Hashed for validation
    encryptedKey: text('encrypted_key'), // Encrypted for recovery (AES-256-GCM)
    email: text('email').notNull(),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSessionId: text('stripe_session_id'),
    figmaUserId: text('figma_user_id'),
    amount: real('amount'),
    currency: text('currency'),
    status: text('status').default('active'),
    purchasedAt: timestamp('purchased_at', timestampConfig).defaultNow(),
    activations: text('activations').default('[]'), // JSON: [{figmaUserId, activatedAt, lastChecked}]
    recoveryCodes: text('recovery_codes').default('[]'), // JSON: [{code: hashed, createdAt}]
    recoveryCodesUsed: text('recovery_codes_used').default('[]'), // JSON: [{code: hashed, usedAt}]
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

export const analytics = pgTable(
  'analytics',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    event: text('event').notNull(),
    userId: text('user_id'),
    licenseKey: text('license_key'),
    properties: text('properties'),
    ip: text('ip'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', timestampConfig).defaultNow(),
  },
  (tbl) => [
    index('analytics_event_idx').on(tbl.event),
    index('analytics_user_idx').on(tbl.userId),
    index('analytics_license_idx').on(tbl.licenseKey),
    index('analytics_created_at_idx').on(tbl.createdAt),
  ],
);

// Usage tracking - lifetime exports for free tier (5 max, never resets)
export const usage = pgTable(
  'usage',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    figmaUserId: text('figma_user_id').notNull(), // Figma user ID (not device-based)
    exportCount: integer('export_count').default(0),
    createdAt: timestamp('created_at', timestampConfig).defaultNow(),
    updatedAt: timestamp('updated_at', timestampConfig).defaultNow(),
  },
  (tbl) => [
    uniqueIndex('usage_figma_user_idx').on(tbl.figmaUserId),
    index('usage_created_at_idx').on(tbl.createdAt),
  ],
);

export const admins = pgTable(
  'admins',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    username: text('username').notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', timestampConfig).defaultNow(),
  },
  (tbl) => [uniqueIndex('admins_username_idx').on(tbl.username)],
);

// Types
export type License = InferSelectModel<typeof licenses>;
export type NewLicense = InferSelectModel<typeof licenses>;
export type Analytic = InferSelectModel<typeof analytics>;
export type Usage = InferSelectModel<typeof usage>;
export type Admin = InferSelectModel<typeof admins>;
