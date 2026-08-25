import Link from "next/link";
import { notFound } from "next/navigation";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import PrintPageButton from "@/components/govuk/PrintPageButton";
import ConstitutionPortableText from "@/components/sanity/ConstitutionPortableText";
import {
  getConstitutionScheduleBySlug,
  getAllConstitutionSchedules,
  getConstitutionLinkPhrases,
} from "@/lib/sanity/client";
import {
  CONSTITUTION_SCHEDULES,
  scheduleBySlug,
} from "@/lib/constitution/schedules";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ConstitutionSchedulePage({ params }: Props) {
  const { slug } = await params;
  const meta = scheduleBySlug(slug);
  const [doc, all, linkPhrases] = await Promise.all([
    getConstitutionScheduleBySlug(slug),
    getAllConstitutionSchedules(),
    getConstitutionLinkPhrases(),
  ]);

  if (!doc && !meta) notFound();
  if (!doc) {
    // Known schedule but not uploaded
    return (
      <>
        <GovUKBreadcrumbs
          items={[
            { text: "Home", href: "/" },
            { text: "Constitution", href: "/constitution" },
            { text: "Schedules", href: "/constitution/schedules" },
            { text: meta!.fullTitle },
          ]}
        />
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper" id="main-content" role="main">
            <h1 className="govuk-heading-xl">
              {meta!.fullTitle} — {meta!.title}
            </h1>
            <p className="govuk-body">
              This schedule has not been uploaded yet. Use Admin → Constitution →
              Paste schedule when ready.
            </p>
            <Link href="/constitution/schedules" className="govuk-link">
              All schedules
            </Link>
          </main>
        </div>
      </>
    );
  }

  const sorted = [...(all || [])].sort(
    (a: { scheduleNumber: number }, b: { scheduleNumber: number }) =>
      a.scheduleNumber - b.scheduleNumber,
  );
  const idx = sorted.findIndex(
    (s: { slug?: string }) => s.slug === doc.slug,
  );
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next =
    idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Constitution", href: "/constitution" },
          { text: "Schedules", href: "/constitution/schedules" },
          { text: doc.fullTitle || "Schedule" },
        ]}
      />
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="app-constitution-reader__sticky govuk-!-display-none-print">
            <span className="govuk-caption-m">Constitution of Kenya 2010</span>
            <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-0">
              {doc.fullTitle}
              {doc.citation ? ` (${doc.citation})` : ""}
            </p>
          </div>

          <span className="govuk-caption-l">Schedules</span>
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
            {doc.fullTitle}
            {doc.title ? ` — ${doc.title}` : ""}
          </h1>
          {doc.citation ? (
            <p className="govuk-body-l">{doc.citation}</p>
          ) : null}
          <PrintPageButton />

          <div className="app-constitution-prose govuk-!-margin-top-6">
            <ConstitutionPortableText
              content={doc.officialText}
              linkPhrases={linkPhrases}
            />
          </div>

          {doc.amplifiedText ? (
            <details className="govuk-details govuk-!-margin-top-6">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  Plain English Explanation
                </span>
              </summary>
              <div className="govuk-details__text">
                <ConstitutionPortableText
                  content={doc.amplifiedText}
                  linkPhrases={linkPhrases}
                />
              </div>
            </details>
          ) : null}

          <nav
            className="govuk-!-margin-top-8"
            aria-label="Adjacent schedules"
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                justifyContent: "space-between",
              }}
            >
              {prev ? (
                <Link
                  href={`/constitution/schedules/${prev.slug}`}
                  className="govuk-button govuk-button--secondary"
                >
                  ← {prev.fullTitle}
                </Link>
              ) : (
                <Link
                  href="/constitution/chapter/18"
                  className="govuk-button govuk-button--secondary"
                >
                  ← Chapter 18
                </Link>
              )}
              {next ? (
                <Link
                  href={`/constitution/schedules/${next.slug}`}
                  className="govuk-button govuk-button--secondary"
                >
                  {next.fullTitle} →
                </Link>
              ) : (
                <Link
                  href="/constitution/schedules"
                  className="govuk-button govuk-button--secondary"
                >
                  All schedules
                </Link>
              )}
            </div>
            <p className="govuk-body govuk-!-margin-top-4">
              <Link href="/constitution" className="govuk-link">
                Constitution contents
              </Link>
            </p>
          </nav>

          {/* Compact schedule jump list */}
          <aside className="govuk-!-margin-top-6 govuk-!-display-none-print">
            <h2 className="govuk-heading-s">All schedules</h2>
            <ul className="govuk-list">
              {CONSTITUTION_SCHEDULES.map((s) => (
                <li key={s.slug}>
                  {s.slug === doc.slug ? (
                    <strong>
                      {s.fullTitle} — {s.title}
                    </strong>
                  ) : (
                    <Link
                      href={`/constitution/schedules/${s.slug}`}
                      className="govuk-link"
                    >
                      {s.fullTitle} — {s.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </aside>
        </main>
      </div>
    </>
  );
}
