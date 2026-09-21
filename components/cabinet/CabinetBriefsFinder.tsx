"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useState,
} from "react";

import type {
  CabinetBriefFinderRow,
  CabinetBriefSearchParams,
} from "@/lib/cabinet/queries";

type Publication =
  CabinetBriefFinderRow & {
    href: string;
  };

type Props = {
  params: CabinetBriefSearchParams;
  rows: Publication[];
  total: number;
  page: number;
  pageSize: number;
  years: number[];
  labels: string[];
};

const dateFormatter =
  new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  });

function formatDate(value: string) {
  return dateFormatter.format(
    new Date(`${value}T12:00:00+03:00`),
  );
}

export default function CabinetBriefsFinder({
  params,
  rows,
  total,
  page,
  pageSize,
  years,
  labels,
}: Props) {
  const router = useRouter();

  const [query, setQuery] = useState(
    params.query ?? "",
  );

  const [label, setLabel] = useState(
    params.label ?? "",
  );

  const [year, setYear] = useState(
    params.year ?? "",
  );

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize),
  );

  const firstResult =
    total === 0
      ? 0
      : (page - 1) * pageSize + 1;

  const lastResult = Math.min(
    page * pageSize,
    total,
  );

  const hasFilters = Boolean(
    params.query ||
      params.label ||
      params.year,
  );

  function buildUrl(
    targetPage = 1,
  ) {
    const search =
      new URLSearchParams();

    const searchQuery =
      query.trim();

    if (searchQuery) {
      search.set(
        "query",
        searchQuery,
      );
    }

    if (label) {
      search.set(
        "label",
        label,
      );
    }

    if (year) {
      search.set(
        "year",
        year,
      );
    }

    if (targetPage > 1) {
      search.set(
        "page",
        String(targetPage),
      );
    }

    const queryString =
      search.toString();

    return `/government/cabinet/briefs${
      queryString
        ? `?${queryString}`
        : ""
    }`;
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    router.push(
      buildUrl(1),
    );
  }

  function clearFilters() {
    setQuery("");
    setLabel("");
    setYear("");

    router.push(
      "/government/cabinet/briefs",
    );
  }

  return (
    <div className="govuk-grid-row">
      {/* LEFT COLUMN — FILTERS */}
      <div className="govuk-grid-column-one-third">
        <aside
          aria-labelledby="cabinet-filters-heading"
          className="govuk-!-margin-bottom-8"
        >
          <h2
            id="cabinet-filters-heading"
            className="govuk-heading-m"
          >
            Filter Cabinet briefs
          </h2>

          <form
            onSubmit={handleSubmit}
          >
            <div className="govuk-form-group">
              <label
                className="govuk-label govuk-label--s"
                htmlFor="cabinet-search"
              >
                Search
              </label>

              <div
                id="cabinet-search-hint"
                className="govuk-hint"
              >
                Search Cabinet communications
              </div>

              <input
                className="govuk-input"
                id="cabinet-search"
                name="query"
                type="search"
                value={query}
                aria-describedby="cabinet-search-hint"
                onChange={(event) =>
                  setQuery(
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="govuk-form-group">
              <label
                className="govuk-label govuk-label--s"
                htmlFor="publication-label"
              >
                Publication type
              </label>

              <select
                className="govuk-select govuk-!-width-full"
                id="publication-label"
                name="label"
                value={label}
                onChange={(event) =>
                  setLabel(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  All publication types
                </option>

                {labels.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="govuk-form-group">
              <label
                className="govuk-label govuk-label--s"
                htmlFor="publication-year"
              >
                Year
              </label>

              <select
                className="govuk-select govuk-!-width-full"
                id="publication-year"
                name="year"
                value={year}
                onChange={(event) =>
                  setYear(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  All years
                </option>

                {years.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="govuk-button govuk-!-margin-bottom-3"
              type="submit"
              data-module="govuk-button"
            >
              Apply filters
            </button>

            {hasFilters && (
              <div>
                <button
                  className="govuk-button govuk-button--secondary"
                  type="button"
                  data-module="govuk-button"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              </div>
            )}
          </form>
        </aside>
      </div>

      {/* RIGHT COLUMN — RESULTS */}
      <div className="govuk-grid-column-two-thirds">
        <div className="govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-l govuk-!-margin-bottom-2">
            Cabinet communications
          </h2>

          {total > 0 ? (
            <p className="govuk-body-s">
              Showing{" "}
              {firstResult.toLocaleString(
                "en-KE",
              )}{" "}
              to{" "}
              {lastResult.toLocaleString(
                "en-KE",
              )}{" "}
              of{" "}
              {total.toLocaleString(
                "en-KE",
              )}{" "}
              {total === 1
                ? "document"
                : "documents"}
            </p>
          ) : (
            <p className="govuk-body-s">
              No documents found
            </p>
          )}
        </div>

        {rows.length > 0 ? (
          <>
            <div>
              {rows.map((record) => (
                <article
                  key={record.id}
                  className="govuk-!-margin-bottom-8"
                >
                  <p className="govuk-body-s govuk-!-margin-bottom-1">
                    <strong>
                      {record.publicationLabel}
                    </strong>

                    {" — "}

                    <time
                      dateTime={
                        record.briefDate
                      }
                    >
                      {formatDate(
                        record.briefDate,
                      )}
                    </time>
                  </p>

                  <h3 className="govuk-heading-m govuk-!-margin-bottom-2">
                    <Link
                      href={record.href}
                      className="govuk-link govuk-link--no-visited-state"
                    >
                      {record.title}
                    </Link>
                  </h3>

                  {(record.excerpt ||
                    record.summary) && (
                    <p className="govuk-body govuk-!-margin-bottom-2">
                      {record.excerpt ||
                        record.summary}
                    </p>
                  )}

                  {(record.venue ||
                    record.locality) && (
                    <p className="govuk-body-s govuk-!-margin-bottom-0">
                      {[
                        record.venue,
                        record.locality,
                      ]
                        .filter(Boolean)
                        .filter(
                          (
                            value,
                            index,
                            array,
                          ) =>
                            array.indexOf(
                              value,
                            ) === index,
                        )
                        .join(", ")}
                    </p>
                  )}
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                className="govuk-pagination govuk-!-margin-top-8"
                aria-label="Pagination"
              >
                {page > 1 && (
                  <div className="govuk-pagination__prev">
                    <Link
                      className="govuk-link govuk-pagination__link"
                      href={buildUrl(
                        page - 1,
                      )}
                      rel="prev"
                    >
                      <span className="govuk-pagination__link-title">
                        Previous
                      </span>
                    </Link>
                  </div>
                )}

                <ul className="govuk-pagination__list">
                  {Array.from(
                    {
                      length:
                        totalPages,
                    },
                    (_, index) =>
                      index + 1,
                  )
                    .filter(
                      (pageNumber) =>
                        pageNumber === 1 ||
                        pageNumber ===
                          totalPages ||
                        Math.abs(
                          pageNumber -
                            page,
                        ) <= 1,
                    )
                    .map(
                      (pageNumber) => (
                        <li
                          key={pageNumber}
                          className={[
                            "govuk-pagination__item",
                            pageNumber ===
                            page
                              ? "govuk-pagination__item--current"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          <Link
                            className="govuk-link govuk-pagination__link"
                            href={buildUrl(
                              pageNumber,
                            )}
                            aria-label={`Page ${pageNumber}`}
                            aria-current={
                              pageNumber ===
                              page
                                ? "page"
                                : undefined
                            }
                          >
                            {pageNumber}
                          </Link>
                        </li>
                      ),
                    )}
                </ul>

                {page < totalPages && (
                  <div className="govuk-pagination__next">
                    <Link
                      className="govuk-link govuk-pagination__link"
                      href={buildUrl(
                        page + 1,
                      )}
                      rel="next"
                    >
                      <span className="govuk-pagination__link-title">
                        Next
                      </span>
                    </Link>
                  </div>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="govuk-!-margin-bottom-8">
            <h3 className="govuk-heading-m">
              No Cabinet communications found
            </h3>

            <p className="govuk-body">
              Try changing your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}