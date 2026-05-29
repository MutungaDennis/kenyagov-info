'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function GovUKHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Accessible toggle handlers preventing overlapping menus
  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (menuOpen) setMenuOpen(false);
    if (moreOpen) setMoreOpen(false);
  };

  const toggleMore = () => {
    setMoreOpen(!moreOpen);
  };

  return (
    <header 
      className="govuk-header site-two-tone-header" 
      role="banner" 
      data-module="govuk-header"
      style={{ 
        backgroundColor: '#ffffff', // High-contrast clean white top tier base
        borderBottom: '6px solid #CE1126', // Harambee Crimson bottom anchor boundary
        padding: '0',
        margin: '0',
        position: 'relative',
        zIndex: 100,
        clear: 'both',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      {/* TIER 1: Pristine White Identity & Account Management Bar */}
      <div 
        className="header-top-white-tier"
        style={{
          borderBottom: '1px solid #e5e5e5'
        }}
      >
        <div 
          className="govuk-width-container" 
          style={{ 
            margin: '0 auto', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingTop: '12px',
            paddingBottom: '12px',
            boxSizing: 'border-box'
          }}
        >
          {/* Left Side: Brand Logo & Title */}
          <div className="govuk-header__logo" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Link href="/" className="govuk-header__link" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              <Image 
                src="/logo.jpeg" 
                alt="CitizenGuide.KE Logo" 
                width={36} 
                height={36} 
                priority
                style={{ marginRight: '10px', display: 'block', borderRadius: '4px', border: '1px solid #bfc1c3' }}
              />
              <span className="header-branding-title" style={{ fontWeight: '800', color: '#0b0c0c', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
                CitizenGuide.KE
              </span>
            </Link>
          </div>

          {/* Right Side Control Nodes: Support, Search Icon (Desktop Only), and My Account */}
          <div 
            className="top-tier-action-group"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {/* Support Call-to-Action Link (Rendered on Desktop/Tablet viewports) */}
            <Link 
              href="/support" 
              className="govuk-link desktop-support-action-btn"
              style={{
                border: '2px solid #004B23',
                color: '#004B23',
                fontSize: '14px',
                fontWeight: 'bold',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              Support
            </Link>

            {/* Desktop Quick Search Drawer Button Trigger Toggle */}
            <button
              type="button"
              onClick={toggleSearch}
              className={`desktop-search-trigger-icon ${searchOpen ? 'icon-active' : ''}`}
              aria-controls="desktop-search-dropdown-drawer"
              aria-label={searchOpen ? "Close search tool" : "Open search tool"}
              aria-expanded={searchOpen}
              style={{
                background: 'none',
                border: 'none',
                color: '#0b0c0c',
                cursor: 'pointer',
                padding: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {/* User Access Gateway: My Account Button */}
            <Link 
              href="/account" 
              className="govuk-link header-account-pill-btn"
              style={{
                backgroundColor: '#0b0c0c',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 'bold',
                textDecoration: 'none',
                padding: '8px 14px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>My Account</span>
            </Link>
          </div>
        </div>
      </div>
      {/* Hidden Desktop Search Expansion Drawer */}
      {searchOpen && (
        <div 
          id="desktop-search-dropdown-drawer"
          className="desktop-only-search-pane"
          style={{
            backgroundColor: '#f3f2f1',
            borderBottom: '4px solid #004B23',
            width: '100%',
            position: 'absolute',
            top: '61px', // Sits flush right below the white tier line
            left: 0,
            zIndex: 99,
            boxShadow: '0 4px 10px rgba(0,0,0,0.12)'
          }}
        >
          <div className="govuk-width-container govuk-!-padding-top-3 govuk-!-padding-bottom-3">
            <form action="/search" method="get" role="search" style={{ display: 'flex', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
              <div style={{ display: 'flex', width: '100%', position: 'relative' }}>
                <input 
                  className="govuk-input" 
                  name="q" 
                  type="search" 
                  placeholder="Search records, guidelines, frameworks..."
                  style={{
                    border: '3px solid #0b0c0c',
                    borderRight: 'none',
                    height: '40px',
                    padding: '0 12px',
                    fontSize: '16px',
                    flex: 1,
                    backgroundColor: '#ffffff',
                    color: '#000000'
                  }}
                />
                <button type="submit" style={{ backgroundColor: '#0b0c0c', border: 'none', color: '#ffffff', width: '44px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIER 2: Emerald Green Navigation & Full Mobile Search Ribbon */}
      <div 
        className="header-bottom-green-tier"
        style={{
          backgroundColor: '#004B23', // Vibrant Deep Kenyan Emerald
          paddingTop: '6px',
          paddingBottom: '6px'
        }}
      >
        <div 
          className="govuk-width-container"
          style={{
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column', // Base mobile stacking layout
            gap: '8px',
            boxSizing: 'border-box'
          }}
        >
          {/* Mobile-Only Full Width Embedded Search Input Row */}
          <div className="mobile-search-embedded-row" style={{ width: '100%' }}>
            <form action="/search" method="get" role="search" style={{ display: 'flex', width: '100%' }}>
              <div style={{ display: 'flex', width: '100%' }}>
                <label className="govuk-visually-hidden" htmlFor="mobile-search-input">Search CitizenGuide.KE</label>
                <input 
                  className="govuk-input" 
                  id="mobile-search-input"
                  name="q" 
                  type="search" 
                  placeholder="Search public services & laws..."
                  style={{
                    border: '2px solid #ffffff',
                    borderRight: 'none',
                    height: '36px',
                    padding: '0 10px',
                    fontSize: '15px',
                    flex: 1,
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    borderRadius: '4px 0 0 4px'
                  }}
                />
                <button type="submit" style={{ backgroundColor: '#0b0c0c', border: '2px solid #ffffff', borderLeft: 'none', color: '#ffffff', width: '40px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </div>
            </form>
          </div>

          {/* Ribbon Wrapper Holding Primary Top-Level Anchor Links */}
          <div 
            className="navigation-ribbon-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative'
            }}
          >
            <nav 
              aria-label="Primary Site Sections" 
              style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}
            >
              {/* Highlight Item 1: Civil Registries */}
              <Link href="/services/id" className="ribbon-nav-link" style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 12px', display: 'inline-flex' }}>
                Civil Services
              </Link>
              
              {/* Highlight Item 2: Immigration Node */}
              <Link href="/services/passport" className="ribbon-nav-link" style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 12px', display: 'inline-flex' }}>
                Passports
              </Link>

              {/* Highlight Item 3: Revenue Hub */}
              <Link href="/services/tax" className="ribbon-nav-link" style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 12px', display: 'inline-flex' }}>
                KRA &amp; Tax
              </Link>
              {/* Highlight Item 4: Transport Node */}
              <Link href="/services/driving" className="ribbon-nav-link" style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 12px', display: 'inline-flex' }}>
                NTSA Transport
              </Link>
            </nav>

            {/* NHS-Inspired Action Control: Comprehensive Sub-navigation Trigger */}
            <button
              type="button"
              onClick={toggleMore}
              className={`ribbon-more-toggle-btn ${moreOpen ? 'more-active' : ''}`}
              aria-controls="expanded-more-mega-menu"
              aria-label={moreOpen ? "Hide remaining site sections menu" : "Show remaining site sections menu"}
              aria-expanded={moreOpen}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                padding: '8px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '4px'
              }}
            >
              <span>More</span>
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ 
                  transform: moreOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* TIER 3: Expanded Category Mega-Menu Drawer Panel */}
      {moreOpen && (
        <div 
          id="expanded-more-mega-menu"
          className="more-dropdown-drawer-panel"
          style={{ 
            backgroundColor: '#f3f2f1', 
            borderBottom: '4px solid #004B23', 
            width: '100%',
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 98,
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
            clear: 'both'
          }}
        >
          <div className="govuk-width-container govuk-!-padding-top-5 govuk-!-padding-bottom-5">
            <div 
              className="mega-menu-flex-grid"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "28px 20px"
              }}
            >
              
              {/* Dropdown Section Column 1: Core Governance Architectures */}
              <div className="mega-menu-column" style={{ flex: "1 1 260px" }}>
                <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #004B23', paddingBottom: '4px', margin: 0, fontSize: "16px" }}>
                  Arms of Government
                </h2>
                <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/executive" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none' }}>The Executive</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>The Presidency, ministries, and cabinet registries</p>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/legislature" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none' }}>The Legislature</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>National Assembly, Senate bills, and committees</p>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/judiciary" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none' }}>The Judiciary</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Supreme Court rulings, case files, and local courts</p>
                  </li>
                  <li>
                    <Link href="/counties" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none' }}>Devolved Counties</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Profiles and leadership for all 47 county systems</p>
                  </li>
                </ul>
              </div>
              {/* Dropdown Section Column 2: Official Gazettes & Policy Archives */}
              <div className="mega-menu-column" style={{ flex: "1 1 260px" }}>
                <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #004B23', paddingBottom: '4px', margin: 0, fontSize: "16px" }}>
                  Official Records
                </h2>
                <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/executive/presidency/executive-orders" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none' }}>Executive Orders</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Administrative structures and policy directives</p>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/executive/presidency/cabinet-decisions" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none' }}>Cabinet Decisions</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Official dispatches from recent Cabinet sessions</p>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/executive/presidency/international-visits" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none' }}>International Visits</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Diplomatic itineraries, outcomes, and speeches</p>
                  </li>
                  <li>
                    <Link href="/search" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none' }}>Search Public Archives 🔍</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Instantly locate gazettes, laws, and official records</p>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Global CSS Responsive Core Layout Overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Base typography font scaling configuration */
        .header-branding-title { font-size: 19px; }
        
        /* Drawer context link setups */
        .sub-drawer-link { color: #004B23 !important; }
        .sub-drawer-link:hover { text-decoration: underline !important; color: #002210 !important; }
        
        /* Interactive dynamic active/hover state matrices */
        .icon-active { background-color: #f3f2f1 !important; border-radius: 4px; color: #004B23 !important; }
        .more-active { background-color: rgba(255, 255, 255, 0.2) !important; }
        .ribbon-nav-link:hover { background-color: rgba(255, 255, 255, 0.1) !important; text-decoration: underline !important; border-radius: 4px; }
        .header-account-pill-btn:hover { background-color: #2b2c2c !important; }
        .desktop-support-action-btn:hover { background-color: #004B23 !important; color: #ffffff !important; }

        /* Absolute positioning parameters for mega-drawers */
        .more-dropdown-drawer-panel { position: absolute; top: 100%; left: 0; }

        /* MOBILE/TABLET VIEWPORT CONTROL FLOW OVERRIDES */
        @media (max-width: 40.05rem) {
          .desktop-support-action-btn { display: none !important; }
          .desktop-search-trigger-icon { display: none !important; }
          .desktop-only-search-pane { display: none !important; }
          
          /* Force Ribbon row to support horizontal scrolling overflow on cramped phones */
          .navigation-ribbon-row nav { flex-wrap: nowrap !important; overflow-x: auto !important; scrollbar-width: none; }
          .navigation-ribbon-row nav::-webkit-scrollbar { display: none; }
          .ribbon-nav-link { white-space: nowrap !important; }
        }

        /* DESKTOP ADVANCED MEDIA QUERIES VIEWPORT OVERRIDES */
        @media (min-width: 40.0625rem) {
          .header-branding-title { font-size: 25px; }
          
          /* Flat ribbon restructuring code */
          .header-bottom-green-tier .govuk-width-container { flex-direction: row !important; align-items: center; justify-content: space-between; }
          
          /* Suppress mobile full search on large web screens */
          .mobile-search-embedded-row { display: none !important; }
        }

        /* Prevent dropdown truncation across mid-tier devices */
        @media (max-width: 48.0625rem) {
          .more-dropdown-drawer-panel { position: relative !important; top: 0 !important; }
        }
      `}} />
    </header>
  );
}
