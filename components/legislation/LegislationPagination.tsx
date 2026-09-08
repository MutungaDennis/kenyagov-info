import Link from "next/link";

type SearchParams = {
  query?: string;
  status?: string;
  chamber?: string;
  year?: string;
  page?: string;
};

function pageHref(page: number, values: SearchParams) {
  const params = new URLSearchParams();

  if (values.query) params.set("query", values.query);
  if (values.status) params.set("status", values.status);
  if (values.chamber) params.set("chamber", values.chamber);
  if (values.year) params.set("year", values.year);

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/legislation/acts?${query}` : "/legislation/acts";
}

function visiblePages(current: number, total: number) {
  const candidates = new Set<number>([
    1,
    total,
    current - 2,
    current - 1,
    current,
    current + 1,
    current + 2,
  ]);

  return [...candidates]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
}

export function LegislationPagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: SearchParams;
}) {
  if (totalPages <= 1) return null;

  const pages = visiblePages(currentPage, totalPages);

  return (
    <nav
      className="govuk-pagination govuk-!-margin-top-7"
      aria-label="Legislation pagination"
    >
      {currentPage > 1 ? (
        <div className="govuk-pagination__prev">
          <Link
            className="govuk-link govuk-pagination__link"
            href={pageHref(currentPage - 1, searchParams)}
            rel="prev"
          >
            <svg
              className="govuk-pagination__icon govuk-pagination__icon--prev"
              xmlns="http://www.w3.org/2000/svg"
              height="13"
              width="15"
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 15 13"
            >
              <path d="m6.5938-.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9766h12.896v-2H3.8608l4.147-4.1465z" />
            </svg>
            <span className="govuk-pagination__link-title">Previous</span>
          </Link>
        </div>
      ) : null}

      <ul className="govuk-pagination__list">
        {pages.map((page, index) => {
          const previous = pages[index - 1];
          const showEllipsis = previous && page - previous > 1;

          return (
            <li
              className="govuk-pagination__item"
              key={page}
              style={{ display: "contents" }}
            >
              {showEllipsis ? (
                <span
                  className="govuk-pagination__item govuk-pagination__item--ellipses"
                  aria-hidden="true"
                >
                  ⋯
                </span>
              ) : null}

              <span
                className={[
                  "govuk-pagination__item",
                  page === currentPage
                    ? "govuk-pagination__item--current"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <Link
                  className="govuk-link govuk-pagination__link"
                  href={pageHref(page, searchParams)}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </Link>
              </span>
            </li>
          );
        })}
      </ul>

      {currentPage < totalPages ? (
        <div className="govuk-pagination__next">
          <Link
            className="govuk-link govuk-pagination__link"
            href={pageHref(currentPage + 1, searchParams)}
            rel="next"
          >
            <span className="govuk-pagination__link-title">Next</span>
            <svg
              className="govuk-pagination__icon govuk-pagination__icon--next"
              xmlns="http://www.w3.org/2000/svg"
              height="13"
              width="15"
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 15 13"
            >
              <path d="m8.107-.0078125-1.377 1.4492 4.1855 3.9766H-1.9805v2H10.857l-4.147 4.1465 1.414 1.4141 6.7266-6.7266z" />
            </svg>
          </Link>
        </div>
      ) : null}
    </nav>
  );
}
