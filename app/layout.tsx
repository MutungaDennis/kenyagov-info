'use client';

import "govuk-frontend/govuk-frontend.min.css"; 
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Inter } from 'next/font/google'; // 1. Import Inter

import GovUKHeader from "@/components/govuk/Header";
import GovUKFooter from "@/components/govuk/Footer";

// 2. Configure Inter
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter', 
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
    // 3. Inject inter.variable to pass the font variable down
    <html lang="en-KE" className={`govuk-template ${inter.variable}`}>
      <body className="govuk-template__body">
        {!isHomePage && <GovUKHeader />}
        {children}
        <GovUKFooter />
      </body>
    </html>
  );
}
