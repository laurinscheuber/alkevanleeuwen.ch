export function onRequest({ request }, next) {
  return next().then((response) => {
    const url = new URL(request.url);

    // Skip security headers for Sanity Studio
    if (url.pathname.startsWith('/studio')) {
      return response;
    }

    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()',
    );
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' cdn.sanity.io data:; font-src 'self'; connect-src 'self' o456yg1x.api.sanity.io ws: wss:; frame-ancestors 'none'",
    );

    return response;
  });
}
