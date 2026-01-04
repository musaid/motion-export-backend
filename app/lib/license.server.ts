import { eq, sql } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import crypto from 'crypto';
import { database } from '~/database/context';
import { licenses, usage, type License } from '~/database/schema';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 4);

function hashLicenseKey(key: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(key);
  hash.update(process.env.LICENSE_SALT || 'motion-export-salt');
  return hash.digest('hex');
}

export function generateLicenseKey(): string {
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
  licenseKey: string;
}> {
  const licenseKey = generateLicenseKey();

  const [license] = await database()
    .insert(licenses)
    .values({
      licenseKey,
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

  return {
    license,
    licenseKey,
  };
}

export async function validateLicense(
  licenseKey: string,
  figmaUserId: string,
): Promise<{
  valid: boolean;
  error?: string;
  license?: License;
  isFirstActivation?: boolean;
}> {
  let license = await database()
    .select()
    .from(licenses)
    .where(eq(licenses.licenseKey, licenseKey))
    .limit(1)
    .then((rows) => rows[0]);

  if (!license) {
    const hashedKey = hashLicenseKey(licenseKey);
    license = await database()
      .select()
      .from(licenses)
      .where(eq(licenses.licenseKey, hashedKey))
      .limit(1)
      .then((rows) => rows[0]);
  }

  if (!license) {
    return { valid: false, error: 'Invalid license key' };
  }

  if (license.status !== 'active') {
    return { valid: false, error: `License is ${license.status}` };
  }

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
    isFirstActivation = true;
    activations.push({
      figmaUserId,
      activatedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
    });
  } else {
    existingActivation.lastChecked = new Date().toISOString();
  }

  const updateData: Partial<License> = {
    activations: JSON.stringify(activations),
    updatedAt: new Date().toISOString(),
  };

  if (!license.figmaUserId) {
    updateData.figmaUserId = figmaUserId;
  }

  if (license.licenseKey !== licenseKey) {
    updateData.licenseKey = licenseKey;
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

export async function checkUsage(figmaUserId: string): Promise<{
  count: number;
  limit: number;
  canExport: boolean;
}> {
  const LIFETIME_LIMIT = 5;

  const [userUsage] = await database()
    .select()
    .from(usage)
    .where(eq(usage.figmaUserId, figmaUserId))
    .limit(1);

  if (!userUsage) {
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

export async function incrementUsage(figmaUserId: string): Promise<void> {
  const [existing] = await database()
    .select()
    .from(usage)
    .where(eq(usage.figmaUserId, figmaUserId))
    .limit(1);

  if (existing) {
    await database()
      .update(usage)
      .set({
        exportCount: sql`${usage.exportCount} + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(usage.id, existing.id));
  } else {
    await database().insert(usage).values({
      figmaUserId,
      exportCount: 1,
    });
  }
}
