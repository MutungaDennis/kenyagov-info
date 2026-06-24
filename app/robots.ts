// app/robots.txt
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 1. ALLOW Search & AI Citation (Max visibility, protects heavy database routes)
      {
        userAgent: [
          'Googlebot',
          'Google-Extended',      // Gemini
          'GPTBot',               // ChatGPT
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Applebot-Extended',
          'Bingbot'               // Bing & Copilot
        ],
        allow: '/',
        disallow: ['/admin', '/studio', '/api/admin', '/search*', '/*?q=*'],
      },

      // 2. BLOCK Aggressive Scrapers (Total ban; no contradictory delay metrics)
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'DotBot',
          'MegaIndex.ru',
          'CCBot',
          'Bytespider',
          'deepcrawl',
          'Rogerbot'
        ],
        disallow: ['/'],
      },

      // 3. Fallback configuration for all other unlisted compliance bots
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/studio', '/api/admin', '/search*'],
        crawlDelay: 2,
      },
    ],
    sitemap: 'https://www.citizenguide.ke/sitemap.xml',
  };
}
