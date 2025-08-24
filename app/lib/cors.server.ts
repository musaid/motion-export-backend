// CORS configuration for API routes
// Note: CORS is now handled by Express middleware in server/app.ts
// These functions are kept for compatibility but the actual CORS handling
// happens at the Express level before React Router processes the request

export function corsHeaders(origin: string | null = null): HeadersInit {
  // Allow specific origins including 'null' for local Figma development
  const allowedOrigins = [
    'https://www.figma.com',
    'https://figma.com',
    'https://motionexport.com',
    'https://www.motionexport.com',
    'http://localhost:3000',
    'null' // Local Figma plugins send 'null' as origin
  ];

  // Check if origin is allowed
  const isAllowed = !origin || allowedOrigins.includes(origin);
  const allowOrigin = isAllowed ? (origin || '*') : 'https://motionexport.com';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Plugin-Id, X-Figma-User-Id, X-API-Key',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Access-Control-Allow-Credentials': 'true'
  };
}