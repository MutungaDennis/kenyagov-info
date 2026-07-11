'use client';

/**
 * CitizenGuide.KE product header — custom site chrome.
 *
 * This is intentionally NOT the GOV.UK Header component.
 * Kenya brand (emerald ribbon + flag red bar) and mega-nav are product UI.
 * Page content still uses GOV.UK Design System components below the header.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SearchAutocomplete from "@/components/govuk/SearchAutocomplete";
import "./site-header.css";

export default function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);

  const closeMenus = () => {
    setMoreOpen(false);
    setMobileSearchOpen(false);
    setDesktopSearchOpen(false);
  };

  const toggleMore = () => {
    setMoreOpen((open) => !open);
    if (mobileSearchOpen) setMobileSearchOpen(false);
    if (desktopSearchOpen) setDesktopSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen((open) => !open);
    if (moreOpen) setMoreOpen(false);
    if (desktopSearchOpen) setDesktopSearchOpen(false);
  };

  const toggleDesktopSearch = () => {
    const next = !desktopSearchOpen;
    setDesktopSearchOpen(next);
    if (next) {
      setMoreOpen(false);
      setMobileSearchOpen(false);
    }
  };

  const closeDesktopSearch = () => setDesktopSearchOpen(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDesktopSearchOpen(false);
        setMoreOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="app-site-header" role="banner">
        {/* Top tier: logo + search + support */}
        <div className="app-site-header__top">
          <div className="govuk-width-container app-site-header__top-inner">
            <Link
              href="/"
              className="app-site-header__logo"
              onClick={closeMenus}
            >
              <Image
                src="/logo.webp"
                alt=""
                width={32}
                height={32}
                priority
                className="app-site-header__logo-image"
              />
              <span className="app-site-header__brand">CitizenGuide.KE</span>
            </Link>

            <div className="app-site-header__actions">
              {!isHome && (
                <button
                  type="button"
                  onClick={toggleDesktopSearch}
                  className={[
                    "app-site-header__icon-btn",
                    "app-site-header__search-desktop",
                    desktopSearchOpen ? "app-site-header__icon-btn--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={desktopSearchOpen ? "Close search" : "Open search"}
                  aria-expanded={desktopSearchOpen}
                  aria-controls="desktop-header-search-panel"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 27 27"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="8.5"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <line
                      x1="18"
                      y1="18"
                      x2="24.5"
                      y2="24.5"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}

              {!isHome && (
                <button
                  type="button"
                  onClick={toggleMobileSearch}
                  className={[
                    "app-site-header__icon-btn",
                    "app-site-header__search-mobile",
                    mobileSearchOpen ? "app-site-header__icon-btn--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-controls="mobile-dropdown-search-drawer"
                  aria-label={
                    mobileSearchOpen ? "Close search tool" : "Open search tool"
                  }
                  aria-expanded={mobileSearchOpen}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              )}

              <Link
                href="/support"
                className="app-site-header__support"
                onClick={closeMenus}
              >
                Support
              </Link>
            </div>
          </div>

          {!isHome && mobileSearchOpen && (
            <div
              id="mobile-dropdown-search-drawer"
              className="app-site-header__mobile-search"
              role="search"
            >
              <div className="govuk-width-container">
                <SearchAutocomplete
                  placeholder="Search public services & laws..."
                  compact={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* Emerald navigation ribbon */}
        <div className="app-site-header__nav-tier">
          <div className="govuk-width-container app-site-header__nav-inner">
            <nav
              aria-label="Primary site sections"
              className="app-site-header__nav"
            >
              <Link
                href="/services"
                className="app-site-header__nav-link"
                onClick={closeMenus}
              >
                Services
              </Link>

              {/* Mobile ribbon: Services + Government only (keeps one line); Elections is under More */}
              <Link
                href="/government"
                className="app-site-header__nav-link app-site-header__nav-link--mobile-only"
                onClick={closeMenus}
              >
                Government
              </Link>

              <Link
                href="/government/cabinet"
                className="app-site-header__nav-link app-site-header__nav-link--desktop-only"
                onClick={closeMenus}
              >
                Cabinet
              </Link>

              <Link
                href="/government/counties"
                className="app-site-header__nav-link app-site-header__nav-link--desktop-only"
                onClick={closeMenus}
              >
                Counties
              </Link>

              <Link
                href="/constitution"
                className="app-site-header__nav-link app-site-header__nav-link--desktop-only"
                onClick={closeMenus}
              >
                Constitution
              </Link>

              <Link
                href="/government/institutions"
                className="app-site-header__nav-link app-site-header__nav-link--desktop-only"
                onClick={closeMenus}
              >
                Institutions
              </Link>

              <Link
                href="/government/people"
                className="app-site-header__nav-link app-site-header__nav-link--desktop-only"
                onClick={closeMenus}
              >
                Officials
              </Link>
            </nav>

            <div>
              <button
                type="button"
                onClick={toggleMore}
                className={[
                  "app-site-header__more",
                  moreOpen ? "app-site-header__more--open" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-controls="expanded-more-mega-menu"
                aria-label={
                  moreOpen
                    ? "Hide additional sections menu"
                    : "Show additional sections menu"
                }
                aria-expanded={moreOpen}
              >
                <span>More</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className={[
                    "app-site-header__more-icon",
                    moreOpen ? "app-site-header__more-icon--open" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden="true"
                  focusable="false"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
          </div>

          {moreOpen && (
            <div
              id="expanded-more-mega-menu"
              className="app-site-header__mega"
            >
              <div className="govuk-width-container app-site-header__mega-inner">
                <div className="app-site-header__mega-grid">
                  <div className="app-site-header__mega-column">
                    <h2 className="app-site-header__mega-heading">Services</h2>
                    <ul className="govuk-list govuk-list--spaced">
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/services"
                          className="govuk-link app-site-header__mega-link govuk-!-font-weight-bold"
                          onClick={closeMenus}
                        >
                          All services A–Z
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/services?category=business-self-employed"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          Businesses and self-employed
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/services?category=civil-registration"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          Births, deaths, marriages and care
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/services?category=driving-transport"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          Driving and transport
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/services?category=passports-travel"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          Passports, travel and living abroad
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/services?category=money-tax"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          Money and tax
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/services?category=land-property"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          Land and property
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="app-site-header__mega-column">
                    <h2 className="app-site-header__mega-heading">
                      Government
                    </h2>
                    <ul className="govuk-list govuk-list--spaced">
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/government/presidency"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          The Presidency
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/government/cabinet"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          The Cabinet
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/government/legislature"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          Parliament
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/government/judiciary"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          The Judiciary
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/government/commissions"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          Constitutional commissions
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/government/counties"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          County governments
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="app-site-header__mega-column">
                    <h2 className="app-site-header__mega-heading">
                      Laws &amp; Records
                    </h2>
                    <ul className="govuk-list govuk-list--spaced">
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/constitution"
                          className="govuk-link app-site-header__mega-link govuk-!-font-weight-bold"
                          onClick={closeMenus}
                        >
                          Constitution of Kenya
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/acts/parliament"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          Acts of Parliament
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/documents"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          Official documents
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/government/people"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          Government officials
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/government/institutions"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          Public institutions
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="app-site-header__mega-column">
                    <h2 className="app-site-header__mega-heading">
                      Elections, Data &amp; Society
                    </h2>
                    <ul className="govuk-list govuk-list--spaced">
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/elections"
                          className="govuk-link app-site-header__mega-link govuk-!-font-weight-bold"
                          onClick={closeMenus}
                        >
                          Elections
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/elections/political-parties"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          Political parties
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/open-data"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          Open data
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          href="/society-and-culture"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          Society &amp; culture
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/guides"
                          className="govuk-link app-site-header__mega-link"
                          onClick={closeMenus}
                        >
                          Citizen guides
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Desktop search panel below header */}
      {!isHome && desktopSearchOpen && (
        <div
          id="desktop-header-search-panel"
          className="app-site-header__search-panel"
          role="search"
        >
          <div className="govuk-width-container">
            <div className="app-site-header__search-panel-inner">
              <SearchAutocomplete
                placeholder="Search government institutions, services, documents, leaders..."
                compact={false}
                autoFocus={true}
              />
              <button
                type="button"
                onClick={closeDesktopSearch}
                className="app-site-header__search-close"
                aria-label="Close search"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
