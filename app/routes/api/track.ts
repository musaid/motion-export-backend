import { data } from 'react-router';
import { analytics } from '~/database/schema';
import { database } from '~/database/context';
import { incrementUsage } from '~/lib/license.server';
import {
  validateRequest,
  generateSecureDeviceId,
  checkRateLimit,
} from '~/lib/security.server';
import {
  isCriticalEvent,
  sendScanCompletedNotification,
  sendLicenseActivationSuccessNotification,
  sendExportBlockedFreeLimitNotification,
  sendExportBlockedProFeatureNotification,
  sendPurchaseButtonClickedNotification,
  sendLicenseActivationFailedNotification,
} from '~/lib/telegram.server';
import { z } from 'zod';
import type { Route } from './+types/track';

const trackSchema = z.object({
  event: z.string(),
  figmaUserId: z.string().optional(),
  properties: z.record(z.string(), z.any()).optional(),
});

export async function action({ request }: Route.ActionArgs) {
  // Validate request source (plugin or web)
  const validation = validateRequest(request);
  if (!validation.valid) {
    return data({ error: validation.error }, { status: 403 });
  }

  // Get IP for rate limiting
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  try {
    const body = await request.json();
    const {
      event,
      properties,
      figmaUserId: bodyUserId,
    } = trackSchema.parse(body);

    // Get Figma user ID from header or body
    const figmaUserId =
      request.headers.get('x-figma-user-id') || bodyUserId || undefined;

    // Generate identifier for rate limiting
    const rateLimitId = figmaUserId || ip;

    // Apply rate limiting based on client type
    if (!checkRateLimit(rateLimitId, validation.clientType, 'track')) {
      return data({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    // Generate secure device ID
    const deviceId = generateSecureDeviceId(figmaUserId, ip);

    // Track all events (no whitelist)
    // Store all properties sent by the plugin along with clientType
    await database()
      .insert(analytics)
      .values({
        event,
        userId: figmaUserId,
        properties: JSON.stringify({
          ...properties,
          clientType: validation.clientType,
        }),
        ip: ip === 'unknown' ? null : ip,
        userAgent: null, // Don't store user agent
      });

    // Send Telegram notifications ONLY for critical events (fire-and-forget)
    if (isCriticalEvent(event)) {
      switch (event) {
        case 'scan_completed':
          sendScanCompletedNotification({
            figmaUserId,
            sessionId: properties?.sessionId,
            animationsCount: properties?.animationsCount,
            animationTypes: properties?.animationTypes,
            scanDuration: properties?.scanDuration,
            hasAnimations: properties?.hasAnimations,
            isFirstScan: properties?.isFirstScan,
          });
          break;

        case 'license_activation_success':
          sendLicenseActivationSuccessNotification({
            figmaUserId,
            sessionId: properties?.sessionId,
            activationMethod: properties?.activationMethod,
            timeToActivate: properties?.timeToActivate,
          });
          break;

        case 'export_blocked_free_limit':
          sendExportBlockedFreeLimitNotification({
            figmaUserId,
            lifetimeUsageCount: properties?.lifetimeUsageCount,
            lifetimeLimit: properties?.lifetimeLimit,
            attemptedFramework: properties?.attemptedFramework,
          });
          break;

        case 'export_blocked_pro_feature':
          sendExportBlockedProFeatureNotification({
            figmaUserId,
            featureName: properties?.featureName,
            animationsCount: properties?.animationsCount,
          });
          break;

        case 'purchase_button_clicked':
          sendPurchaseButtonClickedNotification({
            figmaUserId,
            currentPrice: properties?.currentPrice,
            originalPrice: properties?.originalPrice,
            discountPercentage: properties?.discountPercentage,
            triggerSource: properties?.triggerSource,
          });
          break;

        case 'license_activation_failed':
          sendLicenseActivationFailedNotification({
            figmaUserId,
            errorType: properties?.errorType,
            keyFormatValid: properties?.keyFormatValid,
          });
          break;
      }
    }

    // Update lifetime usage ONLY for export events from plugins (NO daily resets)
    if (event === 'export_completed' && validation.clientType === 'plugin') {
      await incrementUsage(deviceId);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Tracking error:', error);
    // Don't expose errors to client
    return Response.json({ success: true });
  }
}
