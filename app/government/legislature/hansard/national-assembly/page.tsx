import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { createSanityClient } from "@/lib/sanity/createSanityClient";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKAccordion from "@/components/govuk/Accordion";
import GovUKPagination from "@/components/govuk/Pagination";
import PrintPageButton from "@/components/govuk/PrintPageButton";

export const revalidate = 3600;

const sanityClient = createSanityClient({ useCdn: true, token: null });

/** Sittings per page — keeps the archive short as the catalogue grows past 300. */
const PAGE_SIZE = 25;

interface Sitting {
  _id: string;
  title: string;
  slug?: { current: string };
  sittingDate: string;
  sittingPeriod?: string;
  parliamentaryTerm?: string;
  youtubeUrl?: string;
  officialHansardUrl?: string;
  editorialSummary?: unknown[] | string;
  topics?: string[];
  contributionCount?: number;
}

interface PageProps {
  searchParams: Promise<{
    q?: string;
    term?: string;
    year?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "National Assembly Hansard",
  description:
    "Official structured Hansard records of National Assembly debates — searchable HTML sittings.",
};

function formatSittingDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-KE", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function hasSummary(summary: Sitting["editorialSummary"]): boolean {
  if (!summary) return false;
  if (typeof summary === "string") return summary.trim().length > 0;
  return Array.isArray(summary) && summary.length > 0;
}

function SummaryBody({ summary }: { summary: Sitting["editorialSummary"] }) {
  if (!summary) return null;
  if (typeof summary === "string") {
    return <p className="govuk-body">{summary}</p>;
  }
  if (Array.isArray(summary) && summary.length > 0) {
    return (
      <div className="govuk-body">
        <PortableText value={summary as never} />
      </div>
    );
  }
  return null;
}

export default async function NationalAssemblyArchive({
  searchParams,
}: PageProps) {
  const {
    q = "",
    term = "",
    year = "",
    page: pageRaw = "1",
  } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageRaw, 10) || 1);
  const yearFilter = /^\d{4}$/.test(year.trim()) ? year.trim() : "";

  let sittings: Sitting[] = [];
  let totalCount = 0;

  const params: Record<string, string | number> = {};
  let filter =
    '_type == "hansardSitting" && houseType == "national-assembly" && isActive != false';

  if (q.trim()) {
    filter += ` && (title match $q || $q in topics)`;
    params.q = `*${q.trim()}*`;
  }
  if (term.trim()) {
    filter += ` && parliamentaryTerm match $term`;
    params.term = `*${term.trim()}*`;
  }
  if (yearFilter) {
    // sittingDate is ISO YYYY-MM-DD (or datetime) — match calendar year
    filter += ` && string::startsWith(sittingDate, $year)`;
    params.year = yearFilter;
  }

  try {
    totalCount = await sanityClient.fetch(`count(*[${filter}])`, params);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    sittings = await sanityClient.fetch(
      `*[${filter}] | order(sittingDate desc) [$start...$end] {
        _id,
        title,
        slug,
        sittingDate,
        sittingPeriod,
        parliamentaryTerm,
        youtubeUrl,
        officialHansardUrl,
        editorialSummary,
        topics,
        "contributionCount": count(contributions)
      }`,
      { ...params, start, end },
    );
  } catch (error) {
    console.error("Error fetching National Assembly sittings:", error);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  let uniqueTerms: string[] = [];
  try {
    uniqueTerms = await sanityClient.fetch(
      `array::unique(*[_type == "hansardSitting" && houseType == "national-assembly" && isActive != false && defined(parliamentaryTerm)].parliamentaryTerm) | order(@ desc)`,
    );
  } catch {
    uniqueTerms = Array.from(
      new Set(sittings.map((s) => s.parliamentaryTerm).filter(Boolean) as string[]),
    );
  }

  // Distinct years available in the archive (for the year filter)
  let uniqueYears: string[] = [];
  try {
    const dates: string[] = await sanityClient.fetch(
      `*[_type == "hansardSitting" && houseType == "national-assembly" && isActive != false && defined(sittingDate)].sittingDate`,
    );
    uniqueYears = Array.from(
      new Set(
        (dates || [])
          .map((d) => String(d).slice(0, 4))
          .filter((y) => /^\d{4}$/.test(y)),
      ),
    ).sort((a, b) => b.localeCompare(a));
  } catch {
    uniqueYears = Array.from(
      new Set(
        sittings
          .map((s) => (s.sittingDate || "").slice(0, 4))
          .filter((y) => /^\d{4}$/.test(y)),
      ),
    ).sort((a, b) => b.localeCompare(a));
  }

  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, totalCount);
  const hasActiveFilters = Boolean(q || term || yearFilter);

  const sittingAccordionItems = sittings.map((sitting) => {
    const dateLabel = formatSittingDate(sitting.sittingDate);
    const metaBits = [
      sitting.sittingPeriod,
      sitting.parliamentaryTerm,
      sitting.contributionCount != null
        ? `${sitting.contributionCount} contribution${sitting.contributionCount === 1 ? "" : "s"}`
        : null,
    ].filter(Boolean);

    const summaryPresent = hasSummary(sitting.editorialSummary);

    return {
      id: sitting._id,
      title: `${dateLabel} — ${sitting.title || "Sitting"}`,
      expanded: false as boolean,
      content: (
        <>
          {metaBits.length > 0 && (
            <p className="govuk-body-s govuk-!-margin-bottom-2" style={{ color: "#505a5f" }}>
              {metaBits.join(" · ")}
            </p>
          )}

          {summaryPresent ? (
            <>
              <h4 className="govuk-heading-s govuk-!-margin-bottom-1">
                What this sitting covered
              </h4>
              <SummaryBody summary={sitting.editorialSummary} />
            </>
          ) : (
            <p className="govuk-body-s" style={{ color: "#505a5f" }}>
              No editorial summary for this sitting yet. Open the full record to
              read contributions.
            </p>
          )}

          {sitting.topics && sitting.topics.length > 0 && (
            <p className="govuk-!-margin-top-2 govuk-!-margin-bottom-2">
              {sitting.topics.slice(0, 8).map((topic) => (
                <span
                  key={topic}
                  className="govuk-tag govuk-tag--grey govuk-!-margin-right-1 govuk-!-margin-bottom-1 govuk-!-font-size-14"
                >
                  {topic}
                </span>
              ))}
            </p>
          )}

          <p className="govuk-body govuk-!-margin-bottom-0">
            <Link
              href={`/government/legislature/hansard/national-assembly/${sitting.sittingDate}`}
              className="govuk-link govuk-!-font-weight-bold"
            >
              Read full sitting
            </Link>
            {sitting.officialHansardUrl && (
              <>
                {" · "}
                <a
                  href={sitting.officialHansardUrl}
                  className="govuk-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Official PDF
                </a>
              </>
            )}
            {sitting.youtubeUrl && (
              <>
                {" · "}
                <a
                  href={sitting.youtubeUrl}
                  className="govuk-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Video
                </a>
              </>
            )}
          </p>
        </>
      ),
    };
  });

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Legislature", href: "/government/legislature" },
          { text: "National Assembly Hansard" },
        ]}
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l">Republic of Kenya</span>
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
            National Assembly Hansard
          </h1>
          <p className="govuk-body govuk-!-margin-bottom-2">
            Browse sittings of the National Assembly. Expand a sitting for a
            short overview, or open the full day to read contributions.
          </p>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-!-margin-top-6" style={{ textAlign: "right" }}>
            <PrintPageButton />
          </div>
        </div>
      </div>

      <GovUKAccordion
        id="hansard-na-intro"
        headingLevel={2}
        items={[
          {
            id: "about",
            title: "About this Hansard archive",
            expanded: false,
            content: (
              <>
                <p className="govuk-body">
                  These are structured HTML records of National Assembly debates,
                  questions and proceedings — ordered contributions you can read,
                  search and print. Where an official PDF is linked, prefer that
                  as the authoritative source.
                </p>
                <p className="govuk-body">
                  Each sitting can be expanded for an editorial overview of what
                  was discussed. Use search, year and parliamentary term filters
                  below; results are paginated so the page stays short as
                  hundreds of sittings accumulate.
                </p>
                <p className="govuk-body govuk-!-margin-bottom-0">
                  Related:{" "}
                  <Link
                    href="/government/legislature/hansard/members"
                    className="govuk-link"
                  >
                    Find members
                  </Link>
                  {" · "}
                  <Link
                    href="/government/legislature/hansard/senate"
                    className="govuk-link"
                  >
                    Senate Hansard
                  </Link>
                </p>
              </>
            ),
          },
          {
            id: "how-to",
            title: "How to find a sitting",
            expanded: false,
            content: (
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  Filter by <strong>year</strong> to browse one calendar year at
                  a time.
                </li>
                <li>
                  Search by title or topic keywords (for example{" "}
                  <em>budget</em> or <em>leather</em>).
                </li>
                <li>
                  Filter by parliamentary term when terms are recorded on
                  sittings.
                </li>
                <li>
                  Expand a sitting in the list for a short description of the
                  day&apos;s business, then open the full sitting to read
                  contributions.
                </li>
              </ul>
            ),
          },
        ]}
      />

      <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />

      <form method="GET" className="govuk-!-margin-bottom-5">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="q">
                Search
              </label>
              <input
                className="govuk-input"
                id="q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Title or topic…"
              />
            </div>
          </div>
          <div className="govuk-grid-column-one-quarter">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="year">
                Year
              </label>
              <select
                className="govuk-select"
                id="year"
                name="year"
                defaultValue={yearFilter}
              >
                <option value="">All years</option>
                {uniqueYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="govuk-grid-column-one-quarter">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="term">
                Parliamentary term
              </label>
              <select
                className="govuk-select"
                id="term"
                name="term"
                defaultValue={term}
              >
                <option value="">All terms</option>
                {uniqueTerms.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <input type="hidden" name="page" value="1" />
        <button type="submit" className="govuk-button govuk-button--secondary">
          Apply filters
        </button>
        {hasActiveFilters && (
          <Link
            href="/government/legislature/hansard/national-assembly"
            className="govuk-link govuk-!-margin-left-3"
          >
            Clear filters
          </Link>
        )}
      </form>

      <h2 className="govuk-heading-m govuk-!-margin-bottom-1">
        Sittings
        {totalCount > 0 ? (
          <span className="govuk-caption-m govuk-!-margin-top-1">
            Showing {rangeStart}–{rangeEnd} of {totalCount}
            {totalCount !== 1 ? " sittings" : " sitting"}
            {hasActiveFilters && " matching your filters"}
            {yearFilter ? ` · ${yearFilter}` : ""}
          </span>
        ) : (
          <span className="govuk-caption-m govuk-!-margin-top-1">
            0 sittings
          </span>
        )}
      </h2>

      <p className="govuk-body-s govuk-!-margin-bottom-3" style={{ color: "#505a5f" }}>
        Select <strong>Show</strong> on a sitting to read its overview without
        leaving this page.
      </p>

      {sittings.length > 0 ? (
        <>
          <GovUKAccordion
            id={`hansard-na-sittings-p${safePage}`}
            headingLevel={3}
            items={sittingAccordionItems}
          />

          <div className="govuk-!-margin-top-6">
            <GovUKPagination
              currentPage={safePage}
              totalPages={totalPages}
              baseUrl="/government/legislature/hansard/national-assembly"
              queryParams={{
                ...(q ? { q } : {}),
                ...(term ? { term } : {}),
                ...(yearFilter ? { year: yearFilter } : {}),
              }}
            />
          </div>
        </>
      ) : (
        <div className="govuk-inset-text">
          <h3 className="govuk-heading-s">No sittings found</h3>
          <p className="govuk-body">
            {hasActiveFilters
              ? "No results match your filters. Try another year or clear filters."
              : "No published National Assembly Hansard records yet."}
          </p>
        </div>
      )}

      <p className="govuk-body govuk-!-margin-top-6">
        <Link
          href="/government/legislature/hansard/senate"
          className="govuk-link"
        >
          Senate Hansard
        </Link>
      </p>
    </>
  );
}
