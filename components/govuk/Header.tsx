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

  const closeMenus = () => {
    setMoreOpen(false);
    setMobileSearchOpen(false);
    setDesktopSearchOpen(false);
  };

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
        {/* TIER 1: White top tier */}
        <div className="header-top-white-tier">
          <div className="govuk-width-container top">
            <div className="header-logo-container">
              <Link href="/" className="header-logo-link" onClick={closeMenus}>
                <Image 
                  src="/logo.webp" 
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

            <div className="top-tier-action-group">
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

              <Link 
                href="/support" 
                className="govuk-button universal-header-support-btn"
                onClick={closeMenus}
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

          {!isHome && mobileSearchOpen && (
            <div id="mobile-dropdown-search-drawer" className="mobile-only-search-pane">
              <div className="govuk-!-padding-2">
                <SearchAutocomplete 
                  placeholder="Search public services & laws..." 
                  compact={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* TIER 2: Deep Kenyan Green Navigation Ribbon */}
        <div className="header-bottom-green-tier">
          <div className="govuk-width-container header-green-inner">
            <nav aria-label="Primary Site Sections" className="header-nav">
              <Link 
                href="/services" 
                className="ribbon-nav-link" 
                onClick={closeMenus}
                style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}
              >
                Services
              </Link>

              <Link 
                href="/government/cabinet" 
                className="ribbon-nav-link desktop-ribbon-extra" 
                onClick={closeMenus}
                style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}
              >
                Cabinet
              </Link>

              <Link 
                href="/counties" 
                className="ribbon-nav-link desktop-ribbon-extra" 
                onClick={closeMenus}
                style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}
              >
                Counties
              </Link>

              <Link 
                href="/constitution" 
                className="ribbon-nav-link desktop-ribbon-extra" 
                onClick={closeMenus}
                style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}
              >
                Constitution
              </Link>

              <Link 
                href="/open-data" 
                className="ribbon-nav-link desktop-ribbon-extra" 
                onClick={closeMenus}
                style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}
              >
                Open data
              </Link>

              <Link 
                href="/politics" 
                className="ribbon-nav-link desktop-ribbon-extra" 
                onClick={closeMenus}
                style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}
              >
                Politics
              </Link>

              <Link 
                href="/leaders" 
                className="ribbon-nav-link desktop-ribbon-extra" 
                onClick={closeMenus}
                style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', padding: '8px 10px', display: 'inline-flex' }}
              >
                Leaders
              </Link>
            </nav>

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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={moreOpen ? 'rotated' : ''}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          </div>

          {/* TIER 3: Mega Menu */}
          {moreOpen && (
            <div 
              id="expanded-more-mega-menu"
              className="more-dropdown-drawer-panel"
              style={{ 
                backgroundColor: '#f3f2f1', 
                borderBottom: '4px solid #003D1F', 
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
                  
                  {/* Column 1: Services */}
                  <div className="mega-menu-column" style={{ flex: '1 1 240px', boxSizing: 'border-box' }}>
                    <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #003D1F', paddingBottom: '4px', margin: 0, fontSize: '16px' }}>
                      Services
                    </h2>
                    <ul className="govuk-list govuk-list--spaced">
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/services" className="govuk-link sub-drawer-link govuk-!-font-weight-bold" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          All services A–Z
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/services?category=business-self-employed" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Businesses and self-employed
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/services?category=civil-registration" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Births, deaths, marriages and care
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/services?category=driving-transport" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Driving and transport
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/services?category=passports-travel" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Passports, travel and living abroad
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/services?category=money-tax" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Money and tax
                        </Link>
                      </li>
                      <li>
                        <Link href="/services?category=land-property" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Land and property
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 2: Government */}
                  <div className="mega-menu-column" style={{ flex: '1 1 240px', boxSizing: 'border-box' }}>
                    <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #003D1F', paddingBottom: '4px', margin: 0, fontSize: '16px' }}>
                      Government
                    </h2>
                    <ul className="govuk-list govuk-list--spaced">
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/government/cabinet" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          The Cabinet
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/legislature" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          The Legislature
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/judiciary" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          The Judiciary
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/independent-bodies" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Independent bodies
                        </Link>
                      </li>
                      <li>
                        <Link href="/counties" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Counties &amp; devolution
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 3: Laws & Records */}
                  <div className="mega-menu-column" style={{ flex: '1 1 240px', boxSizing: 'border-box' }}>
                    <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #003D1F', paddingBottom: '4px', margin: 0, fontSize: '16px' }}>
                      Laws &amp; Records
                    </h2>
                    <ul className="govuk-list govuk-list--spaced">
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/constitution" className="govuk-link sub-drawer-link govuk-!-font-weight-bold" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Constitution of Kenya
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/acts/parliament" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Acts of Parliament
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/documents" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Official documents
                        </Link>
                      </li>
                      <li>
                        <Link href="/leaders" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Current leaders
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 4: Politics, Data & Society */}
                  <div className="mega-menu-column" style={{ flex: '1 1 240px', boxSizing: 'border-box' }}>
                    <h2 className="govuk-heading-s govuk-!-margin-bottom-3" style={{ color: '#0b0c0c', borderBottom: '3px solid #003D1F', paddingBottom: '4px', margin: 0, fontSize: '16px' }}>
                      Politics, Data &amp; Society
                    </h2>
                    <ul className="govuk-list govuk-list--spaced">
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/politics" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Politics &amp; elections
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/institutions" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Public institutions
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/open-data" className="govuk-link sub-drawer-link govuk-!-font-weight-bold" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Open data
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/society-and-culture" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Society &amp; culture
                        </Link>
                      </li>
                      <li>
                        <Link href="/guides" className="govuk-link sub-drawer-link" onClick={closeMenus} style={{ fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', color: '#003D1F' }}>
                          Citizen guides
                        </Link>
                      </li>
                    </ul>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global CSS with updated Kenyan green theme */}
        <style dangerouslySetInnerHTML={{__html: `
          .header-branding-title { font-size: 15px; }
          .sub-drawer-link { color: #003D1F !important; }
          .sub-drawer-link:hover { text-decoration: underline !important; color: #002A15 !important; }
          .mega-menu-column h2.govuk-heading-s { color: #0b0c0c; border-bottom: 3px solid #003D1F; padding-bottom: 4px; margin: 0; font-size: 16px; }
          .mega-menu-column p.govuk-body-s { color: #505a5f; }
          .mega-menu-column ul.govuk-list { margin: 0; padding: 0; }

          .more-active { background-color: rgba(255, 255, 255, 0.2) !important; }
          .icon-active { background-color: rgba(0, 0, 0, 0.06) !important; border-radius: 4px; }
          .ribbon-nav-link:hover { background-color: rgba(255, 255, 255, 0.15) !important; text-decoration: underline !important; border-radius: 4px; }
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

          .more-dropdown-drawer-panel { position: absolute; top: 100%; left: 0; }
          .mobile-only-search-pane {
            background-color: #f3f2f1;
            border-bottom: 4px solid #003D1F;
            width: 100%;
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 99;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          }

          @media (max-width: 40.05rem) {
            .desktop-search-inline-container { display: none !important; }
            .desktop-search-icon-btn { display: none !important; }
            .desktop-ribbon-extra { display: none !important; }
            .mobile-search-toggle-btn { display: inline-flex !important; }
            .header-branding-title { font-size: 15px; }
            .universal-header-support-btn {
              padding: 7px 11px !important;
              font-size: 13px !important;
            }
            .govuk-width-container.top {
              padding: 8px 12px !important;
            }
          }

          @media (max-width: 23rem) {
            .header-branding-title { font-size: 14px; }
          }

          @media (min-width: 40.0625rem) {
            .header-branding-title { font-size: 24px; }
            .mobile-only-menu-column { display: none !important; }
            .mobile-only-search-pane { display: none !important; }
            .mobile-search-toggle-btn { display: none !important; }
            .universal-header-support-btn {
              padding: 8px 14px !important;
              font-size: 14px !important;
            }
            .header-bottom-green-tier .govuk-width-container { flex-direction: row !important; align-items: center; justify-content: space-between; }
          }

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
            background-color: #003D1F;
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
          .header-search-expanded {
            background-color: #f3f2f1;
            border-bottom: 4px solid #003D1F;
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
          @media (min-width: 40.0625rem) {
            .desktop-search-inline-container { display: none !important; }
          }
        `}} />
      </header>

      {/* Desktop search panel below header */}
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