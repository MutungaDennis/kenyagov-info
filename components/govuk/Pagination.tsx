'use client';

import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="govuk-pagination" role="navigation" aria-label="Pagination">
      <div className="govuk-pagination__prev">
        {currentPage > 1 && (
          <Link
            href={`${baseUrl}?page=${currentPage - 1}`}
            className="govuk-link govuk-pagination__link"
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
              <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
            </svg>
            <span className="govuk-pagination__link-title">
              Previous<span className="govuk-visually-hidden"> page</span>
            </span>
          </Link>
        )}
      </div>

      <ul className="govuk-pagination__list">
        {pages.map((page) => {
          const isCurrent = page === currentPage;
          return (
            <li
              key={page}
              className={`govuk-pagination__item ${
                isCurrent ? 'govuk-pagination__item--current' : ''
              }`}
            >
              <Link
                href={`${baseUrl}?page=${page}`}
                className="govuk-link govuk-pagination__link"
                aria-label={`Page ${page}`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {page}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="govuk-pagination__next">
        {currentPage < totalPages && (
          <Link
            href={`${baseUrl}?page=${currentPage + 1}`}
            className="govuk-link govuk-pagination__link"
            rel="next"
          >
            <span className="govuk-pagination__link-title">
              Next<span className="govuk-visually-hidden"> page</span>
            </span>
            <svg
              className="govuk-pagination__icon govuk-pagination__icon--next"
              xmlns="http://www.w3.org/2000/svg"
              height="13"
              width="15"
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 15 13"
            >
              <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
            </svg>
          </Link>
        )}
      </div>
    </nav>
  );
}
