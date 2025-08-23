import crypto from 'crypto';

// API key for plugin authentication
const PLUGIN_API_KEY = process.env.PLUGIN_API_KEY || 'motion-export-plugin-2024';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://www.figma.com',
  'https://figma.com',
  'http://localhost:3000', // Development
];

// Rate limiting cache
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

export function validateOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

export function validateApiKey(apiKey: string | null): boolean {
  if (!apiKey) return false;
  return apiKey === PLUGIN_API_KEY;
}

// Generate secure device ID from user data
export function generateSecureDeviceId(
  figmaUserId?: string,
  ip?: string
): string {
  // Use Figma user ID as primary identifier
  if (figmaUserId) {
    return `figma-${figmaUserId}`;
  }
  
  // Fallback to IP-based device ID
  if (ip && ip !== 'unknown') {
    const hash = crypto.createHash('sha256');
    hash.update(ip);
    return `ip-${hash.digest('hex').substring(0, 16)}`;
  }
  
  // Should not reach here in production
  throw new Error('Unable to generate device ID');
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

// Simple rate limiting
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const cached = rateLimitCache.get(identifier);
  
  // Clean up old entries
  if (rateLimitCache.size > 1000) {
    for (const [key, value] of rateLimitCache.entries()) {
      if (value.resetAt < now) {
        rateLimitCache.delete(key);
      }
    }
  }
  
  if (!cached || cached.resetAt < now) {
    rateLimitCache.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }
  
  if (cached.count >= limit) {
    return false;
  }
  
  cached.count++;
  return true;
}

// Sanitize input strings
export function sanitizeInput(input: string): string {
  // Remove control characters and trim
  return input.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

// Validate license key format
export function isValidLicenseKeyFormat(key: string): boolean {
  // Format: XXXX-XXXX-XXXX-XXXX (alphanumeric)
  const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(key);
}