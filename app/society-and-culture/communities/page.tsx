'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";

interface CensusYear {
  id: number;
  census_year: number;
  is_active: boolean;
}

interface CensusRecord {
  id: number;
  category_code: string;
  name: string;
  population_count: number;
  parent_id: number | null;
  classification_type: 'MACRO' | 'CITIZEN_MAIN' | 'CITIZEN_SUB';
}

export default function CommunitiesPage() {
  const [years, setYears] = useState<CensusYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [records, setRecords] = useState<CensusRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'totals' | 'tribes' | 'foreign'>('totals');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTimelineYears() {
      try {
        const supabase = createClient();
        const { data, error: yearError } = await supabase
          .from("census_years")
          .select("id, census_year, is_active")
          .order("census_year", { ascending: false });

        if (yearError) throw yearError;
        setYears(data || []);
        
        const activeYear = data?.find(y => y.is_active) || data?.[0];
        if (activeYear) setSelectedYearId(activeYear.id);
      } catch (err: any) {
        setError(err.message || "Failed to load census years.");
      }
    }
    fetchTimelineYears();
  }, []);

  useEffect(() => {
    if (selectedYearId === null) return;
    
    async function fetchCensusMetrics() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error: recError } = await supabase
          .from("knbs_ethnicity_census")
          .select("id, category_code, name, population_count, parent_id, classification_type")
          .eq("census_year_id", selectedYearId);

        if (recError) throw recError;
        setRecords(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load census data.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCensusMetrics();
  }, [selectedYearId]);

  const macroRecords = records.filter(r => r.classification_type === 'MACRO');
  
  const citizenRecords = records.filter(r => 
    (r.classification_type === 'CITIZEN_MAIN' || r.classification_type === 'CITIZEN_SUB') && 
    !r.category_code.startsWith('FOREIGN_') && 
    !r.category_code.startsWith('EA_')
  );

  const foreignRecords = records.filter(r => 
    r.category_code.startsWith('FOREIGN_') || 
    r.category_code.startsWith('EA_') || 
    r.category_code === 'TOTAL_NON_KENYANS'
  );

  // Get ALL main tribes (CITIZEN_MAIN classification)
  const allMainTribes = citizenRecords
    .filter(r => r.classification_type === 'CITIZEN_MAIN')
    .sort((a, b) => b.population_count - a.population_count);

  const selectedYearLabel = years.find(y => y.id === selectedYearId)?.census_year || 2019;

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, tab: 'totals' | 'tribes' | 'foreign') => {
    e.preventDefault();
    setActiveTab(tab);
  };

  if (isLoading && years.length === 0) {
    return (
      <div className="govuk-width-container govuk-!-padding-top-9">
        <p className="govuk-body-l">Loading census data...</p>
      </div>
    );
  }

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and culture", href: "/society-and-culture" },
          { text: "Communities", href: "/society-and-culture/communities" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">People and communities</span>
            <h1 className="govuk-heading-xl">Communities in Kenya</h1>
            <p className="govuk-body-l">
              Population data from the Kenya National Bureau of Statistics (KNBS) census, showing the size and composition of Kenya's communities.
            </p>
          </div>
        </div>

        {/* Data source attribution */}
        <div className="govuk-inset-text govuk-!-margin-bottom-6">
          <p className="govuk-body govuk-!-margin-bottom-2">
            <strong>Data source:</strong> Kenya National Bureau of Statistics (KNBS), 2019 Kenya Population and Housing Census.
          </p>
          <p className="govuk-body govuk-!-margin-bottom-0">
            <a 
              href="https://www.knbs.or.ke/wp-content/uploads/2023/09/2019-Kenya-population-and-Housing-Census-Volume-4-Distribution-of-Population-by-Socio-Economic-Characteristics.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="govuk-link"
            >
              View the full KNBS census report (PDF)
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
                style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }}
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span className="govuk-visually-hidden"> (opens in a new tab)</span>
            </a>
          </p>
        </div>

        {/* Filters */}
        <div className="govuk-!-margin-bottom-6">
          <label className="govuk-label govuk-label--s" htmlFor="census-year-select">
            Census year
          </label>
          <select 
            className="govuk-select" 
            id="census-year-select" 
            value={selectedYearId || ""} 
            onChange={(e) => setSelectedYearId(Number(e.target.value))}
          >
            {years.map(y => (
              <option key={y.id} value={y.id}>{y.census_year}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="govuk-error-summary" role="alert" aria-labelledby="error-heading">
            <h2 className="govuk-error-summary__title" id="error-heading">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="govuk-body">Loading data...</p>
        ) : (
          <div className="govuk-tabs">
            <h2 className="govuk-tabs__title">Contents</h2>
            
            <ul className="govuk-tabs__list" role="tablist">
              <li className={`govuk-tabs__list-item ${activeTab === 'totals' ? 'govuk-tabs__list-item--selected' : ''}`} role="presentation">
                <a 
                  className="govuk-tabs__tab"
                  href="#tab-totals"
                  onClick={(e) => handleTabClick(e, 'totals')}
                  role="tab"
                  aria-selected={activeTab === 'totals'}
                  aria-controls="tab-totals"
                  id="tab-label-totals"
                >
                  Population totals
                </a>
              </li>
              <li className={`govuk-tabs__list-item ${activeTab === 'tribes' ? 'govuk-tabs__list-item--selected' : ''}`} role="presentation">
                <a 
                  className="govuk-tabs__tab"
                  href="#tab-tribes"
                  onClick={(e) => handleTabClick(e, 'tribes')}
                  role="tab"
                  aria-selected={activeTab === 'tribes'}
                  aria-controls="tab-tribes"
                  id="tab-label-tribes"
                >
                  Kenyan communities
                </a>
              </li>
              <li className={`govuk-tabs__list-item ${activeTab === 'foreign' ? 'govuk-tabs__list-item--selected' : ''}`} role="presentation">
                <a 
                  className="govuk-tabs__tab"
                  href="#tab-foreign"
                  onClick={(e) => handleTabClick(e, 'foreign')}
                  role="tab"
                  aria-selected={activeTab === 'foreign'}
                  aria-controls="tab-foreign"
                  id="tab-label-foreign"
                >
                  Foreign nationalities
                </a>
              </li>
            </ul>

            {/* Tab 1: Population Totals */}
            <div 
              className={`govuk-tabs__panel ${activeTab !== 'totals' ? 'govuk-tabs__panel--hidden' : ''}`}
              id="tab-totals"
              role="tabpanel"
              aria-labelledby="tab-label-totals"
            >
              <h2 className="govuk-heading-l">Population totals ({selectedYearLabel})</h2>
              <p className="govuk-body">
                Overall population breakdown by category.
              </p>
              <table className="govuk-table">
                <caption className="govuk-table__caption govuk-visually-hidden">
                  Population totals for {selectedYearLabel}
                </caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">Population group</th>
                    <th scope="col" className="govuk-table__header govuk-table__header--numeric">Population</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {macroRecords.map((rec) => {
                    const isTotalRow = rec.category_code === 'TOTAL_POPULATION';
                    return (
                      <tr key={rec.id} className="govuk-table__row">
                        <th scope="row" className="govuk-table__header" style={{ fontWeight: isTotalRow ? "bold" : "normal" }}>
                          {rec.name}
                        </th>
                        <td className="govuk-table__cell govuk-table__cell--numeric" style={{ fontWeight: isTotalRow ? "bold" : "normal" }}>
                          {rec.population_count.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tab 2: Kenyan Communities - NOW SHOWS ALL TRIBES */}
            <div 
              className={`govuk-tabs__panel ${activeTab !== 'tribes' ? 'govuk-tabs__panel--hidden' : ''}`}
              id="tab-tribes"
              role="tabpanel"
              aria-labelledby="tab-label-tribes"
            >
              <h2 className="govuk-heading-l">Kenyan communities ({selectedYearLabel})</h2>
              <p className="govuk-body">
                All ethnic communities in Kenya. For communities with sub-groups, click to expand and see the breakdown.
              </p>

              <table className="govuk-table">
                <caption className="govuk-table__caption govuk-visually-hidden">
                  All Kenyan communities for {selectedYearLabel}
                </caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header" style={{ width: "10%" }}>#</th>
                    <th scope="col" className="govuk-table__header" style={{ width: "55%" }}>Community</th>
                    <th scope="col" className="govuk-table__header govuk-table__header--numeric" style={{ width: "35%" }}>Population</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {allMainTribes.map((mainRec, index) => {
                    // Find all sub-tribes for this main tribe
                    const subTribes = citizenRecords
                      .filter(child => child.parent_id === mainRec.id && child.classification_type === 'CITIZEN_SUB')
                      .sort((a, b) => b.population_count - a.population_count);
                    
                    const hasSubTribes = subTribes.length > 0;

                    return (
                      <React.Fragment key={mainRec.id}>
                        <tr className="govuk-table__row">
                          <td className="govuk-table__cell">
                            <strong>{index + 1}</strong>
                          </td>
                          <td className="govuk-table__cell">
                            {hasSubTribes ? (
                              <strong>{mainRec.name} <span className="govuk-body-s govuk-!-margin-left-1">({subTribes.length} sub-groups)</span></strong>
                            ) : (
                              <strong>{mainRec.name}</strong>
                            )}
                          </td>
                          <td className="govuk-table__cell govuk-table__cell--numeric" style={{ fontWeight: "bold" }}>
                            {mainRec.population_count.toLocaleString()}
                          </td>
                        </tr>

                        {/* Show sub-tribes if they exist */}
                        {hasSubTribes && (
                          <tr className="govuk-table__row">
                            <td colSpan={3} className="govuk-!-padding-0">
                              <details className="govuk-details govuk-!-margin-bottom-0">
                                <summary className="govuk-details__summary">
                                  <span className="govuk-details__summary-text">
                                    View sub-groups for {mainRec.name}
                                  </span>
                                </summary>
                                <div className="govuk-details__text">
                                  <table className="govuk-table govuk-!-margin-bottom-0">
                                    <tbody className="govuk-table__body">
                                      {subTribes.map((subRec) => (
                                        <tr key={subRec.id} className="govuk-table__row">
                                          <td className="govuk-table__cell">
                                            {subRec.name}
                                          </td>
                                          <td className="govuk-table__cell govuk-table__cell--numeric">
                                            {subRec.population_count.toLocaleString()}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </details>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tab 3: Foreign Nationalities */}
            <div 
              className={`govuk-tabs__panel ${activeTab !== 'foreign' ? 'govuk-tabs__panel--hidden' : ''}`}
              id="tab-foreign"
              role="tabpanel"
              aria-labelledby="tab-label-foreign"
            >
              <h2 className="govuk-heading-l">Foreign nationalities ({selectedYearLabel})</h2>
              <p className="govuk-body">
                Population of foreign nationals and stateless persons residing in Kenya.
              </p>
              <table className="govuk-table">
                <caption className="govuk-table__caption govuk-visually-hidden">
                  Foreign nationalities for {selectedYearLabel}
                </caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">Origin</th>
                    <th scope="col" className="govuk-table__header govuk-table__header--numeric">Population</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {foreignRecords.map((rec) => {
                    const isSubItem = rec.category_code.startsWith('EA_');
                    const isTotalRow = rec.category_code === 'TOTAL_NON_KENYANS' || rec.category_code === 'FOREIGN_EA_COMBINED';

                    return (
                      <tr key={rec.id} className="govuk-table__row">
                        <td className="govuk-table__cell" style={{ paddingLeft: isSubItem ? "20px" : "0px" }}>
                          {isTotalRow ? <strong>{rec.name}</strong> : rec.name}
                        </td>
                        <td className="govuk-table__cell govuk-table__cell--numeric" style={{ fontWeight: isTotalRow ? "bold" : "normal" }}>
                          {rec.population_count.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="govuk-grid-row govuk-!-margin-top-6">
          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m">Related pages</h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/society-and-culture/languages" className="govuk-link">
                      Languages
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/religion-and-faith" className="govuk-link">
                      Religion and faith
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/national-symbols" className="govuk-link">
                      National symbols
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/heritage-sites" className="govuk-link">
                      Heritage sites
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/cultural-calendar" className="govuk-link">
                      Cultural calendar
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture" className="govuk-link">
                      All society and culture
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

        <LastUpdated published="2026-05-22" lastUpdated="2026-07-02" />

      </main>
    </div>
  );
}