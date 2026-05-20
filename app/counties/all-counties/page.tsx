'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
//import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import { counties, type County } from "@/data/counties";

const regions = [
  "All Regions",
  "Coast",
  "North Eastern",
  "Eastern",
  "Central",
  "Rift Valley",
  "Western",
  "Nyanza",
  "Nairobi"
] as const;

export default function AllCountiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");

  const filteredCounties = useMemo(() => {
    return counties.filter((county) => {
      const matchesSearch = 
        county.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        county.capital.toLowerCase().includes(searchTerm.toLowerCase()) ||
        county.governor.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRegion = 
        selectedRegion === "All Regions" || 
        county.region === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [searchTerm, selectedRegion]);

  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/counties" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Counties", href: "/counties" },
          { text: "All 47 Counties", href: "/counties/all-counties" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-xl">All 47 Counties of Kenya</h1>
            <p className="govuk-body-l">
              Kenya is divided into 47 counties as the units of devolved government under the 2010 Constitution.
            </p>

            {/* Filters */}
            <div className="govuk-grid-row govuk-!-margin-bottom-9">
              <div className="govuk-grid-column-one-third">
                <label className="govuk-label" htmlFor="search">Search Counties</label>
                <input
                  className="govuk-input"
                  id="search"
                  type="text"
                  placeholder="County name, capital or governor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="govuk-grid-column-one-third">
                <label className="govuk-label" htmlFor="region">Region</label>
                <select 
                  className="govuk-select" 
                  id="region"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h2 className="govuk-heading-m">Showing {filteredCounties.length} of 47 Counties</h2>

            {/* County Cards */}
            <div className="govuk-grid-row">
              {filteredCounties.map((county) => (
                <div key={county.code} className="govuk-grid-column-one-third govuk-!-margin-bottom-6">
                  <div className="govuk-panel govuk-panel--border" style={{ height: "100%" }}>
                    <strong className="govuk-tag govuk-tag--blue">{county.code}</strong>
                    
                    <h3 className="govuk-heading-m govuk-!-margin-top-3">
                      {county.name}
                    </h3>

                    <p className="govuk-body-s">
                      <strong>Capital:</strong> {county.capital}<br />
                      <strong>Governor:</strong> {county.governor}<br />
                      <strong>Region:</strong> {county.region}
                      {county.economicBloc && <><br /><strong>Bloc:</strong> {county.economicBloc}</>}
                    </p>

                    <p className="govuk-body-s govuk-!-margin-top-2">
                      {county.mainEconomicActivities.slice(0, 3).join(", ")}...
                    </p>

                    <div className="govuk-!-margin-top-4">
                      <Link 
                        href={`/counties/${county.slug}`}
                        className="govuk-button govuk-button--secondary"
                      >
                        View Full Profile →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCounties.length === 0 && (
              <p className="govuk-body">No counties found matching your criteria.</p>
            )}

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}