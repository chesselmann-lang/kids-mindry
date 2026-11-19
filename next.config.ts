import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'swrtduckugkxzrfrbgav.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['kids.mindry.de', 'localhost:3000'],
    },
  },
}

// Sentry wird über sentry.*.config.ts konfiguriert (lazy, nur wenn NEXT_PUBLIC_SENTRY_DSN gesetzt).
// withSentryConfig wird nicht verwendet, da es build-unkompatibel mit dem aktuellen Setup ist.
export default nextConfig
