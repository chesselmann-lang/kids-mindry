// ─── Security Headers ────────────────────────────────────────────────────────
// Kinder-App (Art. 8 DSGVO): extra strikte CSP + keine Einbettung in Frames
const SUPABASE_HOST = 'swrtduckugkxzrfrbgav.supabase.co'

const CSP = [
  "default-src 'self'",
  // Next.js App Router + Tailwind require unsafe-inline; unsafe-eval only in dev
  "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''),
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://${SUPABASE_HOST}`,
  "font-src 'self' data:",
  // Supabase REST + Realtime WebSocket
  `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://*.supabase.co wss://*.supabase.co`,
  "media-src 'self' blob:",
  "object-src 'none'",
  "frame-src 'none'",
  // Kritisch: App darf nicht in fremde Frames eingebettet werden
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ')

// Permissions-Policy: für Kinder-App komplett restriktiv
const PERMISSIONS_POLICY = [
  'camera=()',
  'microphone=()',
  'geolocation=()',
  'payment=()',
  'usb=()',
  'bluetooth=()',
  'interest-cohort=()',
  'accelerometer=()',
  'gyroscope=()',
  'magnetometer=()',
  'display-capture=()',
  'screen-wake-lock=()',
].join(', ')

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TODO Phase 0: Typen wurden am 20.11.2026 neu aus Supabase erzeugt.
    // Restliche Fehler (u. a. Code greift auf nicht vorhandene Tabellen zu)
    // stehen in STATUS.md. Erst danach auf false stellen.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'swrtduckugkxzrfrbgav.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['kids.mindry.de', 'localhost:3000'],
    },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Clickjacking-Schutz (Legacy-Browser)
          { key: 'X-Frame-Options', value: 'DENY' },
          // MIME-Sniffing unterbinden
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer auf gleiche Origin begrenzen
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // HSTS: 1 Jahr, inkl. Subdomains
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          // CSP: strikt + frame-ancestors 'none'
          { key: 'Content-Security-Policy', value: CSP },
          // Permissions: Kinder-App — keine Kamera/Mikro/Geo etc.
          { key: 'Permissions-Policy', value: PERMISSIONS_POLICY },
          // XSS-Protection (Legacy IE/Edge)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // DNS-Prefetch-Control
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ]
  },
}

// Sentry wird über sentry.*.config.ts konfiguriert (lazy, nur wenn NEXT_PUBLIC_SENTRY_DSN gesetzt).
// withSentryConfig wird nicht verwendet, da es build-unkompatibel mit dem aktuellen Setup ist.
export default nextConfig
