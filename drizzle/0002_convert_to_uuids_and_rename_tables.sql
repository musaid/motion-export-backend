-- Migration: Convert serial IDs to UUIDs and rename tables
-- This migration:
-- 1. Renames admin_users to admins
-- 2. Renames usage_analytics to analytics
-- 3. Converts all serial integer IDs to UUIDs

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. RENAME TABLES
-- ============================================================================

ALTER TABLE "admin_users" RENAME TO "admins";
ALTER TABLE "usage_analytics" RENAME TO "analytics";

-- ============================================================================
-- 2. UPDATE INDEXES FOR RENAMED TABLES
-- ============================================================================

-- Update admin_users indexes
DROP INDEX IF EXISTS "admin_users_username_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "admins_username_idx" ON "admins" ("username");

-- Update usage_analytics indexes
DROP INDEX IF EXISTS "usage_analytics_event_idx";
DROP INDEX IF EXISTS "usage_analytics_user_idx";
DROP INDEX IF EXISTS "usage_analytics_license_idx";
DROP INDEX IF EXISTS "usage_analytics_created_at_idx";

CREATE INDEX IF NOT EXISTS "analytics_event_idx" ON "analytics" ("event");
CREATE INDEX IF NOT EXISTS "analytics_user_idx" ON "analytics" ("user_id");
CREATE INDEX IF NOT EXISTS "analytics_license_idx" ON "analytics" ("license_key");
CREATE INDEX IF NOT EXISTS "analytics_created_at_idx" ON "analytics" ("created_at");

-- ============================================================================
-- 3. CONVERT licenses TABLE TO UUID
-- ============================================================================

-- Add new UUID column
ALTER TABLE "licenses" ADD COLUMN "id_new" uuid DEFAULT uuid_generate_v4();

-- Update all rows to have UUIDs
UPDATE "licenses" SET "id_new" = uuid_generate_v4();

-- Make new column NOT NULL
ALTER TABLE "licenses" ALTER COLUMN "id_new" SET NOT NULL;

-- Drop old primary key
ALTER TABLE "licenses" DROP CONSTRAINT "licenses_pkey";

-- Drop old id column
ALTER TABLE "licenses" DROP COLUMN "id";

-- Rename new column to id
ALTER TABLE "licenses" RENAME COLUMN "id_new" TO "id";

-- Add new primary key
ALTER TABLE "licenses" ADD PRIMARY KEY ("id");

-- ============================================================================
-- 4. CONVERT analytics TABLE TO UUID
-- ============================================================================

ALTER TABLE "analytics" ADD COLUMN "id_new" uuid DEFAULT uuid_generate_v4();
UPDATE "analytics" SET "id_new" = uuid_generate_v4();
ALTER TABLE "analytics" ALTER COLUMN "id_new" SET NOT NULL;
ALTER TABLE "analytics" DROP CONSTRAINT "usage_analytics_pkey";
ALTER TABLE "analytics" DROP COLUMN "id";
ALTER TABLE "analytics" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "analytics" ADD PRIMARY KEY ("id");

-- ============================================================================
-- 5. CONVERT usage TABLE TO UUID
-- ============================================================================

ALTER TABLE "usage" ADD COLUMN "id_new" uuid DEFAULT uuid_generate_v4();
UPDATE "usage" SET "id_new" = uuid_generate_v4();
ALTER TABLE "usage" ALTER COLUMN "id_new" SET NOT NULL;
ALTER TABLE "usage" DROP CONSTRAINT "usage_pkey";
ALTER TABLE "usage" DROP COLUMN "id";
ALTER TABLE "usage" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "usage" ADD PRIMARY KEY ("id");

-- ============================================================================
-- 6. CONVERT admins TABLE TO UUID
-- ============================================================================

ALTER TABLE "admins" ADD COLUMN "id_new" uuid DEFAULT uuid_generate_v4();
UPDATE "admins" SET "id_new" = uuid_generate_v4();
ALTER TABLE "admins" ALTER COLUMN "id_new" SET NOT NULL;
ALTER TABLE "admins" DROP CONSTRAINT "admin_users_pkey";
ALTER TABLE "admins" DROP COLUMN "id";
ALTER TABLE "admins" RENAME COLUMN "id_new" TO "id";
ALTER TABLE "admins" ADD PRIMARY KEY ("id");
