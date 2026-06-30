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

// One purchase = one human, who may use the plugin across several devices. A
// Figma user ID is per-account, so a legitimate buyer normally occupies a single
// activation slot; the cap is a generous tolerance ceiling, not a seat-sales
// model. Enforcing it server-side is what stops a publicly-posted key from
// granting Pro to an unbounded number of distinct users.
const MAX_ACTIVATIONS = 5;

type Activation = {
  figmaUserId: string;
  activatedAt: string;
  lastChecked: string;
};

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

  const now = new Date().toISOString();
  const newActivation: Activation = {
    figmaUserId,
    activatedAt: now,
    lastChecked: now,
  };

  // Atomic check-and-append. A single UPDATE decides the outcome so two
  // concurrent first-time activations can't both read "under cap" and both
  // append (the lost-update race that also made any cap unenforceable):
  //   - if this user already has a slot -> refresh its lastChecked (always OK)
  //   - else if under the cap          -> append a new slot
  //   - else                           -> change nothing (row not returned)
  // `activations` is stored as text; cast through jsonb to manipulate it.
  const updated = await database()
    .update(licenses)
    .set({
      activations: sql`
        CASE
          WHEN EXISTS (
            SELECT 1 FROM jsonb_array_elements(COALESCE(${licenses.activations}, '[]')::jsonb) e
            WHERE e->>'figmaUserId' = ${figmaUserId}
          ) THEN (
            SELECT jsonb_agg(
              CASE WHEN e->>'figmaUserId' = ${figmaUserId}
                THEN jsonb_set(e, '{lastChecked}', to_jsonb(${now}::text))
                ELSE e
              END
            )::text
            FROM jsonb_array_elements(COALESCE(${licenses.activations}, '[]')::jsonb) e
          )
          WHEN jsonb_array_length(COALESCE(${licenses.activations}, '[]')::jsonb) < ${MAX_ACTIVATIONS}
            THEN (COALESCE(${licenses.activations}, '[]')::jsonb || ${JSON.stringify(newActivation)}::jsonb)::text
          ELSE ${licenses.activations}
        END
      `,
      figmaUserId: license.figmaUserId ?? figmaUserId,
      licenseKey: licenseKey,
      updatedAt: now,
    })
    .where(eq(licenses.id, license.id))
    .returning();

  const persisted = updated[0] ?? license;
  const activations = JSON.parse(persisted.activations || '[]') as Activation[];
  const present = activations.some((a) => a.figmaUserId === figmaUserId);

  // The user is absent only when the cap rejected the append.
  if (!present) {
    return {
      valid: false,
      error: 'License activation limit reached',
      license: persisted,
    };
  }

  // First activation iff this user wasn't on the license before this call.
  const priorActivations = JSON.parse(
    license.activations || '[]',
  ) as Activation[];
  const isFirstActivation = !priorActivations.some(
    (a) => a.figmaUserId === figmaUserId,
  );

  return {
    valid: true,
    isFirstActivation,
    license: persisted,
  };
}

const CODE_LIFETIME_LIMIT = 5;
const MEDIA_LIFETIME_LIMIT = 2;

export async function checkUsage(figmaUserId: string): Promise<{
  count: number;
  limit: number;
  canExport: boolean;
  mediaCount: number;
  mediaLimit: number;
  canExportMedia: boolean;
}> {
  const [userUsage] = await database()
    .select()
    .from(usage)
    .where(eq(usage.figmaUserId, figmaUserId))
    .limit(1);

  const exportCount = userUsage?.exportCount || 0;
  const mediaExportCount = userUsage?.mediaExportCount || 0;

  return {
    count: exportCount,
    limit: CODE_LIFETIME_LIMIT,
    canExport: exportCount < CODE_LIFETIME_LIMIT,
    mediaCount: mediaExportCount,
    mediaLimit: MEDIA_LIFETIME_LIMIT,
    canExportMedia: mediaExportCount < MEDIA_LIFETIME_LIMIT,
  };
}

// Atomic upsert on the unique figma_user_id index. A single statement avoids the
// select-then-insert race where two concurrent first-time exports (e.g. a code
// export and a media export) both insert and the second throws on the unique
// constraint — silently losing one increment.
export async function incrementUsage(figmaUserId: string): Promise<void> {
  await database()
    .insert(usage)
    .values({ figmaUserId, exportCount: 1 })
    .onConflictDoUpdate({
      target: usage.figmaUserId,
      set: {
        exportCount: sql`${usage.exportCount} + 1`,
        updatedAt: new Date().toISOString(),
      },
    });
}

export async function incrementMediaUsage(figmaUserId: string): Promise<void> {
  await database()
    .insert(usage)
    .values({ figmaUserId, mediaExportCount: 1 })
    .onConflictDoUpdate({
      target: usage.figmaUserId,
      set: {
        mediaExportCount: sql`${usage.mediaExportCount} + 1`,
        updatedAt: new Date().toISOString(),
      },
    });
}
