'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKTable from "@/components/govuk/Table";
import GovUKFeedback from "@/components/govuk/Feedback";
import { senateMembers, type Senator } from "@/data/senate-members";

export default function SenateSenatorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const filteredSenators = useMemo(() => {
    return senateMembers.filter((sen) => {
      const matchesSearch =
        sen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sen.county.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sen.party.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesParty = !selectedParty || sen.party === selectedParty;
      const matchesType = !selectedType || sen.type === selectedType;

      return matchesSearch && matchesParty && matchesType;
    });
  }, [searchTerm, selectedParty, selectedType]);

  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/legislature/senate" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Legislature", href: "/legislature" },
          { text: "Senate", href: "/legislature/senate" },
          { text: "Senators", href: "/legislature/senate/senators" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-xl">Senators of Kenya</h1>
            <p className="govuk-body-l">
              13th Parliament (as at 28th August 2025) — {filteredSenators.length} Senators
            </p>

            {/* Filters */}
            <div className="govuk-grid-row govuk-!-margin-bottom-6">
              <div className="govuk-grid-column-one-third">
                <label className="govuk-label" htmlFor="search">Search Senators</label>
                <input
                  className="govuk-input"
                  id="search"
                  type="text"
                  placeholder="Name or county..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="govuk-grid-column-one-third">
                <label className="govuk-label" htmlFor="party">Political Party</label>
                <select
                  className="govuk-select"
                  id="party"
                  value={selectedParty}
                  onChange={(e) => setSelectedParty(e.target.value)}
                >
                  <option value="">All Parties</option>
                  <option value="ODM">ODM - Orange Democratic Movement</option>
                  <option value="UDA">UDA - United Democratic Alliance</option>
                  <option value="JUBILEE">JUBILEE</option>
                  <option value="WDM-K">WDM-K - Wiper Democratic Movement</option>
                  <option value="FORD-K">FORD-K - Forum for the Restoration of Democracy</option>
                  <option value="UDM">UDM - United Democratic Movement</option>
                  <option value="DP">DP - Democratic Party</option>
                  <option value="NRA">NRA</option>
                </select>
              </div>

              <div className="govuk-grid-column-one-third">
                <label className="govuk-label" htmlFor="type">Type</label>
                <select
                  className="govuk-select"
                  id="type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Elected">Elected Senator (Head of Delegation)</option>
                  <option value="Nominated">Nominated Senator</option>
                </select>
              </div>
            </div>

            <h2 className="govuk-heading-m">Showing {filteredSenators.length} Senators</h2>

            <GovUKTable
              caption="Senators of the Republic of Kenya"
              headers={[
                { text: "No." },
                { text: "Name" },
                { text: "County" },
                { text: "Party" },
                { text: "Type" },
              ]}
              rows={filteredSenators.map((sen, index) => ({
                cells: [
                  (index + 1).toString(),
                  <Link
                    key={sen.id}
                    href={`/legislature/senate/senators/${sen.slug}`}
                    className="govuk-link"
                  >
                    {sen.name}
                  </Link>,
                  sen.county,
                  sen.party,
                  sen.type,
                ],
              }))}
            />
          </div>
        </div>

        <GovUKFeedback />
      </main>
    </div>
  );
}