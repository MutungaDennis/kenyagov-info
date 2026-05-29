'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function GovUKHeader() {
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const toggleMore = () => {
    setMoreOpen(!moreOpen);
    if (mobileSearchOpen) setMobileSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (moreOpen) setMoreOpen(false);
  };

  return (
    <header 
      className="govuk-header site-two-tone-header" 
      role="banner" 
      data-module="govuk-header"
      style={{ 
        backgroundColor: '#ffffff', // Clean crisp white top branding tier
        borderBottom: '6px solid #CE1126', // Harambee Crimson baseline accent rule
        padding: '0',
        margin: '0',
        position: 'relative',
        zIndex: 100,
        clear: 'both',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      {/* TIER 1: Adaptive Brand Identity & Action Controls Row */}
      <div 
        className="header-top-white-tier"
        style={{ borderBottom: '1px solid #e5e5e5' }}
      >
        <div 
          className="govuk-width-container" 
          style={{ 
            margin: '0 auto', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            paddingTop: '10px',
            paddingBottom: '10px',
            paddingLeft: '16px',
            paddingRight: '16px',
            boxSizing: 'border-box'
          }}
        >
          {/* Left Side: Scaled Brand Logo and Responsive Domain Label */}
          <div className="govuk-header__logo" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Link href="/" className="govuk-header__link" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              <Image 
                src="/logo.jpeg" 
                alt="CitizenGuide.KE Logo" 
                width={30} // Reduced signature width for mobile optimization
                height={30} 
                priority
                style={{ marginRight: '8px', display: 'block', borderRadius: '4px', border: '1px solid #bfc1c3' }}
              />
              <span className="header-branding-title" style={{ fontWeight: '800', color: '#0b0c0c', letterSpacing: '-0.4px', lineHeight: '1.2' }}>
                CitizenGuide.KE
              </span>
            </Link>
          </div>

          {/* Right Side: Dual Desktop/Mobile Accessible Control Node Cluster */}
          <div 
            className="top-tier-action-group"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {/* DESKTOP-ONLY SHORT SEARCH BAR (Positioned perfectly on the left of Support) */}
            <div className="desktop-search-inline-container" style={{ marginRight: '4px' }}>
              <form action="/search" method="get" role="search" style={{ display: 'flex' }}>
                <input 
                  className="govuk-input" 
                  name="q" 
                  type="search" 
                  placeholder="Search site..."
                  style={{
                    border: '2px solid #0b0c0c',
                    borderRight: 'none',
                    height: '34px',
                    width: '180px',
                    padding: '0 8px',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                    color: '#000000'
                  }}
                />
                <button type="submit" aria-label="Search" style={{ backgroundColor: '#0b0c0c', border: 'none', color: '#ffffff', width: '36px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </form>
            </div>

            {/* MOBILE-ONLY SEARCH ICON TOGGLE (Sits cleanly right before Support button) */}
            <button
              type="button"
              onClick={toggleMobileSearch}
              className={`mobile-search-toggle-btn ${mobileSearchOpen ? 'icon-active' : ''}`}
              aria-controls="mobile-dropdown-search-drawer"
              aria-label={mobileSearchOpen ? "Close search tool" : "Open search tool"}
              aria-expanded={mobileSearchOpen}
              style={{
                background: 'none',
                border: 'none',
                color: '#0b0c0c',
                cursor: 'pointer',
                padding: '8px',
                display: 'none', // Overridden to display on mobile viewports via CSS in Part 4
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {/* UNIVERSAL SUPPORT LINK: Scaled down via CSS on mobile to guarantee strict single line fit */}
            <Link 
              href="/support" 
              className="govuk-button universal-header-support-btn"
              style={{
                color: '#0b0c0c',
                backgroundColor: '#f3f2f1',
                boxShadow: '0 2px 0 #0b0c0c',
                fontSize: '13px',
                fontWeight: 'bold',
                textDecoration: 'none',
                padding: '6px 12px',
                margin: '0',
                display: 'inline-flex',
                alignItems: 'center',
                border: '2px solid #0b0c0c',
                borderRadius: '0'
              }}
            >
              <span>Support</span>
            </Link>
          </div>
        </div>
      </div>
      {/* MOBILE-ONLY SEARCH EXTENSION DRAWER (Slides open cleanly below the white tier line) */}
      {mobileSearchOpen && (
        <div 
          id="mobile-dropdown-search-drawer"
          className="mobile-only-search-pane"
          style={{
            backgroundColor: '#f3f2f1',
            borderBottom: '4px solid #004B23',
            width: '100%',
            position: 'absolute',
            top: '53px', /* Sits flush under tight mobile branding line */
            left: 0,
            zIndex: 99,
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ padding: '12px 16px' }}>
            <form action="/search" method="get" role="search" style={{ display: 'flex', width: '100%' }}>
              <div style={{ display: 'flex', width: '100%' }}>
                <label className="govuk-visually-hidden" htmlFor="mobile-search-input-field">Search CitizenGuide.KE</label>
                
                {/* HIGH-CONTRAST INJECTION: Forces clear placeholder text visibility inside white input canvas */}
                <style dangerouslySetInnerHTML={{__html: `
                  #mobile-search-input-field { color: #000000 !important; }
                  #mobile-search-input-field::placeholder { color: #000000 !important; opacity: 1 !important; }
                `}} />

                <input 
                  className="govuk-input" 
                  id="mobile-search-input-field"
                  name="q" 
                  type="search" 
                  placeholder="Search guidelines, services, laws..."
                  style={{
                    border: '3px solid #0b0c0c',
                    borderRight: 'none',
                    height: '38px',
                    padding: '0 10px',
                    fontSize: '15px',
                    flex: 1,
                    backgroundColor: '#ffffff',
                    color: '#000000'
                  }}
                />
                <button type="submit" aria-label="Submit Search" style={{ backgroundColor: '#0b0c0c', border: 'none', color: '#ffffff', width: '42px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIER 2: Deep Emerald Clean Navigation Ribbon */}
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
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '16px',
            paddingRight: '16px',
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          {/* Navigation Category Nodes Block */}
          <nav 
            aria-label="Primary Site Sections" 
            style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
          >
            {/* Primary Node 1: Civil Services */}
            <Link href="/services/id" className="ribbon-nav-link" style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}>
              Civil Services
            </Link>
            
            {/* Primary Node 2: Passports */}
            <Link href="/services/passport" className="ribbon-nav-link" style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}>
              Passports
            </Link>

            {/* DESKTOP-ONLY EXTRA NAVIGATION NODES (Automatically hidden on mobile viewports to prevent screen overflow) */}
            <Link href="/services/tax" className="ribbon-nav-link desktop-ribbon-extra" style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 12px', display: 'inline-flex' }}>
              KRA &amp; Tax
            </Link>
            <Link href="/services/driving" className="ribbon-nav-link desktop-ribbon-extra" style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 12px', display: 'inline-flex' }}>
              NTSA Transport
            </Link>
          </nav>

          {/* Collapsible Mega-Menu Toggle Button Container */}
          <div>
            <button
              type="button"
              onClick={toggleMore}
              className={`ribbon-more-toggle-btn ${moreOpen ? 'more-active' : ''}`}
              aria-controls="expanded-more-mega-menu"
              aria-label={moreOpen ? "Hide additional sections menu" : "Show additional sections menu"}
              aria-expanded={moreOpen}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                padding: '8px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                borderRadius: '4px'
              }}
            >
              <span>More</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: moreOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>

        </div>
      </div>
      {/* TIER 3: Expanded Secondary Content Mega-Menu Drawer Panel */}
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
          <div className="govuk-width-container govuk-!-padding-top-5 govuk-!-padding-bottom-5" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
            <div 
              className="mega-menu-flex-grid"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "28px 20px"
              }}
            >
              
              {/* Dropdown Column 1: Core Citizen Services (Mobile Fallbacks) */}
              <div className="mega-menu-column mobile-only-menu-column" style={{ flex: "1 1 260px" }}>
                <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #004B23', paddingBottom: '4px', margin: 0, fontSize: "16px" }}>
                  Additional Services
                </h2>
                <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/services/tax" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none' }}>Money, KRA &amp; Tax</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>Income filings, business licensing, and duties</p>
                  </li>
                  <li>
                    <Link href="/services/driving" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none' }}>Driving &amp; Transport</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: "#505a5f" }}>NTSA logbooks, license testing, and vehicle links</p>
                  </li>
                </ul>
              </div>

              {/* Dropdown Column 2: Core Governance Architectures */}
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
              {/* Dropdown Section Column 3: Official Gazettes & Policy Archives */}
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
        /* Base typography and interactive link variables */
        .header-branding-title { font-size: 15px; }
        .sub-drawer-link { color: #004B23 !important; }
        .sub-drawer-link:hover { text-decoration: underline !important; color: #002210 !important; }
        
        /* Interactive element feedback animations */
        .more-active { background-color: rgba(255, 255, 255, 0.2) !important; }
        .icon-active { background-color: rgba(0, 0, 0, 0.06) !important; border-radius: 4px; }
        .ribbon-nav-link:hover { background-color: rgba(255, 255, 255, 0.1) !important; text-decoration: underline !important; border-radius: 4px; }
        .universal-header-support-btn:hover { background-color: #dbdad9 !important; }

        /* Absolute placement layouts for expansion blocks */
        .more-dropdown-drawer-panel { position: absolute; top: 100%; left: 0; }

        /* SMARTPHONE VIEWPORT FLEX RULES */
        @media (max-width: 40.05rem) {
          .desktop-search-inline-container { display: none !important; }
          .desktop-ribbon-extra { display: none !important; }
          
          /* Enforce active display configuration for the mobile search button */
          .mobile-search-toggle-btn { display: inline-flex !important; }
          
          /* Scale down padding tightly on mobile screens to stop horizontal wrapping */
          .universal-header-support-btn {
            padding: 4px 8px !important;
            font-size: 12px !important;
          }
        }

        /* EXTRA CRAMPED SCREEN PROFILE COMPRESSION (e.g. iPhone SE / 320px screens) */
        @media (max-width: 23rem) {
          .header-branding-title { font-size: 13px; }
        }

        /* ADVANCED DESKTOP FLEX VIEWPORT INTERFACES */
        @media (min-width: 40.0625rem) {
          .header-branding-title { font-size: 24px; }
          .mobile-only-menu-column { display: none !important; }
          .mobile-only-search-pane { display: none !important; }
          
          /* Expand padding allocations for clean desktop monitor presentations */
          .universal-header-support-btn {
            padding: 8px 14px !important;
            font-size: 14px !important;
          }
        }

        /* Prevent mega-menu cutoff scenarios across small monitors and tablet forms */
        @media (max-width: 48.0625rem) {
          .more-dropdown-drawer-panel { position: relative !important; top: 0 !important; }
        }
      `}} />
    </header>
  );
}
