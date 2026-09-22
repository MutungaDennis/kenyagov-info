
import { safeHtml } from "@/lib/safe-html";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GazetteSearchForm from "@/components/gazette/GazetteSearchForm";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ year: string; issueNumber: string }>;
  searchParams: Promise<{ page?: string }>;
};

type GazetteIssueSection = {
  id: string;
  section_type: string;
  title: string;
  content_html: string;
  source_page_start: number | null;
  source_page_end: number | null;
  sort_order: number;
};

type GazetteReference = {
  noticeNumber: number;
  year: number;
};

type GazetteReferenceTarget = {
  noticeNumber: number;
  year: number;
  issueNumber: number;
  href: string;
};

const PAGE_SIZE = 100;

async function getIssue(year: number, issueNumber: number) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("gazette_issues")
    .select(
      `
        id,
        year,
        volume,
        issue_number,
        date,
        pdf_url
      `,
    )
    .eq("year", year)
    .eq("issue_number", issueNumber)
    .maybeSingle();

  return data;
}

/**
 * Find references such as:
 *
 * Gazette Notice No. 17637 of 2023
 * Gazette Notice No. 12916 of 2023
 *
 * inside issue-level sections such as CORRIGENDA.
 */
function extractGazetteReferences(
  sections: GazetteIssueSection[],
): GazetteReference[] {
  const references = new Map<string, GazetteReference>();

  const pattern =
    /Gazette\s+Notice\s+No\.\s*(\d+)\s+of\s+(\d{4})/gi;

  for (const section of sections) {
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(section.content_html)) !== null) {
      const noticeNumber = Number.parseInt(match[1], 10);
      const year = Number.parseInt(match[2], 10);

      if (Number.isNaN(noticeNumber) || Number.isNaN(year)) {
        continue;
      }

      references.set(`${year}-${noticeNumber}`, {
        noticeNumber,
        year,
      });
    }
  }

  return Array.from(references.values());
}

/**
 * Resolve Gazette Notice references against the database.
 *
 * We deliberately resolve the issue number from the database rather than
 * assuming that a notice number belongs to a particular issue.
 */
async function resolveGazetteReferenceTargets(
  references: GazetteReference[],
): Promise<Map<string, GazetteReferenceTarget>> {
  const targets = new Map<string, GazetteReferenceTarget>();

  if (references.length === 0) {
    return targets;
  }

  const supabase = await createClient();

  const noticeNumbers = Array.from(
    new Set(references.map((reference) => reference.noticeNumber)),
  );

  const years = Array.from(
    new Set(references.map((reference) => reference.year)),
  );

  /*
   * First get all matching notice rows.
   *
   * We query issue_id separately rather than relying on a nested Supabase
   * relationship, which avoids the relationship typing problem that can
   * occur when Supabase infers a related record as an array.
   */
  const { data: noticeRows, error: noticeError } = await supabase
    .from("gazette_notices")
    .select("id, issue_id, notice_number")
    .in("notice_number", noticeNumbers);

  if (noticeError) {
    console.error(
      "Gazette reference notice lookup failed:",
      noticeError,
    );

    return targets;
  }

  if (!noticeRows || noticeRows.length === 0) {
    return targets;
  }

  const issueIds = Array.from(
    new Set(
      noticeRows
        .map((notice) => notice.issue_id)
        .filter((issueId): issueId is string => Boolean(issueId)),
    ),
  );

  if (issueIds.length === 0) {
    return targets;
  }

  const { data: issueRows, error: issueError } = await supabase
    .from("gazette_issues")
    .select("id, year, issue_number")
    .in("id", issueIds)
    .in("year", years);

  if (issueError) {
    console.error(
      "Gazette reference issue lookup failed:",
      issueError,
    );

    return targets;
  }

  if (!issueRows) {
    return targets;
  }

  const issuesById = new Map(
    issueRows.map((issue) => [issue.id, issue]),
  );

  for (const notice of noticeRows) {
    if (!notice.issue_id) {
      continue;
    }

    const issue = issuesById.get(notice.issue_id);

    if (!issue) {
      continue;
    }

    const expectedReference = references.find(
      (reference) =>
        reference.noticeNumber === notice.notice_number &&
        reference.year === issue.year,
    );

    if (!expectedReference) {
      continue;
    }

    const key = `${issue.year}-${notice.notice_number}`;

    /*
     * Only create one destination per year + notice number.
     *
     * If your database ever contains an ambiguous duplicate, the first
     * canonical match is retained rather than generating multiple URLs.
     */
    if (!targets.has(key)) {
      targets.set(key, {
        noticeNumber: notice.notice_number,
        year: issue.year,
        issueNumber: issue.issue_number,
        href: `/kenya-gazette/${issue.year}/${issue.issue_number}/notice/${notice.notice_number}`,
      });
    }
  }

  return targets;
}

/**
 * Add internal CitizenGuide links to Gazette references without changing
 * the source wording.
 *
 * Example:
 *
 * Gazette Notice No. 17637 of 2023
 *
 * becomes:
 *
 * <a href="/kenya-gazette/2023/.../notice/17637">
 *   Gazette Notice No. 17637 of 2023
 * </a>
 *
 * If that historical notice has not yet been imported, the original
 * plain text remains unchanged.
 */
function linkGazetteReferencesInHtml(
  html: string,
  targets: Map<string, GazetteReferenceTarget>,
): string {
  return html.replace(
    /Gazette\s+Notice\s+No\.\s*(\d+)\s+of\s+(\d{4})/gi,
    (fullMatch, noticeNumberRaw: string, yearRaw: string) => {
      const noticeNumber = Number.parseInt(
        noticeNumberRaw,
        10,
      );

      const year = Number.parseInt(yearRaw, 10);

      const target = targets.get(
        `${year}-${noticeNumber}`,
      );

      if (!target) {
        return fullMatch;
      }

      return `<a class="govuk-link" href="${target.href}">${fullMatch}</a>`;
    },
  );
}

export async function generateMetadata({
  params,
}: Pick<PageProps, "params">): Promise<Metadata> {
  const {
    year: yearStr,
    issueNumber: issueNumberStr,
  } = await params;

  const year = Number.parseInt(yearStr, 10);
  const issueNumber = Number.parseInt(
    issueNumberStr,
    10,
  );

  if (
    Number.isNaN(year) ||
    Number.isNaN(issueNumber)
  ) {
    return {
      title: "Kenya Gazette issue not found",
    };
  }

  const issue = await getIssue(year, issueNumber);

  if (!issue) {
    return {
      title: "Kenya Gazette issue not found",
    };
  }

  return {
    title: `Kenya Gazette Vol. ${issue.volume} No. ${issue.issue_number}`,
    description: `Browse searchable notices published in Kenya Gazette Vol. ${issue.volume} No. ${issue.issue_number}.`,
    alternates: {
      canonical: `/kenya-gazette/${issue.year}/${issue.issue_number}`,
    },
  };
}

export default async function GazetteIssuePage({
  params,
  searchParams,
}: PageProps) {
  const {
    year: yearStr,
    issueNumber: issueNumberStr,
  } = await params;

  const { page: pageStr } = await searchParams;

  const year = Number.parseInt(yearStr, 10);
  const issueNumber = Number.parseInt(
    issueNumberStr,
    10,
  );

  const requestedPage = Math.max(
    Number.parseInt(pageStr || "1", 10) || 1,
    1,
  );

  if (
    Number.isNaN(year) ||
    Number.isNaN(issueNumber)
  ) {
    notFound();
  }

  const issue = await getIssue(year, issueNumber);

  if (!issue) {
    notFound();
  }

  const supabase = await createClient();

  /*
   * ----------------------------------------------------------
   * ISSUE-LEVEL SECTIONS
   * ----------------------------------------------------------
   *
   * These are things such as:
   *
   * - CORRIGENDA
   * - ERRATA
   * - ADDENDA
   *
   * They are intentionally separate from gazette_notices.
   */
  const {
    data: sectionRows,
    error: sectionsError,
  } = await supabase
    .from("gazette_issue_sections")
    .select(
      `
        id,
        section_type,
        title,
        content_html,
        source_page_start,
        source_page_end,
        sort_order
      `,
    )
    .eq("issue_id", issue.id)
    .order("sort_order", {
      ascending: true,
    });

  if (sectionsError) {
    console.error(
      "Gazette issue sections query failed:",
      sectionsError,
    );
  }

  const sections =
    (sectionRows as GazetteIssueSection[] | null) ??
    [];

  /*
   * Resolve historical notices mentioned in corrigenda.
   */
  const references =
    extractGazetteReferences(sections);

  const referenceTargets =
    await resolveGazetteReferenceTargets(references);

  const renderedSections = sections.map(
    (section) => ({
      ...section,
      content_html: linkGazetteReferencesInHtml(
        section.content_html,
        referenceTargets,
      ),
    }),
  );

  /*
   * ----------------------------------------------------------
   * NUMBERED GAZETTE NOTICES
   * ----------------------------------------------------------
   */
  const from =
    (requestedPage - 1) * PAGE_SIZE;

  const to = from + PAGE_SIZE - 1;

  const {
    data: notices,
    count,
    error,
  } = await supabase
    .from("gazette_notices")
    .select(
      `
        id,
        notice_number,
        title,
        notice_type,
        act_referenced
      `,
      {
        count: "exact",
      },
    )
    .eq("issue_id", issue.id)
    .order("notice_number", {
      ascending: true,
    })
    .range(from, to);

  if (error) {
    console.error(
      "Gazette notices query failed:",
      error,
    );
  }

  const total = count ?? 0;

  const totalPages = Math.max(
    Math.ceil(total / PAGE_SIZE),
    1,
  );

  const currentPage = Math.min(
    requestedPage,
    totalPages,
  );

  const breadcrumbs = [
    {
      text: "Home",
      href: "/",
    },
    {
      text: "Kenya Gazette",
      href: "/kenya-gazette",
    },
    {
      text: year.toString(),
      href: `/kenya-gazette/${year}`,
    },
    {
      text: `Vol. ${issue.volume} No. ${issue.issue_number}`,
    },
  ];

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={breadcrumbs} />

      <main
        className="govuk-main-wrapper"
        id="main-content"
        role="main"
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">
              Published{" "}
              {new Date(
                issue.date,
              ).toLocaleDateString("en-KE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>

            <h1 className="govuk-heading-xl govuk-!-margin-bottom-6">
              Kenya Gazette Vol. {issue.volume} No.{" "}
              {issue.issue_number}
            </h1>

            {issue.pdf_url && (
              <p className="govuk-body">
                <a
                  href={issue.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="govuk-link"
                >
                  View the official issue PDF
                </a>
              </p>
            )}

            <GazetteSearchForm
              inputId={`gazette-issue-${issue.issue_number}-search`}
              year={issue.year}
              issueNumber={issue.issue_number}
              heading="Search within this Gazette issue"
              hint="Search the parsed notices in this issue by notice number, person, organisation, law, place or text."
            />

            {/*
             * ==================================================
             * ISSUE-LEVEL MATERIAL
             * ==================================================
             *
             * CORRIGENDA appears before the numbered notices.
             */}
            {renderedSections.length > 0 && (
              <div className="govuk-!-margin-top-8 govuk-!-margin-bottom-8">
                {renderedSections.map(
                  (section) => (
                    <section
                      key={section.id}
                      className="govuk-!-margin-bottom-8"
                      aria-label={section.title}
                    >
                      <div
                        className={`gazette-issue-section gazette-issue-section--${section.section_type}`}
                        dangerouslySetInnerHTML={{
                          __html:
                            safeHtml(section.content_html),
                        }}
                      />

                      {section.source_page_start && (
                        <p className="govuk-hint govuk-!-margin-top-3">
                          Source: Kenya Gazette page{" "}
                          {section.source_page_start}
                          {section.source_page_end &&
                          section.source_page_end !==
                            section.source_page_start
                            ? `–${section.source_page_end}`
                            : ""}
                        </p>
                      )}
                    </section>
                  ),
                )}
              </div>
            )}

            <h2 className="govuk-heading-l">
              Notices in this issue
            </h2>

            <p className="govuk-body">
              {total === 1
                ? "1 parsed notice"
                : `${total} parsed notices`}{" "}
              currently available.
            </p>

            {notices &&
            notices.length > 0 ? (
              <>
                <dl className="govuk-summary-list">
                  {notices.map(
                    (notice: any) => (
                      <div
                        key={notice.id}
                        className="govuk-summary-list__row"
                      >
                        <dt className="govuk-summary-list__key">
                          <Link
                            href={`/kenya-gazette/${issue.year}/${issue.issue_number}/notice/${notice.notice_number}`}
                            className="govuk-link"
                          >
                            Notice No.{" "}
                            {notice.notice_number}
                          </Link>
                        </dt>

                        <dd className="govuk-summary-list__value">
                          <p className="govuk-body govuk-!-margin-bottom-1">
                            {notice.title}
                          </p>

                          {(notice.notice_type ||
                            notice.act_referenced) && (
                            <p className="govuk-hint govuk-!-margin-bottom-0">
                              {[
                                notice.notice_type,
                                notice.act_referenced,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </dd>
                      </div>
                    ),
                  )}
                </dl>

                {totalPages > 1 && (
                  <nav
                    className="govuk-pagination"
                    aria-label="Notice pages"
                  >
                    {currentPage > 1 && (
                      <div className="govuk-pagination__prev">
                        <Link
                          className="govuk-link govuk-pagination__link"
                          href={`?page=${currentPage - 1}`}
                          rel="prev"
                        >
                          <span className="govuk-pagination__link-title govuk-pagination__link-title--decorated">
                            Previous
                          </span>
                        </Link>
                      </div>
                    )}

                    <p className="govuk-body govuk-!-margin-bottom-0 gazette-pagination-summary">
                      Page {currentPage} of{" "}
                      {totalPages}
                    </p>

                    {currentPage <
                      totalPages && (
                      <div className="govuk-pagination__next">
                        <Link
                          className="govuk-link govuk-pagination__link"
                          href={`?page=${currentPage + 1}`}
                          rel="next"
                        >
                          <span className="govuk-pagination__link-title govuk-pagination__link-title--decorated">
                            Next
                          </span>
                        </Link>
                      </div>
                    )}
                  </nav>
                )}
              </>
            ) : (
              <div className="govuk-inset-text">
                No individual notices have
                been parsed for this issue
                yet. Refer to the official
                PDF.
              </div>
            )}

            <Link
              href={`/kenya-gazette/${year}`}
              className="govuk-back-link"
            >
              Back to {year} Gazette archive
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}