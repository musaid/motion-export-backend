import { data } from 'react-router';
import { validateRecoveryCode } from '~/lib/recovery-codes.server';
import {
  validateRequest,
  checkRateLimit,
  sanitizeInput,
} from '~/lib/security.server';
import { z } from 'zod';
import type { Route } from './+types/recover';

const recoverSchema = z.object({
  recoveryCode: z.string().min(1),
});

export async function action({ request }: Route.ActionArgs) {
  // Validate request source
  const validation = validateRequest(request);
  if (!validation.valid) {
    return data({ valid: false, error: validation.error }, { status: 403 });
  }

  // Get IP for rate limiting
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // Strict rate limiting for recovery (prevent brute force)
  if (!checkRateLimit(ip, validation.clientType, 'recover')) {
    return data(
      { valid: false, error: 'Too many recovery attempts. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const parsed = recoverSchema.parse(body);

    // Sanitize recovery code
    const sanitizedCode = sanitizeInput(parsed.recoveryCode.toUpperCase());

    // Validate format (RC-XXXX-XXXX-XXXX)
    const codePattern = /^RC-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!codePattern.test(sanitizedCode)) {
      return data({
        valid: false,
        error: 'Invalid recovery code format',
      });
    }

    // Validate recovery code and get license key
    const result = await validateRecoveryCode(sanitizedCode);

    if (result.valid) {
      return data({
        valid: true,
        licenseKey: result.licenseKey,
        email: result.email,
      });
    }

    return data({
      valid: false,
      error: result.error || 'Invalid recovery code',
    });
  } catch (error) {
    console.error('Recovery error:', error);
    return data(
      { valid: false, error: 'Recovery failed' },
      { status: 500 },
    );
  }
}
