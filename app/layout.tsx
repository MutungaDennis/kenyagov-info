'use client';

// This handles the styles (CSS is safe for SSR)
import "govuk-frontend/govuk-frontend.min.css"; 

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Dynamically import the JS only on the client side (same as your working version)
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
        {/* Enhanced Header with Logo */}
        <header className="govuk-header" role="banner" data-module="govuk-header">
          <div className="govuk-header__container govuk-width-container">
            <div className="govuk-header__content">
              <Link href="/" className="govuk-header__link govuk-header__link--service-name flex items-center gap-3">
                <Image 
                  src="/logo.png" 
                  alt="KenyaGovInfo.KE Logo" 
                  width={52} 
                  height={52}
                  className="govuk-header__logo"
                  priority
                />
                <div>
                  <span className="text-[28px] leading-none font-bold">KenyaGovInfo.KE</span>
                  <p className="govuk-header__service-description">
                    Independent directory of Kenyan government entities, services and leaders
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </header>

        <div className="govuk-width-container">
          {/* Phase Banner */}
          <div className="govuk-phase-banner">
            <p className="govuk-phase-banner__content">
              <strong className="govuk-tag govuk-phase-banner__content__tag">Beta</strong>
              <span className="govuk-phase-banner__text">
                This is a new website — your feedback will help us improve it.
              </span>
            </p>
          </div>

          <main className="govuk-main-wrapper govuk-main-wrapper--auto-spacing" id="main-content">
            {children}
          </main>
        </div>

        {/* Enhanced Footer with Logo */}
        <footer className="govuk-footer" role="contentinfo">
          <div className="govuk-width-container">
            <div className="govuk-footer__meta">
              <div className="govuk-footer__meta-item govuk-footer__meta-item--grow">
                {/* Logo in Footer */}
                <div className="flex items-center gap-3 mb-6">
                  <Image 
                    src="/logo.png" 
                    alt="KenyaGovInfo.KE Logo" 
                    width={40} 
                    height={40}
                  />
                  <span className="font-bold text-lg">KenyaGovInfo.KE</span>
                </div>

                <ul className="govuk-footer__inline-list">
                  <li className="govuk-footer__inline-list-item">
                    <Link href="/help" className="govuk-footer__link">Help</Link>
                  </li>
                  <li className="govuk-footer__inline-list-item">
                    <Link href="/privacy" className="govuk-footer__link">Privacy</Link>
                  </li>
                  <li className="govuk-footer__inline-list-item">
                    <Link href="/cookies" className="govuk-footer__link">Cookies</Link>
                  </li>
                  <li className="govuk-footer__inline-list-item">
                    <Link href="/accessibility" className="govuk-footer__link">Accessibility statement</Link>
                  </li>
                  <li className="govuk-footer__inline-list-item">
                    <Link href="/contact" className="govuk-footer__link">Contact</Link>
                  </li>
                  <li className="govuk-footer__inline-list-item">
                    <Link href="/terms" className="govuk-footer__link">Terms and conditions</Link>
                  </li>
                </ul>

                <div className="govuk-footer__meta-custom">
                  <p className="govuk-footer__meta-text">
                    <strong>Disclaimer:</strong> KenyaGovInfo.KE is an <strong>independent informational platform</strong> 
                    and is <strong>not</strong> an official website of the Government of Kenya.
                  </p>
                  <p className="govuk-footer__meta-text">
                    All information is compiled from publicly available sources. 
                    For official services, transactions, or legal documents, please visit the relevant 
                    government institution or use the <strong>eCitizen</strong> portal.
                  </p>
                  <p className="govuk-footer__meta-text">
                    © {new Date().getFullYear()} KenyaGovInfo.KE — Not affiliated with or endorsed by the Government of Kenya.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}