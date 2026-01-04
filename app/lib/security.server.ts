import crypto from 'crypto';

// Allowed origins for different clients
const ALLOWED_ORIGINS = {
  figma: [
    'https://www.figma.com',
    'https://figma.com',
    'null', // Figma plugins send 'null' origin in some cases
  ],
  web: [
    'https://motionexport.com',
    'https://www.motionexport.com',
    'http://localhost:3000', // Development only
  ],
};

// Plugin identifiers (not secrets, just for identification)
const VALID_PLUGIN_IDS = ['motion-export'];

// Rate limiting cache
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

export function validateRequest(request: Request): {
  valid: boolean;
  error?: string;
  clientType?: 'plugin' | 'web';
} {
  const origin = request.headers.get('origin');
  const pluginId = request.headers.get('x-plugin-id');
  const figmaUserId = request.headers.get('x-figma-user-id');

  // Check if it's a Figma plugin request
  if (pluginId) {
    // Validate plugin ID
    if (!VALID_PLUGIN_IDS.includes(pluginId)) {
      return { valid: false, error: 'Invalid plugin' };
    }

    // Validate origin is from Figma
    if (origin && !ALLOWED_ORIGINS.figma.includes(origin)) {
      return { valid: false, error: 'Invalid origin for plugin' };
    }

    // Figma plugins always have a logged-in user
    // The 'anonymous' case should never happen in practice
    return { valid: true, clientType: 'plugin' };
  }

  // Check if it's a web app request
  if (
    origin &&
    ALLOWED_ORIGINS.web.some((allowed) => origin.startsWith(allowed))
  ) {
    return { valid: true, clientType: 'web' };
  }

  return { valid: false, error: 'Unauthorized request source' };
}

export function getFigmaUserId(figmaUserId?: string): string | null {
  if (!figmaUserId) {
    return null;
  }
  return figmaUserId;
}

// Enhanced rate limiting with different limits per client type
type RateLimitConfig = {
  requests: number;
  windowMs: number;
};

type EndpointLimits = {
  validate: RateLimitConfig;
  track: RateLimitConfig;
  default: RateLimitConfig;
  [key: string]: RateLimitConfig;
};

export function checkRateLimit(
  identifier: string,
  clientType: 'plugin' | 'web' = 'plugin',
  endpoint: string = 'default',
): boolean {
  const now = Date.now();

  // Different limits for different client types and endpoints
  const limits: Record<'plugin' | 'web', EndpointLimits> = {
    plugin: {
      validate: { requests: 30, windowMs: 60000 }, // 30 per minute
      track: { requests: 100, windowMs: 60000 }, // 100 per minute
      recover: { requests: 5, windowMs: 60000 }, // 5 per minute (strict for security)
      default: { requests: 50, windowMs: 60000 }, // 50 per minute
    },
    web: {
      validate: { requests: 10, windowMs: 60000 }, // 10 per minute
      track: { requests: 50, windowMs: 60000 }, // 50 per minute
      recover: { requests: 5, windowMs: 60000 }, // 5 per minute (strict for security)
      default: { requests: 20, windowMs: 60000 }, // 20 per minute
    },
  };

  const clientLimits = limits[clientType];
  const limit = clientLimits[endpoint] || clientLimits.default;
  const cacheKey = `${clientType}:${endpoint}:${identifier}`;
  const cached = rateLimitCache.get(cacheKey);

  // Clean up old entries periodically
  if (rateLimitCache.size > 1000) {
    for (const [key, value] of rateLimitCache.entries()) {
      if (value.resetAt < now) {
        rateLimitCache.delete(key);
      }
    }
  }

  if (!cached || cached.resetAt < now) {
    rateLimitCache.set(cacheKey, {
      count: 1,
      resetAt: now + limit.windowMs,
    });
    return true;
  }

  if (cached.count >= limit.requests) {
    return false;
  }

  cached.count++;
  return true;
}

// Sanitize input strings
export function sanitizeInput(input: string): string {
  // Remove control characters and trim
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

// Validate license key format
export function isValidLicenseKeyFormat(key: string): boolean {
  // Format: XXXX-XXXX-XXXX-XXXX (alphanumeric)
  const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(key);
}
