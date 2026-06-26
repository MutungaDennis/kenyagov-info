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
// GLOBAL METADATA CORE CONFIGURATION
// Static references to images like '/og-image.png' are removed 
// to allow Next.js file-based dynamic OG engines to take over.
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
  openGraph: {
    title: 'Citizen Guide Kenya - Informational Guide for Kenyans',
    description: 'Access the Kenyan Constitution, County records, Parliamentary Acts, and step-by-step public service guides seamlessly.',
    url: 'https://www.citizenguide.ke',
    siteName: 'Citizen Guide Kenya',
    locale: 'en_KE',
    type: 'website',
    // Next.js automatically maps your app/opengraph-image.tsx file here
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Citizen Guide Kenya',
    description: 'Your ultimate informational dashboard for Kenyan governance and public services.',
    // Next.js automatically injects your modern dynamic card engines here
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
