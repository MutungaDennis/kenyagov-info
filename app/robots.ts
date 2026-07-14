// app/robots.ts
import type { MetadataRoute } from 'next';
import { getAdminBasePath } from '@/lib/admin-path';

const SITE_URL = 'https://www.citizenguide.ke';

/**
 * robots.txt — allow major search engines and AI crawlers to discover content.
 * Block admin/studio and SEO scrapers only.
 *
 * AI discovery also uses: https://www.citizenguide.ke/llms.txt
 */
export default function robots(): MetadataRoute.Robots {
  const adminBase = getAdminBasePath();
  const privatePaths = [
    '/admin',
    '/admin/',
    adminBase,
    `${adminBase}/`,
    '/studio',
    '/studio/',
    '/api/admin',
    '/api/admin/',
  ];

  return {
    rules: [
      // Search engines + AI assistants (allow public content)
      {
        userAgent: [
          'Googlebot',
          'Google-Extended',
          'GoogleOther',
          'Bingbot',
          'Slurp', // Yahoo
          'DuckDuckBot',
          'Yandex',
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'ClaudeBot',
          'anthropic-ai',
          'PerplexityBot',
          'Applebot',
          'Applebot-Extended',
          'Amazonbot',
          'meta-externalagent',
          'FacebookBot',
          'LinkedInBot',
          'Twitterbot',
          'CCBot', // Common Crawl — used by many AI corpora
        ],
        allow: '/',
        disallow: privatePaths,
      },

      // Aggressive commercial SEO scrapers (not discovery engines)
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'DotBot',
          'MegaIndex.ru',
          'Bytespider',
          'Rogerbot',
        ],
        disallow: ['/'],
      },

      // Everyone else
      {
        userAgent: '*',
        allow: '/',
        disallow: privatePaths,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
