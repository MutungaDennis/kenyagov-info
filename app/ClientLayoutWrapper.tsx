// app/ClientLayoutWrapper.tsx
'use client';

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site";
import SiteNotifications from "@/components/site/SiteNotifications";
import GovUKFooter from "@/components/govuk/Footer";
import GovUKFeedback from "@/components/govuk/Feedback";
import GovUKReportProblem from "@/components/govuk/ReportProblem";
import GovUKPhaseBanner from "@/components/govuk/PhaseBanner";
import CookieBanner from "@/components/govuk/CookieBanner";
import { logPageViewClient } from "@/lib/supabase/log-page-view";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const adminBase = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH?.replace(/\/$/, "") || "/admin";
  const isAdminRoute = !!pathname && (pathname === adminBase || pathname.startsWith(`${adminBase}/`) || pathname.startsWith("/admin"));
  const isHome = pathname === "/";

  // GOV.UK: mark JS support on body
  useEffect(() => {
    const body = document.body;
    if (!body.classList.contains("js-enabled")) {
      body.classList.add("js-enabled");
    }
    if ("noModule" in HTMLScriptElement.prototype && !body.classList.contains("govuk-frontend-supported")) {
      body.classList.add("govuk-frontend-supported");
    }
  }, []);

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
          } catch { /* ignore */ }
        }
        void logPageViewClient(pathname, refHost);
      }
    }
  }, [pathname, isAdminRoute]);

  // ✅ REMOVED <body> tag. Replaced with Fragment <>
  return (
    <>
      {!isAdminRoute && <CookieBanner />}

      {!isAdminRoute && (
        <a href="#main-content" className="govuk-skip-link" data-module="govuk-skip-link">
          Skip to main content
        </a>
      )}

      {!isAdminRoute && (
        <>
          {isHome ? (
            <>
              <div className="govuk-width-container">
                <GovUKPhaseBanner />
                <SiteNotifications />
              </div>

              <main className="govuk-main-wrapper app-main--home" id="main-content" role="main">
                {children}
              </main>

              <div className="govuk-width-container">
                <div className="govuk-!-margin-top-9 govuk-!-margin-bottom-6 govuk-!-display-none-print app-no-print">
                  <GovUKFeedback />
                  <GovUKReportProblem />
                </div>
              </div>
            </>
          ) : (
            <>
              <SiteHeader />

              <div className="govuk-width-container">
                <GovUKPhaseBanner />
                <SiteNotifications />

                <main className="govuk-main-wrapper" id="main-content" role="main">
                  {children}
                </main>

                <div className="govuk-!-margin-top-9 govuk-!-margin-bottom-6 govuk-!-display-none-print app-no-print">
                  <GovUKFeedback />
                  <GovUKReportProblem />
                </div>
              </div>
            </>
          )}

          <GovUKFooter />
        </>
      )}

      {isAdminRoute && children}
    </>
  );
}