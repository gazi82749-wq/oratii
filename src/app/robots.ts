import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oratii.in';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/speech-coach', '/presentation', '/challenge', '/viva', '/reports', '/profile', '/account', '/admin'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

