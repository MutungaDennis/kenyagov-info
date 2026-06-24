// app/ClientLayoutWrapper.tsx
'use client';

import { useEffect } from "react";
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
    <body className="govuk-template__body" suppressHydrationWarning={true}>
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
