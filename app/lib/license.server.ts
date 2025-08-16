import { eq, and, sql } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import { database } from '~/database/context';
import { licenses, dailyUsage, type License } from '~/database/schema';

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
  figmaUserId?: string | null;
  amount: number;
  currency: string;
}): Promise<License> {
  const key = generateLicenseKey();

  // Store payment intent ID in metadata if needed
  const metadata = {
    createdVia: 'stripe_checkout',
    timestamp: new Date().toISOString(),
  };

  const [license] = await database()
    .insert(licenses)
    .values({
      key,
      email: data.email,
      stripeCustomerId: data.stripeCustomerId,
      stripeSessionId: data.stripeSessionId,
      figmaUserId: data.figmaUserId,
      amount: data.amount,
      currency: data.currency,
      status: 'active',
      activations: '[]',
      metadata: JSON.stringify(metadata),
    })
    .returning();

  return license;
}

export async function validateLicense(
  key: string,
  deviceId: string,
): Promise<{
  valid: boolean;
  error?: string;
  license?: License;
}> {
  // Get license
  const [license] = await database()
    .select()
    .from(licenses)
    .where(eq(licenses.key, key))
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

  // Get or create today's usage
  let [usage] = await database()
    .select()
    .from(dailyUsage)
    .where(and(eq(dailyUsage.deviceId, deviceId), eq(dailyUsage.date, today)))
    .limit(1);

  if (!usage) {
    // Create new daily usage record
    [usage] = await database()
      .insert(dailyUsage)
      .values({
        deviceId,
        date: today,
        exportCount: 0,
      })
      .returning();
  }

  return {
    count: usage.exportCount || 0,
    limit: DAILY_LIMIT,
    canExport: (usage.exportCount || 0) < DAILY_LIMIT,
  };
}

export async function incrementDailyUsage(deviceId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  await database()
    .update(dailyUsage)
    .set({
      exportCount: sql`export_count + 1`,
    })
    .where(and(eq(dailyUsage.deviceId, deviceId), eq(dailyUsage.date, today)));
}
