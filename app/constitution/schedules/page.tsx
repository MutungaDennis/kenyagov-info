import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { getAllConstitutionSchedules } from "@/lib/sanity/client";
import { CONSTITUTION_SCHEDULES } from "@/lib/constitution/schedules";

export const revalidate = 3600;

export default async function ConstitutionSchedulesIndexPage() {
  const uploaded = await getAllConstitutionSchedules();
  const bySlug = new Map(
    (uploaded || []).map((s: { slug?: string }) => [s.slug, s]),
  );

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Constitution", href: "/constitution" },
          { text: "Schedules" },
        ]}
      />
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <span className="govuk-caption-l">Constitution of Kenya 2010</span>
          <h1 className="govuk-heading-xl">Schedules</h1>
          <p className="govuk-body-l">
            The six Schedules follow Chapter 18. They set out counties, national
            symbols, oaths, distribution of functions, legislation timelines, and
            transitional provisions.
          </p>

          <ol className="govuk-list govuk-list--number">
            {CONSTITUTION_SCHEDULES.map((meta) => {
              const doc = bySlug.get(meta.slug) as
                | { title?: string; citation?: string }
                | undefined;
              return (
                <li key={meta.slug} className="govuk-!-margin-bottom-4">
                  {doc ? (
                    <>
                      <Link
                        href={`/constitution/schedules/${meta.slug}`}
                        className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-24"
                      >
                        {meta.fullTitle} — {doc.title || meta.title}
                      </Link>
                      {doc.citation || meta.citation ? (
                        <p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                          {doc.citation || meta.citation}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <span className="govuk-!-font-weight-bold govuk-!-font-size-24">
                        {meta.fullTitle} — {meta.title}
                      </span>
                      <p className="govuk-hint govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                        Not uploaded yet ({meta.citation})
                      </p>
                    </>
                  )}
                </li>
              );
            })}
          </ol>

          <p className="govuk-body">
            <Link href="/constitution" className="govuk-link">
              Back to Constitution contents
            </Link>
            {" · "}
            <Link href="/constitution/chapter/18" className="govuk-link">
              Chapter 18
            </Link>
          </p>
        </main>
      </div>
    </>
  );
}
