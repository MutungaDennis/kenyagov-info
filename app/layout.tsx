// app/layout.tsx
import { Metadata } from 'next';
import { Public_Sans } from 'next/font/google';

import "govuk-frontend/govuk-frontend.min.css"; 
import "@/app/globals.css"; 

import { ClientLayoutWrapper } from "./ClientLayoutWrapper";

// Configure Public Sans Font with CSS Variable binding
const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-public-sans',
});

// =============================================================
// OPEN GRAPH / SOCIAL IMAGE CONFIGURATION
// =============================================================
// CURRENT SETUP (Static images - Recommended for Vercel free/pro plan)
// - Using static files: app/opengraph-image.webp + app/twitter-image.webp
// - This avoids the Edge Function size limit (1 MB on Vercel)
//
// FUTURE REVERSION (when deploying on Cloudflare with 25 MB limit):
// 1. Rename `app/opengraph-image2.tsx` back to `app/opengraph-image.tsx`
// 2. Delete or rename `app/opengraph-image.webp` and `app/twitter-image.webp`
// 3. Comment out or remove the `images` arrays below (lines with openGraph.images and twitter.images)
// 4. The dynamic file will then automatically take over
// =============================================================

export const metadata: Metadata = {
  title: {
    default: 'Citizen Guide Kenya - Informational Guide for Kenyans',
    template: '%s | Citizen Guide Kenya',
  },
  description: 'Your comprehensive, easy-to-use informational guide to Kenyan governance, institutions, constitution, counties, and public services.',
  metadataBase: new URL('https://www.citizenguide.ke'),
  alternates: {
    canonical: '/',
  },

  // === OPEN GRAPH (Facebook, LinkedIn, WhatsApp, etc.) ===
  openGraph: {
    title: 'Citizen Guide Kenya - Informational Guide for Kenyans',
    description: 'Access the Kenyan Constitution, County records, Parliamentary Acts, and step-by-step public service guides seamlessly.',
    url: 'https://www.citizenguide.ke',
    siteName: 'Citizen Guide Kenya',
    locale: 'en_KE',
    type: 'website',
    
    // CURRENT: Static image (explicit for clarity)
    images: [
      {
        url: '/opengraph-image.webp',
        width: 1200,
        height: 630,
        alt: 'Citizen Guide Kenya - Your Guide to Kenyan Governance',
      },
    ],
  },

  // === TWITTER / X CARD ===
  twitter: {
    card: 'summary_large_image',
    title: 'Citizen Guide Kenya',
    description: 'Your ultimate informational dashboard for Kenyan governance and public services.',
    
    // CURRENT: Static image
    images: ['/twitter-image.webp'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-KE" className={`govuk-template ${publicSans.variable}`}>
      <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
    </html>
  );
}