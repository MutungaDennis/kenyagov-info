'use client';

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
        {/* Render standard header only for internal sub-pages */}
        {!isHomePage && <GovUKHeader />}

        {/* 
          FIXED: Removed the duplicate govuk-width-container and main wrappers. 
          This allows pages to span the full canvas width and inject their own native container structures.
        */}
        {children}

        <GovUKFooter />
      </body>
    </html>
  );
}
