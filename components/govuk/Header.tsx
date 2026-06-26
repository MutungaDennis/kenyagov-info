'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SearchAutocomplete from "./SearchAutocomplete";

export default function GovUKHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);

  const toggleMore = () => {
    setMoreOpen(!moreOpen);
    if (mobileSearchOpen) setMobileSearchOpen(false);
    if (desktopSearchOpen) setDesktopSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (moreOpen) setMoreOpen(false);
    if (desktopSearchOpen) setDesktopSearchOpen(false);
  };

  const toggleDesktopSearch = () => {
    const next = !desktopSearchOpen;
    setDesktopSearchOpen(next);
    if (next) {
      setMoreOpen(false);
      setMobileSearchOpen(false);
    }
  };

  const closeDesktopSearch = () => setDesktopSearchOpen(false);

  // Close desktop search panel on Escape (GOV.UK-like keyboard UX)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && desktopSearchOpen) {
        setDesktopSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [desktopSearchOpen]);

  return (
    <>
    <header 
      className="govuk-header site-two-tone-header"
      role="banner" 
      data-module="govuk-header"
    >
      {/* TIER 1: White top tier containing logo left + search + support right (original location) */}
      <div className="header-top-white-tier">
        <div className="govuk-width-container top">
          {/* Left: Logo + Brand (dark text on white) - kept on single line to keep header compact */}
          <div className="header-logo-container">
            <Link href="/" className="header-logo-link">
              <Image 
                src="/logo.jpg" 
                alt="CitizenGuide.KE" 
                width={30} 
                height={30} 
                priority
                className="header-logo-image"
              />
              <span className="header-branding-title">
                CitizenGuide.KE
              </span>
            </Link>
          </div>

          {/* Right Side: Support + conditional search (no search on homepage to avoid redundancy with prominent homepage search) */}
          <div className="top-tier-action-group">
            {/* DESKTOP: On non-home pages, show GOV.UK-style search icon. Clicking opens prominent bar BELOW the header. */}
            {!isHome && (
              <button
                type="button"
                onClick={toggleDesktopSearch}
                className={`desktop-search-icon-btn ${desktopSearchOpen ? 'icon-active' : ''}`}
                aria-label={desktopSearchOpen ? "Close search" : "Open search"}
                aria-expanded={desktopSearchOpen}
                aria-controls="desktop-header-search-panel"
              >
                <svg width="18" height="18" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                  <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="3" />
                  <line x1="18" y1="18" x2="24.5" y2="24.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </button>
            )}

            {/* MOBILE: Quick search icon toggle (hidden entirely on homepage) */}
            {!isHome && (
              <button
                type="button"
                onClick={toggleMobileSearch}
                className={`mobile-search-toggle-btn mobile-search-toggle-btn-base ${mobileSearchOpen ? 'icon-active' : ''}`}
                aria-controls="mobile-dropdown-search-drawer"
                aria-label={mobileSearchOpen ? "Close search tool" : "Open search tool"}
                aria-expanded={mobileSearchOpen}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            )}

            {/* UNIVERSAL SUPPORT ACTION LINK BUTTON */}
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
        {/* MOBILE-ONLY DROPDOWN SEARCH DRAWER (Slides open under the white tier baseline) — not on homepage */}
        {!isHome && mobileSearchOpen && (
          <div 
            id="mobile-dropdown-search-drawer"
            className="mobile-only-search-pane"
          >
            <div className="govuk-!-padding-2">
              <SearchAutocomplete 
                placeholder="Search public services & laws..." 
                compact={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* TIER 2: Deep Emerald Clean Navigation Ribbon */}
      <div className="header-bottom-green-tier">
        <div className="govuk-width-container header-green-inner">
          {/* Navigation Category Ribbon: Comprehensive like GOV.UK, prioritised key citizen pages from site structure */}
          <nav 
            aria-label="Primary Site Sections" 
            className="header-nav"
          >
            {/* High priority quick links (always visible) */}
            <Link href="/services" className="ribbon-nav-link" style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}>
              Services
            </Link>
            
            <Link href="/services/passport" className="ribbon-nav-link" style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}>
              Passports
            </Link>

            <Link href="/services/tax" className="ribbon-nav-link" style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}>
              Tax
            </Link>

            <Link href="/services/driving" className="ribbon-nav-link" style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}>
              Driving
            </Link>

            {/* Desktop-only ribbon items: prioritise core important pages (National, County, key documents) */}
            <Link href="/executive" className="ribbon-nav-link desktop-ribbon-extra" style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}>
              Executive
            </Link>
            <Link href="/counties" className="ribbon-nav-link desktop-ribbon-extra" style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}>
              Counties
            </Link>
            <Link href="/constitution" className="ribbon-nav-link desktop-ribbon-extra" style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}>
              Constitution
            </Link>
            <Link href="/open-data" className="ribbon-nav-link desktop-ribbon-extra" style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}>
              Open data
            </Link>
          </nav>

          {/* Collapsible Mega Menu Trigger Block */}
          <div>
            <button
              type="button"
              onClick={toggleMore}
              className={`ribbon-more-toggle-btn ${moreOpen ? 'more-active' : ''}`}
              aria-controls="expanded-more-mega-menu"
              aria-label={moreOpen ? "Hide additional sections menu" : "Show additional sections menu"}
              aria-expanded={moreOpen}
            >
              <span>More</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={moreOpen ? 'rotated' : ''}><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
          </div>

        </div>
        {/* TIER 3: Expanded Secondary Content Mega-Menu Drawer Panel - nested inside green tier for correct top:100% */}
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
          <div className="govuk-width-container govuk-!-padding-top-5 govuk-!-padding-bottom-5 govuk-!-padding-horizontal-3">
            <div className="mega-menu-flex-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '28px 20px', alignItems: 'flex-start' }}>
              
              {/* Column 1: Services (prioritised citizen transactions) */}
              <div className="mega-menu-column" style={{ flex: '1 1 240px', boxSizing: 'border-box' }}>
                <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #004B23', paddingBottom: '4px', margin: 0, fontSize: '16px' }}>
                  Services
                </h2>
                <ul className="govuk-list govuk-list--spaced" >
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/services" className="govuk-link sub-drawer-link govuk-!-font-weight-bold" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>All services A–Z</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: '#505a5f' }}>Business, civil registration, passports, tax, driving</p>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/services/tax" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>KRA &amp; Tax</Link>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/services/driving" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>Driving &amp; Transport</Link>
                  </li>
                  <li>
                    <Link href="/services/passport" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>Passports &amp; Immigration</Link>
                  </li>
                </ul>
              </div>

              {/* Column 2: Government structure (National + County) — prioritised */}
              <div className="mega-menu-column" style={{ flex: '1 1 240px', boxSizing: 'border-box' }}>
                <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #004B23', paddingBottom: '4px', margin: 0, fontSize: '16px' }}>
                  Government
                </h2>
                <ul className="govuk-list govuk-list--spaced" >
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/executive" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>The Executive</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: '#505a5f' }}>Presidency, ministries and cabinet</p>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/legislature" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>The Legislature</Link>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/judiciary" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>The Judiciary</Link>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/independent-bodies" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>Independent bodies</Link>
                  </li>
                  <li>
                    <Link href="/counties" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>Counties &amp; devolution</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: '#505a5f' }}>47 counties, governors, wards</p>
                  </li>
                </ul>
              </div>

              {/* Column 3: Laws & official records (core reference material) */}
              <div className="mega-menu-column" style={{ flex: '1 1 240px', boxSizing: 'border-box' }}>
                <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #004B23', paddingBottom: '4px', margin: 0, fontSize: '16px' }}>
                  Laws &amp; Records
                </h2>
                <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/constitution" className="govuk-link sub-drawer-link govuk-!-font-weight-bold" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>Constitution of Kenya</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: '#505a5f' }}>Full text with explanations</p>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/acts/parliament" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>Acts of Parliament</Link>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/documents" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>Official documents</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: '#505a5f' }}>Vision 2030, sessional papers</p>
                  </li>
                  <li>
                    <Link href="/leaders" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>Current leaders</Link>
                  </li>
                </ul>
              </div>

              {/* Column 4: Politics, institutions, data & society (comprehensive coverage) */}
              <div className="mega-menu-column" style={{ flex: '1 1 240px', boxSizing: 'border-box' }}>
                <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #004B23', paddingBottom: '4px', margin: 0, fontSize: '16px' }}>
                  Politics, Data &amp; Society
                </h2>
                <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/politics" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>Politics &amp; elections</Link>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/institutions" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>Public institutions</Link>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/open-data" className="govuk-link sub-drawer-link govuk-!-font-weight-bold" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>Open data</Link>
                    <p className="govuk-body-s govuk-!-margin-top-0 govuk-!-margin-bottom-0" style={{ color: '#505a5f' }}>Datasets and registers</p>
                  </li>
                  <li className="govuk-!-margin-bottom-2">
                    <Link href="/society-and-culture" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>Society &amp; culture</Link>
                  </li>
                  <li>
                    <Link href="/guides" className="govuk-link sub-drawer-link" style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#004B23' }}>Citizen guides</Link>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}
      </div>

      {/* Global CSS Responsive Core Layout Overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Base typography and interactive link variables */
        .header-branding-title { font-size: 15px; }
        .sub-drawer-link { color: #004B23 !important; }
        .sub-drawer-link:hover { text-decoration: underline !important; color: #002210 !important; }
        .mega-menu-column h2.govuk-heading-s { color: #0b0c0c; border-bottom: 3px solid #004B23; padding-bottom: 4px; margin: 0; font-size: 16px; }
        .mega-menu-column p.govuk-body-s { color: #505a5f; }
        .mega-menu-column ul.govuk-list { margin: 0; padding: 0; }
        
        /* Interactive element feedback states */
        .more-active { background-color: rgba(255, 255, 255, 0.2) !important; }
        .icon-active { background-color: rgba(0, 0, 0, 0.06) !important; border-radius: 4px; }
        .ribbon-nav-link:hover { background-color: rgba(255, 255, 255, 0.1) !important; text-decoration: underline !important; border-radius: 4px; }
        .ribbon-nav-link { color: #ffffff; font-size: 15px; font-weight: bold; text-decoration: none; padding: 8px 10px; display: inline-flex; }
        .top-tier-action-group { display: flex; align-items: center; gap: 8px; }
        .header-top-white-tier { border-bottom: 1px solid #e5e5e5; position: relative; }
        .govuk-width-container.top { margin: 0 auto; display: flex; justify-content: space-between; align-items: center; padding: 6px 16px; box-sizing: border-box; }
        .header-branding-title { font-weight: 800; color: #0b0c0c; letter-spacing: -0.4px; line-height: 1; }
        .header-logo-container { display: inline-flex; align-items: center; }
        .header-logo-link { display: inline-flex; align-items: center; text-decoration: none; }
        .universal-header-support-btn {
          color: #0b0c0c;
          background-color: #f3f2f1;
          box-shadow: 0 2px 0 #0b0c0c;
          font-size: 13px;
          font-weight: bold;
          text-decoration: none;
          padding: 6px 12px;
          margin: 0;
          display: inline-flex;
          align-items: center;
          border: 2px solid #0b0c0c;
          border-radius: 0;
        }
        .universal-header-support-btn:hover { background-color: #dbdad9 !important; }

        /* Absolute placement layouts for expansion blocks */
        .more-dropdown-drawer-panel { position: absolute; top: 100%; left: 0; }
        .mobile-only-search-pane {
          background-color: #f3f2f1;
          border-bottom: 4px solid #004B23;
          width: 100%;
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 99;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        /* SMARTPHONE VIEWPORT FLEX RULES */
        @media (max-width: 40.05rem) {
          .desktop-search-inline-container { display: none !important; }
          .desktop-search-icon-btn { display: none !important; }
          .desktop-ribbon-extra { display: none !important; }
          
          /* Enforce active display configuration for the mobile search toggle icon */
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
          .mobile-search-toggle-btn { display: none !important; }
          
          /* Expand padding allocations for clean desktop monitor presentations */
          .universal-header-support-btn {
            padding: 8px 14px !important;
            font-size: 14px !important;
          }

          /* Re-orient green ribbon parameters into a single horizontal block */
          .header-bottom-green-tier .govuk-width-container { flex-direction: row !important; align-items: center; justify-content: space-between; }
        }

        /* Prevent mega-menu cutoff scenarios across small monitors and tablet forms */
        @media (max-width: 48.0625rem) {
          .more-dropdown-drawer-panel { position: relative !important; top: 0 !important; }
        }
        .header-logo-image {
          margin-right: 8px;
          display: inline-block;
          vertical-align: middle;
          border-radius: 4px;
          border: 1px solid #bfc1c3;
        }
        .site-two-tone-header {
          background-color: #ffffff;
          border-bottom: 6px solid #CE1126;
          padding: 0;
          margin: 0;
          position: relative;
          z-index: 100;
        }
        .mega-menu-flex-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 28px 20px;
        }
        .header-bottom-green-tier {
          background-color: #004B23;
          padding-top: 6px;
          padding-bottom: 6px;
          position: relative;
        }
        .header-green-inner {
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-left: 16px;
          padding-right: 16px;
          box-sizing: border-box;
          position: relative;
        }
        .govuk-!-padding-horizontal-3 {
          padding-left: 16px !important;
          padding-right: 16px !important;
        }
        .header-nav {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .ribbon-more-toggle-btn {
          background-color: transparent;
          border: none;
          color: #ffffff;
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
          padding: 8px 12px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border-radius: 4px;
        }
        .ribbon-more-toggle-btn svg {
          transition: transform 0.2s ease;
        }
        .ribbon-more-toggle-btn svg.rotated {
          transform: rotate(180deg);
        }
        .mobile-search-toggle-btn-base {
          background: none;
          border: none;
          color: #0b0c0c;
          cursor: pointer;
          padding: 8px;
          align-items: center;
          justify-content: center;
        }

        /* DESKTOP SEARCH ICON (GOV.UK style) shown on non-home pages instead of inline bar */
        .desktop-search-icon-btn {
          background: none;
          border: none;
          color: #0b0c0c;
          cursor: pointer;
          padding: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .desktop-search-icon-btn:hover {
          background-color: rgba(0, 0, 0, 0.06);
        }

        /* PROMINENT SEARCH PANEL BELOW THE FULL HEADER (desktop) */
        .header-search-expanded {
          background-color: #f3f2f1;
          border-bottom: 4px solid #004B23;
          padding: 12px 0;
          position: relative;
          z-index: 95;
        }
        .search-expanded-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .search-expanded-content .autocomplete-wrapper {
          flex: 1;
        }
        .search-expanded-close {
          background: none;
          border: 2px solid #0b0c0c;
          color: #0b0c0c;
          font-size: 16px;
          line-height: 1;
          padding: 6px 10px;
          cursor: pointer;
          font-weight: bold;
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: 4px;
        }
        .search-expanded-close:hover {
          background-color: #e5e5e5;
        }

        /* On desktop hide the old inline container (we now use icon + below bar) */
        @media (min-width: 40.0625rem) {
          .desktop-search-inline-container { display: none !important; }
        }
      `}} />
    </header>

    {/* PROMINENT SEARCH BAR OPENED BELOW THE HEADER (desktop, non-home pages) */}
    {/* Triggered by the search icon in the header. Matches GOV.UK "click icon → reveal search" pattern. */}
    {!isHome && desktopSearchOpen && (
      <div
        id="desktop-header-search-panel"
        className="header-search-expanded"
        role="search"
      >
        <div className="govuk-width-container">
          <div className="search-expanded-content">
            <SearchAutocomplete
              placeholder="Search government institutions, services, documents, leaders..."
              compact={false}
              autoFocus={true}
            />
            <button
              type="button"
              onClick={closeDesktopSearch}
              className="search-expanded-close"
              aria-label="Close search"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
