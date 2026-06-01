'use client';

import "govuk-frontend/govuk-frontend.min.css"; 
import "@/app/globals.css"; 

import { useEffect } from "react";
import { Public_Sans } from 'next/font/google';

// Use only the universal Header component
import GovUKHeader from "@/components/govuk/Header";
import GovUKFooter from "@/components/govuk/Footer";
import GovUKFeedback from "@/components/govuk/Feedback";
import GovUKReportProblem from "@/components/govuk/ReportProblem";

// Configure Public Sans Font
const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-public-sans',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {
    const initGovuk = async () => {
      try {
        // @ts-expect-error - No types for minified JS
        const { initAll } = await import("govuk-frontend/govuk-frontend.min.js");
        initAll();
      } catch (error) {
        console.error("Failed to initialize GOV.UK Frontend:", error);
      }
    };
    initGovuk();
  }, []);

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
      {/* 
        CRITICAL FIX: Added suppressHydrationWarning to silence Grammarly extension flags,
        and injected a style block to erase the default GOV.UK framework top margins/paddings.
      */}
      <body className="govuk-template__body" suppressHydrationWarning={true} style={{ margin: 0, padding: 0 }}>
        
        {/* Force an immediate top spacing reset to pull the header flush to the glass edge */}
        <style dangerouslySetInnerHTML={{__html: `
          html, body, html.govuk-template, body.govuk-template__body {
            margin-top: 0 !important;
            padding-top: 0 !important;
          }
          /* Removes legacy framework top offsets built for cookie banners */
          .govuk-template__body {
            top: 0 !important;
          }
        `}} />

        {/* Universal Header rendered across all pages */}
        <GovUKHeader />
        
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            {children}
          </main>

          {/* Global Feedback Section (Sits right above the footer boundary) */}
          <div className="govuk-!-margin-top-9 govuk-!-margin-bottom-6">
            <GovUKFeedback />
            <GovUKReportProblem />
          </div>
        </div>

        <GovUKFooter />
      </body>
    </html>
  );
}
