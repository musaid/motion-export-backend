import { data } from 'react-router';
import { validateLicense, checkDailyUsage } from '~/lib/license.server';
import { 
  validateRequest,
  generateSecureDeviceId,
  checkRateLimit,
  isValidLicenseKeyFormat,
  sanitizeInput
} from '~/lib/security.server';
import { corsHeaders, handleCors } from '~/lib/cors.server';
import { z } from 'zod';
import type { Route } from './+types/validate';

const validateSchema = z.object({
  licenseKey: z.string().optional(),
  figmaUserId: z.string().optional(),
});

// Handle OPTIONS and GET requests
export async function loader({ request }: Route.LoaderArgs) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  const origin = request.headers.get('origin');
  // Return method not allowed for GET
  return data(
    { error: 'Method not allowed' }, 
    { status: 405, headers: corsHeaders(origin) }
  );
}

export async function action({ request }: Route.ActionArgs) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  const origin = request.headers.get('origin');
  // Validate request source (plugin or web)
  const validation = validateRequest(request);
  if (!validation.valid) {
    return data(
      { valid: false, error: validation.error }, 
      { status: 403, headers: corsHeaders(origin) }
    );
  }

  // Get IP for rate limiting and device ID generation
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Get Figma user ID from header (more reliable than body)
  const figmaUserId = request.headers.get('x-figma-user-id') || undefined;
  
  // Generate identifier for rate limiting
  const rateLimitId = figmaUserId || ip;

  // Apply rate limiting based on client type
  if (!checkRateLimit(rateLimitId, validation.clientType, 'validate')) {
    return data(
      { valid: false, error: 'Rate limit exceeded' }, 
      { status: 429, headers: corsHeaders(origin) }
    );
  }

  try {
    const body = await request.json();
    const { licenseKey } = validateSchema.parse(body);

    // Generate secure device ID server-side
    const deviceId = generateSecureDeviceId(figmaUserId, ip);

    // Check for pro license
    if (licenseKey) {
      // Validate license key format
      const sanitizedKey = sanitizeInput(licenseKey);
      if (!isValidLicenseKeyFormat(sanitizedKey)) {
        return data({
          valid: false,
          isPro: false,
          error: 'Invalid license key format',
        }, { headers: corsHeaders(origin) });
      }

      const result = await validateLicense(sanitizedKey, deviceId);

      if (result.valid) {
        return data({
          valid: true,
          isPro: true,
          license: {
            email: result.license!.email,
            purchasedAt: result.license!.purchasedAt,
          },
        }, { headers: corsHeaders(origin) });
      }

      return data({
        valid: false,
        isPro: false,
        error: result.error,
      }, { headers: corsHeaders(origin) });
    }

    // Check daily usage for free tier
    const usage = await checkDailyUsage(deviceId);

    return data({
      valid: usage.canExport,
      isPro: false,
      dailyUsageCount: usage.count,
      dailyLimit: usage.limit,
    }, { headers: corsHeaders(origin) });
  } catch (error) {
    console.error('Validation error:', error);
    return data(
      { valid: false, error: 'Validation failed' }, 
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}