// CORS configuration for API routes

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

export function handleCors(request: Request): Response | null {
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin)
    });
  }
  
  return null;
}