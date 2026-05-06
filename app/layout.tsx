'use client';

// Styles
import "govuk-frontend/govuk-frontend.min.css"; 

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import GovUKHeader from "@/components/govuk/Header";
import GovUKFooter from "@/components/govuk/Footer";

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
    <html lang="en" className="govuk-template">
      <body className="govuk-template__body">
        {/* Show header on all pages */}
        <GovUKHeader isHomePage={isHomePage} />

        {/* Only show width container for non-home pages */}
        {!isHomePage && (
          <div className="govuk-width-container">
            <main className="govuk-main-wrapper govuk-main-wrapper--auto-spacing" id="main-content">
              {children}
            </main>
          </div>
        )}

        {/* Home page content is full-width, handled by its own layout */}
        {isHomePage && children}

        <GovUKFooter />
      </body>
    </html>
  );
}
