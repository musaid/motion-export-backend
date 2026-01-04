-- Manual Migration Script: Convert Existing Licenses to User-Based Format
-- Run this AFTER applying the drizzle migration
-- This script is safe to run multiple times (idempotent)

-- ============================================================================
-- Step 1: Convert old deviceId format to figmaUserId in activations array
-- ============================================================================
-- This converts entries like:
--   { "deviceId": "figma-123", ... }
-- to:
--   { "figmaUserId": "123", ... }

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
        -- If entry has IP-based or temp deviceId, skip it
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
-- Step 2: Extract and store figmaUserId in the main license record
-- ============================================================================
-- Populate the figmaUserId column from the activations array if not already set

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

-- ============================================================================
-- Step 3: Summary Report
-- ============================================================================
-- Run these queries to verify the migration worked correctly

-- Check how many licenses were updated
SELECT
  COUNT(*) FILTER (WHERE activations::text LIKE '%figmaUserId%') as licenses_with_new_format,
  COUNT(*) FILTER (WHERE activations::text LIKE '%deviceId%') as licenses_with_old_format,
  COUNT(*) FILTER (WHERE encrypted_key IS NOT NULL) as licenses_with_encryption,
  COUNT(*) FILTER (WHERE recovery_codes != '[]') as licenses_with_recovery_codes,
  COUNT(*) as total_licenses
FROM licenses;

-- Show sample converted activation data
SELECT
  id,
  email,
  figma_user_id,
  activations,
  encrypted_key IS NOT NULL as has_encryption,
  recovery_codes != '[]' as has_recovery_codes
FROM licenses
WHERE activations != '[]'
LIMIT 5;

-- ============================================================================
-- Notes:
-- ============================================================================
-- 1. Existing licenses will continue to work without any changes
-- 2. Users will NOT notice anything different
-- 3. Old licenses will NOT have recovery codes (only new purchases will)
-- 4. Old licenses will NOT have encrypted_key (can't retroactively encrypt)
-- 5. This script is safe to run multiple times
-- 6. IP-based and temp device IDs are intentionally removed (they were fallbacks)
