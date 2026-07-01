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
      router.push(`/search/all?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
      <div className="govuk-width-container">
        
        {/* GOV.UK Phase Banner (BETA Disclosure Panel) */}
        <div className="govuk-phase-banner">
          <p className="govuk-phase-banner__content">
            <strong className="govuk-tag govuk-phase-banner__content__tag">BETA</strong>
            <span className="govuk-phase-banner__text">
              This website is in early development. Your feedback helps us improve it.{' '}
              <Link href="/feedback" className="govuk-link">Give feedback</Link>
            </span>
          </p>
        </div>

        {/* Hero using GOV.UK classes only */}
        <div className="govuk-!-padding-top-6 govuk-!-padding-bottom-6 govuk-!-margin-bottom-8">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full">
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
                CitizenGuide.KE
              </h1>
              
              <p className="govuk-body-l">
                Find clear, factual information about the Government of Kenya — institutions, leaders, counties, public services and the constitution.
              </p>

              <form onSubmit={handleSearchSubmit} className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="main-search">
                  Search government entities, services or laws
                </label>
                <div className="govuk-hint" id="search-hint-text">
                  For example: KRA, Constitution Article 47, passport or Nairobi County
                </div>
                
                <div className="govuk-input__wrapper">
                  <input
                    className="govuk-input"
                    id="main-search"
                    name="q"
                    type="search"
                    autoComplete="off"
                    aria-describedby="search-hint-text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="govuk-button"
                    aria-label="Search"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Popular Services using standard GOV.UK patterns */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
              Popular services
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Common public services accessed by citizens
            </p>

            <ul className="govuk-list govuk-list--spaced">
              {/* 1. Businesses and self-employed */}
              <li className="govuk-!-margin-bottom-4">
                <Link href="/services?category=business-self-employed" className="govuk-link govuk-!-font-weight-bold">
                  Businesses and self-employed
                </Link>
                <p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  Set up a business name or limited company, and file company annual returns.
                </p>
              </li>

              {/* 2. Births, deaths, marriages and care */}
              <li className="govuk-!-margin-bottom-4">
                <Link href="/services?category=civil-registration" className="govuk-link govuk-!-font-weight-bold">
                  Births, deaths, marriages and care
                </Link>
                <p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  Register a birth or death, apply for a marriage certificate, or check police clearance.
                </p>
              </li>

              {/* 3. Driving and transport */}
              <li className="govuk-!-margin-bottom-4">
                <Link href="/services?category=driving-transport" className="govuk-link govuk-!-font-weight-bold">
                  Driving and transport
                </Link>
                <p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  Apply for a provisional licence (PDL), renew your driving licence, or transfer vehicle ownership.
                </p>
              </li>

              {/* 4. Passports, travel and living abroad */}
              <li className="govuk-!-margin-bottom-4">
                <Link href="/services?category=passports-travel" className="govuk-link govuk-!-font-weight-bold">
                  Passports, travel and living abroad
                </Link>
                <p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  Apply for or renew a Kenyan passport, check visa rules, and manage immigration profiles.
                </p>
              </li>

              {/* 5. Money and tax */}
              <li className="govuk-!-margin-bottom-4">
                <Link href="/services?category=money-tax" className="govuk-link govuk-!-font-weight-bold">
                  Money and tax
                </Link>
                <p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  File self-assessment tax returns, request KRA PIN variations, or check compliance.
                </p>
              </li>

              {/* 6. Land and property */}
              <li className="govuk-!-margin-bottom-5">
                <Link href="/services?category=land-property" className="govuk-link govuk-!-font-weight-bold">
                  Land and property
                </Link>
                <p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  Search land and property records, settle land rates, or verify title details.
                </p>
              </li>

              {/* Explore all services */}
              <li className="govuk-!-margin-top-6">
                <Link href="/services" className="govuk-link govuk-!-font-weight-bold">
                  Explore all services A to Z
                </Link>
                <p className="govuk-body govuk-!-margin-top-1">
                  Browse the complete index of government information.
                </p>
              </li>
            </ul>
          </div>

          <div className="govuk-grid-column-one-third-from-desktop govuk-grid-column-full govuk-!-margin-top-4">
            <div className="govuk-inset-text">
              <h3 className="govuk-heading-s govuk-!-margin-top-0">
                Featured
              </h3>

              <div className="govuk-!-margin-bottom-3">
                <h4 className="govuk-heading-s govuk-!-margin-bottom-1">
                  <Link href="/elections" className="govuk-link">2027 General Election timeline</Link>
                </h4>
                <p className="govuk-body govuk-!-margin-0">
                  IEBC voter registration, updates and nomination information.
                </p>
              </div>

              <div>
                <h4 className="govuk-heading-s govuk-!-margin-bottom-1">
                  <Link href="/government/counties/devolution" className="govuk-link">County budget and devolution</Link>
                </h4>
                <p className="govuk-body govuk-!-margin-0">
                  Intergovernmental grants, budgets and county performance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--xl govuk-!-margin-top-8 govuk-!-margin-bottom-8" />

        <div className="govuk-grid-row">
          
          <div className="govuk-grid-column-one-third-from-desktop">
            <h2 className="govuk-heading-m">National government</h2>
            <ul className="govuk-list">
              <li>
                <Link href="/government/cabinet" className="govuk-link govuk-!-font-weight-bold">The Executive</Link>
                <p className="govuk-body govuk-!-margin-top-1">Presidency, ministries, cabinet secretaries and state departments.</p>
              </li>
              <li>
                <Link href="/government/legislature" className="govuk-link govuk-!-font-weight-bold">The Legislature</Link>
                <p className="govuk-body govuk-!-margin-top-1">National Assembly and Senate.</p>
              </li>
              <li>
                <Link href="/government/judiciary" className="govuk-link govuk-!-font-weight-bold">The Judiciary</Link>
                <p className="govuk-body govuk-!-margin-top-1">Supreme Court, superior courts and judicial administration.</p>
              </li>
              <li>
                <Link href="/government/commissions" className="govuk-link govuk-!-font-weight-bold">Independent Commissions</Link>
                <p className="govuk-body govuk-!-margin-top-1">Constitutional offices and oversight bodies (IEBC, SRC, EACC, etc.).</p>
              </li>
            </ul>
          </div>

          <div className="govuk-grid-column-one-third-from-desktop">
            <h2 className="govuk-heading-m">County governance</h2>
            <ul className="govuk-list">
              <li>
                <Link href="/government/counties/governors" className="govuk-link govuk-!-font-weight-bold">County Executives</Link>
                <p className="govuk-body govuk-!-margin-top-1">Governors, deputy governors and county executive committees.</p>
              </li>
              <li>
                <Link href="/government/counties" className="govuk-link govuk-!-font-weight-bold">County Assemblies &amp; Wards</Link>
                <p className="govuk-body govuk-!-margin-top-1">MCAs, ward-level representation, and local legislation.</p>
              </li>
              <li>
                <Link href="/government/counties/devolution" className="govuk-link govuk-!-font-weight-bold">Devolution</Link>
                <p className="govuk-body govuk-!-margin-top-1">Intergovernmental relations, budgets, and county performance.</p>
              </li>
            </ul>
          </div>

          <div className="govuk-grid-column-one-third-from-desktop">
            <h2 className="govuk-heading-m">Institutions and politics</h2>
            <ul className="govuk-list">
              <li>
                <Link href="/government/institutions" className="govuk-link govuk-!-font-weight-bold">Public Institutions</Link>
                <p className="govuk-body govuk-!-margin-top-1">Parastatals, regulators, and government agencies.</p>
              </li>
              <li>
                <Link href="/elections" className="govuk-link govuk-!-font-weight-bold">Elections</Link>
                <p className="govuk-body govuk-!-margin-top-1">Political parties, elections, and voter information.</p>
              </li>
              <li>
                <Link href="/coalitions" className="govuk-link govuk-!-font-weight-bold">Political Coalitions</Link>
                <p className="govuk-body govuk-!-margin-top-1">Registered party alliances and coalition frameworks.</p>
              </li>
              <li>
                <Link href="/open-data" className="govuk-link govuk-!-font-weight-bold">Open data</Link>
                <p className="govuk-body govuk-!-margin-top-1">Public datasets and machine-readable registers.</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Additional GOV.UK grid rows for remaining categories */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third-from-desktop">
            <h2 className="govuk-heading-m">Society and culture</h2>
            <ul className="govuk-list">
              <li>
                <Link href="/society-and-culture" className="govuk-link govuk-!-font-weight-bold">Culture and heritage</Link>
                <p className="govuk-body govuk-!-margin-top-1">National symbols, heritage sites, holidays and cultural calendars.</p>
              </li>
              <li>
                <Link href="/guides" className="govuk-link govuk-!-font-weight-bold">Citizen guides</Link>
                <p className="govuk-body govuk-!-margin-top-1">Plain-language guides to public processes and rights.</p>
              </li>
              <li>
                <Link href="/about" className="govuk-link govuk-!-font-weight-bold">About this site</Link>
                <p className="govuk-body govuk-!-margin-top-1">How this guide works and accessibility information.</p>
              </li>
            </ul>
          </div>

          <div className="govuk-grid-column-one-third-from-desktop">
            <h2 className="govuk-heading-m">Current leaders</h2>
            <ul className="govuk-list">
              <li>
                <Link href="/government/people" className="govuk-link govuk-!-font-weight-bold">All government officials</Link>
                <p className="govuk-body govuk-!-margin-top-1">President, Deputy President, Cabinet Secretaries and senior officials.</p>
              </li>
              <li>
                <Link href="/government/legislature/national-assembly/members" className="govuk-link govuk-!-font-weight-bold">Members of Parliament</Link>
                <p className="govuk-body govuk-!-margin-top-1">National Assembly and Senate members.</p>
              </li>
              <li>
                <Link href="/government/counties/governors" className="govuk-link govuk-!-font-weight-bold">County leadership</Link>
                <p className="govuk-body govuk-!-margin-top-1">Governors, MCAs and county executives.</p>
              </li>
              <li>
                <Link href="/government/commissions" className="govuk-link govuk-!-font-weight-bold">Independent bodies</Link>
                <p className="govuk-body govuk-!-margin-top-1">Commissions and oversight officials.</p>
              </li>
            </ul>
          </div>

          <div className="govuk-grid-column-one-third-from-desktop">
            <h2 className="govuk-heading-m">More information</h2>
            <ul className="govuk-list">
              <li>
                <Link href="/documents" className="govuk-link govuk-!-font-weight-bold">Official documents</Link>
                <p className="govuk-body govuk-!-margin-top-1">Vision 2030, sessional papers and key publications.</p>
              </li>
              <li>
                <Link href="/acts/parliament" className="govuk-link govuk-!-font-weight-bold">Acts of Parliament</Link>
                <p className="govuk-body govuk-!-margin-top-1">Current and historical legislation.</p>
              </li>
              <li>
                <Link href="/constitution" className="govuk-link govuk-!-font-weight-bold">The Constitution of Kenya 2010</Link>
                <p className="govuk-body govuk-!-margin-top-1">The supreme law, fully searchable with explanations.</p>
              </li>
            </ul>
          </div>
        </div>
        
      </div>

    </>
  );
}