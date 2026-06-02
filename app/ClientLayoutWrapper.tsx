// app/ClientLayoutWrapper.tsx
'use client';

import { useEffect } from "react";
import Script from "next/script"; // Import the optimized Next.js Script component
import GovUKHeader from "@/components/govuk/Header";
import GovUKFooter from "@/components/govuk/Footer";
import GovUKFeedback from "@/components/govuk/Feedback";
import GovUKReportProblem from "@/components/govuk/ReportProblem";

export function ClientLayoutWrapper({
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
    <body className="govuk-template__body" suppressHydrationWarning={true} style={{ margin: 0, padding: 0 }}>
      {/* 
        1. Initialize Google Consent Mode v2 (Default: Denied)
        Placed inside the active <body> execution block.
      */}
      <Script id="google-consent-mode" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          
          var consentChoice = null;
          try {
            consentChoice = localStorage.getItem('cookie-consent');
          } catch(e) {}

          if (consentChoice === 'accepted') {
            gtag('consent', 'default', {
              'ad_storage': 'granted',
              'ad_user_data': 'granted',
              'ad_personalization': 'granted',
              'analytics_storage': 'granted'
            });
          } else {
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied'
            });
          }
        `}
      </Script>

      {/* 2. Load the primary third-party Google Tag script library */}
      <Script
        src="https://googletagmanager.com"
        strategy="afterInteractive"
      />
      
      {/* 3. Execute Global Google Analytics App Configuration */}
      <Script id="google-analytics-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-GG9GWN5J48');
        `}
      </Script>

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
  );
}
