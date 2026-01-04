-- Simplify license system: user-based licensing with email recovery
-- From: 0000_cosmic_genesis.sql (device_id + hashed keys)
-- To: Simplified schema (figma_user_id + plaintext keys + email recovery)

-- Rename device_id to figma_user_id in usage table
ALTER TABLE "usage" RENAME COLUMN "device_id" TO "figma_user_id";
--> statement-breakpoint

-- Update usage table index
DROP INDEX IF EXISTS "usage_device_idx";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "usage_figma_user_idx" ON "usage" ("figma_user_id");
--> statement-breakpoint

-- Clean up usage data: remove "figma-" prefix if it exists
UPDATE "usage"
SET "figma_user_id" = REPLACE("figma_user_id", 'figma-', '')
WHERE "figma_user_id" LIKE 'figma-%';
--> statement-breakpoint

-- Rename key column to license_key in licenses table
ALTER TABLE "licenses" RENAME COLUMN "key" TO "license_key";
--> statement-breakpoint

-- Update licenses table index
DROP INDEX IF EXISTS "licenses_key_idx";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "licenses_license_key_idx" ON "licenses" ("license_key");
--> statement-breakpoint

-- Convert existing activations from deviceId format to figmaUserId format
UPDATE "licenses"
SET "activations" = (
  SELECT COALESCE(
    jsonb_agg(
      CASE
        WHEN elem->>'deviceId' IS NOT NULL AND elem->>'deviceId' LIKE 'figma-%'
        THEN jsonb_build_object(
          'figmaUserId', REPLACE(elem->>'deviceId', 'figma-', ''),
          'activatedAt', elem->>'activatedAt',
          'lastChecked', elem->>'lastChecked'
        )
        WHEN elem->>'figmaUserId' IS NOT NULL
        THEN elem
        ELSE NULL
      END
    ) FILTER (WHERE
      (elem->>'deviceId' LIKE 'figma-%') OR
      (elem->>'figmaUserId' IS NOT NULL)
    ),
    '[]'::jsonb
  )::text
  FROM jsonb_array_elements(COALESCE("activations"::jsonb, '[]'::jsonb)) elem
)
WHERE "activations" IS NOT NULL
  AND "activations" != '[]'
  AND "activations"::text LIKE '%deviceId%';
--> statement-breakpoint

-- Populate figma_user_id in licenses from activations array
UPDATE "licenses"
SET "figma_user_id" = (
  SELECT elem->>'figmaUserId'
  FROM jsonb_array_elements(COALESCE("activations"::jsonb, '[]'::jsonb)) elem
  WHERE elem->>'figmaUserId' IS NOT NULL
  LIMIT 1
)
WHERE "figma_user_id" IS NULL
  AND "activations" IS NOT NULL
  AND "activations" != '[]';
