// app/layout.tsx
import { Metadata, Viewport } from 'next';
import { Public_Sans } from 'next/font/google';

import "govuk-frontend/govuk-frontend.min.css";
import "@/app/globals.css";

import { ClientLayoutWrapper } from "./ClientLayoutWrapper";

const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-public-sans',
});

const SITE_URL = 'https://www.citizenguide.ke';
const SITE_NAME = 'CitizenGuide.KE';
const DEFAULT_TITLE = 'CitizenGuide.KE — Informational guide to Kenyan governance';
const DEFAULT_DESCRIPTION =
  'Find clear, factual information about the Government of Kenya — institutions, leaders, counties, public services, elections, and the Constitution of Kenya 2010.';

/**
 * Default social share image: branded card with site logo.
 * Absolute URL (via metadataBase) so WhatsApp, Facebook, LinkedIn, X can fetch it.
 * File is ~13KB — well under Vercel limits (previous assets exceeded 1MB).
 */
const OG_IMAGE = {
  url: '/og-image.webp',
  width: 1200,
  height: 630,
  alt: 'CitizenGuide.KE — Your guide to Kenyan governance',
  type: 'image/webp' as const,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#047857',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'government',
  keywords: [
    'Kenya government',
    'Constitution of Kenya',
    'counties',
    'public services',
    'elections',
    'IEBC',
    'Parliament of Kenya',
    'cabinet',
    'CitizenGuide',
    'civic information',
  ],

  alternates: {
    canonical: '/',
    // AI / LLM discovery file (also at /llms.txt)
    types: {
      'text/plain': [{ url: '/llms.txt', title: 'llms.txt' }],
    },
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  // Open Graph — GOV.UK-style centralized template defaults
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },

  // X / Twitter
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE.url],
  },

  // Icons / favicon (logo)
  icons: {
    icon: [{ url: '/logo.webp', type: 'image/webp' }],
    apple: [{ url: '/logo.webp', type: 'image/webp' }],
  },

  // Manifest-friendly
  other: {
    'ai-content': 'index',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-rendered JSON-LD for crawlers (not client-only)
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: ['Citizen Guide Kenya', 'citizenguide.ke'],
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'en-KE',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.webp`,
        width: 512,
        height: 512,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search/all?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.webp`,
    description:
      'Independent civic technology platform providing structured information on Kenya’s Constitution, government institutions, counties, and public services. Not an official government website.',
    areaServed: {
      '@type': 'Country',
      name: 'Kenya',
    },
    sameAs: [],
  };

  return (
    <html lang="en-KE" className={`govuk-template ${publicSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
      </head>
      <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
    </html>
  );
}
