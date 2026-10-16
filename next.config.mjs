/** @type {import('next').NextConfig} */

const nextConfig = {
  // ─── Security ───
  poweredByHeader: false, // remove X-Powered-By: Next.js header

  // ─── React ───
  reactStrictMode: true,

  // ─── Image Optimisation (WebP/AVIF auto-convert) ───
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24h cache
  },

  // ─── Experimental ───
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'pdfjs-dist'],
    optimizePackageImports: ['lucide-react', 'recharts'],
  },

  // ─── Production HTTP Security Headers ───
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=self, microphone=self, geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://checkout.razorpay.com https://cdn.jsdelivr.net https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: https://*.google-analytics.com https://*.googletagmanager.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.deepgram.com https://*.convertapi.com https://api.cerebras.ai https://api.groq.com https://generativelanguage.googleapis.com https://openrouter.ai https://cdn.jsdelivr.net https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
              "media-src 'self' blob:",
              "worker-src 'self' blob: https://cdnjs.cloudflare.com https://cdn.jsdelivr.net",
              "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com",
            ].join('; '),
          },
        ],
      },
      // ─── Block Googlebot from indexing Vercel preview domain ───
      {
        source: '/(.*)',
        has: [{ type: 'host', value: 'ppt-analyzer.vercel.app' }],
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },

  // ─── Canonical Domain 308 Permanent Redirects (Consolidate SEO & Favicon) ───
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'ppt-analyzer.vercel.app',
          },
        ],
        destination: 'https://oratii.in/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
