import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/studio', '/api/admin'],
    },
    sitemap: 'https://citizenguide.ke/sitemap.xml',
  };
}
