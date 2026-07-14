// app/ClientLayoutWrapper.tsx
'use client';

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { SiteHeader } from "@/components/site";
import SiteNotifications from "@/components/site/SiteNotifications";
import GovUKFooter from "@/components/govuk/Footer";
import GovUKFeedback from "@/components/govuk/Feedback";
import GovUKReportProblem from "@/components/govuk/ReportProblem";
import GovUKPhaseBanner from "@/components/govuk/PhaseBanner";
import CookieBanner from "@/components/govuk/CookieBanner";
import { logPageView } from "@/lib/supabase/analytics";

export function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const adminBase =
    process.env.NEXT_PUBLIC_ADMIN_BASE_PATH?.replace(/\/$/, "") || "/admin";
  const isAdminRoute =
    !!pathname &&
    (pathname === adminBase ||
      pathname.startsWith(`${adminBase}/`) ||
      pathname.startsWith("/admin"));

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

  return (
    <body className="govuk-template__body" suppressHydrationWarning={true}>
      {/*
        GOV.UK page template: mark JS support immediately so enhanced
        components can initialise correctly after initAll().
        Sitewide WebSite/Organization JSON-LD is server-rendered in app/layout.tsx.
      */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "document.body.className += ' js-enabled' + ('noModule' in HTMLScriptElement.prototype ? ' govuk-frontend-supported' : '');",
        }}
      />

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

      {/* Skip link must be early in the body for keyboard/screen-reader users */}
      {!isAdminRoute && (
        <a
          href="#main-content"
          className="govuk-skip-link"
          data-module="govuk-skip-link"
        >
          Skip to main content
        </a>
      )}

      {!isAdminRoute && (
        <>
          <SiteHeader />

          {/*
            Single page template shell:
            - one width container
            - phase banner (site-wide)
            - one main landmark
            Pages must NOT re-wrap in govuk-width-container or <main>.
          */}
          <div className="govuk-width-container">
            <GovUKPhaseBanner />
            <SiteNotifications />

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
