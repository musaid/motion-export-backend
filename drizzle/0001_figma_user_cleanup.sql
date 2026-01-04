-- Migration: Switch from deviceId to figmaUserId + add recovery codes
-- Date: 2025-01-20
-- Description: Clean up device-based tracking, switch to user-based licensing, add recovery code support
-- PRODUCTION SAFE: Simple column additions and rename

-- ============================================================================
-- STEP 1: Add new columns to licenses table
-- ============================================================================
ALTER TABLE licenses
ADD COLUMN IF NOT EXISTS encrypted_key TEXT,
ADD COLUMN IF NOT EXISTS recovery_codes TEXT DEFAULT '[]',
ADD COLUMN IF NOT EXISTS recovery_codes_used TEXT DEFAULT '[]';

COMMENT ON COLUMN licenses.encrypted_key IS 'AES-256-GCM encrypted license key for recovery purposes';
COMMENT ON COLUMN licenses.recovery_codes IS 'JSON array of hashed recovery codes (GitHub/Google standard)';
COMMENT ON COLUMN licenses.recovery_codes_used IS 'JSON array of used recovery codes with timestamps';

-- ============================================================================
-- STEP 2: Rename device_id to figma_user_id in usage table
-- ============================================================================
ALTER TABLE usage RENAME COLUMN device_id TO figma_user_id;

-- Update index
DROP INDEX IF EXISTS usage_device_idx;
CREATE UNIQUE INDEX IF NOT EXISTS usage_figma_user_idx ON usage(figma_user_id);

COMMENT ON COLUMN usage.figma_user_id IS 'Figma user ID for tracking free tier usage (no longer device-based)';

-- ============================================================================
-- STEP 3: Convert existing license activations from deviceId to figmaUserId
-- ============================================================================
-- Convert old deviceId format to figmaUserId in activations array
-- Changes: { "deviceId": "figma-123", ... } -> { "figmaUserId": "123", ... }
UPDATE licenses
SET activations = (
  SELECT COALESCE(
    jsonb_agg(
      CASE
        -- If entry has old deviceId format (starts with "figma-")
        WHEN elem->>'deviceId' IS NOT NULL AND elem->>'deviceId' LIKE 'figma-%'
        THEN jsonb_build_object(
          'figmaUserId', REPLACE(elem->>'deviceId', 'figma-', ''),
          'activatedAt', elem->>'activatedAt',
          'lastChecked', elem->>'lastChecked'
        )
        -- If entry already has figmaUserId, keep it as-is
        WHEN elem->>'figmaUserId' IS NOT NULL
        THEN elem
        -- Skip IP-based or temp deviceIds (these were fallbacks, not real users)
        ELSE NULL
      END
    ) FILTER (WHERE
      (elem->>'deviceId' LIKE 'figma-%') OR
      (elem->>'figmaUserId' IS NOT NULL)
    ),
    '[]'::jsonb
  )::text
  FROM jsonb_array_elements(COALESCE(activations::jsonb, '[]'::jsonb)) elem
)
WHERE activations IS NOT NULL
  AND activations != '[]'
  AND activations::text LIKE '%deviceId%';

-- ============================================================================
-- STEP 4: Populate figma_user_id column in licenses table from activations
-- ============================================================================
UPDATE licenses
SET figma_user_id = (
  SELECT elem->>'figmaUserId'
  FROM jsonb_array_elements(COALESCE(activations::jsonb, '[]'::jsonb)) elem
  WHERE elem->>'figmaUserId' IS NOT NULL
  LIMIT 1
)
WHERE figma_user_id IS NULL
  AND activations IS NOT NULL
  AND activations != '[]';
