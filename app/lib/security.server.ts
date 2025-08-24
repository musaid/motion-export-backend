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

    // Require Figma user ID for plugin requests
    if (!figmaUserId || figmaUserId === 'anonymous') {
      // Allow anonymous for some operations but track differently
      console.warn('Anonymous plugin request');
    }

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

// Generate secure device ID from user data
export function generateSecureDeviceId(
  figmaUserId?: string,
  ip?: string,
): string {
  // Use Figma user ID as primary identifier
  if (figmaUserId && figmaUserId !== 'anonymous') {
    return `figma-${figmaUserId}`;
  }

  // Fallback to IP-based device ID for anonymous users
  if (ip && ip !== 'unknown') {
    const hash = crypto.createHash('sha256');
    hash.update(ip);
    hash.update(process.env.DEVICE_SALT || 'motion-export-device');
    return `ip-${hash.digest('hex').substring(0, 16)}`;
  }

  // Generate a temporary ID for edge cases
  return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Hash license key for storage
export function hashLicenseKey(key: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(key);
  hash.update(process.env.LICENSE_SALT || 'motion-export-salt');
  return hash.digest('hex');
}

// Verify license key against hash
export function verifyLicenseKey(key: string, hash: string): boolean {
  return hashLicenseKey(key) === hash;
}

// Enhanced rate limiting with different limits per client type
export function checkRateLimit(
  identifier: string,
  clientType: 'plugin' | 'web' = 'plugin',
  endpoint: string = 'default',
): boolean {
  const now = Date.now();

  // Different limits for different client types and endpoints
  const limits = {
    plugin: {
      validate: { requests: 30, windowMs: 60000 }, // 30 per minute
      track: { requests: 100, windowMs: 60000 }, // 100 per minute
      default: { requests: 50, windowMs: 60000 }, // 50 per minute
    },
    web: {
      validate: { requests: 10, windowMs: 60000 }, // 10 per minute
      track: { requests: 50, windowMs: 60000 }, // 50 per minute
      default: { requests: 20, windowMs: 60000 }, // 20 per minute
    },
  };

  const limit = limits[clientType][endpoint] || limits[clientType].default;
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
