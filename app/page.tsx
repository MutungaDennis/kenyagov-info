"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
      <div className="govuk-width-container">
        
        {/* GOV.UK Phase Banner (BETA Disclosure Panel) */}
        <div className="govuk-phase-banner" style={{ marginTop: "16px", marginBottom: "16px" }}>
          <p className="govuk-phase-banner__content" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <strong className="govuk-tag govuk-phase-banner__content__tag" style={{ backgroundColor: "#1d70b8", color: "#ffffff" }}>BETA</strong>
            <span className="govuk-phase-banner__text" style={{ fontSize: "16px", color: "#262c2e", lineHeight: "1.5" }}>
              This website is in early development. Your feedback helps us improve it.{' '}
              <Link href="/feedback" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, textDecoration: "underline" }}>Give feedback</Link>
            </span>
          </p>
        </div>

        {/* Polished, Premium Search Hero Panel */}
        <section 
          className="govuk-!-padding-top-6 govuk-!-padding-bottom-6 govuk-!-margin-bottom-8"
          style={{ borderBottom: "3px solid #1d70b8", backgroundColor: "#f8f9fa", padding: "36px 24px", borderRadius: "4px" }}
        >
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full">
              
              <h1 className="govuk-heading-l govuk-!-margin-bottom-3" style={{ fontSize: "44px", fontWeight: 800, color: "#0b0c0c", letterSpacing: "-0.02em", lineHeight: "1.1" }}>
                CitizenGuide.KE
              </h1>
              
              <p className="govuk-body" style={{ fontSize: "20px", color: "#111418", lineHeight: "1.65", marginBottom: "24px", maxWidth: "65ch" }}>
                Your independent guide to Kenyan government institutions, leaders, devolved counties, public services, and the laws that govern us.
              </p>

              {/* Main Unified Search Form Component */}
              <form onSubmit={handleSearchSubmit} className="govuk-form-group govuk-!-margin-bottom-0">
                <label className="govuk-label govuk-label--s" htmlFor="main-search" style={{ fontWeight: 700, fontSize: "19px", color: "#0b0c0c" }}>
                  Search government entities, services or laws
                </label>
                <div className="govuk-hint govuk-!-margin-bottom-3" id="search-hint-text" style={{ fontSize: "16px", color: "#3b4246", lineHeight: "1.4" }}>
                  For example, KRA, Constitution Article 47, Birth certificate, or Nairobi County
                </div>
                
                <div style={{ display: "flex", width: "100%", boxSizing: "border-box" }}>
                  <input
                    className="govuk-input"
                    id="main-search"
                    name="q"
                    type="search"
                    autoComplete="off"
                    aria-describedby="search-hint-text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ flex: 1, margin: 0, height: "48px", borderRight: "none", borderRadius: "0", fontSize: "18px", paddingLeft: "12px", border: "2px solid #0b0c0c" }}
                  />
                  <button 
                    type="submit"
                    className="govuk-button" 
                    aria-label="Search site archives"
                    style={{ 
                      margin: 0, 
                      height: "48px", 
                      width: "58px", 
                      padding: "0", 
                      borderRadius: "0", 
                      backgroundColor: "#00703c",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #0b0c0c",
                      borderLeft: "none",
                      cursor: "pointer"
                    }}
                  >
                    <svg 
                      style={{ display: "block", fill: "#ffffff" }} 
                      version="1.1" 
                      xmlns="http://w3.org" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M18.86 17.44l-5.11-5.11a7.37 7.37 0 1 0-1.41 1.41l5.11 5.11a1 1 0 1 0 1.42-1.41zM3 8.39a5.39 5.39 0 1 1 5.39 5.39A5.4 5.4 0 0 1 3 8.39z" />
                    </svg>
                  </button>
                </div>
              </form>

            </div>
          </div>
        </section>
        {/* Popular Services & Enhanced Featured Panel Section */}
<div className="govuk-grid-row">
  <div className="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full">
    <h2 className="govuk-heading-m govuk-!-margin-bottom-2" style={{ fontSize: "26px", fontWeight: 700, color: "#0b0c0c" }}>
      Popular Services
    </h2>
    <p className="govuk-body-s govuk-!-margin-bottom-4" style={{ fontSize: "17px", color: "#3b4246", lineHeight: "1.4" }}>
      Common public services accessed by citizens
    </p>

    <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
      {/* 1. Businesses and self-employed */}
      <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
        <Link href="/services?category=business-self-employed" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>
          Businesses and self-employed
        </Link>
        <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5" }}>
          Set up a business name or limited company, and file your company annual returns on BRS.
        </p>
      </li>

      {/* 2. Births, deaths, marriages and care */}
      <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
        <Link href="/services?category=civil-registration" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>
          Births, deaths, marriages and care
        </Link>
        <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5" }}>
          Register a birth or death, apply for a marriage certificate, or check police clearance procedures.
        </p>
      </li>

      {/* 3. Driving and transport */}
      <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
        <Link href="/services?category=driving-transport" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>
          Driving and transport
        </Link>
        <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5" }}>
          Apply for provisional licenses (PDL), renew your driving licence, or transfer vehicle ownership.
        </p>
      </li>

      {/* 4. Passports, travel and living abroad */}
      <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
        <Link href="/services?category=passports-travel" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>
          Passports, travel and living abroad
        </Link>
        <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5" }}>
          Apply for or renew a Kenyan passport, check visa regulations, and manage online immigration profiles.
        </p>
      </li>

      {/* 5. Money and tax */}
      <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
        <Link href="/services?category=money-tax" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>
          Money and tax
        </Link>
        <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5" }}>
          File your self-assessment tax returns, request KRA PIN variations, or check compliance statuses.
        </p>
      </li>

      {/* 6. Land and property */}
      <li className="govuk-!-margin-bottom-5" style={{ listStyleType: "none" }}>
        <Link href="/services?category=land-property" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>
          Land and property
        </Link>
        <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5" }}>
          Search land and property records on Ardhisasa, settle land rates, or verify boundary title details.
        </p>
      </li>

      {/* ENHANCED ACTION: Explore All Services Master Trigger Link */}
      <li className="govuk-!-margin-top-6 border-t-2 border-[#b1b4b6] pt-4" style={{ listStyleType: "none" }}>
        <Link href="/services" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "19px", display: "inline-flex", alignItems: "center", color: "#1d70b8", textDecoration: "underline" }}>
          Explore all services A–Z
          <span style={{ marginLeft: "6px", fontSize: "15px", textDecoration: "none", display: "inline-block" }}>▶</span>
        </Link>
        <p className="govuk-body-s govuk-!-margin-top-1" style={{ color: "#505a5f", fontSize: "15px" }}>
          Browse our complete comprehensive index of verified government information sheets.
        </p>
      </li>
    </ul>
  </div>

          {/* 100% GOV.UK Compliant Featured High-Focus Text Box */}
          <div className="govuk-grid-column-one-third-from-desktop govuk-grid-column-full govuk-!-margin-top-4">
            <div 
              style={{ 
                backgroundColor: "#f8f9fa", 
                borderLeft: "4px solid #1d70b8", 
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                borderRadius: "2px"
              }}
            >
              <h3 className="govuk-heading-s govuk-!-margin-top-0 govuk-!-margin-bottom-3" style={{ color: "#1d70b8", fontSize: "18px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Featured Information
              </h3>
              
              {/* Featured Item 1 */}
              <div className="govuk-!-margin-bottom-3" style={{ borderBottom: "1px solid #bfc1c3", paddingBottom: "14px" }}>
                <h4 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ fontSize: "17px", color: "#0b0c0c" }}>
                  <Link href="/politics/elections" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, textDecoration: "underline" }}>2027 General Election Timeline</Link>
                </h4>
                <p className="govuk-body-s govuk-!-margin-0" style={{ color: "#262c2e", fontSize: "15px", lineHeight: "1.5" }}>
                  IEBC voter registration windows, administrative updates, and pending legislative nomination parameters.
                </p>
              </div>

              {/* Featured Item 2 */}
              <div className="govuk-!-margin-bottom-1">
                <h4 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ fontSize: "17px", color: "#0b0c0c" }}>
                  <Link href="/counties/devolution" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, textDecoration: "underline" }}>County Budget Allocation Audit</Link>
                </h4>
                <p className="govuk-body-s govuk-!-margin-0" style={{ color: "#262c2e", fontSize: "15px", lineHeight: "1.5" }}>
                  Review recent intergovernmental dispatches, conditional grant disbursements, and development expenditure balances.
                </p>
              </div>
            </div>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl govuk-!-margin-top-8 govuk-!-margin-bottom-8" style={{ borderTop: "2px solid #bfc1c3" }} />
        {/* Core Directory Grid Matrix - 100% Text Based Category Flow */}
        <div 
          className="home-flex-directory-grid"
          style={{ display: "flex", flexWrap: "wrap", gap: "32px 24px", width: "100%" }}
        >
          
          {/* Section 1: Structure of National Government */}
          <div className="directory-flex-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-4" style={{ fontSize: "24px", color: "#0b0c0c", fontWeight: 700, borderLeft: "4px solid #00664f", paddingLeft: "12px", lineHeight: "1.1" }}>
              National Government
            </h2>
            <ul className="govuk-list" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
                <Link href="/executive" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>The Executive</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Presidency, National Ministries, Cabinet Secretaries, and State Departments.</p>
              </li>
              <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
                <Link href="/legislature" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>The Legislature</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Bi-cameral Parliament tracking the National Assembly and the Senate.</p>
              </li>
              <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
                <Link href="/judiciary" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>The Judiciary</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Supreme Court rulings, superior courts, and judicial administration records.</p>
              </li>
              <li style={{ listStyleType: "none" }}>
                <Link href="/independent-bodies" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>Independent Commissions</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Constitutional Offices, oversight groups, and entities (IEBC, SRC, EACC).</p>
              </li>
            </ul>
          </div>
          {/* Section 2: County Governance & Devolution Structure */}
          <div className="directory-flex-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-4" style={{ fontSize: "24px", color: "#0b0c0c", fontWeight: 700, borderLeft: "4px solid #00664f", paddingLeft: "12px", lineHeight: "1.1" }}>
              County Governance
            </h2>
            <ul className="govuk-list" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
                <Link href="/counties/governors" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>County Executives</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Governors, Deputy Governors, CECMs, and sub-county administration panels.</p>
              </li>
              <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
                <Link href="/counties" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>County Assemblies &amp; Wards</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Local legislative houses, ward managers, elected MCAs, and passed regional acts.</p>
              </li>
              <li style={{ listStyleType: "none" }}>
                <Link href="/counties/devolution" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>Devolution Analytics</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Intergovernmental relations indices, budget tracking, and conditional grants.</p>
              </li>
            </ul>
          </div>

          {/* Section 3: Public Institutions, State Agencies & Politics */}
          <div className="directory-flex-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-4" style={{ fontSize: "24px", color: "#0b0c0c", fontWeight: 700, borderLeft: "4px solid #00664f", paddingLeft: "12px", lineHeight: "1.1" }}>
              Institutions &amp; Politics
            </h2>
            <ul className="govuk-list" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
                <Link href="/institutions" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>Public Institutions</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Browse parastatals, state regulatory organs (EPRA), publications, and public tenders.</p>
              </li>
              <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
                <Link href="/politics" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>Politics &amp; Elections</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Registered political parties, by-elections tracking, and voter registration frameworks.</p>
              </li>
              <li style={{ listStyleType: "none" }}>
                <Link href="/coalitions" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>Political Coalitions</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Official alliances, multi-party alignments, and registered coalitions database.</p>
              </li>
            </ul>
          </div>
          {/* Section 4: Legal Frameworks, Documents & Open Data */}
          <div className="directory-flex-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-4" style={{ fontSize: "24px", color: "#0b0c0c", fontWeight: 700, borderLeft: "4px solid #00664f", paddingLeft: "12px", lineHeight: "1.1" }}>
              Laws &amp; Open Data
            </h2>
            <ul className="govuk-list" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
                <Link href="/constitution" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>The Constitution of Kenya 2010</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>The supreme law of the land. Collapsible chapters and text indexes.</p>
              </li>
              <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
                <Link href="/acts/parliament" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>Acts of Parliament</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>National bills and primary statutes grouped by their House of Origin.</p>
              </li>
              <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
                <Link href="/documents" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>Strategic State Documents</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>National blueprints, historical Sessional Papers, and Vision 2030 roadmaps.</p>
              </li>
              <li style={{ listStyleType: "none" }}>
                <Link href="/open-data" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>Open Data Portal</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Public datasets, programmatic API endpoints, and ward export routers.</p>
              </li>
            </ul>
          </div>

          {/* Section 5: Society, Culture & Public Briefings */}
          <div className="directory-flex-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-4" style={{ fontSize: "24px", color: "#0b0c0c", fontWeight: 700, borderLeft: "4px solid #00664f", paddingLeft: "12px", lineHeight: "1.1" }}>
              Society &amp; Culture
            </h2>
            <ul className="govuk-list" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
                <Link href="/society-and-culture" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>Culture &amp; Heritage</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>National symbols, values, heritage sites, holidays, and official cultural calendars.</p>
              </li>
              <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
                <Link href="/guides" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>Citizen Guides</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Plain-language handbooks detailing public processes and constitutional civic rights.</p>
              </li>
              <li style={{ listStyleType: "none" }}>
                <Link href="/about" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>Site Information</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Learn about this independent guide, accessibility, and platform documentation guidelines.</p>
              </li>
            </ul>
          </div>
          {/* Section 6: Current Leaders Directory */}
          <div className="directory-flex-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-4" style={{ fontSize: "24px", color: "#0b0c0c", fontWeight: 700, borderLeft: "4px solid #00664f", paddingLeft: "12px", lineHeight: "1.1" }}>
              Current Leaders
            </h2>
            <ul className="govuk-list" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
                <Link href="/leaders/executive" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>National Executive Leaders</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Rosters and profile timelines for the President, Deputy President, and active Cabinet Secretaries.</p>
              </li>
              <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
                <Link href="/leaders/parliament" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>Members of Parliament</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Elected Members of the National Assembly and Senators mapping all national constituencies.</p>
              </li>
              <li className="govuk-!-margin-bottom-4" style={{ listStyleType: "none" }}>
                <Link href="/leaders/county" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>County Executive Leadership</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Regional office profiles for Governors, Deputy Governors, County Women Representatives, and MCAs.</p>
              </li>
              <li style={{ listStyleType: "none" }}>
                <Link href="/leaders/commissions" className="govuk-link govuk-link--no-underline" style={{ fontWeight: 700, fontSize: "20px", display: "inline-block", textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "3px", color: "#1d70b8" }}>Independent Agency Officials</Link>
                <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#262c2e", fontSize: "17px", lineHeight: "1.5", letterSpacing: "-0.01em" }}>Oversight directors, autonomous chairpersons, and Directors General steering independent offices.</p>
              </li>
            </ul>
          </div>

        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l govuk-!-margin-top-8 govuk-!-margin-bottom-8" style={{ borderTop: "1px solid #bfc1c3" }} />

        
      </div>

      {/* Global CSS Layout Overrides safe for Next App Architecture Layout Trees */}
      <style dangerouslySetInnerHTML={{__html: `
        .govuk-link--no-underline { 
          text-decoration: underline !important; 
          text-decoration-thickness: 2px !important; 
          text-underline-offset: 3px !important; 
          color: #1d70b8 !important; 
        }
        .govuk-link--no-underline:hover { 
          text-decoration: underline !important; 
          text-decoration-thickness: 3px !important; 
          color: #003078 !important; 
        }
        
        /* Mobile First Responsive Grid Flow matching True GOV.UK categories layout */
        .home-flex-directory-grid { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 32px 24px; 
          width: 100%; 
        }
        .directory-flex-block { 
          flex: 1 1 100%; 
          box-sizing: border-box; 
          margin-bottom: 16px;
        }

        /* Responsive Breakpoints for Tablet & Widescreen Desktop Viewports */
        @media (min-width: 32.0625rem) {
          .directory-flex-block { flex: 1 1 45%; }
        }

        @media (min-width: 61.25rem) {
          .directory-flex-block { flex: 1 1 30%; }
        }
      `}} />
    </>
  );
}
