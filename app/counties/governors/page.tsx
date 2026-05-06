'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKTable from "@/components/govuk/Table";
import GovUKFeedback from "@/components/govuk/Feedback";
import { governors, type Governor } from "@/data/governors";

export default function GovernorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  const filteredGovernors = useMemo(() => {
    return governors.filter((g) => {
      const matchesSearch = 
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.county.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesParty = !selectedParty || g.party === selectedParty;
      const matchesRegion = !selectedRegion || g.region === selectedRegion;

      return matchesSearch && matchesParty && matchesRegion;
    });
  }, [searchTerm, selectedParty, selectedRegion]);

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/counties" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Counties", href: "/counties" },
          { text: "Governors", href: "/counties/governors" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-xl">County Governors of Kenya</h1>
            <p className="govuk-body-l">
              Current Governors and Deputy Governors of Kenya’s 47 counties (13th Parliament).
            </p>

            {/* Filters */}
            <div className="govuk-grid-row govuk-!-margin-bottom-9">
              <div className="govuk-grid-column-one-third">
                <label className="govuk-label" htmlFor="search">Search</label>
                <input
                  className="govuk-input"
                  id="search"
                  type="text"
                  placeholder="Governor or county name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="govuk-grid-column-one-third">
                <label className="govuk-label" htmlFor="party">Party</label>
                <select 
                  className="govuk-select" 
                  id="party"
                  value={selectedParty}
                  onChange={(e) => setSelectedParty(e.target.value)}
                >
                  <option value="">All Parties</option>
                  <option value="UDA">UDA</option>
                  <option value="ODM">ODM</option>
                  <option value="JUBILEE">JUBILEE</option>
                  <option value="WDM-K">WDM-K</option>
                  <option value="FORD-K">FORD-K</option>
                </select>
              </div>

              <div className="govuk-grid-column-one-third">
                <label className="govuk-label" htmlFor="region">Region</label>
                <select 
                  className="govuk-select" 
                  id="region"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="">All Regions</option>
                  <option value="Coast">Coast</option>
                  <option value="North Eastern">North Eastern</option>
                  <option value="Eastern">Eastern</option>
                  <option value="Central">Central</option>
                  <option value="Rift Valley">Rift Valley</option>
                  <option value="Western">Western</option>
                  <option value="Nyanza">Nyanza</option>
                  <option value="Nairobi">Nairobi</option>
                </select>
              </div>
            </div>

            <h2 className="govuk-heading-m">Showing {filteredGovernors.length} Governors</h2>

            <GovUKTable
              caption="County Governors and Their Deputies"
              headers={[
                { text: "No." },
                { text: "Governor" },
                { text: "County" },
                { text: "Party" },
                { text: "Region" },
                { text: "Deputy Governor" },
              ]}
              rows={filteredGovernors.map((g, index) => ({
                cells: [
                  (index + 1).toString(),
                  <Link 
                    key={g.id} 
                    href={`/counties/${g.countySlug}`}
                    className="govuk-link"
                  >
                    {g.name}
                  </Link>,
                  g.county,
                  g.party,
                  g.region,
                  g.deputyGovernor,
                ],
              }))}
            />

            <p className="govuk-body govuk-!-margin-top-6">
              Click on any Governor’s name to view the full county profile.
            </p>

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}