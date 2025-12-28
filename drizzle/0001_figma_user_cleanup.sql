-- Migration: Switch from deviceId to figmaUserId + add recovery codes
-- Date: 2025-01-20
-- Description: Clean up device-based tracking, switch to user-based licensing, add recovery code support

-- Add new columns to licenses table
ALTER TABLE licenses
ADD COLUMN IF NOT EXISTS encrypted_key TEXT,
ADD COLUMN IF NOT EXISTS recovery_codes TEXT DEFAULT '[]',
ADD COLUMN IF NOT EXISTS recovery_codes_used TEXT DEFAULT '[]';

-- Add comments for documentation
COMMENT ON COLUMN licenses.encrypted_key IS 'AES-256-GCM encrypted license key for recovery purposes';
COMMENT ON COLUMN licenses.recovery_codes IS 'JSON array of hashed recovery codes (GitHub/Google standard)';
COMMENT ON COLUMN licenses.recovery_codes_used IS 'JSON array of used recovery codes with timestamps';

-- Rename device_id to figma_user_id in usage table
ALTER TABLE usage RENAME COLUMN device_id TO figma_user_id;

-- Update index
DROP INDEX IF EXISTS usage_device_idx;
CREATE UNIQUE INDEX IF NOT EXISTS usage_figma_user_idx ON usage(figma_user_id);

-- Add comment
COMMENT ON COLUMN usage.figma_user_id IS 'Figma user ID for tracking free tier usage (no longer device-based)';
