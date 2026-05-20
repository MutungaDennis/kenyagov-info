'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function GovUKHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header 
      className="govuk-header" 
      role="banner" 
      data-module="govuk-header"
      style={{ 
        backgroundColor: '#002147', 
        borderBottom: '10px solid #ffbf47',
        padding: '0',
        margin: '0',
        position: 'relative',
        zIndex: 100,
        clear: 'both'
      }}
    >
      {/* Explicitly containerized branding bar to stop height leakage */}
      <div 
        className="govuk-header__container govuk-width-container" 
        style={{ 
          paddingTop: '15px',
          paddingBottom: '15px',
          margin: '0 auto',
          position: 'relative',
          display: 'block',
          height: 'auto',
          minHeight: '44px',
          boxSizing: 'border-box'
        }}
      >
        {/* Left Side: Brand Branding Container Block */}
        <div 
          className="govuk-header__logo" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            float: 'left',
            margin: '0',
            padding: '0'
          }}
        >
          <Link href="/" className="govuk-header__link govuk-header__link--homepage" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image 
              src="/logo.png" 
              alt="" 
              width={36} 
              height={36} 
              priority
              style={{ marginRight: '12px', display: 'block' }}
            />
            <span className="govuk-header__logotype-text" style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '-0.5px', lineHeight: '1.2' }}>
              CitizenGuide.KE
            </span>
          </Link>
        </div>

        {/* Right Side: Accessible Control Interaction Toggles */}
        <div 
          className="govuk-header__content" 
          style={{ 
            float: 'right', 
            textAlign: 'right',
            margin: '0',
            padding: '0'
          }}
        >
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`govuk-header__menu-button govuk-js-header-toggle ${menuOpen ? 'govuk-header__menu-button--open' : ''}`}
            aria-controls="navigation"
            aria-label={menuOpen ? "Hide main menu navigation" : "Show main menu navigation"}
            aria-expanded={menuOpen}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#ffffff', 
              fontSize: '19px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              padding: '6px 12px',
              margin: '0',
              lineHeight: '1.5'
            }}
          >
            Menu {menuOpen ? '▲' : '▼'}
          </button>
        </div>

        {/* Pure CSS clearfix to completely lock down the container background area */}
        <div style={{ clear: 'both', display: 'block', height: '0', overflow: 'hidden' }}></div>
      </div>

      {/* Full Width Collapsible Mega Menu Drawer */}
      {menuOpen && (
        <div 
          id="navigation" 
          className="govuk-header__navigation-wrapper"
          style={{ 
            backgroundColor: '#f3f2f1', 
            borderTop: '1px solid #bfc1c3', 
            display: 'block',
            width: '100%',
            position: 'absolute',
            top: '100%',
            left: '0',
            zIndex: 99,
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            clear: 'both'
          }}
        >
          <div className="govuk-width-container govuk-!-padding-top-6 govuk-!-padding-bottom-6">
            <div className="govuk-grid-row">
              
              {/* Column 1: Core Citizen Services & Information */}
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-4">
                <h2 className="govuk-heading-m govuk-!-margin-bottom-4" style={{ color: '#0b0c0c', borderBottom: '4px solid #0b0c0c', paddingBottom: '5px', display: 'inline-block' }}>
                  Services & Information
                </h2>
                <ul className="govuk-list govuk-list--spaced" style={{ margin: 0 }}>
                  <li>
                    <Link href="/services/id" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Births, Deaths & Care</Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">ID applications, certificates, and civil registries</p>
                  </li>
                  <li>
                    <Link href="/services/passport" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Passports & Immigration</Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Travel documents, citizenship, and entry visas</p>
                  </li>
                  <li>
                    <Link href="/services/tax" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Money, KRA & Tax</Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Income filings, business licensing, and duties</p>
                  </li>
                  <li>
                    <Link href="/services/driving" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Driving & Transport</Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">NTSA logbooks, license testing, and vehicle links</p>
                  </li>
                </ul>
              </div>

              {/* Column 2: Government Arms & National Organs */}
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-4">
                <h2 className="govuk-heading-m govuk-!-margin-bottom-4" style={{ color: '#0b0c0c', borderBottom: '4px solid #0b0c0c', paddingBottom: '5px', display: 'inline-block' }}>
                  Arms of Government
                </h2>
                <ul className="govuk-list govuk-list--spaced" style={{ margin: 0 }}>
                  <li>
                    <Link href="/executive" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">The Executive</Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">The Presidency, ministries, and cabinet registries</p>
                  </li>
                  <li>
                    <Link href="/legislature" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">The Legislature</Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">National Assembly, Senate bills, and committees</p>
                  </li>
                  <li>
                    <Link href="/judiciary" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">The Judiciary</Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Supreme Court rulings, case files, and local courts</p>
                  </li>
                  <li>
                    <Link href="/counties" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Devolved Counties</Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Profiles and leadership for all 47 county systems</p>
                  </li>
                </ul>
              </div>

              {/* Column 3: National Records & Public Briefings */}
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-4">
                <h2 className="govuk-heading-m govuk-!-margin-bottom-4" style={{ color: '#0b0c0c', borderBottom: '4px solid #0b0c0c', paddingBottom: '5px', display: 'inline-block' }}>
                  Official Records
                </h2>
                <ul className="govuk-list govuk-list--spaced" style={{ margin: 0 }}>
                  <li>
                    <Link href="/executive/presidency/executive-orders" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Executive Orders</Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Administrative structures and policy directives</p>
                  </li>
                  <li>
                    <Link href="/executive/presidency/cabinet-decisions" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Cabinet Decisions</Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Official dispatches from recent Cabinet sessions</p>
                  </li>
                  <li>
                    <Link href="/executive/presidency/international-visits" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">International Visits</Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Diplomatic itineraries, outcomes, and speeches</p>
                  </li>
                  <li>
                    <Link href="/search" className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-19">Search Public Archives 🔍</Link>
                    <p className="govuk-body-s govuk-!-margin-top-1 govuk-text-secondary">Instantly locate gazettes, laws, and official records</p>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}
    </header>
  );
}
