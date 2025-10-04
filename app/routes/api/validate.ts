import { data } from 'react-router';
import { validateLicense, checkUsage } from '~/lib/license.server';
import {
  validateRequest,
  generateSecureDeviceId,
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

  // Get IP for rate limiting and device ID generation
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  try {
    const body = await request.json();
    const parsed = validateSchema.parse(body);

    // Get Figma user ID from header or body
    const figmaUserId =
      request.headers.get('x-figma-user-id') || parsed.figmaUserId || undefined;

    // Generate identifier for rate limiting
    const rateLimitId = figmaUserId || ip;

    // Apply rate limiting based on client type
    if (!checkRateLimit(rateLimitId, validation.clientType, 'validate')) {
      return data(
        { valid: false, error: 'Rate limit exceeded' },
        { status: 429 },
      );
    }

    // Generate secure device ID server-side
    const deviceId = generateSecureDeviceId(figmaUserId, ip);

    // Check for pro license
    if (parsed.licenseKey) {
      // Validate license key format
      const sanitizedKey = sanitizeInput(parsed.licenseKey);
      if (!isValidLicenseKeyFormat(sanitizedKey)) {
        return data({
          valid: false,
          isPro: false,
          error: 'Invalid license key format',
        });
      }

      const result = await validateLicense(sanitizedKey, deviceId);

      if (result.valid && result.license) {
        // Check if this is a new activation
        const activations = JSON.parse(result.license.activations || '[]');
        const isNewActivation = !activations.some(
          (a: { deviceId: string }) => a.deviceId === deviceId,
        );

        // Send notification for new activations (fire-and-forget)
        if (isNewActivation) {
          sendLicenseActivatedNotification({
            email: result.license.email,
            deviceId,
            activationCount: activations.length,
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
    const usageResult = await checkUsage(deviceId);

    return data({
      valid: usageResult.canExport,
      isPro: false,
      dailyUsageCount: usageResult.count, // Keep name for backwards compat, but it's lifetime count
      dailyLimit: usageResult.limit,
    });
  } catch (error) {
    console.error('Validation error:', error);
    return data({ valid: false, error: 'Validation failed' }, { status: 500 });
  }
}
