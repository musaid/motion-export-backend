import { eq, sql } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import { database } from '~/database/context';
import { licenses, usage, type License } from '~/database/schema';
import { hashLicenseKey } from './security.server';
import { encryptLicenseKey } from './encryption.server';
import { generateRecoveryCodes } from './recovery-codes.server';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 4);

export function generateLicenseKey(): string {
  // Format: XXXX-XXXX-XXXX-XXXX
  return Array(4)
    .fill(0)
    .map(() => nanoid())
    .join('-');
}

export async function createLicense(data: {
  email: string;
  stripeCustomerId?: string | null;
  stripeSessionId?: string | null;
  amount: number;
  currency: string;
}): Promise<{
  license: License;
  plainKey: string;
  recoveryCodes: string[];
}> {
  const plainKey = generateLicenseKey();
  const hashedKey = hashLicenseKey(plainKey);
  const encryptedKey = encryptLicenseKey(plainKey);

  // Generate recovery codes (GitHub/Google standard)
  const { plain: recoveryCodesPlain, hashed: recoveryCodesHashed } =
    generateRecoveryCodes(3);

  const [license] = await database()
    .insert(licenses)
    .values({
      key: hashedKey, // For validation
      encryptedKey, // For recovery
      email: data.email,
      stripeCustomerId: data.stripeCustomerId,
      stripeSessionId: data.stripeSessionId,
      amount: data.amount,
      currency: data.currency,
      status: 'active',
      activations: '[]',
      recoveryCodes: JSON.stringify(recoveryCodesHashed),
      recoveryCodesUsed: '[]',
      metadata: JSON.stringify({
        createdVia: 'stripe_checkout',
        timestamp: new Date().toISOString(),
      }),
    })
    .returning();

  return {
    license,
    plainKey,
    recoveryCodes: recoveryCodesPlain,
  };
}

export async function validateLicense(
  plainKey: string,
  figmaUserId: string,
): Promise<{
  valid: boolean;
  error?: string;
  license?: License;
  isFirstActivation?: boolean;
}> {
  const hashedKey = hashLicenseKey(plainKey);

  // Get license by hashed key
  const [license] = await database()
    .select()
    .from(licenses)
    .where(eq(licenses.key, hashedKey))
    .limit(1);

  if (!license) {
    return { valid: false, error: 'Invalid license key' };
  }

  if (license.status !== 'active') {
    return { valid: false, error: `License is ${license.status}` };
  }

  // Parse activations (now stores figmaUserId instead of deviceId)
  const activations = JSON.parse(license.activations || '[]') as Array<{
    figmaUserId: string;
    activatedAt: string;
    lastChecked: string;
  }>;

  const existingActivation = activations.find(
    (a) => a.figmaUserId === figmaUserId,
  );

  let isFirstActivation = false;

  if (!existingActivation) {
    // New activation for this Figma user
    isFirstActivation = true;
    activations.push({
      figmaUserId,
      activatedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
    });
  } else {
    // Existing activation - just update last checked timestamp
    existingActivation.lastChecked = new Date().toISOString();
  }

  // Update license
  const updateData: Partial<License> = {
    activations: JSON.stringify(activations),
    updatedAt: new Date().toISOString(),
  };

  // Store figmaUserId if not already stored
  if (!license.figmaUserId) {
    updateData.figmaUserId = figmaUserId;
  }

  await database()
    .update(licenses)
    .set(updateData)
    .where(eq(licenses.id, license.id));

  return {
    valid: true,
    isFirstActivation,
    license: {
      ...license,
      activations: JSON.stringify(activations),
    },
  };
}

// Check lifetime usage (5 exports max for free tier, NEVER resets)
export async function checkUsage(figmaUserId: string): Promise<{
  count: number;
  limit: number;
  canExport: boolean;
}> {
  const LIFETIME_LIMIT = 5;

  // Get lifetime usage for this Figma user
  const [userUsage] = await database()
    .select()
    .from(usage)
    .where(eq(usage.figmaUserId, figmaUserId))
    .limit(1);

  if (!userUsage) {
    // No usage yet
    return {
      count: 0,
      limit: LIFETIME_LIMIT,
      canExport: true,
    };
  }

  return {
    count: userUsage.exportCount || 0,
    limit: LIFETIME_LIMIT,
    canExport: (userUsage.exportCount || 0) < LIFETIME_LIMIT,
  };
}

// Increment lifetime usage (NO daily resets, permanent counter)
export async function incrementUsage(figmaUserId: string): Promise<void> {
  // Check if record exists
  const [existing] = await database()
    .select()
    .from(usage)
    .where(eq(usage.figmaUserId, figmaUserId))
    .limit(1);

  if (existing) {
    // Update existing record - increment lifetime counter
    await database()
      .update(usage)
      .set({
        exportCount: sql`${usage.exportCount} + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(usage.id, existing.id));
  } else {
    // Create new record
    await database().insert(usage).values({
      figmaUserId,
      exportCount: 1,
    });
  }
}
