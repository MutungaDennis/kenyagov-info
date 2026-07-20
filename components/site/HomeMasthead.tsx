"use client";

/**
 * Homepage-only masthead (GDS-inspired pattern, CitizenGuide brand):
 * full-width brand green band, logo + title, search, and Menu (no strip header).
 * Not the GOV.UK brand — product colours and name only.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import HomeSearch from "@/components/site/HomeSearch";

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

export default function HomeMasthead() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <section className="app-home-masthead" aria-label="Welcome">
      {/* Thin top strip inside the green band: Menu only (no full site header) */}
      <div className="app-home-masthead__bar">
        <div className="govuk-width-container app-home-masthead__bar-inner">
          <p className="app-home-masthead__bar-tag govuk-visually-hidden">
            CitizenGuide.KE
          </p>
          <button
            type="button"
            className={[
              "app-home-menu-button",
              menuOpen ? "app-home-menu-button--open" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-expanded={menuOpen}
            aria-controls="home-site-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="app-home-menu-button__text">
              {menuOpen ? "Close" : "Menu"}
            </span>
            <span className="app-home-menu-button__icon" aria-hidden="true">
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

      {menuOpen && (
        <div
          id="home-site-menu"
          className="app-home-menu"
          role="navigation"
          aria-label="Site sections"
        >
          <div className="govuk-width-container">
            <div className="app-home-menu__grid">
              {MENU_SECTIONS.map((section) => (
                <div key={section.heading} className="app-home-menu__column">
                  <h2 className="app-home-menu__heading">{section.heading}</h2>
                  <ul className="govuk-list">
                    {section.links.map((link) => (
                      <li key={link.href} className="govuk-!-margin-bottom-2">
                        <Link
                          href={link.href}
                          className={[
                            "govuk-link",
                            "app-home-menu__link",
                            link.bold ? "govuk-!-font-weight-bold" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => setMenuOpen(false)}
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

      <div className="govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full">
            <div className="app-home-masthead__identity">
              <Image
                src="/logo.webp"
                alt=""
                width={56}
                height={56}
                priority
                className="app-home-masthead__logo"
              />
              <h1 className="app-home-masthead__title">CitizenGuide.KE</h1>
            </div>

            <p className="app-home-masthead__lead">
              Find clear, factual information about the Government of Kenya —
              institutions, leaders, counties, public services and the
              constitution.
            </p>

            <HomeSearch variant="inverse" />
          </div>
        </div>
      </div>
    </section>
  );
}
