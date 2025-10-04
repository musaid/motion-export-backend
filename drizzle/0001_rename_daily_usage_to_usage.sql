-- Migration: Rename daily_usage to usage and convert to lifetime tracking
-- This removes daily reset functionality and implements 5 lifetime exports for free tier

-- Rename table
ALTER TABLE "daily_usage" RENAME TO "usage";

-- Drop date column (no longer needed for lifetime tracking)
ALTER TABLE "usage" DROP COLUMN IF EXISTS "date";

-- Add updated_at column
ALTER TABLE "usage" ADD COLUMN "updated_at" timestamp DEFAULT now();

-- Update indexes
DROP INDEX IF EXISTS "daily_usage_device_date_idx";
DROP INDEX IF EXISTS "daily_usage_device_idx";
DROP INDEX IF EXISTS "daily_usage_date_idx";
DROP INDEX IF EXISTS "daily_usage_created_at_idx";

CREATE UNIQUE INDEX IF NOT EXISTS "usage_device_idx" ON "usage" ("device_id");
CREATE INDEX IF NOT EXISTS "usage_created_at_idx" ON "usage" ("created_at");
