'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function GovUKHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Toggle helpers ensuring menus don't clash
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    if (searchOpen) setSearchOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (menuOpen) setMenuOpen(false);
  };

  return (
    <header 
      className="govuk-header" 
      role="banner" 
      data-module="govuk-header"
      style={{ 
        backgroundColor: '#004B23', // Distinct Deep Kenyan Emerald
        borderBottom: '8px solid #CE1126', // Harambee Crimson Accent line
        padding: '0',
        margin: '0',
        position: 'relative',
        zIndex: 100,
        clear: 'both'
      }}
    >
      {/* Branding and interactive controls framework */}
      <div 
        className="govuk-header__container govuk-width-container" 
        style={{ 
          paddingTop: '12px',
          paddingBottom: '12px',
          margin: '0 auto',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 'auto',
          minHeight: '48px',
          boxSizing: 'border-box'
        }}
      >
        {/* Left Side: Custom Site Logo and App Title */}
        <div 
          className="govuk-header__logo" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            margin: '0',
            padding: '0'
          }}
        >
          <Link href="/" className="govuk-header__link govuk-header__link--homepage" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image 
              src="/logo.jpeg" 
              alt="CitizenGuide.KE Logo" 
              width={38} 
              height={38} 
              priority
              style={{ marginRight: '12px', display: 'block', borderRadius: '4px' }}
            />
            <span className="govuk-header__logotype-text header-branding-title" style={{ fontWeight: '800', color: '#ffffff', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
              CitizenGuide.KE
            </span>
          </Link>
        </div>

        {/* Right Side: Accessible Control Interaction Toggles Panel */}
        <div 
          className="header-controls-group" 
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0',
            padding: '0'
          }}
        >
          {/* Action Link: Support Portal */}
          <Link 
            href="/support" 
            className="govuk-link header-support-link"
            style={{
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 'bold',
              textDecoration: 'none',
              padding: '8px 12px',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            Support
          </Link>

          {/* Accessible Action Control Toggle: Search */}
          <button
            type="button"
            onClick={toggleSearch}
            className={`header-control-btn ${searchOpen ? 'btn-active' : ''}`}
            aria-controls="search-drawer"
            aria-label={searchOpen ? "Hide search bar" : "Show search bar"}
            aria-expanded={searchOpen}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#ffffff', 
              fontSize: '16px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              padding: '8px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span className="control-btn-text">Search</span>
          </button>

          {/* Accessible Action Control Toggle: Menu */}
          <button
            type="button"
            onClick={toggleMenu}
            className={`govuk-header__menu-button govuk-js-header-toggle ${menuOpen ? 'govuk-header__menu-button--open' : ''}`}
            aria-controls="navigation"
            aria-label={menuOpen ? "Hide main menu navigation" : "Show main menu navigation"}
            aria-expanded={menuOpen}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#ffffff', 
              fontSize: '16px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              padding: '8px 12px',
              margin: '0',
              lineHeight: '1.5',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Menu {menuOpen ? '▲' : '▼'}
          </button>
        </div>
      </div>
      {/* Search Bar Drawer (Expands cleanly below header when active) */}
      {searchOpen && (
        <div 
          id="search-drawer"
          style={{
            backgroundColor: '#f3f2f1',
            borderBottom: '4px solid #004B23',
            width: '100%',
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 99,
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
          }}
        >
          <div className="govuk-width-container govuk-!-padding-top-4 govuk-!-padding-bottom-4">
            <form action="/search" method="get" role="search" style={{ display: 'flex', maxWidth: '600px', margin: '0 auto', width: '100%', padding: '0 15px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', width: '100%', position: 'relative' }}>
                <label className="govuk-visually-hidden" htmlFor="header-search-input">
                  Search CitizenGuide.KE
                </label>
                <input 
                  className="govuk-input" 
                  id="header-search-input" 
                  name="q" 
                  type="search" 
                  placeholder="Search public records, services, laws..."
                  style={{
                    border: '3px solid #0b0c0c',
                    borderRight: 'none',
                    height: '40px',
                    margin: 0,
                    padding: '0 10px',
                    fontSize: '16px',
                    flex: 1
                  }}
                />
                <button 
                  type="submit" 
                  style={{
                    backgroundColor: '#0b0c0c',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: 0,
                    padding: 0
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Width Collapsible Mega Menu Drawer Dropdown */}
      {menuOpen && (
        <div 
          id="navigation" 
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
                <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #004B23', paddingBottom: '4px', margin: 0, fontSize: "16px" }}>
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
                <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #004B23', paddingBottom: '4px', margin: 0, fontSize: "16px" }}>
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
                <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #004B23', paddingBottom: '4px', margin: 0, fontSize: "16px" }}>
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
        .header-branding-title { font-size: 19px; }
        .govuk-link--no-underline { text-decoration: none !important; color: #004B23 !important; }
        .govuk-link--no-underline:hover { text-decoration: underline !important; color: #002210 !important; }
        
        .legislation-mega-menu { position: absolute; top: 100%; left: 0; }
        
        /* Custom UI highlights for active action panels */
        .btn-active { background-color: rgba(255, 255, 255, 0.15) !important; border-radius: 4px; }
        .header-support-link:hover { text-decoration: underline !important; color: #ffffff !important; }

        @media (min-width: 25rem) {
          .header-branding-title { font-size: 21px; }
        }

        @media (max-width: 420px) {
          /* Hide button text label on narrow viewports to preserve space */
          .control-btn-text { display: none !important; }
          .header-controls-group { gap: 4px !important; }
        }

        @media (min-width: 40.0625rem) {
          .header-branding-title { font-size: 26px; }
        }

        @media (max-width: 48.0625rem) {
          /* Prevent menu content cutoff on smaller screens by turning off absolute layers */
          .legislation-mega-menu { position: relative !important; top: 0 !important; }
          #search-drawer { position: relative !important; top: 0 !important; }
        }
      `}} />
    </header>
  );
}
