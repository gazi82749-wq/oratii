import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/speech-coach', '/presentation', '/challenge', '/viva', '/reports', '/profile', '/account'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://Oratii.app'}/sitemap.xml`,
  };
}
