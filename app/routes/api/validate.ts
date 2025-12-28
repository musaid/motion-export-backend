import { data } from 'react-router';
import { validateLicense, checkUsage } from '~/lib/license.server';
import {
  validateRequest,
  getFigmaUserId,
  checkRateLimit,
  isValidLicenseKeyFormat,
  sanitizeInput,
} from '~/lib/security.server';
import { sendLicenseActivatedNotification } from '~/lib/telegram.server';
import { z } from 'zod';
import type { Route } from './+types/validate';

const validateSchema = z.object({
  licenseKey: z.string().optional(),
  figmaUserId: z.string().optional(),
});

export async function action({ request }: Route.ActionArgs) {
  // Validate request source (plugin or web)
  const validation = validateRequest(request);
  if (!validation.valid) {
    return data({ valid: false, error: validation.error }, { status: 403 });
  }

  // Get IP for rate limiting fallback
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  try {
    const body = await request.json();
    const parsed = validateSchema.parse(body);

    // Get Figma user ID from header or body
    const figmaUserIdRaw =
      request.headers.get('x-figma-user-id') || parsed.figmaUserId;
    const figmaUserId = getFigmaUserId(figmaUserIdRaw);

    // Figma plugins should always have a user ID
    if (!figmaUserId && validation.clientType === 'plugin') {
      return data(
        { valid: false, error: 'User identification required' },
        { status: 400 },
      );
    }

    // Generate identifier for rate limiting
    const rateLimitId = figmaUserId || ip;

    // Apply rate limiting based on client type
    if (!checkRateLimit(rateLimitId, validation.clientType, 'validate')) {
      return data(
        { valid: false, error: 'Rate limit exceeded' },
        { status: 429 },
      );
    }

    // Check for pro license
    if (parsed.licenseKey && figmaUserId) {
      // Validate license key format
      const sanitizedKey = sanitizeInput(parsed.licenseKey);
      if (!isValidLicenseKeyFormat(sanitizedKey)) {
        return data({
          valid: false,
          isPro: false,
          error: 'Invalid license key format',
        });
      }

      const result = await validateLicense(sanitizedKey, figmaUserId);

      if (result.valid && result.license) {
        // Send notification for new activations (fire-and-forget)
        if (result.isFirstActivation) {
          sendLicenseActivatedNotification({
            email: result.license.email,
            figmaUserId,
            isFirstActivation: true,
          });
        }

        return data({
          valid: true,
          isPro: true,
          license: {
            email: result.license.email,
            purchasedAt: result.license.purchasedAt,
          },
        });
      }

      return data({
        valid: false,
        isPro: false,
        error: result.error,
      });
    }

    // Check lifetime usage for free tier (5 exports max, NEVER resets)
    if (!figmaUserId) {
      // Can't track usage without user ID
      return data({
        valid: false,
        isPro: false,
        error: 'User identification required for free tier',
      });
    }

    const usageResult = await checkUsage(figmaUserId);

    return data({
      valid: usageResult.canExport,
      isPro: false,
      lifetimeUsageCount: usageResult.count,
      lifetimeLimit: usageResult.limit,
    });
  } catch (error) {
    console.error('Validation error:', error);
    return data({ valid: false, error: 'Validation failed' }, { status: 500 });
  }
}
