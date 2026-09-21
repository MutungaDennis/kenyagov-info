import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import PresidentialSpeechesFinder from "@/components/presidential-speeches/PresidentialSpeechesFinder";

import {
  getPresidentialSpeechFilters,
  searchPublicPresidentialSpeeches,
  type PresidentialSpeechFinderRow,
  type PresidentialSpeechSearchParams,
} from "@/lib/presidential-speeches/queries";

export const dynamic = "force-dynamic";

export default async function PresidentialSpeechesPage({
  searchParams,
}: {
  searchParams: Promise<PresidentialSpeechSearchParams>;
}) {
  const params = await searchParams;

  const [{ rows, total, page, pageSize }, filters] = await Promise.all([
    searchPublicPresidentialSpeeches(params),
    getPresidentialSpeechFilters(),
  ]);

  const publications: Array<
    PresidentialSpeechFinderRow & { href: string }
  > = rows.map((record) => ({
    ...record,
    href: `/government/presidency/speeches/${record.slug}`,
  }));

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "The Presidency", href: "/government/presidency" },
          {
            text: "Speeches and communications",
            href: "/government/presidency/speeches",
          },
        ]}
      />

      <div className="govuk-width-container">
        <main id="main-content">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
                Presidential speeches and communications
              </h1>

              <p className="govuk-body-l govuk-!-margin-bottom-7">
                Browse speeches, addresses, statements, remarks, formal
                communiqués and messages associated with Presidents of the
                Republic of Kenya.
              </p>
            </div>
          </div>

          <PresidentialSpeechesFinder
            params={params}
            rows={publications}
            total={total}
            page={page}
            pageSize={pageSize}
            presidents={filters.presidents}
            years={filters.years}
            kinds={filters.kinds}
            types={filters.types}
            topics={filters.topics}
            counties={filters.counties}
          />
        </main>
      </div>
    </>
  );
}
