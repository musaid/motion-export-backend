import { eq, and, sql } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import { database } from '~/database/context';
import { licenses, dailyUsage, type License } from '~/database/schema';
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

  // Update license
  await database()
    .update(licenses)
    .set({
      activations: JSON.stringify(activations),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(licenses.id, license.id));

  return {
    valid: true,
    license: {
      ...license,
      activations: JSON.stringify(activations),
    },
  };
}

export async function checkDailyUsage(deviceId: string): Promise<{
  count: number;
  limit: number;
  canExport: boolean;
}> {
  const today = new Date().toISOString().split('T')[0];
  const DAILY_LIMIT = 3;

  // Get today's usage
  const [usage] = await database()
    .select()
    .from(dailyUsage)
    .where(and(eq(dailyUsage.deviceId, deviceId), eq(dailyUsage.date, today)))
    .limit(1);

  if (!usage) {
    // No usage yet today
    return {
      count: 0,
      limit: DAILY_LIMIT,
      canExport: true,
    };
  }

  return {
    count: usage.exportCount || 0,
    limit: DAILY_LIMIT,
    canExport: (usage.exportCount || 0) < DAILY_LIMIT,
  };
}

export async function incrementDailyUsage(deviceId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  // Check if record exists
  const [existing] = await database()
    .select()
    .from(dailyUsage)
    .where(and(eq(dailyUsage.deviceId, deviceId), eq(dailyUsage.date, today)))
    .limit(1);

  if (existing) {
    // Update existing record
    await database()
      .update(dailyUsage)
      .set({
        exportCount: sql`${dailyUsage.exportCount} + 1`,
      })
      .where(eq(dailyUsage.id, existing.id));
  } else {
    // Create new record
    await database()
      .insert(dailyUsage)
      .values({
        deviceId,
        date: today,
        exportCount: 1,
      });
  }
}