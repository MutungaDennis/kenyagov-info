"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GovUKHomeHeader from "@/components/govuk/HomeHeader";
import GovUKFeedback from "@/components/govuk/Feedback";

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
      {/* Home-page exclusive minimal brand bar header component */}
      <GovUKHomeHeader />

      <div className="govuk-width-container">
        
        {/* GOV.UK Phase Banner (BETA Disclosure Panel) */}
        <div className="govuk-phase-banner" style={{ marginTop: "10px" }}>
          <p className="govuk-phase-banner__content">
            <strong className="govuk-tag govuk-phase-banner__content__tag">BETA</strong>
            <span className="govuk-phase-banner__text">
              This website is in early development. Your feedback helps us improve it.{' '}
              <Link href="/feedback" className="govuk-link govuk-link--no-underline">Give feedback</Link>
            </span>
          </p>
        </div>

        {/* Polished, Premium Search Hero Panel */}
        <section 
          className="govuk-!-padding-top-6 govuk-!-padding-bottom-6 govuk-!-margin-bottom-6"
          style={{ borderBottom: "2px solid #1d70b8" }}
        >
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full">
              
              <h1 className="govuk-heading-l govuk-!-margin-bottom-2" style={{ fontSize: "36px", letterSpacing: "-1px" }}>
                CitizenGuide.KE
              </h1>
              
              <p className="govuk-body" style={{ fontSize: "18px", color: "#2b2b2b", lineHeight: "1.4", marginBottom: "20px" }}>
                Your independent guide to Kenyan government institutions, leaders, devolved counties, public services, and the laws that govern us.
              </p>

              {/* Main Unified Search Form Component */}
              <form onSubmit={handleSearchSubmit} className="govuk-form-group govuk-!-margin-bottom-0">
                <label className="govuk-label govuk-label--s govuk-!-font-weight-bold" htmlFor="main-search">
                  Search government entities, services or laws
                </label>
                <div className="govuk-hint govuk-!-margin-bottom-2 govuk-!-font-size-14" id="search-hint-text">
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
                    style={{ flex: 1, margin: 0, height: "40px", borderRight: "none", borderRadius: "0", fontSize: "16px" }}
                  />
                  <button 
                    type="submit"
                    className="govuk-button" 
                    aria-label="Search site archives"
                    style={{ 
                      margin: 0, 
                      height: "40px", 
                      width: "48px", 
                      padding: "0", 
                      borderRadius: "0", 
                      backgroundColor: "#00703c",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    <svg 
                      style={{ display: "block", fill: "#ffffff" }} 
                      version="1.1" 
                      xmlns="http://w3.org" 
                      width="18" 
                      height="18" 
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
            <h2 className="govuk-heading-m govuk-!-margin-bottom-1" style={{ fontSize: "22px" }}>Popular Services</h2>
            <p className="govuk-body-s govuk-!-text-colour-dark-grey govuk-!-margin-bottom-3">Common public services accessed by citizens</p>

            <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-font-size-16">
                <Link href="/services/business" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold" }}>Starting a business</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>BRS company registrations, naming approvals, and trade licensing updates</p>
              </li>
              <li className="govuk-!-font-size-16">
                <Link href="/services/national-id" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold" }}>National ID, Birth, Death &amp; Marriage Certificates</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Civil registries, replacement application guidelines, and status lookups</p>
              </li>
              <li className="govuk-!-font-size-16">
                <Link href="/services/driving" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold" }}>Driving Licence &amp; Vehicle Registration</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>NTSA logbooks, Smart DL renewals, and transfer verification checklists</p>
              </li>
              <li className="govuk-!-font-size-16">
                <Link href="/services/passport" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold" }}>Passport Application</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Immigration pathways, eCitizen scheduling, and dynamic visa regulations</p>
              </li>
              <li className="govuk-!-font-size-16">
                <Link href="/services/tax" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold" }}>Taxes and iTax Services</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>KRA dynamic filing timelines, PIN generation, and tax compliance certificates</p>
              </li>
            </ul>
          </div>

          {/* 100% GOV.UK Compliant Featured High-Focus Text Box */}
          <div className="govuk-grid-column-one-third-from-desktop govuk-grid-column-full govuk-!-margin-top-4">
            <div 
              style={{ 
                backgroundColor: "#f3f2f1", 
                borderLeft: "4px solid #1d70b8", 
                padding: "15px" 
              }}
            >
              <h3 className="govuk-heading-s govuk-!-margin-top-0 govuk-!-margin-bottom-2" style={{ color: "#1d70b8", fontSize: "16px" }}>
                Featured Information
              </h3>
              
              {/* Featured Item 1 */}
              <div className="govuk-!-margin-bottom-3" style={{ borderBottom: "1px solid #bfc1c3", paddingBottom: "10px" }}>
                <h4 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ fontSize: "14px", color: "#0b0c0c" }}>
                  <Link href="/politics/elections" className="govuk-link govuk-link--no-underline">2027 General Election Timeline</Link>
                </h4>
                <p className="govuk-body-s govuk-!-margin-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>
                  IEBC voter registration windows, administrative updates, and pending legislative nomination parameters.
                </p>
              </div>

              {/* Featured Item 2 */}
              <div className="govuk-!-margin-bottom-1">
                <h4 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ fontSize: "14px", color: "#0b0c0c" }}>
                  <Link href="/counties/devolution" className="govuk-link govuk-link--no-underline">County Budget Allocation Audit</Link>
                </h4>
                <p className="govuk-body-s govuk-!-margin-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>
                  Review recent intergovernmental dispatches, conditional grant disbursements, and development expenditure balances.
                </p>
              </div>
            </div>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl govuk-!-margin-top-6 govuk-!-margin-bottom-6" />
        {/* Core Directory Grid Matrix - 100% Text Based Category Flow */}
        <div 
          className="home-flex-directory-grid"
          style={{ display: "flex", flexWrap: "wrap", gap: "28px 24px", width: "100%" }}
        >
          
          {/* Section 1: Structure of National Government */}
          <div className="directory-flex-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2" style={{ fontSize: "20px", color: "#0b0c0c" }}>
              National Government
            </h2>
            <ul className="govuk-list" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-margin-bottom-2">
                <Link href="/executive" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>The Executive</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Presidency, National Ministries, Cabinet Secretaries, and State Departments.</p>
              </li>
              <li className="govuk-!-margin-bottom-2">
                <Link href="/legislature" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>The Legislature</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Bi-cameral Parliament tracking the National Assembly and the Senate.</p>
              </li>
              <li className="govuk-!-margin-bottom-2">
                <Link href="/judiciary" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>The Judiciary</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Supreme Court rulings, superior courts, and judicial administration records.</p>
              </li>
              <li>
                <Link href="/independent-bodies" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>Independent Commissions</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Constitutional Offices, oversight groups, and entities (IEBC, SRC, EACC).</p>
              </li>
            </ul>
          </div>

          {/* Section 2: County Governance & Devolution Structure */}
          <div className="directory-flex-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2" style={{ fontSize: "20px", color: "#0b0c0c" }}>
              County Governance
            </h2>
            <ul className="govuk-list" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-margin-bottom-2">
                <Link href="/counties/governors" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>County Executives</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Governors, Deputy Governors, CECMs, and sub-county administration panels.</p>
              </li>
              <li className="govuk-!-margin-bottom-2">
                <Link href="/counties" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>County Assemblies &amp; Wards</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Local legislative houses, ward managers, elected MCAs, and passed regional acts.</p>
              </li>
              <li>
                <Link href="/counties/devolution" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>Devolution Analytics</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Intergovernmental relations indices, budget tracking, and conditional grants.</p>
              </li>
            </ul>
          </div>

          {/* Section 3: Public Institutions, State Agencies & Politics */}
          <div className="directory-flex-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2" style={{ fontSize: "20px", color: "#0b0c0c" }}>
              Institutions &amp; Politics
            </h2>
            <ul className="govuk-list" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-margin-bottom-2">
                <Link href="/institutions" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>Public Institutions</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Browse parastatals, state regulatory organs (EPRA), publications, and public tenders.</p>
              </li>
              <li className="govuk-!-margin-bottom-2">
                <Link href="/politics" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>Politics &amp; Elections</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Registered political parties, by-elections tracking, and voter registration frameworks.</p>
              </li>
              <li>
                <Link href="/coalitions" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>Political Coalitions</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Official alliances, multi-party alignments, and registered coalitions database.</p>
              </li>
            </ul>
          </div>

          {/* Section 4: Legal Frameworks, Documents & Open Data */}
          <div className="directory-flex-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2" style={{ fontSize: "20px", color: "#0b0c0c" }}>
              Laws &amp; Open Data
            </h2>
            <ul className="govuk-list" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-margin-bottom-2">
                <Link href="/constitution" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>The Constitution of Kenya 2010</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>The supreme law of the land. Collapsible chapters and text indexes.</p>
              </li>
              <li className="govuk-!-margin-bottom-2">
                <Link href="/acts/parliament" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>Acts of Parliament</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>National bills and primary statutes grouped by their House of Origin.</p>
              </li>
              <li className="govuk-!-margin-bottom-2">
                <Link href="/documents" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>Strategic State Documents</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>National blueprints, historical Sessional Papers, and Vision 2030 roadmaps.</p>
              </li>
              <li>
                <Link href="/open-data" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>Open Data Portal</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Public datasets, programmatic API endpoints, and ward export routers.</p>
              </li>
            </ul>
          </div>
          {/* Section 5: Society, Culture & Public Briefings */}
          <div className="directory-flex-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2" style={{ fontSize: "20px", color: "#0b0c0c" }}>
              Society &amp; Culture
            </h2>
            <ul className="govuk-list" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-margin-bottom-2">
                <Link href="/society-and-culture" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>Culture &amp; Heritage</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>National symbols, values, heritage sites, holidays, and official cultural calendars.</p>
              </li>
              <li className="govuk-!-margin-bottom-2">
                <Link href="/guides" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>Citizen Guides</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Plain-language handbooks detailing public processes and constitutional civic rights.</p>
              </li>
              <li>
                <Link href="/about" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>Site Information</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Learn about this independent guide, accessibility, and platform documentation guidelines.</p>
              </li>
            </ul>
          </div>

          {/* Section 6: Current Leaders Directory */}
          <div className="directory-flex-block" style={{ flex: "1 1 280px", boxSizing: "border-box" }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2" style={{ fontSize: "20px", color: "#0b0c0c" }}>
              Current Leaders
            </h2>
            <ul className="govuk-list" style={{ margin: 0, padding: 0 }}>
              <li className="govuk-!-margin-bottom-2">
                <Link href="/leaders/executive" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>National Executive Leaders</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Rosters and profile timelines for the President, Deputy President, and active Cabinet Secretaries.</p>
              </li>
              <li className="govuk-!-margin-bottom-2">
                <Link href="/leaders/parliament" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>Members of Parliament</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Elected Members of the National Assembly and Senators mapping all national constituencies.</p>
              </li>
              <li className="govuk-!-margin-bottom-2">
                <Link href="/leaders/county" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>County Executive Leadership</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Regional office profiles for Governors, Deputy Governors, County Women Representatives, and MCAs.</p>
              </li>
              <li>
                <Link href="/leaders/commissions" className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold", fontSize: "16px" }}>Independent Agency Officials</Link>
                <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f", lineHeight: "1.3" }}>Oversight directors, autonomous chairpersons, and Directors General steering independent offices.</p>
              </li>
            </ul>
          </div>

        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l govuk-!-margin-top-6 govuk-!-margin-bottom-6" />

        <GovUKFeedback />
      </div>

      {/* Global CSS Layout Overrides safe for Next App Architecture Layout Trees */}
      <style dangerouslySetInnerHTML={{__html: `
        .govuk-link--no-underline { text-decoration: none !important; color: #1d70b8 !important; }
        .govuk-link--no-underline:hover { text-decoration: underline !important; color: #003078 !important; }
        
        /* 📱 Mobile First Responsive Grid Flow matching True GOV.UK categories layout */
        .home-flex-directory-grid { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 24px; 
          width: 100%; 
        }
        .directory-flex-block { 
          flex: 1 1 100%; 
          box-sizing: border-box; 
        }

        /* 🖥️ Responsive Breakpoints for Tablet & Widescreen Desktop Viewports */
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
