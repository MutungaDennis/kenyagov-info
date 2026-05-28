'use client';

// 1. Core Framework Styles (Loaded first)
import "govuk-frontend/govuk-frontend.min.css"; 

// 2. Your Custom Global Overrides (Loaded second with a safe relative path)
import "./globals.css"; 

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Lexend } from 'next/font/google';

import GovUKHeader from "@/components/govuk/Header";
import GovUKFooter from "@/components/govuk/Footer";

// Configure Lexend Font Asset
const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const initGovuk = async () => {
      try {
        // @ts-expect-error - No types for the minified JS distribution
        const { initAll } = await import("govuk-frontend/govuk-frontend.min.js");
        initAll();
      } catch (error) {
        console.error("Failed to initialize GOV.UK Frontend:", error);
      }
    };

    initGovuk();
  }, []);

  return (
    <html lang="en-KE" className={`govuk-template ${lexend.variable}`}>
      <body className="govuk-template__body">
        {/* Render header on internal subpages */}
        {!isHomePage && <GovUKHeader />}

        {/* GOV.UK Layout grid and alignment wrapper */}
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            {children}
          </main>
        </div>

        <GovUKFooter />
      </body>
    </html>
  );
}
