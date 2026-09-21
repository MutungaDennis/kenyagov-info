import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import CabinetBriefsFinder from "@/components/cabinet/CabinetBriefsFinder";

import {
  getCabinetBriefFilters,
  searchPublicCabinetBriefs,
  type CabinetBriefFinderRow,
  type CabinetBriefSearchParams,
} from "@/lib/cabinet/queries";

export const dynamic = "force-dynamic";

export default async function CabinetBriefsPage({
  searchParams,
}: {
  searchParams: Promise<CabinetBriefSearchParams>;
}) {
  const params = await searchParams;

  const [
    {
      rows,
      total,
      page,
      pageSize,
    },
    filters,
  ] = await Promise.all([
    searchPublicCabinetBriefs(params),
    getCabinetBriefFilters(),
  ]);

  const publications: Array<
    CabinetBriefFinderRow & {
      href: string;
    }
  > = rows.map((record) => ({
    ...record,
    href: `/government/cabinet/briefs/${record.slug}`,
  }));

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          {
            text: "Home",
            href: "/",
          },
          {
            text: "Government",
            href: "/government",
          },
          {
            text: "Cabinet",
            href: "/government/cabinet",
          },
          {
            text: "Cabinet briefs",
            href: "/government/cabinet/briefs",
          },
        ]}
      />

      <div className="govuk-width-container">
        <main
          className="govuk-main-wrapper govuk-!-padding-top-4"
          id="main-content"
        >
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
                Cabinet briefs
              </h1>

              <p className="govuk-body-l govuk-!-margin-bottom-8">
                Browse official Cabinet communications, including
                Cabinet Briefs, Cabinet News, Cabinet Resolutions
                and Cabinet Despatches.
              </p>
            </div>
          </div>

          <CabinetBriefsFinder
            params={params}
            rows={publications}
            total={total}
            page={page}
            pageSize={pageSize}
            years={filters.years}
            labels={filters.labels}
          />
        </main>
      </div>
    </>
  );
}