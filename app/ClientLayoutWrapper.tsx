// app/ClientLayoutWrapper.tsx
'use client';

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
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

  // Analytics tracking
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
            // ignore
          }
        }
        logPageView(pathname, refHost);
      }
    }
  }, [pathname, isAdminRoute]);

  // ==========================================
  // GLOBAL SCHEMA.ORG - WebSite + Organization
  // This applies to the entire site
  // ==========================================
  const globalSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CitizenGuide.KE",
    "url": "https://www.citizenguide.ke",
    "description": "An independent civic technology platform providing structured information on Kenya's Constitution, government institutions, counties, and public services.",
    "publisher": {
      "@type": "Organization",
      "name": "CitizenGuide.KE",
      "url": "https://www.citizenguide.ke"
    }
  };

  return (
    <body className="govuk-template__body" suppressHydrationWarning={true}>
      {/* Google Consent Mode */}
      <Script id="google-consent-mode" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied'
          });
        `}
      </Script>

      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-GG9GWN5J48"
        strategy="afterInteractive"
      />
      
      <Script id="google-analytics-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-GG9GWN5J48');
        `}
      </Script>

      {/* Global Schema.org - placed early in body */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchema) }}
      />

      <style dangerouslySetInnerHTML={{__html: `
        html, body, html.govuk-template, body.govuk-template__body {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        .govuk-template__body {
          top: 0 !important;
        }
      `}} />

      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />

      {!isAdminRoute && <CookieBanner />}

      {!isAdminRoute && (
        <>
          <GovUKHeader />
          
          <div className="govuk-width-container">
            <main className="govuk-main-wrapper" id="main-content" role="main">
              {children}
            </main>

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