// app/society-and-culture/heritage-sites/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { sanityClient } from '@/lib/sanity/client'
import { HERITAGE_SITES_QUERY } from '@/lib/sanity/queries'
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs'
import LastUpdated from '@/components/govuk/LastUpdated'
import {
  HeritageSite,
  getCategoryLabel,
  getRegionLabel,
  isUnescoSite,
  filterSites,
  CATEGORY_LABELS,
  REGION_LABELS,
} from '@/lib/data/heritageSites.utils'

export default function HeritageSitesPage() {
  const [sites, setSites] = useState<HeritageSite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRegion, setSelectedRegion] = useState<string>('all')

  // Fetch heritage sites from Sanity
  useEffect(() => {
    async function fetchSites() {
      try {
        const data = await sanityClient.fetch(HERITAGE_SITES_QUERY)
        setSites(data || [])
      } catch (error) {
        console.error('Failed to fetch heritage sites:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSites()
  }, [])

  // Filter sites based on selections
  const filteredSites = useMemo(() => {
    return filterSites(sites, selectedCategory, selectedRegion)
  }, [sites, selectedCategory, selectedRegion])

  // Count by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: sites.length }
    sites.forEach((site: HeritageSite) => {  // <-- ADDED explicit type
      counts[site.category] = (counts[site.category] || 0) + 1
    })
    return counts
  }, [sites])

  const handleResetFilters = () => {
    setSelectedCategory('all')
    setSelectedRegion('all')
  }

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and culture", href: "/society-and-culture" },
          { text: "Heritage sites", href: "/society-and-culture/heritage-sites" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl">Heritage sites in Kenya</h1>
            
            <p className="govuk-body-l">
              Explore Kenya's protected archaeological sites, historical monuments, and UNESCO World Heritage Sites designated under the National Museums and Heritage Act.
            </p>

            {isLoading ? (
              <p className="govuk-body">Loading heritage sites...</p>
            ) : sites.length === 0 ? (
              <div className="govuk-inset-text">
                <p className="govuk-body">
                  No heritage sites are currently listed. Check back soon for updates.
                </p>
              </div>
            ) : (
              <>
                {/* FILTERS */}
                <div className="app-heritage-filters govuk-!-margin-bottom-6">
                  <div className="govuk-form-group">
                    <label className="govuk-label govuk-label--s" htmlFor="category-filter">
                      Filter by category
                    </label>
                    <select
                      className="govuk-select"
                      id="category-filter"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="all">All sites ({categoryCounts.all})</option>
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label} ({categoryCounts[value] || 0})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="govuk-form-group">
                    <label className="govuk-label govuk-label--s" htmlFor="region-filter">
                      Filter by region
                    </label>
                    <select
                      className="govuk-select"
                      id="region-filter"
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                    >
                      <option value="all">All regions</option>
                      {Object.entries(REGION_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {(selectedCategory !== 'all' || selectedRegion !== 'all') && (
                    <button
                      onClick={handleResetFilters}
                      className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                    >
                      Reset filters
                    </button>
                  )}
                </div>

                {/* RESULTS COUNT */}
                <p className="govuk-body govuk-!-margin-bottom-4">
                  <strong>Showing {filteredSites.length} of {sites.length} sites</strong>
                </p>

                {/* SITES LIST */}
                {filteredSites.length > 0 ? (
                  <ul className="govuk-list app-heritage-list">
                    {filteredSites.map(site => (
                      <li key={site._id} className="app-heritage-item">
                        <Link
                          href={`/society-and-culture/heritage-sites/${site.slug}`}
                          className="govuk-link govuk-link--no-visited-state"
                        >
                          <h2 className="govuk-heading-m govuk-!-margin-bottom-1">
                            {site.name}
                          </h2>
                        </Link>
                        <p className="govuk-body-s govuk-!-margin-bottom-1">
                          <strong>{getCategoryLabel(site.category)}</strong>
                          {' • '}
                          {getRegionLabel(site.region)}
                          {' • '}
                          {site.county}
                        </p>
                        <p className="govuk-body-s govuk-!-margin-bottom-0">
                          {site.shortDescription}
                        </p>
                        {isUnescoSite(site.category) && (
                          <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0 app-unesco-badge">
                            <strong>UNESCO World Heritage Site</strong>
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="govuk-inset-text">
                    <p className="govuk-body">
                      No heritage sites match the selected filters.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="govuk-link"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', textDecoration: 'underline' }}
                    >
                      Reset all filters
                    </button>
                  </div>
                )}

                <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

                <LastUpdated published="2026-05-22" lastUpdated="2026-07-02" />
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m">Related pages</h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/society-and-culture/cultural-calendar" className="govuk-link">
                      Cultural calendar
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/national-events" className="govuk-link">
                      National events
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/communities" className="govuk-link">
                      Communities
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/national-symbols" className="govuk-link">
                      National symbols
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture" className="govuk-link">
                      All society and culture
                    </Link>
                  </li>
                </ul>
              </nav>

              <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

              <div className="govuk-inset-text">
                <p className="govuk-body govuk-!-margin-bottom-0">
                  The National Museums of Kenya manages and protects heritage sites across the country.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <style>{`
        .app-heritage-filters {
          display: flex;
          gap: 20px;
          align-items: flex-end;
          flex-wrap: wrap;
          padding: 20px;
          background-color: #f3f2f1;
          border-left: 4px solid #1d70b8;
        }

        .app-heritage-filters .govuk-form-group {
          margin-bottom: 0;
          flex: 1;
          min-width: 200px;
        }

        .app-heritage-list {
          margin: 0;
          padding: 0;
        }

        .app-heritage-item {
          padding: 20px 0;
          border-bottom: 1px solid #b1b4b6;
        }

        .app-heritage-item:last-child {
          border-bottom: none;
        }

        .app-heritage-item h2 {
          color: #1d70b8;
        }

        .app-heritage-item h2:hover {
          text-decoration-thickness: 3px;
        }

        .app-unesco-badge {
          color: #00703c;
          font-size: 14px;
        }

        @media (max-width: 40.0625rem) {
          .app-heritage-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .app-heritage-filters .govuk-form-group {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  )
}