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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.deepgram.com https://api.groq.com https://api.cerebras.ai https://generativelanguage.googleapis.com https://openrouter.ai https://lumberjack.razorpay.com",
              "frame-src https://api.razorpay.com https://checkout.razorpay.com",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
