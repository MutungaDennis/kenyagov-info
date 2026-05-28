'use client';

import "govuk-frontend/govuk-frontend.min.css"; 
import "@/app/globals.css"; 

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Public_Sans } from 'next/font/google';

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
  const pathname = usePathname();
  const isHomePage = pathname === "/";

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
      <body className="govuk-template__body">
        {!isHomePage && <GovUKHeader />}
        
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
