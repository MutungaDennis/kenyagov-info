import type { Metadata } from "next";

import { LegislationFilters } from "@/components/legislation/LegislationFilters";
import { LegislationList } from "@/components/legislation/LegislationList";
import { LegislationPagination } from "@/components/legislation/LegislationPagination";
import { listLegislation } from "@/lib/legislation/queries";

export const metadata: Metadata = {
  title: "Acts of Parliament - CitizenGuide.KE",
  description: "Browse and search Acts of Parliament in Kenya.",
  alternates: {
    canonical: "/legislation/acts",
  },
};

const PAGE_SIZE = 30;

type SearchParams = {
  query?: string;
  status?: string;
  chamber?: string;
  year?: string;
  page?: string;
};

export default async function ActsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const p = await searchParams;

  const currentPage = Math.max(1, Number.parseInt(p.page || "1", 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const items = await listLegislation({
    category: "act",
    query: p.query?.trim() || null,
    status: p.status || null,
    chamber: p.chamber || null,
    year: p.year || null,
    limit: PAGE_SIZE,
    offset,
  });

  const totalCount = Number(items[0]?.total_count ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <main
      className="govuk-width-container govuk-main-wrapper"
      id="main-content"
    >
      <span className="govuk-caption-xl">Legislation</span>
      <h1 className="govuk-heading-xl">Acts of Parliament</h1>

      <p className="govuk-body-l">
        Search and browse national Acts of Parliament. Newer legislation is
        shown first.
      </p>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <LegislationFilters
            action="/legislation/acts"
            showChamber
            values={p}
          />
        </div>

        <div className="govuk-grid-column-two-thirds">
          <div aria-live="polite" aria-atomic="true">
            <p className="govuk-body-s govuk-!-margin-bottom-4">
              {totalCount.toLocaleString("en-KE")}{" "}
              {totalCount === 1 ? "result" : "results"}
              {p.query ? (
                <>
                  {" "}
                  for <strong>“{p.query}”</strong>
                </>
              ) : null}
            </p>
          </div>

          {items.length > 0 ? (
            <>
              <LegislationList items={items} />

              <LegislationPagination
                currentPage={currentPage}
                totalPages={totalPages}
                searchParams={p}
              />
            </>
          ) : (
            <div className="govuk-inset-text">
              No Acts matched your search or filters. Try removing one or more
              filters or using fewer search words.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
