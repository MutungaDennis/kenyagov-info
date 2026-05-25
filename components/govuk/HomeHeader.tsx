'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function GovUKHomeHeader() {
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
      <div 
        className="govuk-header__container govuk-width-container" 
        style={{ 
          paddingTop: '15px',
          paddingBottom: '15px',
          margin: '0 auto',
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
          <Link 
            href="/" 
            className="govuk-header__link govuk-header__link--homepage" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              textDecoration: 'none' 
            }}
          >
            <Image 
              src="/logo.jpeg" 
              alt="" 
              width={36} 
              height={36} 
              priority
              style={{ marginRight: '12px', display: 'block' }}
            />
            <span 
              className="govuk-header__logotype-text" 
              style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: '#ffffff', 
                letterSpacing: '-0.5px', 
                lineHeight: '1.2' 
              }}
            >
              CitizenGuide.KE
            </span>
          </Link>
        </div>

        {/* Right Side: Accessible Main Menu Navigation Toggle */}
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
            aria-controls="home-navigation"
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

                {/* Pure CSS Clearfix wrapper to secure layout calculations */}
        <div style={{ clear: 'both', display: 'block', height: '0', overflow: 'hidden' }}></div>
      </div>

            {/* Full Width Collapsible Mega Menu Drawer Dropdown */}
      {menuOpen && (
        <div 
          id="home-navigation" 
          className="govuk-header__navigation-wrapper legislation-mega-menu"
          style={{ 
            backgroundColor: '#f3f2f1', 
            borderTop: '1px solid #bfc1c3', 
            display: 'block',
            width: '100%',
            zIndex: 99,
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            clear: 'both'
          }}
        >
          <div className="govuk-width-container govuk-!-padding-top-4 govuk-!-padding-bottom-4">
            
            {/* Fluid responsive flex grid supporting clean wrapping configurations */}
            <div 
              className="mega-menu-flex-grid"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "24px 20px"
              }}
            >
              
              {/* Column 1: Core Citizen Services & Information */}
              <div className="mega-menu-column" style={{ flex: "1 1 260px" }}>
                <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #0b0c0c', paddingBottom: '4px', margin: 0, fontSize: "16px" }}>
                  Services &amp; Information
                </h2>
                <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/services/id" className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold govuk-!-font-size-16">Births, Deaths &amp; Care</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>ID applications, certificates, and civil registries</p>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/services/passport" className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold govuk-!-font-size-16">Passports &amp; Immigration</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Travel documents, citizenship, and entry visas</p>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/services/tax" className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold govuk-!-font-size-16">Money, KRA &amp; Tax</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Income filings, business licensing, and duties</p>
                  </li>
                  <li>
                    <Link href="/services/driving" className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold govuk-!-font-size-16">Driving &amp; Transport</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>NTSA logbooks, license testing, and vehicle links</p>
                  </li>
                </ul>
              </div>

              {/* Column 2: Government Arms & National Organs */}
              <div className="mega-menu-column" style={{ flex: "1 1 260px" }}>
                <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #0b0c0c', paddingBottom: '4px', margin: 0, fontSize: "16px" }}>
                  Arms of Government
                </h2>
                <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/executive" className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold govuk-!-font-size-16">The Executive</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>The Presidency, ministries, and cabinet registries</p>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/legislature" className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold govuk-!-font-size-16">The Legislature</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>National Assembly, Senate bills, and committees</p>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/judiciary" className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold govuk-!-font-size-16">The Judiciary</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Supreme Court rulings, case files, and local courts</p>
                  </li>
                  <li>
                    <Link href="/counties" className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold govuk-!-font-size-16">Devolved Counties</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Profiles and leadership for all 47 county systems</p>
                  </li>
                </ul>
              </div>

              {/* Column 3: National Records & Public Briefings */}
              <div className="mega-menu-column" style={{ flex: "1 1 260px" }}>
                <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #0b0c0c', paddingBottom: '4px', margin: 0, fontSize: "16px" }}>
                  Official Records
                </h2>
                <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/executive/presidency/executive-orders" className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold govuk-!-font-size-16">Executive Orders</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Administrative structures and policy directives</p>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/executive/presidency/cabinet-decisions" className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold govuk-!-font-size-16">Cabinet Decisions</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Official dispatches from recent Cabinet sessions</p>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/executive/presidency/international-visits" className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold govuk-!-font-size-16">International Visits</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Diplomatic itineraries, outcomes, and speeches</p>
                  </li>
                  <li>
                    <Link href="/search" className="govuk-link govuk-link--no-underline govuk-!-font-weight-bold govuk-!-font-size-16">Search Public Archives 🔍</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Instantly locate gazettes, laws, and official records</p>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Global CSS Layout Overrides safe for modern multi-device deployment */}
      <style dangerouslySetInnerHTML={{__html: `
        .header-branding-title { font-size: 20px; }
        .govuk-link--no-underline { text-decoration: none !important; color: #1d70b8 !important; }
        .govuk-link--no-underline:hover { text-decoration: underline !important; color: #003078 !important; }
        
        .legislation-mega-menu { position: absolute; top: 100%; left: 0; }

        @media (min-width: 25rem) {
          .header-branding-title { font-size: 22px; }
        }

        @media (min-width: 40.0625rem) {
          .header-branding-title { font-size: 28px; }
        }

        @media (max-width: 48.0625rem) {
          /* Prevent menu content cutoff on smaller screens by turning off absolute layers */
          .legislation-mega-menu { position: relative !important; top: 0 !important; }
        }
      `}} />
    </header>
  );
}
