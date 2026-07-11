// app/society-and-culture/religion-and-faith/page.tsx
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

interface CountyReference {
  id: string;
  name: string;
  code: string;
  slug: string;
}

interface ReligionRecord {
  id: number;
  county_id: string | null;
  population_total: number;
  catholic: number;
  protestant: number;
  evangelical: number;
  african_instituted: number;
  orthodox: number;
  other_christian: number;
  islam: number;
  hindu: number;
  traditionists: number;
  other_religion: number;
  no_religion_atheist: number;
  dont_know: number;
  not_stated: number;
  counties?: CountyReference | null;
}

export default function ReligionAndFaithPage() {
  const [years, setYears] = useState<CensusYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [records, setRecords] = useState<ReligionRecord[]>([]);
  const [activeViewId, setActiveViewId] = useState<string>("NATIONAL");
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

    async function fetchReligionMetrics() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        
        const { data, error: recError } = await supabase
          .from("knbs_religion_census")
          .select(`
            id, county_id, population_total, catholic, protestant, evangelical, 
            african_instituted, orthodox, other_christian, islam, hindu, 
            traditionists, other_religion, no_religion_atheist, dont_know, not_stated,
            counties ( id, name, code, slug )
          `)
          .eq("census_year_id", selectedYearId);

        if (recError) throw recError;
        setRecords(data as any || []);
      } catch (err: any) {
        setError(err.message || "Failed to load census data.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchReligionMetrics();
  }, [selectedYearId]);

  const nationalRecord = records.find(r => r.county_id === null);
  const countyRecords = records.filter(r => r.county_id !== null);

  const activeDisplayRecord = activeViewId === "NATIONAL" 
    ? nationalRecord 
    : records.find(r => r.county_id?.toString() === activeViewId);

  const formatNum = (num?: number) => num !== undefined ? num.toLocaleString() : "0";
  const selectedYearLabel = years.find(y => y.id === selectedYearId)?.census_year || 2019;

  if (isLoading && years.length === 0) {
    return (
      
        <p className="govuk-body-l">Loading census data...</p>
      
    );
  }

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and culture", href: "/society-and-culture" },
          { text: "Religion and faith", href: "/society-and-culture/religion-and-faith" },
        ]}
      />

      
        
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">People and communities</span>
            <h1 className="govuk-heading-xl">Religion and faith in Kenya</h1>
            <p className="govuk-body-l">
              Population data on religious affiliation from the Kenya National Bureau of Statistics (KNBS) census.
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
              <div className="govuk-inset-text govuk-!-margin-bottom-6">
                <div className="app-filter-row">
                  <div className="govuk-form-group govuk-!-margin-bottom-0">
                    <label className="govuk-label govuk-label--s" htmlFor="census-year-select">
                      Census year
                    </label>
                    <select 
                      className="govuk-select" 
                      id="census-year-select" 
                      value={selectedYearId || ""} 
                      onChange={(e) => setSelectedYearId(Number(e.target.value))}
                    >
                      {years.map(y => <option key={y.id} value={y.id}>{y.census_year}</option>)}
                    </select>
                  </div>
                  <div className="govuk-form-group govuk-!-margin-bottom-0">
                    <label className="govuk-label govuk-label--s" htmlFor="regional-filter-select">
                      Region
                    </label>
                    <select 
                      className="govuk-select" 
                      id="regional-filter-select" 
                      value={activeViewId} 
                      onChange={(e) => setActiveViewId(e.target.value)}
                    >
                      <option value="NATIONAL">Kenya (national total)</option>
                      {countyRecords.map(r => (
                        <option key={r.id} value={r.county_id || ""}>
                          {r.counties?.name || `Code ${r.county_id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <style>{`
                .app-filter-row {
                  display: flex;
                  gap: 20px;
                  align-items: flex-end;
                  flex-wrap: wrap;
                }

                .app-filter-row .govuk-form-group:first-child {
                  flex: 0 0 auto;
                }

                .app-filter-row .govuk-form-group:first-child .govuk-select {
                  width: 100px;
                }

                .app-filter-row .govuk-form-group:last-child {
                  flex: 1;
                  min-width: 200px;
                }

                @media (max-width: 40.0625rem) {
                  .app-filter-row {
                    flex-direction: column;
                    align-items: stretch;
                  }

                  .app-filter-row .govuk-form-group:first-child .govuk-select {
                    width: 100%;
                  }
                }
              `}</style>

        {error && (
          <div className="govuk-error-summary" role="alert" aria-labelledby="error-heading">
            <h2 className="govuk-error-summary__title" id="error-heading">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">{error}</p>
            </div>
          </div>
        )}

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {isLoading ? (
              <p className="govuk-body">Loading data...</p>
            ) : !activeDisplayRecord ? (
              <div className="govuk-inset-text">
                <p className="govuk-body">
                  No data is available for the selected region and year.
                </p>
              </div>
            ) : (
              <>
                <h2 className="govuk-heading-l">
                  {activeViewId === "NATIONAL" ? "Kenya" : `${activeDisplayRecord.counties?.name} County`} ({selectedYearLabel})
                </h2>

                <p className="govuk-body">
                  Total population: <strong>{formatNum(activeDisplayRecord.population_total)}</strong>
                </p>

                <table className="govuk-table">
                  <caption className="govuk-table__caption govuk-visually-hidden">
                    Religious affiliation breakdown for {activeViewId === "NATIONAL" ? "Kenya" : activeDisplayRecord.counties?.name} in {selectedYearLabel}
                  </caption>
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header">Religious group</th>
                      <th scope="col" className="govuk-table__header govuk-table__header--numeric">Population</th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header">Protestant</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.protestant)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header">Roman Catholic</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.catholic)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header">Evangelical</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.evangelical)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header">Islam</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.islam)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header">African Instituted Churches</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.african_instituted)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header">Other Christian</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.other_christian)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header">No religion / atheist</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.no_religion_atheist)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header">Orthodox</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.orthodox)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header">Traditionalists</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.traditionists)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header">Hindu</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.hindu)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header">Other religions</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.other_religion)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header">Do not know</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.dont_know)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header">Not stated</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.not_stated)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="govuk-inset-text">
                  <p className="govuk-body govuk-!-margin-bottom-0">
                    <strong>Note:</strong> KNBS did not ask the religious affiliation question to people living in hotels, hospitals, prisons, police cells, children&apos;s homes, short-term travellers, or people sleeping rough.
                  </p>
                </div>
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
                    <Link href="/society-and-culture/communities" className="govuk-link">
                      Communities
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/languages" className="govuk-link">
                      Languages
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/constitution-and-national-values" className="govuk-link">
                      Constitution and national values
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
                  The Kenya National Bureau of Statistics (KNBS) conducts the national census every 10 years.
                </p>
              </div>
            </aside>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

        <LastUpdated published="2026-05-22" lastUpdated="2026-07-02" />

      
    
  
  </>
);
}