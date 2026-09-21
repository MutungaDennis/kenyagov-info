"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import type {
  PresidentialRecordKind,
  PresidentialSpeechFinderRow,
  PresidentialSpeechSearchParams,
} from "@/lib/presidential-speeches/queries";

type FilterOption = {
  slug: string;
  name: string;
};

type PublicationTypeOption = FilterOption & {
  kinds: PresidentialRecordKind[];
};

type Props = {
  params: PresidentialSpeechSearchParams;
  rows: Array<PresidentialSpeechFinderRow & { href: string }>;
  total: number;
  page: number;
  pageSize: number;
  presidents: FilterOption[];
  years: number[];
  kinds: Array<{ slug: PresidentialRecordKind; name: string }>;
  types: PublicationTypeOption[];
  topics: FilterOption[];
  counties: string[];
};

function buildHref(
  params: PresidentialSpeechSearchParams,
  changes: Partial<PresidentialSpeechSearchParams>,
) {
  const next = { ...params, ...changes };
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(next)) {
    if (value && value.trim() !== "") search.set(key, value);
  }

  const query = search.toString();
  return `/government/presidency/speeches${query ? `?${query}` : ""}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  }).format(new Date(`${date}T12:00:00+03:00`));
}

function kindLabel(kind: PresidentialRecordKind) {
  switch (kind) {
    case "communique":
      return "Communiqué";
    case "message":
      return "Message";
    case "speech":
    default:
      return "Speech";
  }
}

function FilterDetails({
  title,
  open = false,
  children,
}: {
  title: string;
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="govuk-details govuk-!-margin-bottom-4" open={open}>
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">{title}</span>
      </summary>
      <div className="govuk-details__text govuk-!-padding-bottom-0">
        {children}
      </div>
    </details>
  );
}

export default function PresidentialSpeechesFinder({
  params,
  rows,
  total,
  page,
  pageSize,
  presidents,
  years,
  kinds,
  types,
  topics,
  counties,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginationPages = Array.from(
    new Set(
      [1, page - 1, page, page + 1, totalPages].filter(
        (value) => value >= 1 && value <= totalPages,
      ),
    ),
  ).sort((a, b) => a - b);

  const initialKind: PresidentialRecordKind | "" =
    params.kind === "speech" ||
    params.kind === "communique" ||
    params.kind === "message"
      ? params.kind
      : "";

  const [selectedKind, setSelectedKind] =
    useState<PresidentialRecordKind | "">(initialKind);
  const [selectedType, setSelectedType] = useState(params.type ?? "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const coordinatedTypes = selectedKind
    ? types.filter((type) => type.kinds.includes(selectedKind))
    : types;

  function handleKindChange(nextKind: PresidentialRecordKind | "") {
    setSelectedKind(nextKind);

    if (!nextKind) return;

    const currentTypeStillApplies = types.some(
      (type) =>
        type.slug === selectedType && type.kinds.includes(nextKind),
    );

    if (!currentTypeStillApplies) setSelectedType("");
  }

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-one-third govuk-!-display-none-print">
        <form method="get" action="/government/presidency/speeches">
          <input type="hidden" name="page" value="1" />

          <div className="govuk-form-group govuk-!-margin-bottom-6">
            <label className="govuk-label govuk-label--s" htmlFor="q">
              Search publications
            </label>
            <input
              className="govuk-input"
              id="q"
              name="q"
              type="search"
              defaultValue={params.q ?? ""}
            />
          </div>

          <h2 className="finder-filters-desktop-heading govuk-heading-m govuk-!-margin-bottom-4">
            Filter
          </h2>

          <button
            type="button"
            className="finder-filters-mobile-toggle"
            aria-expanded={mobileFiltersOpen}
            aria-controls="presidential-filter-options"
            onClick={() => setMobileFiltersOpen((open) => !open)}
          >
            <span>Filter</span>
            <span
              className={`finder-filters-mobile-chevron ${
                mobileFiltersOpen ? "finder-filters-mobile-chevron--open" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          <div
            id="presidential-filter-options"
            className={`finder-filters-content ${
              mobileFiltersOpen ? "finder-filters-content--open" : ""
            }`}
          >
            <FilterDetails title="Content type" open>
            <div className="govuk-form-group govuk-!-margin-bottom-3">
              <label className="govuk-label" htmlFor="kind">
                Content type
              </label>
              <select
                className="govuk-select govuk-!-width-full"
                id="kind"
                name="kind"
                value={selectedKind}
                onChange={(event) =>
                  handleKindChange(
                    event.target.value as PresidentialRecordKind | "",
                  )
                }
              >
                <option value="">All content</option>
                {kinds.map((kind) => (
                  <option key={kind.slug} value={kind.slug}>
                    {kind.name}
                  </option>
                ))}
              </select>
            </div>
          </FilterDetails>

          <FilterDetails title="Publication type" open>
            <div className="govuk-form-group govuk-!-margin-bottom-3">
              <label className="govuk-label" htmlFor="type">
                Publication type
              </label>
              <div id="type-hint" className="govuk-hint">
                {selectedKind
                  ? `Showing publication types used by ${kindLabel(selectedKind).toLowerCase()} records.`
                  : "Choose a content type to narrow these options."}
              </div>
              <select
                className="govuk-select govuk-!-width-full"
                id="type"
                name="type"
                aria-describedby="type-hint"
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
              >
                <option value="">All publication types</option>
                {coordinatedTypes.map((type) => (
                  <option key={type.slug} value={type.slug}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </FilterDetails>

          <FilterDetails title="President">
            <div className="govuk-form-group govuk-!-margin-bottom-3">
              <label className="govuk-label" htmlFor="president">
                President
              </label>
              <select
                className="govuk-select govuk-!-width-full"
                id="president"
                name="president"
                defaultValue={params.president ?? ""}
              >
                <option value="">All Presidents</option>
                {presidents.map((president) => (
                  <option key={president.slug} value={president.slug}>
                    {president.name}
                  </option>
                ))}
              </select>
            </div>
          </FilterDetails>

          <FilterDetails title="Year">
            <div className="govuk-form-group govuk-!-margin-bottom-3">
              <label className="govuk-label" htmlFor="year">
                Year
              </label>
              <select
                className="govuk-select govuk-!-width-full"
                id="year"
                name="year"
                defaultValue={params.year ?? ""}
              >
                <option value="">All years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </FilterDetails>

          <FilterDetails title="Topic">
            <div className="govuk-form-group govuk-!-margin-bottom-3">
              <label className="govuk-label" htmlFor="topic">
                Topic
              </label>
              <select
                className="govuk-select govuk-!-width-full"
                id="topic"
                name="topic"
                defaultValue={params.topic ?? ""}
              >
                <option value="">All topics</option>
                {topics.map((topic) => (
                  <option key={topic.slug} value={topic.slug}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>
          </FilterDetails>

          <FilterDetails title="County">
            <div className="govuk-form-group govuk-!-margin-bottom-3">
              <label className="govuk-label" htmlFor="county">
                County
              </label>
              <select
                className="govuk-select govuk-!-width-full"
                id="county"
                name="county"
                defaultValue={params.county ?? ""}
              >
                <option value="">All counties</option>
                {counties.map((county) => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </select>
            </div>
          </FilterDetails>

          <button
            className="govuk-button govuk-!-margin-bottom-3"
            data-module="govuk-button"
            type="submit"
          >
            Apply filters
          </button>

          <div>
            <Link href="/government/presidency/speeches" className="govuk-link">
              Clear filters
            </Link>
          </div>
          </div>


        </form>
      </div>

      <div className="govuk-grid-column-two-thirds">
        <section aria-label="Presidential publication results">
          <p
            className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-6"
            aria-live="polite"
          >
            {total === 1
              ? "1 publication found"
              : `${total.toLocaleString("en-KE")} publications found`}
            {params.q?.trim() ? ` for “${params.q.trim()}”` : ""}
          </p>

          {rows.length > 0 ? (
            <ol className="govuk-list govuk-list--spaced">
              {rows.map((record) => (
                <li key={record.id} className="govuk-!-margin-bottom-7">
                  <strong className="govuk-tag govuk-tag--grey govuk-!-margin-bottom-2">
                    {kindLabel(record.recordKind)}
                  </strong>

                  <h3 className="govuk-heading-m govuk-!-margin-bottom-1">
                    <Link
                      href={record.href}
                      className="govuk-link govuk-link--no-visited-state"
                    >
                      {record.title}
                    </Link>
                  </h3>

                  <p className="govuk-body-s govuk-!-margin-bottom-2">
                    <time dateTime={record.speechDate}>
                      {formatDate(record.speechDate)}
                    </time>
                    {record.president
                      ? ` — ${record.president.preferredName ?? record.president.fullName}`
                      : ""}
                  </p>

                  {(record.speechType?.name || record.occasion) && (
                    <p className="govuk-body-s govuk-!-margin-bottom-2">
                      {record.speechType?.name ?? ""}
                      {record.speechType?.name && record.occasion ? " · " : ""}
                      {record.occasion ?? ""}
                    </p>
                  )}

                  {(record.locality ||
                    record.county ||
                    record.country !== "Kenya") && (
                    <p className="govuk-body-s govuk-!-margin-bottom-2">
                      {[record.locality, record.county, record.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}

                  {(record.excerpt || record.summary) && (
                    <p className="govuk-body govuk-!-margin-bottom-0">
                      {record.excerpt ?? record.summary}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <div className="govuk-inset-text">
              No Presidential publications match your search and selected filters.
              Try a broader search or clear one or more filters.
            </div>
          )}
        </section>

        {totalPages > 1 && (
          <nav className="govuk-pagination" aria-label="Pagination">
            {page > 1 && (
              <div className="govuk-pagination__prev">
                <Link
                  className="govuk-link govuk-pagination__link"
                  href={buildHref(params, { page: String(page - 1) })}
                  rel="prev"
                >
                  <span className="govuk-pagination__link-title">Previous</span>
                </Link>
              </div>
            )}

            <ul className="govuk-pagination__list">
              {paginationPages.map((pageNumber) => (
                <li
                  key={pageNumber}
                  className={`govuk-pagination__item ${
                    pageNumber === page ? "govuk-pagination__item--current" : ""
                  }`}
                >
                  <Link
                    className="govuk-link govuk-pagination__link"
                    href={buildHref(params, { page: String(pageNumber) })}
                    aria-label={`Page ${pageNumber}`}
                    aria-current={pageNumber === page ? "page" : undefined}
                  >
                    {pageNumber}
                  </Link>
                </li>
              ))}
            </ul>

            {page < totalPages && (
              <div className="govuk-pagination__next">
                <Link
                  className="govuk-link govuk-pagination__link"
                  href={buildHref(params, { page: String(page + 1) })}
                  rel="next"
                >
                  <span className="govuk-pagination__link-title">Next</span>
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>

      <style jsx>{`
        .finder-filters-mobile-toggle {
          display: none;
        }

        .finder-filters-content {
          display: block;
        }

        @media (max-width: 40.0525em) {
          .finder-filters-desktop-heading {
            display: none;
          }

          .finder-filters-mobile-toggle {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            margin: 0 0 20px;
            padding: 10px 0;
            border: 0;
            border-top: 1px solid #b1b4b6;
            border-bottom: 1px solid #b1b4b6;
            background: transparent;
            font: inherit;
            font-weight: 700;
            text-align: left;
            cursor: pointer;
          }

          .finder-filters-mobile-chevron {
            width: 10px;
            height: 10px;
            margin-right: 4px;
            border-right: 2px solid currentColor;
            border-bottom: 2px solid currentColor;
            transform: rotate(45deg) translateY(-2px);
            transition: transform 120ms ease;
          }

          .finder-filters-mobile-chevron--open {
            transform: rotate(225deg) translate(-2px, -2px);
          }

          .finder-filters-mobile-toggle:focus {
            outline: 3px solid #ffdd00;
            outline-offset: 0;
            background: #ffdd00;
          }

          .finder-filters-content {
            display: none;
          }

          .finder-filters-content--open {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
