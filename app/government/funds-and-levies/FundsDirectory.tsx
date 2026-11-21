"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import type { FundParent, FundRecord } from "@/lib/funds/types";

type Props = {
  funds: FundRecord[];
  parents: Record<string, FundParent>;
  unavailable: boolean;
};

function valuesFor(funds: FundRecord[], field: "fund_classification" | "fund_levy_type") {
  return [...new Set(funds.map((fund) => fund[field]?.trim()).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b));
}

export default function FundsDirectory({ funds, parents, unavailable }: Props) {
  const [query, setQuery] = useState("");
  const [classification, setClassification] = useState("");
  const [recordType, setRecordType] = useState("");
  const [parentId, setParentId] = useState("");

  const classifications = useMemo(() => valuesFor(funds, "fund_classification"), [funds]);
  const recordTypes = useMemo(() => valuesFor(funds, "fund_levy_type"), [funds]);
  const parentOptions = useMemo(
    () => Object.values(parents).sort((a, b) => a.name.localeCompare(b.name)),
    [parents],
  );
  const filteredFunds = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return funds.filter((fund) => {
      const parent = fund.parent_institution_id ? parents[fund.parent_institution_id] : null;
      const searchable = [
        fund.name,
        fund.short_name,
        fund.description,
        fund.mandate,
        fund.target_population,
        fund.fund_levy_type,
        fund.fund_classification,
        fund.legal_basis_reference,
        fund.funding_source,
        parent?.name,
      ].filter(Boolean).join(" ").toLocaleLowerCase();
      return (!search || searchable.includes(search)) &&
        (!classification || fund.fund_classification === classification) &&
        (!recordType || fund.fund_levy_type === recordType) &&
        (!parentId || fund.parent_institution_id === parentId);
    });
  }, [funds, parents, query, classification, recordType, parentId]);

  const clearFilters = () => {
    setQuery("");
    setClassification("");
    setRecordType("");
    setParentId("");
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={[
        { text: "Home", href: "/" },
        { text: "Government", href: "/government" },
        { text: "Funds, levies and schemes" },
      ]} />
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">Public money and services</span>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">Government funds, levies and schemes</h1>
            <p className="govuk-body-l">
              Find out what a fund is for, which public institution is responsible for it, and where to get official information.
            </p>
            <div className="govuk-inset-text">
              Funds and levies are listed under the public institutions that administer them. They are not separate institutions and are not included in the institution count.
            </div>
          </div>
        </div>

        <div className="govuk-grid-row govuk-!-margin-top-6">
          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--s" htmlFor="fund-search">Search funds and schemes</label>
              <div id="fund-search-hint" className="govuk-hint">Search by name, purpose, institution or legal basis.</div>
              <input
                className="govuk-input"
                id="fund-search"
                name="search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-describedby="fund-search-hint"
              />
            </div>
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--s" htmlFor="fund-classification">Fund classification</label>
              <select className="govuk-select govuk-!-width-full" id="fund-classification" value={classification} onChange={(event) => setClassification(event.target.value)}>
                <option value="">All classifications</option>
                {classifications.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--s" htmlFor="fund-type">Type</label>
              <select className="govuk-select govuk-!-width-full" id="fund-type" value={recordType} onChange={(event) => setRecordType(event.target.value)}>
                <option value="">All types</option>
                {recordTypes.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div className="govuk-form-group">
              <label className="govuk-label govuk-label--s" htmlFor="fund-administrator">Administering institution</label>
              <select className="govuk-select govuk-!-width-full" id="fund-administrator" value={parentId} onChange={(event) => setParentId(event.target.value)}>
                <option value="">All institutions</option>
                {parentOptions.map((parent) => <option key={parent.id} value={parent.id}>{parent.name}</option>)}
              </select>
            </div>
            <button className="govuk-button govuk-button--secondary" type="button" onClick={clearFilters}>Clear filters</button>
          </div>

          <div className="govuk-grid-column-two-thirds">
            <p className="govuk-body" aria-live="polite">
              {unavailable
                ? "Fund records are temporarily unavailable. Please try again later."
                : `Showing ${filteredFunds.length} of ${funds.length} ${funds.length === 1 ? "record" : "records"}.`}
            </p>
            {unavailable ? (
              <div className="govuk-inset-text">The directory could not connect to its public records. No sample or substitute records are shown.</div>
            ) : filteredFunds.length > 0 ? (
              <ul className="govuk-list govuk-!-margin-bottom-0">
                {filteredFunds.map((fund) => {
                  const parent = fund.parent_institution_id ? parents[fund.parent_institution_id] : null;
                  return (
                    <li key={fund.id} className="govuk-!-padding-bottom-5 govuk-!-margin-bottom-5">
                      <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
                        <Link className="govuk-link govuk-link--no-visited-state" href={`/government/funds-and-levies/${fund.slug}`}>{fund.name}</Link>
                      </h2>
                      <p className="govuk-body-s govuk-!-margin-bottom-2">
                        {fund.fund_levy_type && <strong className="govuk-tag govuk-tag--blue govuk-!-margin-right-2">{fund.fund_levy_type}</strong>}
                        {fund.fund_classification && <span>{fund.fund_classification}</span>}
                      </p>
                      <p className="govuk-body govuk-!-margin-bottom-2">
                        {fund.description || fund.mandate || "A public fund or scheme. More information about its purpose has not yet been added."}
                      </p>
                      {parent && <p className="govuk-body-s govuk-!-margin-bottom-0">Administered by <Link className="govuk-link" href={`/government/institutions/${parent.slug}`}>{parent.name}</Link></p>}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="govuk-inset-text">No funds match those filters. Try a different search or clear your filters.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
