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
  counties?: CountyReference | null; // Joined relation data via Supabase ORM
}

export default function ReligionAndFaithPage() {
  const [years, setYears] = useState<CensusYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [records, setRecords] = useState<ReligionRecord[]>([]);
  const [activeViewId, setActiveViewId] = useState<string>("NATIONAL"); // "NATIONAL" or County ID string
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Phase 1: Query Available Timeline Reference Records
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
        setError(err.message || "Failed to query calendar tracking logs.");
      }
    }
    fetchTimelineYears();
  }, []);

  // Phase 2: Query Live Metrics Matched on Selected Timeline Cycle Year
  useEffect(() => {
    if (selectedYearId === null) return;

    async function fetchReligionMetrics() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        
        // Execute foreign-table join query to fetch county model parameters alongside numbers
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
        setError(err.message || "Failed to query relational demographic layers.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchReligionMetrics();
  }, [selectedYearId]);

  // Isolate current National reference record vs County listings array
  const nationalRecord = records.find(r => r.county_id === null);
  const countyRecords = records.filter(r => r.county_id !== null);

  // Determine active dataset row array based on targeted dropdown menu state
  const activeDisplayRecord = activeViewId === "NATIONAL" 
    ? nationalRecord 
    : records.find(r => r.county_id?.toString() === activeViewId);

  const formatNum = (num?: number) => num !== undefined ? num.toLocaleString() : "0";
  const selectedYearLabel = years.find(y => y.id === selectedYearId)?.census_year || 2019;

  if (isLoading && years.length === 0) {
    return (
      <div className="govuk-width-container govuk-!-padding-top-9">
        <p className="govuk-body-l">Establishing remote connection to public KNBS religious database metrics...</p>
      </div>
    );
  }

  return (
    <div className="govuk-width-container">
      {/* GOV.UK Navigation Breadcrumbs */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and Culture", href: "/society-and-culture" },
          { text: "Religion and Faith", href: "/society-and-culture/religion-and-faith" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* HEADER SECTION */}
        <div className="govuk-grid-row govuk-!-margin-bottom-6">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">National Identity and Heritage</span>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">Religious Affiliation Demographics</h1>
            <p className="govuk-body-l">
              Educational overview of Kenya&apos;s multidenominational landscapes compiled by the Kenya National Bureau of Statistics (KNBS).
            </p>
          </div>
        </div>

        {/* CONTROLS FILTERS BAR COMPONENT */}
        <div className="govuk-inset-text">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group govuk-!-margin-bottom-0">
                <label className="govuk-label" htmlFor="census-year-select"><strong>Select Census Cycle Year</strong></label>
                <select className="govuk-select govuk-!-width-full" id="census-year-select" value={selectedYearId || ""} onChange={(e) => setSelectedYearId(Number(e.target.value))}>
                  {years.map(y => <option key={y.id} value={y.id}>KNBS Statistics Cycle: {y.census_year}</option>)}
                </select>
              </div>
            </div>
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group govuk-!-margin-bottom-0">
                <label className="govuk-label" htmlFor="regional-filter-select"><strong>Select Regional Location Filter</strong></label>
                <select className="govuk-select" id="regional-filter-select" style={{ width: "100%" }} value={activeViewId} onChange={(e) => setActiveViewId(e.target.value)}>
                  <option value="NATIONAL">Entire Republic (Kenya Macro Total)</option>
                                    {countyRecords.map(r => (
                    <option key={r.id} value={r.county_id || ""}>
                      {r.counties?.name || `Code ${r.county_id}`}
                    </option>
                  ))}

                </select>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="govuk-error-summary" role="alert" aria-labelledby="error-heading">
            <h2 className="govuk-error-summary__title" id="error-heading">System Error</h2>
            <div className="govuk-error-summary__body"><p className="govuk-body">{error}</p></div>
          </div>
        )}

        {/* WORKSPACE REGISTRY MATRIX GRID */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {isLoading ? (
              <p className="govuk-body-l">Syncing database entries...</p>
            ) : !activeDisplayRecord ? (
              <div className="govuk-inset-text">
                No population metrics data values returned for this selected regional configuration context yet.
              </div>
            ) : (
              <>
                <h2 className="govuk-heading-l">
                  {activeViewId === "NATIONAL" ? "Kenya (National Summary)" : `${activeDisplayRecord.counties?.name} County`} Data ({selectedYearLabel})
                </h2>

                {/* ACCESSIBLE VERTICAL COMPARISON TABLE OVERLAY */}
                <table className="govuk-table">
                  <caption className="govuk-table__caption govuk-table__caption--m">
                    Affiliation Breakdown Distribution Matrix (Total Tracked: {formatNum(activeDisplayRecord.population_total)})
                  </caption>
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header">Religious Group / Denominational Affiliation</th>
                      <th scope="col" className="govuk-table__header govuk-table__header--numeric">Enumerated Population</th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    <tr className="govuk-table__row"><th scope="row" className="govuk-table__header" >Protestant Denominations</th><td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.protestant)}</td></tr>
                    <tr className="govuk-table__row"><th scope="row" className="govuk-table__header" >Roman Catholic Church</th><td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.catholic)}</td></tr>
                    <tr className="govuk-table__row"><th scope="row" className="govuk-table__header" >Evangelical Churches</th><td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.evangelical)}</td></tr>
                    <tr className="govuk-table__row"><th scope="row" className="govuk-table__header" >Islam</th><td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.islam)}</td></tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header" >African Instituted Churches (AICs)</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.african_instituted)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header" >Other Christian Variants</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.other_christian)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header" >No Religion / Atheists</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.no_religion_atheist)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header" >Orthodox Church</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.orthodox)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header" >Traditionists</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.traditionists)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header" >Hinduism</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.hindu)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header" >Other Unlisted Religions</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.other_religion)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header" >Do Not Know</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.dont_know)}</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header" >Not Stated Parameters</th>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{formatNum(activeDisplayRecord.not_stated)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* STATUTORY CENSUS LIMITATION FOOTNOTE */}
                <div className="govuk-!-background-white govuk-!-border-1 govuk-!-padding-3 govuk-!-margin-top-4">
                  <p className="govuk-body-s govuk-!-text-colour-secondary govuk-!-margin-0">
                    <strong>Official Statistical Footnote Note:</strong> Pursuant to KNBS methodological rules, the religious affiliation question was explicitly omitted for institutional populations residing within hotels/lodges, hospitals, prison/police custody cells, children&apos;s rescue homes, short-term travelers, and outdoor unsheltered sleepers.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* SIDEBAR NAVIGATION COLUMN */}
          <aside className="govuk-grid-column-one-third" role="complementary">
            <div className="society-top-border">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Related Guidance</h2>
              <ul className="govuk-list govuk-body-s">
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/communities" className="govuk-link">
                    <strong>Demographics &amp; Ethnic Groups</strong>
                  </Link>
                </li>
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/constitution-and-national-values" className="govuk-link">
                    <strong>Constitution and Governance Principles</strong>
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* FEEDBACK METADATA */}
        <div className="govuk-grid-row govuk-!-margin-top-6">
          <div className="govuk-grid-column-full">
            <LastUpdated published="2026-05-22" lastUpdated="2026-05-22" />
            
          </div>
        </div>

      </main>
    </div>
  );
}
