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
            <span className="govuk-pagination__link-title">Previous</span>
          </Link>
        )}
      </div>

      <ul className="govuk-pagination__list">
        {pages.map((page) => (
          <li key={page} className="govuk-pagination__item">
            <Link
              href={`${baseUrl}?page=${page}`}
              className={`govuk-link govuk-pagination__link ${
                page === currentPage ? 'govuk-pagination__link--current' : ''
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Link>
          </li>
        ))}
      </ul>

      <div className="govuk-pagination__next">
        {currentPage < totalPages && (
          <Link
            href={`${baseUrl}?page=${currentPage + 1}`}
            className="govuk-link govuk-pagination__link"
            rel="next"
          >
            <span className="govuk-pagination__link-title">Next</span>
          </Link>
        )}
      </div>
    </nav>
  );
}