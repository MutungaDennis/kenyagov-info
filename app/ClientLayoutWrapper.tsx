// app/ClientLayoutWrapper.tsx
'use client';

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script"; // Import the optimized Next.js Script component
import GovUKHeader from "@/components/govuk/Header";
import GovUKFooter from "@/components/govuk/Footer";
import GovUKFeedback from "@/components/govuk/Feedback";
import GovUKReportProblem from "@/components/govuk/ReportProblem";
import CookieBanner from "@/components/govuk/CookieBanner";
import { logPageView } from "@/lib/supabase/analytics";

export function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

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

  // Log page view for admin analytics (GOV.UK style - simple page view tracking)
  // Only track public pages (not /admin). Only log if analytics cookies accepted.
  // Capture referrer hostname (for "top entry / acquisition" analysis) — sanitized, no query strings.
  useEffect(() => {
    if (pathname && !isAdminRoute) {
      const consent = localStorage.getItem('cookie-consent');
      if (consent === 'accepted') {
        let refHost: string | null = null;
        if (typeof document !== 'undefined' && document.referrer) {
          try {
            const u = new URL(document.referrer);
            refHost = u.hostname;
          } catch {
            // ignore bad referrer
          }
        }
        logPageView(pathname, refHost);
      }
    }
  }, [pathname, isAdminRoute]);

  return (
    <body className="govuk-template__body" suppressHydrationWarning={true} style={{ margin: 0, padding: 0 }}>
      {/* 
        1. Initialize Google Consent Mode v2 (Default: Denied)
        Always deny by default, before any other scripts.
      */}
      <Script id="google-consent-mode" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          
          // Always set default to denied (GOV.UK best practice + Consent Mode v2)
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied'
          });
        `}
      </Script>

      {/* 2. Load the primary third-party Google Tag script library */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-GG9GWN5J48"
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

      {/* Global Cloudflare Turnstile script - loaded once for all widgets (feedback, support, report) */}
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />

      {!isAdminRoute && <CookieBanner />}

      {!isAdminRoute && (
        <>
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
        </>
      )}

      {isAdminRoute && children}
    </body>
  );
}
