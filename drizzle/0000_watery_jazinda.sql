CREATE TABLE IF NOT EXISTS "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "daily_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"date" text NOT NULL,
	"export_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "licenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"email" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_session_id" text,
	"figma_user_id" text,
	"amount" real,
	"currency" text,
	"status" text DEFAULT 'active',
	"purchased_at" timestamp DEFAULT now(),
	"activations" text DEFAULT '[]',
	"metadata" text DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usage_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"event" text NOT NULL,
	"user_id" text,
	"license_key" text,
	"properties" text,
	"ip" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_username_idx" ON "admin_users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "daily_usage_device_date_idx" ON "daily_usage" USING btree ("device_id","date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "daily_usage_device_idx" ON "daily_usage" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "daily_usage_date_idx" ON "daily_usage" USING btree ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "daily_usage_created_at_idx" ON "daily_usage" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "licenses_key_idx" ON "licenses" USING btree ("key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "licenses_email_idx" ON "licenses" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "licenses_stripe_customer_idx" ON "licenses" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "licenses_figma_user_idx" ON "licenses" USING btree ("figma_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "licenses_status_idx" ON "licenses" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "licenses_created_at_idx" ON "licenses" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usage_analytics_event_idx" ON "usage_analytics" USING btree ("event");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usage_analytics_user_idx" ON "usage_analytics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usage_analytics_license_idx" ON "usage_analytics" USING btree ("license_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usage_analytics_created_at_idx" ON "usage_analytics" USING btree ("created_at");