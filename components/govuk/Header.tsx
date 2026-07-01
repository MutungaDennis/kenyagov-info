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
                  width={32} 
                  height={32} 
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
                  <svg width="20" height="20" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              )}

              <Link 
                href="/support" 
                className="govuk-button universal-header-support-btn"
                onClick={closeMenus}
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

        {/* TIER 2: Emerald Green Navigation Ribbon */}
        <div className="header-bottom-green-tier">
          <div className="govuk-width-container header-green-inner">
            <nav aria-label="Primary Site Sections" className="header-nav">
              <Link 
                href="/services" 
                className="ribbon-nav-link" 
                onClick={closeMenus}
              >
                Services
              </Link>

              <Link 
                href="/government" 
                className="ribbon-nav-link mobile-ribbon-extra" 
                onClick={closeMenus}
              >
                Government
              </Link>

              <Link 
                href="/elections" 
                className="ribbon-nav-link mobile-ribbon-extra" 
                onClick={closeMenus}
              >
                Elections
              </Link>

              <Link 
                href="/government/cabinet" 
                className="ribbon-nav-link desktop-ribbon-extra" 
                onClick={closeMenus}
              >
                Cabinet
              </Link>

              <Link 
                href="/government/counties" 
                className="ribbon-nav-link desktop-ribbon-extra" 
                onClick={closeMenus}
              >
                Counties
              </Link>

              <Link 
                href="/constitution" 
                className="ribbon-nav-link desktop-ribbon-extra" 
                onClick={closeMenus}
              >
                Constitution
              </Link>

              <Link 
                href="/government/institutions" 
                className="ribbon-nav-link desktop-ribbon-extra" 
                onClick={closeMenus}
              >
                Institutions
              </Link>

              <Link 
                href="/government/people" 
                className="ribbon-nav-link desktop-ribbon-extra" 
                onClick={closeMenus}
              >
                Officials
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
            >
              <div className="govuk-width-container govuk-!-padding-top-5 govuk-!-padding-bottom-5 govuk-!-padding-horizontal-3">
                <div className="mega-menu-flex-grid">
                  
                  {/* Column 1: Services */}
                  <div className="mega-menu-column">
                    <h2 className="govuk-heading-s govuk-!-margin-bottom-3 mega-menu-heading">
                      Services
                    </h2>
                    <ul className="govuk-list govuk-list--spaced">
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/services" className="govuk-link sub-drawer-link govuk-!-font-weight-bold" onClick={closeMenus}>
                          All services A–Z
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/services?category=business-self-employed" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          Businesses and self-employed
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/services?category=civil-registration" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          Births, deaths, marriages and care
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/services?category=driving-transport" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          Driving and transport
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/services?category=passports-travel" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          Passports, travel and living abroad
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/services?category=money-tax" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          Money and tax
                        </Link>
                      </li>
                      <li>
                        <Link href="/services?category=land-property" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          Land and property
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 2: Government */}
                  <div className="mega-menu-column">
                    <h2 className="govuk-heading-s govuk-!-margin-bottom-3 mega-menu-heading">
                      Government
                    </h2>
                    <ul className="govuk-list govuk-list--spaced">
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/government/presidency" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          The Presidency
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/government/cabinet" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          The Cabinet
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/government/legislature" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          Parliament
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/government/judiciary" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          The Judiciary
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/government/commissions" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          Constitutional commissions
                        </Link>
                      </li>
                      <li>
                        <Link href="/government/counties" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          County governments
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 3: Laws & Records */}
                  <div className="mega-menu-column">
                    <h2 className="govuk-heading-s govuk-!-margin-bottom-3 mega-menu-heading">
                      Laws &amp; Records
                    </h2>
                    <ul className="govuk-list govuk-list--spaced">
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/constitution" className="govuk-link sub-drawer-link govuk-!-font-weight-bold" onClick={closeMenus}>
                          Constitution of Kenya
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/acts/parliament" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          Acts of Parliament
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/documents" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          Official documents
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/government/people" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          Government officials
                        </Link>
                      </li>
                      <li>
                        <Link href="/government/institutions" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          Public institutions
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Column 4: Elections, Data & Society */}
                  <div className="mega-menu-column">
                    <h2 className="govuk-heading-s govuk-!-margin-bottom-3 mega-menu-heading">
                      Elections, Data &amp; Society
                    </h2>
                    <ul className="govuk-list govuk-list--spaced">
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/elections" className="govuk-link sub-drawer-link govuk-!-font-weight-bold" onClick={closeMenus}>
                          Elections
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/elections/political-parties" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          Political parties
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/open-data" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          Open data
                        </Link>
                      </li>
                      <li className="govuk-!-margin-bottom-2">
                        <Link href="/society-and-culture" className="govuk-link sub-drawer-link" onClick={closeMenus}>
                          Society &amp; culture
                        </Link>
                      </li>
                      <li>
                        <Link href="/guides" className="govuk-link sub-drawer-link" onClick={closeMenus}>
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

        {/* Global CSS - Updated with emerald green theme */}
        <style dangerouslySetInnerHTML={{__html: `
          /* Base styles */
          .site-two-tone-header {
            background-color: #ffffff;
            border-bottom: 6px solid #CE1126;
            padding: 0;
            margin: 0;
            position: relative;
            z-index: 100;
          }

          .header-top-white-tier {
            border-bottom: 1px solid #e5e5e5;
            position: relative;
          }

          .govuk-width-container.top {
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 16px;
            box-sizing: border-box;
          }

          .header-logo-container {
            display: inline-flex;
            align-items: center;
          }

          .header-logo-link {
            display: inline-flex;
            align-items: center;
            text-decoration: none;
          }

          .header-logo-image {
            margin-right: 10px;
            display: inline-block;
            vertical-align: middle;
            border-radius: 4px;
            border: 1px solid #bfc1c3;
          }

          .header-branding-title {
            font-weight: 800;
            color: #0b0c0c;
            letter-spacing: -0.4px;
            line-height: 1;
            font-size: 18px;
          }

          .top-tier-action-group {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          /* Support Button - Now uses green with white text for better visibility */
          .universal-header-support-btn {
            color: #ffffff !important;
            background-color: #047857 !important;
            box-shadow: 0 2px 0 #065f46 !important;
            font-size: 14px;
            font-weight: bold;
            text-decoration: none;
            padding: 8px 16px;
            margin: 0;
            display: inline-flex;
            align-items: center;
            border: none;
            border-radius: 4px;
          }

          .universal-header-support-btn:hover {
            background-color: #065f46 !important;
          }

          .desktop-search-icon-btn {
            background: none;
            border: none;
            color: #0b0c0c;
            cursor: pointer;
            padding: 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
          }

          .desktop-search-icon-btn:hover {
            background-color: rgba(0, 0, 0, 0.06);
          }

          .mobile-search-toggle-btn-base {
            background: none;
            border: none;
            color: #0b0c0c;
            cursor: pointer;
            padding: 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .icon-active {
            background-color: rgba(0, 0, 0, 0.06) !important;
            border-radius: 4px;
          }

          /* Emerald Green navigation tier - matches search bar color */
          .header-bottom-green-tier {
            background-color: #047857;
            padding-top: 8px;
            padding-bottom: 8px;
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

          .header-nav {
            display: flex;
            align-items: center;
            gap: 2px;
          }

          .ribbon-nav-link {
            color: #ffffff;
            font-size: 15px;
            font-weight: bold;
            text-decoration: none;
            padding: 10px 12px;
            display: inline-flex;
            border-radius: 4px;
          }

          .ribbon-nav-link:hover {
            background-color: rgba(255, 255, 255, 0.2) !important;
            text-decoration: underline !important;
          }

          .ribbon-more-toggle-btn {
            background-color: transparent;
            border: none;
            color: #ffffff;
            font-size: 15px;
            font-weight: bold;
            cursor: pointer;
            padding: 10px 14px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border-radius: 4px;
          }

          .ribbon-more-toggle-btn svg {
            transition: transform 0.2s ease;
          }

          .ribbon-more-toggle-btn svg.rotated {
            transform: rotate(180deg);
          }

          .more-active {
            background-color: rgba(255, 255, 255, 0.25) !important;
          }

          /* Mobile search pane */
          .mobile-only-search-pane {
            background-color: #f3f2f1;
            border-bottom: 4px solid #047857;
            width: 100%;
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 99;
            box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          }

          /* Mega menu */
          .more-dropdown-drawer-panel {
            background-color: #f3f2f1;
            border-bottom: 4px solid #047857;
            width: 100%;
            position: absolute;
            top: 100%;
            left: 0;
            z-index: 98;
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
            clear: both;
          }

          .mega-menu-flex-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 28px 20px;
            align-items: flex-start;
          }

          .mega-menu-column {
            flex: 1 1 240px;
            box-sizing: border-box;
          }

          .mega-menu-heading {
            color: #0b0c0c;
            border-bottom: 3px solid #047857;
            padding-bottom: 4px;
            margin: 0;
            font-size: 16px;
          }

          .sub-drawer-link {
            color: #047857 !important;
            font-weight: bold;
            font-size: 16px;
            text-decoration: none;
          }

          .sub-drawer-link:hover {
            text-decoration: underline !important;
            color: #065f46 !important;
          }

          /* Desktop search panel */
          .header-search-expanded {
            background-color: #f3f2f1;
            border-bottom: 4px solid #047857;
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

          /* Mobile styles */
          @media (max-width: 40.05rem) {
            .header-branding-title {
              font-size: 19px;
            }

            .govuk-width-container.top {
              padding: 10px 14px !important;
            }

            .universal-header-support-btn {
              padding: 9px 14px !important;
              font-size: 14px !important;
            }

            .desktop-search-icon-btn {
              display: none !important;
            }

            .desktop-ribbon-extra {
              display: none !important;
            }

            .mobile-search-toggle-btn {
              display: inline-flex !important;
            }

            .header-logo-image {
              width: 34px;
              height: 34px;
            }
          }

          @media (max-width: 23rem) {
            .header-branding-title {
              font-size: 17px;
            }
          }

          /* Tablet and desktop styles */
          @media (min-width: 40.0625rem) {
            .header-branding-title {
              font-size: 24px;
            }

            .mobile-only-search-pane {
              display: none !important;
            }

            .mobile-search-toggle-btn {
              display: none !important;
            }

            .mobile-ribbon-extra {
              display: none !important;
            }

            .universal-header-support-btn {
              padding: 10px 18px !important;
              font-size: 15px !important;
            }

            .header-bottom-green-tier .govuk-width-container {
              flex-direction: row !important;
              align-items: center;
              justify-content: space-between;
            }
          }

          @media (max-width: 48.0625rem) {
            .more-dropdown-drawer-panel {
              position: relative !important;
              top: 0 !important;
            }
          }

          .govuk-!-padding-horizontal-3 {
            padding-left: 16px !important;
            padding-right: 16px !important;
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