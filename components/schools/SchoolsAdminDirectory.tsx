'use client';

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";
import { createBrowserClientAsync } from "@/lib/supabase/client";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

type SchoolDirectoryRow = {
  id: string;
  slug: string;
  official_name: string;
  short_name?: string | null;
  ownership: string;
  is_published: boolean;
  institution_type: string;
  operational_status: string | null;
  registration_status: string | null;
  nemis_code?: string | null;
  tsc_code?: string | null;
  knec_code?: string | null;
  county_code?: number | null;
  canonical_county?: string | null;
  sub_county_id?: string | null;
  canonical_sub_county?: string | null;
  county: string;
  sub_county?: string | null;
  constituency?: string | null;
  ward?: string | null;
  district?: string | null;
  zone?: string | null;
  physical_address?: string | null;
  postal_address?: string | null;
  location_name?: string | null;
  sub_location_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geographic_setting?: string | null;
  main_tier?: string | null;
  multi_level_flag?: boolean | null;
  moe_category?: string | null;
  gender_type?: string | null;
  accommodation_type?: string | null;
  sponsor_name?: string | null;
  religious_affiliation?: string | null;
  special_needs_status?: string | null;
  sne_categories?: string[] | null;
  total_enrollment?: number | null;
  total_teachers?: number | null;
  tsc_teachers?: number | null;
  bom_teachers?: number | null;
  water_source?: string | null;
  power_source?: string | null;
  internet_connectivity?: string | null;
  public_phone?: string | null;
  public_email?: string | null;
  website_url?: string | null;
  verification_status: string;
  verification_notes?: string | null;
  levels?: string[] | null;
  identifiers?: string[] | null;
  source_count: number;
};

type CountyOption = {
  code: number;
  name: string;
};

type SubCountyOption = {
  id: string;
  name: string;
};

const PAGE_SIZE = 50;
const LEVEL_OPTIONS = ["primary", "junior", "senior_secondary", "ecde"];
const INSTITUTION_TYPE_OPTIONS = [
  "regular", "special", "rehabilitation", "ecde_centre", "hospital_school", "other",
];
const OWNERSHIP_OPTIONS = ["public", "private", "community", "faith_based", "other", "unknown"];
const VERIFICATION_OPTIONS = [
  "unverified", "source_confirmed", "cross_source_match", "institution_verified", "disputed",
];

const SCHOOL_SELECT = `
  id, slug, official_name, short_name, nemis_code, tsc_code, knec_code,
  ownership, is_published, institution_type, operational_status, registration_status,
  county, sub_county, constituency, ward, district, zone, physical_address,
  latitude, longitude, verification_status, verification_notes, levels,
  identifiers, source_count, county_code, canonical_county, sub_county_id,
  canonical_sub_county, location_name, sub_location_name, geographic_setting,
  main_tier, multi_level_flag, moe_category, gender_type, accommodation_type,
  sponsor_name, religious_affiliation, special_needs_status, sne_categories,
  total_enrollment, total_teachers, tsc_teachers, bom_teachers, water_source,
  power_source, internet_connectivity, public_phone, public_email, website_url,
  postal_address
`;

const prettyLabel = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

export default function SchoolsAdminDirectory() {
  const [schools, setSchools] = useState<SchoolDirectoryRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [publicationFilter, setPublicationFilter] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("");
  const [countyFilter, setCountyFilter] = useState("");
  const [subCountyFilter, setSubCountyFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [countyOptions, setCountyOptions] = useState<CountyOption[]>([]);
  const [subCountyOptions, setSubCountyOptions] = useState<SubCountyOption[]>([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSchools, setTotalSchools] = useState(0);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCounties = async () => {
      try {
        const supabase = await createBrowserClientAsync();
        const { data: countyData, error: countyError } = await supabase
          .from("education_counties")
          .select("code, name")
          .order("code");

        if (countyError) throw countyError;
        if (!cancelled) setCountyOptions((countyData ?? []) as CountyOption[]);
      } catch (error) {
        if (!cancelled) setErrorMessage(getErrorMessage(error));
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    };

    fetchCounties();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      setCurrentPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;

    const fetchSubCounties = async () => {
      setSubCountyOptions([]);
      if (!countyFilter) return;

      const supabase = await createBrowserClientAsync();
      const { data, error } = await supabase
        .from("education_sub_counties")
        .select("id, name")
        .eq("county_code", Number(countyFilter))
        .order("name");

      if (!cancelled) {
        if (error) setErrorMessage(getErrorMessage(error));
        else setSubCountyOptions((data ?? []) as SubCountyOption[]);
      }
    };

    fetchSubCounties();
    return () => { cancelled = true; };
  }, [countyFilter]);

  useEffect(() => {
    let cancelled = false;

    const fetchSchools = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const supabase = await createBrowserClientAsync();
        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        let query = supabase
          .from("education_school_directory")
          .select(SCHOOL_SELECT, { count: "exact" })
          .order("official_name", { ascending: true })
          .order("id", { ascending: true })
          .range(from, to);

        const safeSearch = debouncedSearchTerm.replace(/[%_(),]/g, " ").replace(/\s+/g, " ").trim();
        if (safeSearch) {
          const pattern = `%${safeSearch}%`;
          query = query.or([
            `official_name.ilike.${pattern}`,
            `short_name.ilike.${pattern}`,
            `county.ilike.${pattern}`,
            `sub_county.ilike.${pattern}`,
            `ward.ilike.${pattern}`,
            `district.ilike.${pattern}`,
            `zone.ilike.${pattern}`,
          ].join(","));
        }
        if (levelFilter) query = query.eq("main_tier", levelFilter);
        if (typeFilter) query = query.eq("institution_type", typeFilter);
        if (publicationFilter) query = query.eq("is_published", publicationFilter === "published");
        if (ownershipFilter) query = query.eq("ownership", ownershipFilter);
        if (countyFilter) query = query.eq("county_code", Number(countyFilter));
        if (subCountyFilter) query = query.eq("sub_county_id", subCountyFilter);
        if (verificationFilter) query = query.eq("verification_status", verificationFilter);

        const { data, error, count } = await query;
        if (error) throw error;

        if (!cancelled) {
          setSchools((data ?? []) as SchoolDirectoryRow[]);
          setTotalSchools(count ?? 0);
        }
      } catch (error) {
        if (!cancelled) {
          setSchools([]);
          setTotalSchools(0);
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSchools();
    return () => { cancelled = true; };
  }, [currentPage, debouncedSearchTerm, levelFilter, typeFilter, ownershipFilter, countyFilter, subCountyFilter, verificationFilter, publicationFilter]);

  const totalPages = Math.max(1, Math.ceil(totalSchools / PAGE_SIZE));
  const firstResult = totalSchools === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastResult = Math.min(currentPage * PAGE_SIZE, totalSchools);

  const resetPageAndSet = (setter: (value: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLevelFilter("");
    setTypeFilter("");
    setOwnershipFilter("");
    setPublicationFilter("");
    setCountyFilter("");
    setSubCountyFilter("");
    setVerificationFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={[{ text: "Admin", href: adminPath() }, { text: "Schools" }]} />
      <section className="govuk-main-wrapper" aria-label="School records">
        <span className="govuk-caption-xl">Education records</span>
        <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">Kenyan schools directory</h1>
        <p className="govuk-body-l">Manage public and private school records. Only published public schools appear in the public institutions directory.</p>

        {errorMessage ? (
          <div className="govuk-error-summary" data-module="govuk-error-summary">
            <div role="alert">
              <h2 className="govuk-error-summary__title">Schools could not be loaded</h2>
              <div className="govuk-error-summary__body"><p className="govuk-body govuk-!-margin-bottom-0">{errorMessage}</p></div>
            </div>
          </div>
        ) : (
          <>
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-third">
                <div className="govuk-inset-text">
                  <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                    {loading ? "Loading schools..." : `${totalSchools.toLocaleString()} schools found`}
                  </p>
                  <p className="govuk-body-s govuk-!-margin-bottom-0">
                    {!loading && totalSchools > 0
                      ? `Showing ${firstResult.toLocaleString()} to ${lastResult.toLocaleString()}`
                      : "Results are loaded 50 at a time"}
                  </p>
                </div>
              </div>
              <div className="govuk-grid-column-two-thirds">
                <div className="govuk-form-group">
                  <label className="govuk-label govuk-label--s" htmlFor="search-schools">Search schools</label>
                  <div className="govuk-hint" id="search-schools-hint">Search by school name, county, sub-county, ward, district or zone</div>
                  <input className="govuk-input govuk-!-width-full" id="search-schools" type="search" aria-describedby="search-schools-hint" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                </div>
              </div>
            </div>

            <div className="govuk-grid-row govuk-!-margin-bottom-4">
              <FilterSelect label="Education level" value={levelFilter} onChange={(value) => resetPageAndSet(setLevelFilter, value)} options={LEVEL_OPTIONS} />
              <FilterSelect label="Institution type" value={typeFilter} onChange={(value) => resetPageAndSet(setTypeFilter, value)} options={INSTITUTION_TYPE_OPTIONS} />
              <FilterSelect label="Publication" value={publicationFilter} onChange={(value) => resetPageAndSet(setPublicationFilter, value)} options={["published", "unpublished"]} />
              <FilterSelect label="Ownership" value={ownershipFilter} onChange={(value) => resetPageAndSet(setOwnershipFilter, value)} options={OWNERSHIP_OPTIONS} />
              <OptionFilterSelect
                label="County"
                value={countyFilter}
                onChange={(value) => {
                  setCountyFilter(value);
                  setSubCountyFilter("");
                  setCurrentPage(1);
                }}
                options={countyOptions.map((county) => ({ value: String(county.code), label: county.name }))}
                disabled={optionsLoading}
              />
              <OptionFilterSelect
                label="Sub-county"
                value={subCountyFilter}
                onChange={(value) => resetPageAndSet(setSubCountyFilter, value)}
                options={subCountyOptions.map((subCounty) => ({ value: subCounty.id, label: subCounty.name }))}
                disabled={!countyFilter}
              />
              <FilterSelect label="Verification" value={verificationFilter} onChange={(value) => resetPageAndSet(setVerificationFilter, value)} options={VERIFICATION_OPTIONS} />
            </div>

            <button type="button" className="govuk-button govuk-button--secondary" onClick={clearFilters}>Clear filters</button>

            {loading ? (
              <p className="govuk-body" role="status">Loading schools...</p>
            ) : schools.length === 0 ? (
              <div className="govuk-inset-text"><p className="govuk-body govuk-!-margin-bottom-0">No schools match the selected filters.</p></div>
            ) : (
              <>
                <div
                  className="govuk-table-responsive"
                  role="region"
                  aria-label="Schools directory table"
                  tabIndex={0}
                  style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%" }}
                >
                  <p className="govuk-body-s govuk-!-margin-bottom-2">On smaller screens, scroll horizontally to view all columns.</p>
                  <table className="govuk-table" style={{ minWidth: "720px", width: "100%" }}>
                  <caption className="govuk-table__caption govuk-visually-hidden">Imported schools and verification details</caption>
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header">School</th>
                      <th scope="col" className="govuk-table__header">Level and type</th>
                      <th scope="col" className="govuk-table__header">Location</th>
                      <th scope="col" className="govuk-table__header">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {schools.map((school) => (
                      <Fragment key={school.id}>
                        <tr className="govuk-table__row">
                          <td className="govuk-table__cell">
                            <Link className="govuk-link govuk-!-font-weight-bold" href={adminPath(`schools/${school.id}`)}>{school.official_name}</Link><br /><span className={`govuk-tag ${school.is_published ? "govuk-tag--green" : "govuk-tag--grey"}`}>{school.is_published ? "Published" : "Unpublished"}</span><br />
                            <span className="govuk-body-s">{prettyLabel(school.ownership)}</span>
                          </td>
                          <td className="govuk-table__cell">
                            {school.main_tier ? prettyLabel(school.main_tier) : "Not recorded"}<br />
                            <span className="govuk-body-s">{prettyLabel(school.institution_type)}</span>
                          </td>
                          <td className="govuk-table__cell">
                            {[school.ward, school.canonical_sub_county ?? school.sub_county, school.canonical_county ?? school.county].filter(Boolean).join(", ") || "-"}
                            {school.physical_address && <><br /><span className="govuk-body-s">{school.physical_address}</span></>}
                          </td>
                          <td className="govuk-table__cell">
                            <strong className={`govuk-tag ${school.verification_status === "cross_source_match" ? "govuk-tag--green" : "govuk-tag--yellow"}`}>
                              {prettyLabel(school.verification_status)}
                            </strong><br />
                            <span className="govuk-body-s">{school.source_count} source{school.source_count === 1 ? "" : "s"}</span>
                          </td>
                        </tr>
                        <tr className="govuk-table__row">
                          <td className="govuk-table__cell" colSpan={4}>
                            <details className="govuk-details govuk-!-margin-bottom-0">
                              <summary className="govuk-details__summary">
                                <span className="govuk-details__summary-text">View all available details</span>
                              </summary>
                              <div className="govuk-details__text"><SchoolDetails school={school} /></div>
                            </details>
                          </td>
                        </tr>
                      </Fragment>
                    ))}
                  </tbody>
                  </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  const id = `filter-${label.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <div className="govuk-grid-column-one-quarter">
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--s" htmlFor={id}>{label}</label>
        <select className="govuk-select govuk-!-width-full" id={id} value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">All</option>
          {options.map((option) => <option key={option} value={option}>{prettyLabel(option)}</option>)}
        </select>
      </div>
    </div>
  );
}

function OptionFilterSelect({ label, value, onChange, options, disabled = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  const id = `filter-${label.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <div className="govuk-grid-column-one-quarter">
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--s" htmlFor={id}>{label}</label>
        <select
          className="govuk-select govuk-!-width-full"
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">All</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = paginationItems(currentPage, totalPages);
  const goToPage = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="govuk-pagination govuk-!-margin-top-6" aria-label="Schools results pagination">
      {currentPage > 1 && (
        <div className="govuk-pagination__prev">
          <a
            className="govuk-link govuk-pagination__link"
            href={`?page=${currentPage - 1}`}
            rel="prev"
            onClick={(event) => { event.preventDefault(); goToPage(currentPage - 1); }}
          >
            <span className="govuk-pagination__link-title">Previous</span>
          </a>
        </div>
      )}

      <ul className="govuk-pagination__list">
        {pages.map((item, index) => item === "ellipsis" ? (
          <li className="govuk-pagination__item govuk-pagination__item--ellipses" key={`ellipsis-${index}`}>
            &ctdot;
          </li>
        ) : (
          <li
            className={`govuk-pagination__item ${item === currentPage ? "govuk-pagination__item--current" : ""}`}
            key={item}
          >
            <a
              className="govuk-link govuk-pagination__link"
              href={`?page=${item}`}
              aria-label={`Page ${item}`}
              aria-current={item === currentPage ? "page" : undefined}
              onClick={(event) => { event.preventDefault(); goToPage(item); }}
            >
              {item}
            </a>
          </li>
        ))}
      </ul>

      {currentPage < totalPages && (
        <div className="govuk-pagination__next">
          <a
            className="govuk-link govuk-pagination__link"
            href={`?page=${currentPage + 1}`}
            rel="next"
            onClick={(event) => { event.preventDefault(); goToPage(currentPage + 1); }}
          >
            <span className="govuk-pagination__link-title">Next</span>
          </a>
        </div>
      )}
    </nav>
  );
}

function paginationItems(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const visible = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const pages = [...visible].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const items: (number | "ellipsis")[] = [];

  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) items.push("ellipsis");
    items.push(page);
  });
  return items;
}

function SchoolDetails({ school }: { school: SchoolDirectoryRow }) {
  return (
    <div className="govuk-grid-row">
      <DetailGroup title="Identity" items={[
        ["School ID", school.id], ["NEMIS code", school.nemis_code],
        ["TSC code", school.tsc_code], ["KNEC code", school.knec_code],
        ["Other source identifiers", school.identifiers],
      ]} />
      <DetailGroup title="Location" items={[
        ["County", school.canonical_county ?? school.county],
        ["Sub-county", school.canonical_sub_county ?? school.sub_county],
        ["Constituency", school.constituency], ["Ward", school.ward],
        ["District", school.district], ["Education zone", school.zone],
        ["Location", school.location_name], ["Sub-location", school.sub_location_name],
        ["Physical address", school.physical_address], ["Postal address", school.postal_address],
        ["Latitude", school.latitude], ["Longitude", school.longitude],
        ["Urban/rural", school.geographic_setting],
      ]} />
      <DetailGroup title="Level and operations" items={[
        ["Main tier", school.main_tier], ["Levels offered", school.levels],
        ["Multiple levels", school.multi_level_flag], ["MoE category", school.moe_category],
        ["Gender type", school.gender_type], ["Accommodation", school.accommodation_type],
        ["Sponsor", school.sponsor_name], ["Religious affiliation", school.religious_affiliation],
        ["Registration status", school.registration_status], ["Operational status", school.operational_status],
        ["Special-needs status", school.special_needs_status], ["SNE categories", school.sne_categories],
      ]} />
      <DetailGroup title="Capacity, infrastructure and contacts" items={[
        ["Total enrolment", school.total_enrollment], ["Total teachers", school.total_teachers],
        ["TSC teachers", school.tsc_teachers], ["BOM teachers", school.bom_teachers],
        ["Water source", school.water_source], ["Power source", school.power_source],
        ["Internet connectivity", school.internet_connectivity], ["Public phone", school.public_phone],
        ["Public email", school.public_email], ["Website", school.website_url],
      ]} />
    </div>
  );
}

function DetailGroup({ title, items }: { title: string; items: [string, unknown][] }) {
  return (
    <div className="govuk-grid-column-one-half govuk-!-margin-bottom-5">
      <h3 className="govuk-heading-s">{title}</h3>
      <dl className="govuk-summary-list">
        {items.map(([term, value]) => (
          <div className="govuk-summary-list__row" key={term}>
            <dt className="govuk-summary-list__key">{term}</dt>
            <dd className="govuk-summary-list__value">{displayValue(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.map(String).join(", ") : "-";
  if (typeof value === "string" && value.includes("_")) return prettyLabel(value);
  return String(value);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message) return message;
  }
  return "The schools could not be loaded.";
}
