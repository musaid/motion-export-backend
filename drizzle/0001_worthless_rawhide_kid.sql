ALTER TABLE "daily_usage" RENAME TO "usage";--> statement-breakpoint
ALTER TABLE "usage" RENAME COLUMN "date" TO "updated_at";--> statement-breakpoint
DROP INDEX IF EXISTS "daily_usage_device_date_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "daily_usage_device_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "daily_usage_date_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "daily_usage_created_at_idx";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "usage_device_idx" ON "usage" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usage_created_at_idx" ON "usage" USING btree ("created_at");