export async function onRequest({ request }, next) {
  const response = await next();
  const url = new URL(request.url);

  // Skip security headers for Sanity Studio
  if (url.pathname.startsWith('/studio')) {
    return response;
  }

  const mutableHeaders = new Headers(response.headers);
  mutableHeaders.set('X-Content-Type-Options', 'nosniff');
  mutableHeaders.set('X-Frame-Options', 'DENY');
  mutableHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  mutableHeaders.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  mutableHeaders.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  mutableHeaders.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' data:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' cdn.sanity.io data:; font-src 'self'; connect-src 'self' o456yg1x.api.sanity.io ws: wss:; frame-ancestors 'none'"
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: mutableHeaders
  });
}
