import { data } from 'react-router';
import { eq } from 'drizzle-orm';
import { database } from '~/database/context';
import { licenses } from '~/database/schema';
import { validateRequest, checkRateLimit, sanitizeInput } from '~/lib/security.server';
import { sendLicenseEmail } from '~/lib/email.server';
import { z } from 'zod';
import type { Route } from './+types/recover';

const recoverSchema = z.object({
  email: z.string().email(),
});

export async function action({ request }: Route.ActionArgs) {
  const validation = validateRequest(request);
  if (!validation.valid) {
    return data({ success: false, error: validation.error }, { status: 403 });
  }

  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (!checkRateLimit(ip, validation.clientType, 'recover')) {
    return data(
      { success: false, error: 'Too many recovery attempts. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const parsed = recoverSchema.parse(body);
    const email = sanitizeInput(parsed.email.toLowerCase());

    const userLicenses = await database()
      .select()
      .from(licenses)
      .where(eq(licenses.email, email));

    if (userLicenses.length === 0) {
      return data({
        success: false,
        error: 'No licenses found for this email address',
      });
    }

    const activeLicenses = userLicenses.filter((l) => l.status === 'active');

    if (activeLicenses.length === 0) {
      return data({
        success: false,
        error: 'No active licenses found for this email address',
      });
    }

    await sendLicenseEmail(email, activeLicenses[0].licenseKey);

    return data({
      success: true,
      message: 'License key sent to your email address',
    });
  } catch (error) {
    console.error('Recovery error:', error);
    return data({ success: false, error: 'Recovery failed' }, { status: 500 });
  }
}
