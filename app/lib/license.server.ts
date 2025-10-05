import { eq, sql } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import { database } from '~/database/context';
import { licenses, usage, type License } from '~/database/schema';
import { hashLicenseKey } from './security.server';

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
}): Promise<{ license: License; plainKey: string }> {
  const plainKey = generateLicenseKey();
  const hashedKey = hashLicenseKey(plainKey);

  const [license] = await database()
    .insert(licenses)
    .values({
      key: hashedKey, // Store hashed version
      email: data.email,
      stripeCustomerId: data.stripeCustomerId,
      stripeSessionId: data.stripeSessionId,
      amount: data.amount,
      currency: data.currency,
      status: 'active',
      activations: '[]',
      metadata: JSON.stringify({
        createdVia: 'stripe_checkout',
        timestamp: new Date().toISOString(),
      }),
    })
    .returning();

  return { license, plainKey }; // Return plain key to send to user
}

export async function validateLicense(
  plainKey: string,
  deviceId: string,
): Promise<{
  valid: boolean;
  error?: string;
  license?: License;
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

  // Check activations
  const activations = JSON.parse(license.activations || '[]') as Array<{
    deviceId: string;
    activatedAt: string;
    lastChecked: string;
  }>;

  const existingActivation = activations.find((a) => a.deviceId === deviceId);

  if (!existingActivation) {
    // Check activation limit
    if (activations.length >= 5) {
      return { valid: false, error: 'Maximum activations reached (5 devices)' };
    }

    // Add new activation
    activations.push({
      deviceId,
      activatedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
    });
  } else {
    // Update last checked
    existingActivation.lastChecked = new Date().toISOString();
  }

  // Extract figmaUserId from deviceId if present and not already stored
  const updateData: Partial<License> = {
    activations: JSON.stringify(activations),
    updatedAt: new Date().toISOString(),
  };

  // If deviceId contains figma user ID and license doesn't have it yet, store it
  if (deviceId.startsWith('figma-') && !license.figmaUserId) {
    const figmaUserId = deviceId.replace('figma-', '');
    updateData.figmaUserId = figmaUserId;
  }

  // Update license
  await database()
    .update(licenses)
    .set(updateData)
    .where(eq(licenses.id, license.id));

  return {
    valid: true,
    license: {
      ...license,
      activations: JSON.stringify(activations),
    },
  };
}

// Check lifetime usage (5 exports max for free tier, NEVER resets)
export async function checkUsage(deviceId: string): Promise<{
  count: number;
  limit: number;
  canExport: boolean;
}> {
  const LIFETIME_LIMIT = 5;

  // Get lifetime usage (no date filtering - lifetime tracking only)
  const [userUsage] = await database()
    .select()
    .from(usage)
    .where(eq(usage.deviceId, deviceId))
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
export async function incrementUsage(deviceId: string): Promise<void> {
  // Check if record exists
  const [existing] = await database()
    .select()
    .from(usage)
    .where(eq(usage.deviceId, deviceId))
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
      deviceId,
      exportCount: 1,
    });
  }
}
