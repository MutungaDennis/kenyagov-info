// app/layout.tsx
import type { Metadata, Viewport } from "next";
import Script from "next/script";

import "govuk-frontend/govuk-frontend.min.css";
import "@/app/globals.css";

import { ClientLayoutWrapper } from "./ClientLayoutWrapper";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00703c",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,

  authors: [
    {
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],

  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "government",

  keywords: [
    "Kenya government",
    "Constitution of Kenya",
    "counties",
    "public services",
    "elections",
    "IEBC",
    "Parliament of Kenya",
    "cabinet",
    "CitizenGuide",
    "civic information",
  ],

  alternates: {
    types: {
      "text/plain": [
        {
          url: "/llms.txt",
          title: "llms.txt",
        },
      ],
    },
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },

  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },

  icons: {
    icon: [
      {
        url: "/logo.webp",
        type: "image/webp",
      },
      {
        url: "/favicon.ico",
        sizes: "any",
      },
    ],
    apple: [
      {
        url: "/logo.webp",
        type: "image/webp",
      },
    ],
  },

  other: {
    "ai-content": "index",
    "og:logo": `${SITE_URL}/logo.webp`,
    "origin-trial":
      "A4osS6hE38l+I8HVoNIZUPu9CvgXN7Wk4+mu9gbnNgUlJpGPrpgjNNw+kHB/IPzh2AwL+sjPB5rnWBQMk1OGLw8AAAB2eyJvcmlnaW4iOiJodHRwczovL2NpdGl6ZW5ndWlkZS5rZTo0NDMiLCJmZWF0dXJlIjoiV2ViTUNQIiwiZXhwaXJ5IjoxNzk0ODczNjAwLCJpc1N1YmRvbWFpbiI6dHJ1ZSwiaXN0aGlyZFBhcnR5Ijp0cnVlfQ==",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const runtimeSupabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";

  const runtimeSupabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "";

  const publicEnvBootstrap =
    runtimeSupabaseUrl && runtimeSupabaseKey
      ? `window.__CG_PUBLIC_ENV=${JSON.stringify({
          supabaseUrl: runtimeSupabaseUrl,
          supabaseAnonKey: runtimeSupabaseKey,
        }).replace(/</g, "\\u003c")};`
      : "";

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: [
      "Citizen Guide Kenya",
      "CitizenGuide",
      "citizenguide.ke",
    ],
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-KE",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: [
      "Citizen Guide Kenya",
      "CitizenGuide",
      "citizenguide.ke",
      "Citizen Guide Africa",
    ],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.webp`,
      width: 512,
      height: 512,
    },
    description:
      "Independent civic technology platform and informational guide to Kenyan governance.",
    foundingDate: "2026-06-01",
    areaServed: {
      "@type": "Country",
      name: "Kenya",
    },
    sameAs: [
      "https://www.wikidata.org/wiki/Q141265951",
    ],
  };

  const websiteSchemaJson = JSON.stringify(websiteSchema).replace(
    /</g,
    "\\u003c"
  );

  const organizationSchemaJson = JSON.stringify(organizationSchema).replace(
    /</g,
    "\\u003c"
  );

  return (
    <html lang="en-KE" className="govuk-template">
      <head>
        <Script
          id="cookie-consent-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('cookie-consent'))document.documentElement.classList.add('app-cookie-consent-set')}catch(e){}",
          }}
        />
        {/*
          Use next/script rather than a raw <script> element.
          beforeInteractive places this in the initial document early enough
          for client code that reads window.__CG_PUBLIC_ENV.
        */}
        {publicEnvBootstrap ? (
          <Script
            id="public-env-bootstrap"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: publicEnvBootstrap,
            }}
          />
        ) : null}

        {/*
          Structured data is also emitted through next/script so React 19 does
          not treat these as dynamically inserted raw script elements.
        */}
        <Script
          id="website-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: websiteSchemaJson,
          }}
        />

        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: organizationSchemaJson,
          }}
        />

        <link
          rel="alternate"
          type="text/plain"
          href="/llms.txt"
          title="llms.txt"
        />

        {runtimeSupabaseUrl ? (
          <link
            rel="preconnect"
            href={runtimeSupabaseUrl}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>

      <body
        className="govuk-template__body"
        suppressHydrationWarning
      >
        <GoogleAnalytics />

        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
