import { data } from 'react-router';
import { usageAnalytics } from '~/database/schema';
import { database } from '~/database/context';
import { incrementDailyUsage } from '~/lib/license.server';
import { 
  validateRequest,
  generateSecureDeviceId,
  checkRateLimit
} from '~/lib/security.server';
import { corsHeaders } from '~/lib/cors.server';
import { z } from 'zod';
import type { Route } from './+types/track';

const trackSchema = z.object({
  event: z.string(),
  figmaUserId: z.string().optional(),
  properties: z.record(z.string(), z.any()).optional(),
});

export async function action({ request }: Route.ActionArgs) {
  const origin = request.headers.get('origin');
  // Validate request source (plugin or web)
  const validation = validateRequest(request);
  if (!validation.valid) {
    return data({ error: validation.error }, { status: 403, headers: corsHeaders(origin) });
  }

  // Get IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Get Figma user ID from header
  const figmaUserId = request.headers.get('x-figma-user-id') || undefined;
  
  // Generate identifier for rate limiting
  const rateLimitId = figmaUserId || ip;

  // Apply rate limiting based on client type
  if (!checkRateLimit(rateLimitId, validation.clientType, 'track')) {
    return data({ error: 'Rate limit exceeded' }, { status: 429, headers: corsHeaders(origin) });
  }

  try {
    const body = await request.json();
    const { event, properties } = trackSchema.parse(body);

    // Generate secure device ID
    const deviceId = generateSecureDeviceId(figmaUserId, ip);

    // Only track essential events
    const essentialEvents = [
      'export_completed',
      'plugin_opened',
      'license_activated'
    ];

    if (!essentialEvents.includes(event)) {
      return Response.json({ success: true }, { headers: corsHeaders(origin) }); // Silently ignore non-essential events
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
          clientType: validation.clientType,
        }),
        ip: ip === 'unknown' ? null : ip,
        userAgent: null, // Don't store user agent
      });

    // Update daily usage ONLY for export events from plugins
    if (event === 'export_completed' && validation.clientType === 'plugin') {
      await incrementDailyUsage(deviceId);
    }

    return Response.json({ success: true }, { headers: corsHeaders(origin) });
  } catch (error) {
    console.error('Tracking error:', error);
    // Don't expose errors to client
    return Response.json({ success: true }, { headers: corsHeaders(origin) });
  }
}