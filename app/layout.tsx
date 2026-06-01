// app/layout.tsx
import { Metadata } from 'next';
import { Public_Sans } from 'next/font/google';

import "govuk-frontend/govuk-frontend.min.css"; 
import "@/app/globals.css"; 

// Import your Client Component Wrapper defined at the bottom of this file
import { ClientLayoutWrapper } from "./ClientLayoutWrapper";

// Configure Public Sans Font
const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-public-sans',
});

// ==========================================
// 1. GLOBAL SEO & WHATSAPP LINK PREVIEW
// ==========================================
export const metadata: Metadata = {
  title: {
    default: 'Citizen Guide Kenya - Informational Guide for Kenyans',
    template: '%s | Citizen Guide Kenya',
  },
  description: 'Your comprehensive, easy-to-use informational guide to Kenyan governance, institutions, constitution, counties, and public services.',
  metadataBase: new URL('https://citizenguide.ke'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Citizen Guide Kenya - Informational Guide for Kenyans',
    description: 'Access the Kenyan Constitution, County records, Parliamentary Acts, and step-by-step public service guides seamlessly.',
    url: 'https://citizenguide.ke',
    siteName: 'Citizen Guide Kenya',
    locale: 'en_KE',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // Place a 1200x630px image in your public/ folder
        width: 1200,
        height: 630,
        alt: 'Citizen Guide Kenya Preview Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Citizen Guide Kenya',
    description: 'Your ultimate informational dashboard for Kenyan governance and public services.',
    images: ['/og-image.png'],
  },
};

// ==========================================
// 2. ROOT LAYOUT (SERVER SIDE)
// ==========================================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-KE" className={`govuk-template ${publicSans.variable}`}>
      <head>
        {/* Google Analytics 4 Tag Setup */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-GG9GWN5J48"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-GG9GWN5J48');
            `,
          }}
        />
      </head>
      {/* Pass children down to the Client Components wrapper below */}
      <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
    </html>
  );
}
