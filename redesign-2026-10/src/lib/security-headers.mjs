// Baseline response headers for both marketing hosts. Static site, no API routes.
// The CSP ships as Report-Only first: inline scripts (consent, Tally loader, contact mailto,
// JSON-LD) and the Vercel preview toolbar need checking before anything is enforced.
// Turning it into an enforcing Content-Security-Policy is a separate, reviewed change.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://tally.so https://vercel.live",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://tally.so https://vercel.live",
  "img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com https://tally.so",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "frame-src https://tally.so https://vercel.live",
  "frame-ancestors 'self'",
  "form-action 'self' mailto:",
  "base-uri 'self'",
  "object-src 'none'"
].join("; ");

export function securityHeaders() {
  return {
    source: "/(.*)",
    headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
      { key: "Content-Security-Policy-Report-Only", value: CSP }
    ]
  };
}
