"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";
import { REVIEW_STATUSES } from "@/lib/gazette/relationship-types";

const PAGE_SIZE = 50;

type Issue = {
  year: number;
  volume: string;
  issue_number: number;
  date: string;
  is_special_issue?: boolean | null;
};

type Row = {
  id: string;
  notice_number: number;
  title: string;
  notice_type?: string | null;
  transcription_status?: string | null;
  relationship_review_status?: string | null;
  gazette_issues: Issue | Issue[] | null;
};

function issueOf(row: Row): Issue | null {
  if (Array.isArray(row.gazette_issues)) return row.gazette_issues[0] || null;
  return row.gazette_issues || null;
}

export default function GazetteAdminPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [year, setYear] = useState("");
  const [issue, setIssue] = useState("");
  const [review, setReview] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });

      if (q) params.set("q", q);
      if (year) params.set("year", year);
      if (issue) params.set("issue", issue);
      if (review) params.set("review_status", review);

      const res = await fetch(`/api/admin/gazette/notices?${params.toString()}`, {
        credentials: "include",
        cache: "no-store",
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load Gazette notices");
      }

      setRows(json.data || []);
      setTotal(json.total || 0);
    } catch (err) {
      setRows([]);
      setTotal(0);
      setError(
        err instanceof Error ? err.message : "Failed to load Gazette notices",
      );
    } finally {
      setLoading(false);
    }
  }, [offset, q, year, issue, review]);

  useEffect(() => {
    load();
  }, [load]);

  const applyFilters = (event: FormEvent) => {
    event.preventDefault();
    setOffset(0);
    setQ(searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput("");
    setQ("");
    setYear("");
    setIssue("");
    setReview("");
    setOffset(0);
  };

  const hasFilters = Boolean(q || year || issue || review);

  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="govuk-width-container">
      <Link href={adminPath()} className="govuk-back-link">
        Back to Admin
      </Link>

      <main className="govuk-main-wrapper" id="main-content">
        <h1 className="govuk-heading-xl">Kenya Gazette</h1>
        <p className="govuk-body-l">
          Find Gazette notices, edit their transcription and metadata, and
          manage links to people, institutions, Corrigenda and other notices.
        </p>

        {error && (
          <div
            className="govuk-error-summary"
            role="alert"
            aria-labelledby="gazette-admin-error-title"
          >
            <h2
              id="gazette-admin-error-title"
              className="govuk-error-summary__title"
            >
              There is a problem
            </h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">{error}</p>
            </div>
          </div>
        )}

        <section
          aria-labelledby="gazette-filter-heading"
          className="govuk-!-margin-bottom-7"
        >
          <h2 id="gazette-filter-heading" className="govuk-heading-l">
            Find Gazette notices
          </h2>

          <form onSubmit={applyFilters}>
            <div className="govuk-form-group">
              <label
                className="govuk-label govuk-label--m"
                htmlFor="gazette-search"
              >
                Search notices
              </label>
              <div id="gazette-search-hint" className="govuk-hint">
                Search by Gazette Notice number, title, notice type or legal
                basis.
              </div>
              <input
                id="gazette-search"
                name="q"
                className="govuk-input govuk-!-width-two-thirds"
                aria-describedby="gazette-search-hint"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="For example: 444, Appointment, State Corporations Act"
              />
            </div>

            <fieldset className="govuk-fieldset govuk-!-margin-bottom-5">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                <span className="govuk-fieldset__heading">
                  Narrow the results
                </span>
              </legend>

              <div className="govuk-hint">
                Use these filters on their own or together with the search box.
              </div>

              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-quarter">
                  <div className="govuk-form-group">
                    <label
                      className="govuk-label govuk-label--s"
                      htmlFor="gazette-year"
                    >
                      Gazette year
                    </label>
                    <div id="gazette-year-hint" className="govuk-hint">
                      For example, 2024
                    </div>
                    <input
                      id="gazette-year"
                      name="year"
                      className="govuk-input govuk-input--width-5"
                      inputMode="numeric"
                      aria-describedby="gazette-year-hint"
                      value={year}
                      onChange={(event) => {
                        setYear(event.target.value);
                        setOffset(0);
                      }}
                    />
                  </div>
                </div>

                <div className="govuk-grid-column-one-quarter">
                  <div className="govuk-form-group">
                    <label
                      className="govuk-label govuk-label--s"
                      htmlFor="gazette-issue"
                    >
                      Issue number
                    </label>
                    <div id="gazette-issue-hint" className="govuk-hint">
                      For example, 8
                    </div>
                    <input
                      id="gazette-issue"
                      name="issue"
                      className="govuk-input govuk-input--width-5"
                      inputMode="numeric"
                      aria-describedby="gazette-issue-hint"
                      value={issue}
                      onChange={(event) => {
                        setIssue(event.target.value);
                        setOffset(0);
                      }}
                    />
                  </div>
                </div>

                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label
                      className="govuk-label govuk-label--s"
                      htmlFor="gazette-linking-status"
                    >
                      Relationship review status
                    </label>
                    <div id="gazette-linking-status-hint" className="govuk-hint">
                      Shows whether people, institutions and related Gazette
                      notices have been reviewed and linked.
                    </div>
                    <select
                      id="gazette-linking-status"
                      name="review_status"
                      className="govuk-select govuk-!-width-full"
                      aria-describedby="gazette-linking-status-hint"
                      value={review}
                      onChange={(event) => {
                        setReview(event.target.value);
                        setOffset(0);
                      }}
                    >
                      <option value="">All relationship statuses</option>
                      {REVIEW_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </fieldset>

            <div className="govuk-button-group">
              <button className="govuk-button" type="submit">
                Apply search and filters
              </button>

              {hasFilters && (
                <button
                  className="govuk-button govuk-button--secondary"
                  type="button"
                  onClick={clearFilters}
                >
                  Clear search and filters
                </button>
              )}
            </div>
          </form>
        </section>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l" />

        <section aria-labelledby="gazette-results-heading">
          <h2 id="gazette-results-heading" className="govuk-heading-l">
            Gazette notices
          </h2>

          <p className="govuk-body">
            {loading
              ? "Loading Gazette notices…"
              : `Showing ${rows.length} of ${total.toLocaleString()} notices`}
          </p>

          {!loading && hasFilters && (
            <div className="govuk-inset-text">
              <strong>Current filters:</strong>
              <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-0">
                {q && <li>Search: “{q}”</li>}
                {year && <li>Year: {year}</li>}
                {issue && <li>Issue: {issue}</li>}
                {review && <li>Relationship review status: {review}</li>}
              </ul>
            </div>
          )}

          {!loading && rows.length > 0 && (
            <div className="govuk-table-wrapper">
              <table className="govuk-table">
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">
                      Gazette notice
                    </th>
                    <th scope="col" className="govuk-table__header">
                      Issue and date
                    </th>
                    <th scope="col" className="govuk-table__header">
                      Title
                    </th>
                    <th scope="col" className="govuk-table__header">
                      Relationship review
                    </th>
                    <th scope="col" className="govuk-table__header">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {rows.map((row) => {
                    const issueRow = issueOf(row);
                    const status =
                      row.relationship_review_status || "Not reviewed";

                    return (
                      <tr className="govuk-table__row" key={row.id}>
                        <td className="govuk-table__cell">
                          <strong>G.N. {row.notice_number}</strong>
                        </td>

                        <td className="govuk-table__cell">
                          {issueRow ? (
                            <>
                              <strong>
                                {issueRow.year}, Issue {issueRow.issue_number}
                              </strong>
                              <div className="govuk-hint govuk-!-margin-bottom-0">
                                Vol. {issueRow.volume}
                                {issueRow.is_special_issue
                                  ? " · Special Issue"
                                  : ""}
                                <br />
                                {new Date(
                                  issueRow.date,
                                ).toLocaleDateString("en-KE", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </div>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="govuk-table__cell">
                          {row.title}
                          {row.notice_type && (
                            <div className="govuk-hint govuk-!-margin-bottom-0">
                              {row.notice_type}
                            </div>
                          )}
                        </td>

                        <td className="govuk-table__cell">
                          <strong
                            className={`govuk-tag ${
                              status === "Reviewed"
                                ? "govuk-tag--green"
                                : status === "Needs attention"
                                  ? "govuk-tag--red"
                                  : status === "Partially linked"
                                    ? "govuk-tag--blue"
                                    : "govuk-tag--grey"
                            }`}
                          >
                            {status}
                          </strong>
                        </td>

                        <td className="govuk-table__cell">
                          <Link
                            className="govuk-link"
                            href={adminPath(`gazette/${row.id}`)}
                          >
                            Edit
                          </Link>
                          {" · "}
                          <Link
                            className="govuk-link"
                            href={adminPath(
                              `gazette/${row.id}/relationships`,
                            )}
                          >
                            Manage relationships
                          </Link>
                          {issueRow && (
                            <>
                              {" · "}
                              <Link
                                className="govuk-link"
                                target="_blank"
                                href={`/kenya-gazette/${issueRow.year}/${issueRow.issue_number}/notice/${row.notice_number}`}
                              >
                                View public
                              </Link>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && rows.length === 0 && (
            <div className="govuk-inset-text">
              No Gazette notices match the current search and filters.
            </div>
          )}

          {totalPages > 1 && (
            <nav
              className="govuk-pagination"
              aria-label="Gazette notice results pages"
            >
              {page > 1 && (
                <div className="govuk-pagination__prev">
                  <button
                    type="button"
                    className="govuk-link govuk-pagination__link app-button-as-link"
                    onClick={() =>
                      setOffset(Math.max(0, offset - PAGE_SIZE))
                    }
                  >
                    <span className="govuk-pagination__link-title">
                      Previous
                    </span>
                  </button>
                </div>
              )}

              <ul className="govuk-pagination__list">
                <li className="govuk-pagination__item govuk-pagination__item--current">
                  <span className="govuk-body">
                    Page {page} of {totalPages}
                  </span>
                </li>
              </ul>

              {page < totalPages && (
                <div className="govuk-pagination__next">
                  <button
                    type="button"
                    className="govuk-link govuk-pagination__link app-button-as-link"
                    onClick={() => setOffset(offset + PAGE_SIZE)}
                  >
                    <span className="govuk-pagination__link-title">
                      Next
                    </span>
                  </button>
                </div>
              )}
            </nav>
          )}
        </section>
      </main>
    </div>
  );
}
