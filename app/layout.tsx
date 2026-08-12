// app/layout.tsx
import { Metadata, Viewport } from 'next';

import "govuk-frontend/govuk-frontend.min.css";
import "@/app/globals.css";

import { ClientLayoutWrapper } from "./ClientLayoutWrapper";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00703c',
};

/**
 * Root metadata for social previews (WhatsApp, X, Facebook, Telegram, iMessage).
 * Per-page routes should override title/description/canonical via generateMetadata
 * or page `metadata` — do NOT set a sitewide canonical to "/" here.
 */
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

  // Do NOT set openGraph.url or alternates.canonical to the homepage here.
  // A sitewide homepage canonical makes Google treat every URL as a duplicate
  // of "/" (GSC: "Alternate page with proper canonical tag").
  // Each route must set its own canonical via buildPageMetadata / generateMetadata.
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },

  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },

  icons: {
    icon: [
      { url: '/logo.webp', type: 'image/webp' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/logo.webp', type: 'image/webp' }],
  },

  other: {
    'ai-content': 'index',
    // WhatsApp / some scrapers also look at these loosely
    'og:logo': `${SITE_URL}/logo.webp`,
    'origin-trial': 'A4osS6hE38l+I8HVoNIZUPu9CvgXN7Wk4+mu9gbnNgUlJpGPrpgjNNw+kHB/IPzh2AwL+sjPB5rnWBQMk1OGLw8AAAB2eyJvcmlnaW4iOiJodHRwczovL2NpdGl6ZW5ndWlkZS5rZTo0NDMiLCJmZWF0dXJlIjoiV2ViTUNQIiwiZXhwaXJ5IjoxNzk0ODczNjAwLCJpc1N1YmRvbWFpbiI6dHJ1ZSwiaXN0aGlyZFBhcnR5Ijp0cnVlfQ==',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Inject Supabase public env for the browser when Worker runtime has vars
  // but they were not inlined at `next build` (common Cloudflare misconfig).
  // Client pages then skip a failing placeholder and avoid blank data UIs.
  const runtimeSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const runtimeSupabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "";
  const publicEnvBootstrap =
    runtimeSupabaseUrl && runtimeSupabaseKey
      ? `window.__CG_PUBLIC_ENV=${JSON.stringify({
          supabaseUrl: runtimeSupabaseUrl,
          supabaseAnonKey: runtimeSupabaseKey,
        })};`
      : "";

  // WebSite + SearchAction enables Google’s sitelinks search box when eligible.
  // Target must match the real site search that returns institutions, laws, pages, etc.
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: ['Citizen Guide Kenya', 'CitizenGuide', 'citizenguide.ke'],
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'en-KE',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.webp`,
      width: 512,
      height: 512,
    },
    description:
      'Independent civic technology platform providing structured information on Kenya’s Constitution, government institutions, counties, and public services. Not an official government website.',
    areaServed: {
      '@type': 'Country',
      name: 'Kenya',
    },
    // Not an official government body — do not claim GovernmentOrganization.
    sameAs: [],
  };

  return (
    <html lang="en-KE" className="govuk-template">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
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
        {publicEnvBootstrap ? (
          <script
            dangerouslySetInnerHTML={{ __html: publicEnvBootstrap }}
          />
        ) : null}
        {runtimeSupabaseUrl ? (
          <link rel="preconnect" href={runtimeSupabaseUrl} crossOrigin="anonymous" />
        ) : null}
      </head>
      <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
    </html>
  );
}