'use client';

/**
 * Strip header for non-home pages — GDS-inspired compact product chrome:
 * logo + CitizenGuide.KE | search icon | Menu (mega panel).
 * Brand green + product name (not GOV.UK branding).
 * Homepage uses HomeMasthead instead (see ClientLayoutWrapper).
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchAutocomplete from "@/components/govuk/SearchAutocomplete";
import "./site-header.css";

const MENU_SECTIONS: {
  heading: string;
  links: { href: string; label: string; bold?: boolean }[];
}[] = [
  {
    heading: "Services & topics",
    links: [
      { href: "/services", label: "Services", bold: true },
      { href: "/topics", label: "Topics", bold: true },
      { href: "/services/popular", label: "Popular services" },
      { href: "/services/a-z", label: "Services A–Z" },
      { href: "/guides", label: "Life-event guides" },
      { href: "/ecitizen", label: "eCitizen explained" },
      { href: "/huduma-centres", label: "Huduma Centres" },
    ],
  },
  {
    heading: "Government",
    links: [
      { href: "/government", label: "Government hub", bold: true },
      { href: "/how-government-works", label: "How government works" },
      { href: "/find-your-representatives", label: "Find your representatives" },
      { href: "/government/cabinet", label: "The Cabinet" },
      { href: "/government/legislature", label: "Parliament" },
      { href: "/government/judiciary", label: "The Judiciary" },
      { href: "/government/counties", label: "County governments" },
    ],
  },
  {
    heading: "Laws & records",
    links: [
      { href: "/constitution", label: "Constitution of Kenya", bold: true },
      { href: "/acts/parliament", label: "Acts of Parliament" },
      { href: "/documents", label: "Official documents" },
      {
        href: "/government/legislature/hansard/national-assembly",
        label: "Hansard",
      },
      { href: "/government/people", label: "Government officials" },
      { href: "/government/institutions", label: "Public institutions" },
    ],
  },
  {
    heading: "Elections, data & help",
    links: [
      { href: "/elections", label: "Elections and voting", bold: true },
      { href: "/society-and-culture", label: "Society and culture" },
      { href: "/contact-government", label: "Contact government" },
      { href: "/scams", label: "Scams and fake websites" },
      { href: "/open-data", label: "Open data" },
      { href: "/help", label: "Help" },
      { href: "/about", label: "About this site" },
    ],
  },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const closeAll = () => {
    setMenuOpen(false);
    setSearchOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen((open) => !open);
    setSearchOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen((open) => !open);
    setMenuOpen(false);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="app-site-header govuk-!-display-none-print" role="banner">
        <div className="app-site-header__strip">
          <div className="govuk-width-container app-site-header__strip-inner">
            <Link
              href="/"
              className="app-site-header__logo"
              onClick={closeAll}
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
              <button
                type="button"
                onClick={toggleSearch}
                className={[
                  "app-site-header__icon-btn",
                  searchOpen ? "app-site-header__icon-btn--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={searchOpen ? "Close search" : "Open search"}
                aria-expanded={searchOpen}
                aria-controls="header-search-panel"
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

              <button
                type="button"
                onClick={toggleMenu}
                className={[
                  "app-site-header__menu-btn",
                  menuOpen ? "app-site-header__menu-btn--open" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-controls="site-header-menu"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                <span className="app-site-header__menu-btn-text">
                  {menuOpen ? "Close" : "Menu"}
                </span>
                <span className="app-site-header__menu-btn-icon" aria-hidden="true">
                  {menuOpen ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" focusable="false">
                      <path
                        d="M1 1l12 12M13 1L1 13"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  ) : (
                    <svg width="16" height="12" viewBox="0 0 16 12" focusable="false">
                      <path
                        d="M0 1h16M0 6h16M0 11h16"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div
            id="header-search-panel"
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
                  onClick={() => setSearchOpen(false)}
                  className="app-site-header__search-close"
                  aria-label="Close search"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {menuOpen && (
          <div
            id="site-header-menu"
            className="app-site-header__mega"
            role="navigation"
            aria-label="Site sections"
          >
            <div className="govuk-width-container app-site-header__mega-inner">
              <div className="app-site-header__mega-grid">
                {MENU_SECTIONS.map((section) => (
                  <div key={section.heading} className="app-site-header__mega-column">
                    <h2 className="app-site-header__mega-heading">
                      {section.heading}
                    </h2>
                    <ul className="govuk-list govuk-list--spaced">
                      {section.links.map((link) => (
                        <li key={link.href} className="govuk-!-margin-bottom-2">
                          <Link
                            href={link.href}
                            className={[
                              "govuk-link",
                              "app-site-header__mega-link",
                              link.bold ? "govuk-!-font-weight-bold" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            onClick={closeAll}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
