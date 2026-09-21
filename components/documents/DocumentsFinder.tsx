import Link from "next/link";

import type {
  DocumentCategoryFilter,
  DocumentFinderRow,
  DocumentSearchParams,
  DocumentTopicFilter,
  DocumentTypeFilter,
} from "@/lib/documents/queries";

type DocumentsFinderProps = {
  params: DocumentSearchParams;
  rows: DocumentFinderRow[];
  total: number;
  page: number;
  pageSize: number;
  categories: DocumentCategoryFilter[];
  types: DocumentTypeFilter[];
  topics: DocumentTopicFilter[];
};

function hrefWith(
  params: DocumentSearchParams,
  changes: Record<
    string,
    string | undefined
  >,
) {
  const searchParams =
    new URLSearchParams();

  const merged = {
    ...params,
    ...changes,
  } as Record<
    string,
    string | undefined
  >;

  Object.entries(merged).forEach(
    ([key, value]) => {
      if (value) {
        searchParams.set(key, value);
      }
    },
  );

  const queryString =
    searchParams.toString();

  return queryString
    ? `/documents?${queryString}`
    : "/documents";
}

function getSelectedName(
  options: Array<{
    name: string;
    slug: string;
  }>,
  slug?: string,
) {
  if (!slug) {
    return null;
  }

  return (
    options.find(
      (option) =>
        option.slug === slug,
    )?.name ?? slug
  );
}

function getVisiblePages(
  currentPage: number,
  totalPages: number,
) {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    );
  }

  const pages = new Set<number>();

  pages.add(1);
  pages.add(totalPages);
  pages.add(currentPage);

  if (currentPage > 1) {
    pages.add(currentPage - 1);
  }

  if (currentPage < totalPages) {
    pages.add(currentPage + 1);
  }

  return [...pages].sort(
    (a, b) => a - b,
  );
}

export default function DocumentsFinder({
  params,
  rows,
  total,
  page,
  pageSize,
  categories,
  types,
  topics,
}: DocumentsFinderProps) {
  const pages = Math.max(
    1,
    Math.ceil(total / pageSize),
  );

  const selectedCategory =
    categories.find(
      (category) =>
        category.slug ===
        params.category,
    );

  const selectedCategoryName =
    getSelectedName(
      categories,
      params.category,
    );

  const selectedTypeName =
    getSelectedName(
      types,
      params.type,
    );

  const selectedTopicName =
    getSelectedName(
      topics,
      params.topic,
    );

  /*
   * Once a category has been
   * applied, only show types
   * belonging to that category.
   *
   * With no category selected,
   * show every document type.
   */
  const availableTypes =
    selectedCategory
      ? types.filter(
          (type) =>
            type.category_id ===
            selectedCategory.id,
        )
      : types;

  const hasAppliedFilters =
    Boolean(
      params.category ||
        params.type ||
        params.topic ||
        params.year_from ||
        params.year_to,
    );

  const hasAnySearchState =
    Boolean(
      params.q ||
        params.category ||
        params.type ||
        params.topic ||
        params.year_from ||
        params.year_to ||
        (
          params.sort &&
          params.sort !== "newest"
        ),
    );

  const visiblePages =
    getVisiblePages(page, pages);

  return (
    <div className="govuk-width-container">
      <main
        className="govuk-main-wrapper"
        id="main-content"
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-3">
              Documents
            </h1>

            <p className="govuk-body-l">
              Find policies, plans,
              legislation, reports,
              sessional papers, budgets
              and other official public
              documents.
            </p>
          </div>
        </div>

        <div className="govuk-grid-row">
          {/* Filters */}
          <div className="govuk-grid-column-one-third">
            <form
              action="/documents"
              method="get"
            >
              <div
                className="govuk-!-padding-4 govuk-!-margin-bottom-6"
                style={{
                  backgroundColor:
                    "#f3f2f1",
                  borderTop:
                    "4px solid #1d70b8",
                }}
              >
                <h2 className="govuk-heading-m">
                  Filter documents
                </h2>

                {/* Search */}
                <div className="govuk-form-group">
                  <label
                    className="govuk-label govuk-label--s"
                    htmlFor="documents-search"
                  >
                    Search
                  </label>

                  <div
                    id="documents-search-hint"
                    className="govuk-hint"
                  >
                    Search by title,
                    subject or words in
                    the document.
                  </div>

                  <input
                    className="govuk-input"
                    id="documents-search"
                    name="q"
                    type="search"
                    defaultValue={
                      params.q ?? ""
                    }
                    aria-describedby="documents-search-hint"
                  />
                </div>

                {/* Category */}
                <div className="govuk-form-group">
                  <label
                    className="govuk-label govuk-label--s"
                    htmlFor="document-category"
                  >
                    Document category
                  </label>

                  <div
                    id="document-category-hint"
                    className="govuk-hint"
                  >
                    Choose a broad group
                    of government
                    documents.
                  </div>

                  <select
                    className="govuk-select"
                    id="document-category"
                    name="category"
                    defaultValue={
                      params.category ??
                      ""
                    }
                    aria-describedby="document-category-hint"
                    style={{
                      maxWidth: "100%",
                      width: "100%",
                    }}
                  >
                    <option value="">
                      All document
                      categories
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={
                            category.id
                          }
                          value={
                            category.slug
                          }
                        >
                          {category.name}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                {/* Type */}
                <div className="govuk-form-group">
                  <label
                    className="govuk-label govuk-label--s"
                    htmlFor="document-type"
                  >
                    Document type
                  </label>

                  <div
                    id="document-type-hint"
                    className="govuk-hint"
                  >
                    {selectedCategory
                      ? `Showing types within ${selectedCategory.name}.`
                      : "Choose a specific kind of document."}
                  </div>

                  <select
                    className="govuk-select"
                    id="document-type"
                    name="type"
                    defaultValue={
                      params.type ?? ""
                    }
                    aria-describedby="document-type-hint"
                    style={{
                      maxWidth: "100%",
                      width: "100%",
                    }}
                  >
                    <option value="">
                      All document types
                    </option>

                    {availableTypes.map(
                      (type) => (
                        <option
                          key={type.id}
                          value={
                            type.slug
                          }
                        >
                          {type.name}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                {/* Topic */}
                {topics.length > 0 && (
                  <div className="govuk-form-group">
                    <label
                      className="govuk-label govuk-label--s"
                      htmlFor="document-topic"
                    >
                      Topic
                    </label>

                    <div
                      id="document-topic-hint"
                      className="govuk-hint"
                    >
                      Narrow results by
                      subject.
                    </div>

                    <select
                      className="govuk-select"
                      id="document-topic"
                      name="topic"
                      defaultValue={
                        params.topic ?? ""
                      }
                      aria-describedby="document-topic-hint"
                      style={{
                        maxWidth:
                          "100%",
                        width: "100%",
                      }}
                    >
                      <option value="">
                        All topics
                      </option>

                      {topics.map(
                        (topic) => (
                          <option
                            key={
                              topic.id
                            }
                            value={
                              topic.slug
                            }
                          >
                            {topic.name}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                )}

                {/* Year range */}
                <fieldset className="govuk-fieldset govuk-!-margin-bottom-5">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                    Publication year
                  </legend>

                  <div
                    id="publication-year-hint"
                    className="govuk-hint"
                  >
                    For example, 1960 to
                    1980.
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div className="govuk-form-group govuk-!-margin-bottom-0">
                      <label
                        className="govuk-label"
                        htmlFor="year-from"
                      >
                        From
                      </label>

                      <input
                        className="govuk-input govuk-input--width-4"
                        id="year-from"
                        name="year_from"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        defaultValue={
                          params.year_from ??
                          ""
                        }
                        aria-describedby="publication-year-hint"
                      />
                    </div>

                    <div className="govuk-form-group govuk-!-margin-bottom-0">
                      <label
                        className="govuk-label"
                        htmlFor="year-to"
                      >
                        To
                      </label>

                      <input
                        className="govuk-input govuk-input--width-4"
                        id="year-to"
                        name="year_to"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        defaultValue={
                          params.year_to ??
                          ""
                        }
                        aria-describedby="publication-year-hint"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Sort */}
                <div className="govuk-form-group">
                  <label
                    className="govuk-label govuk-label--s"
                    htmlFor="document-sort"
                  >
                    Sort by
                  </label>

                  <select
                    className="govuk-select"
                    id="document-sort"
                    name="sort"
                    defaultValue={
                      params.sort ??
                      "newest"
                    }
                    style={{
                      maxWidth: "100%",
                      width: "100%",
                    }}
                  >
                    <option value="newest">
                      Newest first
                    </option>

                    <option value="oldest">
                      Oldest first
                    </option>

                    <option value="recently-added">
                      Recently added
                    </option>

                    <option value="recently-updated">
                      Recently updated
                    </option>

                    <option value="a-z">
                      Title A to Z
                    </option>
                  </select>
                </div>

                {/*
                 * Filtering should always
                 * return to page 1.
                 */}
                <input
                  type="hidden"
                  name="page"
                  value="1"
                />

                <button
                  className="govuk-button govuk-!-margin-bottom-3"
                  type="submit"
                >
                  Apply filters
                </button>

                {hasAnySearchState && (
                  <p className="govuk-body govuk-!-margin-bottom-0">
                    <Link
                      className="govuk-link"
                      href="/documents"
                    >
                      Clear all filters
                    </Link>
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Results */}
          <div className="govuk-grid-column-two-thirds">
            {/* Applied filters */}
            {hasAppliedFilters && (
              <section
                aria-labelledby="selected-filters-heading"
                className="govuk-!-margin-bottom-5"
              >
                <h2
                  className="govuk-heading-s govuk-!-margin-bottom-2"
                  id="selected-filters-heading"
                >
                  Selected filters
                </h2>

                <ul className="govuk-list govuk-!-margin-bottom-2">
                  {params.category &&
                    selectedCategoryName && (
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          className="govuk-link"
                          href={hrefWith(
                            params,
                            {
                              category:
                                undefined,
                              type:
                                undefined,
                              page:
                                undefined,
                            },
                          )}
                        >
                          Remove category:{" "}
                          {
                            selectedCategoryName
                          }
                        </Link>
                      </li>
                    )}

                  {params.type &&
                    selectedTypeName && (
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          className="govuk-link"
                          href={hrefWith(
                            params,
                            {
                              type:
                                undefined,
                              page:
                                undefined,
                            },
                          )}
                        >
                          Remove document
                          type:{" "}
                          {
                            selectedTypeName
                          }
                        </Link>
                      </li>
                    )}

                  {params.topic &&
                    selectedTopicName && (
                      <li className="govuk-!-margin-bottom-2">
                        <Link
                          className="govuk-link"
                          href={hrefWith(
                            params,
                            {
                              topic:
                                undefined,
                              page:
                                undefined,
                            },
                          )}
                        >
                          Remove topic:{" "}
                          {
                            selectedTopicName
                          }
                        </Link>
                      </li>
                    )}

                  {params.year_from && (
                    <li className="govuk-!-margin-bottom-2">
                      <Link
                        className="govuk-link"
                        href={hrefWith(
                          params,
                          {
                            year_from:
                              undefined,
                            page:
                              undefined,
                          },
                        )}
                      >
                        Remove starting
                        year:{" "}
                        {
                          params.year_from
                        }
                      </Link>
                    </li>
                  )}

                  {params.year_to && (
                    <li className="govuk-!-margin-bottom-2">
                      <Link
                        className="govuk-link"
                        href={hrefWith(
                          params,
                          {
                            year_to:
                              undefined,
                            page:
                              undefined,
                          },
                        )}
                      >
                        Remove ending
                        year:{" "}
                        {params.year_to}
                      </Link>
                    </li>
                  )}
                </ul>

                <p className="govuk-body-s">
                  <Link
                    href="/documents"
                    className="govuk-link"
                  >
                    Clear all filters
                  </Link>
                </p>
              </section>
            )}

            {/* Search heading */}
            {params.q ? (
              <>
                <span className="govuk-caption-m">
                  Search results for
                </span>

                <h2 className="govuk-heading-l govuk-!-margin-bottom-2">
                  “{params.q}”
                </h2>
              </>
            ) : (
              <h2 className="govuk-heading-l govuk-!-margin-bottom-2">
                All documents
              </h2>
            )}

            <p
              className="govuk-body govuk-!-margin-bottom-5"
              aria-live="polite"
            >
              <strong>
                {total.toLocaleString()}
              </strong>{" "}
              document
              {total === 1 ? "" : "s"}{" "}
              found
            </p>

            {/* No results */}
            {rows.length === 0 ? (
              <div className="govuk-!-margin-top-6">
                <h3 className="govuk-heading-m">
                  No documents found
                </h3>

                <p className="govuk-body">
                  Try using fewer search
                  terms, selecting a
                  broader category, or
                  removing one or more
                  filters.
                </p>

                <p className="govuk-body">
                  <Link
                    className="govuk-link"
                    href="/documents"
                  >
                    View all documents
                  </Link>
                </p>
              </div>
            ) : (
              <div>
                {rows.map(
                  (document) => {
                    const year =
                      document.document_year ??
                      (
                        document.publication_date
                          ? new Date(
                              `${document.publication_date}T00:00:00Z`,
                            ).getUTCFullYear()
                          : null
                      );

                    return (
                      <article
                        key={
                          document.id
                        }
                        className="govuk-!-padding-top-4 govuk-!-padding-bottom-4"
                        style={{
                          borderTop:
                            "1px solid #b1b4b6",
                        }}
                      >
                        {document.category_name && (
                          <p className="govuk-caption-m govuk-!-margin-bottom-1">
                            {
                              document.category_name
                            }
                          </p>
                        )}

                        <h3 className="govuk-heading-m govuk-!-margin-bottom-2">
                          <Link
                            className="govuk-link"
                            href={
                              document.href
                            }
                          >
                            {
                              document.title
                            }
                          </Link>
                        </h3>

                        <p className="govuk-body-s govuk-!-margin-bottom-2">
                          {[
                            document.type_name,
                            year,
                            document.publisher_text,
                          ]
                            .filter(
                              Boolean,
                            )
                            .join(
                              " · ",
                            )}
                        </p>

                        {document.summary && (
                          <p className="govuk-body govuk-!-margin-bottom-0">
                            {
                              document.summary
                            }
                          </p>
                        )}
                      </article>
                    );
                  },
                )}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <nav
                className="govuk-pagination govuk-!-margin-top-6"
                aria-label="Pagination"
              >
                {page > 1 && (
                  <div className="govuk-pagination__prev">
                    <Link
                      className="govuk-link govuk-pagination__link"
                      href={hrefWith(
                        params,
                        {
                          page: String(
                            page - 1,
                          ),
                        },
                      )}
                      rel="prev"
                    >
                      <span className="govuk-pagination__link-title">
                        Previous
                        <span className="govuk-visually-hidden">
                          {" "}
                          page
                        </span>
                      </span>
                    </Link>
                  </div>
                )}

                <ul className="govuk-pagination__list">
                  {visiblePages.map(
                    (
                      pageNumber,
                      index,
                    ) => {
                      const previous =
                        visiblePages[
                          index - 1
                        ];

                      const showEllipsis =
                        previous &&
                        pageNumber -
                          previous >
                          1;

                      return (
                        <li
                          key={
                            pageNumber
                          }
                          style={{
                            display:
                              "contents",
                          }}
                        >
                          {showEllipsis && (
                            <span
                              className="govuk-pagination__item govuk-pagination__item--ellipses"
                              aria-hidden="true"
                            >
                              ⋯
                            </span>
                          )}

                          <span
                            className={[
                              "govuk-pagination__item",
                              pageNumber ===
                              page
                                ? "govuk-pagination__item--current"
                                : "",
                            ]
                              .filter(
                                Boolean,
                              )
                              .join(
                                " ",
                              )}
                          >
                            {pageNumber ===
                            page ? (
                              <span
                                className="govuk-link govuk-pagination__link"
                                aria-current="page"
                                aria-label={`Page ${pageNumber}`}
                              >
                                {
                                  pageNumber
                                }
                              </span>
                            ) : (
                              <Link
                                className="govuk-link govuk-pagination__link"
                                href={hrefWith(
                                  params,
                                  {
                                    page: String(
                                      pageNumber,
                                    ),
                                  },
                                )}
                                aria-label={`Page ${pageNumber}`}
                              >
                                {
                                  pageNumber
                                }
                              </Link>
                            )}
                          </span>
                        </li>
                      );
                    },
                  )}
                </ul>

                {page < pages && (
                  <div className="govuk-pagination__next">
                    <Link
                      className="govuk-link govuk-pagination__link"
                      href={hrefWith(
                        params,
                        {
                          page: String(
                            page + 1,
                          ),
                        },
                      )}
                      rel="next"
                    >
                      <span className="govuk-pagination__link-title">
                        Next
                        <span className="govuk-visually-hidden">
                          {" "}
                          page
                        </span>
                      </span>
                    </Link>
                  </div>
                )}
              </nav>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}