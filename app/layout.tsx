import { Metadata, Viewport } from 'next';
import Script from 'next/script';

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
    'og:logo': `${SITE_URL}/logo.webp`,
    'origin-trial': 'A4osS6hE38l+I8HVoNIZUPu9CvgXN7Wk4+mu9gbnNgUlJpGPrpgjNNw+kHB/IPzh2AwL+sjPB5rnWBQMk1OGLw8AAAB2eyJvcmlnaW4iOiJodHRwczovL2NpdGl6ZW5ndWlkZS5rZTo0NDMiLCJmZWF0dXJlIjoiV2ViTUNQIiwiZXhwaXJ5IjoxNzk0ODczNjAwLCJpc1N1YmRvbWFpbiI6dHJ1ZSwiaXN0aGlyZFBhcnR5Ijp0cnVlfQ==',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    sameAs: [],
  };

  return (
    <html lang="en-KE" className="govuk-template">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        
        {/* ✅ Use Next.js Script for JSON-LD to avoid hydration issues */}
        <Script
          id="website-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
        
        {/* ✅ Environment Bootstrap Script */}
        {publicEnvBootstrap && (
          <Script
            id="public-env-bootstrap"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: publicEnvBootstrap }}
          />
        )}

        {runtimeSupabaseUrl && (
          <link rel="preconnect" href={runtimeSupabaseUrl} crossOrigin="anonymous" />
        )}
      </head>
      <body>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}