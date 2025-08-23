import { data } from 'react-router';
import { usageAnalytics } from '~/database/schema';
import { database } from '~/database/context';
import { incrementDailyUsage } from '~/lib/license.server';
import { 
  validateApiKey, 
  validateOrigin, 
  generateSecureDeviceId,
  checkRateLimit
} from '~/lib/security.server';
import { z } from 'zod';
import type { Route } from './+types/track';

const trackSchema = z.object({
  event: z.string(),
  figmaUserId: z.string().optional(),
  properties: z.record(z.string(), z.any()).optional(),
});

export async function action({ request }: Route.ActionArgs) {
  // Security: Check origin
  const origin = request.headers.get('origin');
  if (!validateOrigin(origin)) {
    return data({ error: 'Invalid origin' }, { status: 403 });
  }

  // Security: Check API key
  const apiKey = request.headers.get('x-api-key');
  if (!validateApiKey(apiKey)) {
    return data({ error: 'Invalid API key' }, { status: 401 });
  }

  // Get IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Security: Rate limiting (higher limit for tracking)
  if (!checkRateLimit(ip, 100, 60000)) { // 100 requests per minute
    return data({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { event, figmaUserId, properties } = trackSchema.parse(body);

    // Generate secure device ID
    const deviceId = generateSecureDeviceId(figmaUserId, ip);

    // Only track essential events
    const essentialEvents = [
      'export_completed',
      'plugin_opened',
      'license_activated'
    ];

    if (!essentialEvents.includes(event)) {
      return Response.json({ success: true }); // Silently ignore non-essential events
    }

    // Track event (minimal data)
    await database()
      .insert(usageAnalytics)
      .values({
        event,
        userId: figmaUserId,
        properties: JSON.stringify({
          framework: properties?.framework,
          count: properties?.animationCount,
          version: properties?.pluginVersion,
        }),
        ip: ip === 'unknown' ? null : ip,
        userAgent: null, // Don't store user agent
      });

    // Update daily usage ONLY for export events
    if (event === 'export_completed') {
      await incrementDailyUsage(deviceId);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Tracking error:', error);
    // Don't expose errors to client
    return Response.json({ success: true });
  }
}