import crypto from 'crypto';
import { customAlphabet } from 'nanoid';
import { eq } from 'drizzle-orm';
import { database } from '~/database/context';
import { licenses } from '~/database/schema';
import { decryptLicenseKey } from './encryption.server';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 4);

/**
 * Generate recovery code in format: RC-XXXX-YYYY-ZZZZ
 * Follows GitHub/Google standard for recovery codes
 */
export function generateRecoveryCode(): string {
  return `RC-${nanoid()}-${nanoid()}-${nanoid()}`;
}

/**
 * Generate set of recovery codes (default: 3)
 * Returns both plain codes (to show user) and hashed codes (to store in DB)
 */
export function generateRecoveryCodes(count: number = 3): {
  plain: string[];
  hashed: Array<{ code: string; createdAt: string }>;
} {
  const plain: string[] = [];
  const hashed: Array<{ code: string; createdAt: string }> = [];

  for (let i = 0; i < count; i++) {
    const code = generateRecoveryCode();
    plain.push(code);
    hashed.push({
      code: hashRecoveryCode(code),
      createdAt: new Date().toISOString(),
    });
  }

  return { plain, hashed };
}

/**
 * Hash recovery code for storage (one-way hash)
 */
export function hashRecoveryCode(code: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(code);
  hash.update(process.env.RECOVERY_CODE_SALT || 'motion-export-recovery');
  return hash.digest('hex');
}

/**
 * Validate recovery code and return the license key
 * Marks the code as used after successful validation
 */
export async function validateRecoveryCode(plainCode: string): Promise<{
  valid: boolean;
  licenseKey?: string;
  email?: string;
  error?: string;
}> {
  const hashedCode = hashRecoveryCode(plainCode);

  // Find license with this recovery code
  const allLicenses = await database().select().from(licenses);

  for (const license of allLicenses) {
    const codes = JSON.parse(license.recoveryCodes || '[]') as Array<{
      code: string;
      createdAt: string;
    }>;
    const usedCodes = JSON.parse(license.recoveryCodesUsed || '[]') as Array<{
      code: string;
      usedAt: string;
    }>;

    // Check if code exists in this license
    const codeExists = codes.some((c) => c.code === hashedCode);
    if (!codeExists) {
      continue; // Try next license
    }

    // Check if license is active
    if (license.status !== 'active') {
      return {
        valid: false,
        error: `License is ${license.status}`,
      };
    }

    // Check if code already used
    const alreadyUsed = usedCodes.some((c) => c.code === hashedCode);
    if (alreadyUsed) {
      return {
        valid: false,
        error: 'Recovery code already used',
      };
    }

    // Mark code as used
    usedCodes.push({
      code: hashedCode,
      usedAt: new Date().toISOString(),
    });

    await database()
      .update(licenses)
      .set({
        recoveryCodesUsed: JSON.stringify(usedCodes),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(licenses.id, license.id));

    // Decrypt and return the license key
    if (!license.encryptedKey) {
      return {
        valid: false,
        error: 'License key encryption not available for this license',
      };
    }

    try {
      const decryptedKey = decryptLicenseKey(license.encryptedKey);
      return {
        valid: true,
        licenseKey: decryptedKey,
        email: license.email,
      };
    } catch (error) {
      console.error('Failed to decrypt license key:', error);
      return {
        valid: false,
        error: 'Failed to decrypt license key',
      };
    }
  }

  return {
    valid: false,
    error: 'Invalid recovery code',
  };
}
