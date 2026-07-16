import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { createSanityClient } from "@/lib/sanity/createSanityClient";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import PrintPageButton from "@/components/govuk/PrintPageButton";

export const revalidate = 3600;

const sanityClient = createSanityClient({ useCdn: true, token: null });

interface Sitting {
  _id: string;
  title: string;
  slug?: { current: string };
  sittingDate: string;
  sittingPeriod?: string;
  parliamentaryTerm?: string;
  youtubeUrl?: string;
  officialHansardUrl?: string;
  editorialSummary?: unknown[];
  topics?: string[];
  contributionCount?: number;
}

interface PageProps {
  searchParams: Promise<{
    q?: string;
    term?: string;
  }>;
}

export const metadata = {
  title: "Senate Hansard",
  description:
    "Official structured Hansard records of Senate debates — searchable HTML sittings.",
};

export default async function SenateHansardArchive({
  searchParams,
}: PageProps) {
  const { q = "", term = "" } = await searchParams;

  let sittings: Sitting[] = [];

  try {
    const params: Record<string, string> = {};
    let filter =
      '_type == "hansardSitting" && houseType == "senate" && isActive != false';

    if (q.trim()) {
      filter += ` && (title match $q || $q in topics)`;
      params.q = `*${q.trim()}*`;
    }
    if (term.trim()) {
      filter += ` && parliamentaryTerm match $term`;
      params.term = `*${term.trim()}*`;
    }

    sittings = await sanityClient.fetch(
      `*[${filter}] | order(sittingDate desc) [0...80] {
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
      params,
    );
  } catch (error) {
    console.error("Error fetching Senate sittings:", error);
  }

  let uniqueTerms: string[] = [];
  try {
    uniqueTerms = await sanityClient.fetch(
      `array::unique(*[_type == "hansardSitting" && houseType == "senate" && isActive != false && defined(parliamentaryTerm)].parliamentaryTerm) | order(@ desc)`,
    );
  } catch {
    uniqueTerms = Array.from(
      new Set(sittings.map((s) => s.parliamentaryTerm).filter(Boolean) as string[]),
    );
  }

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Legislature", href: "/government/legislature" },
          { text: "Senate Hansard" },
        ]}
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l">Republic of Kenya</span>
          <h1 className="govuk-heading-xl">Senate Hansard</h1>
          <p className="govuk-body-l">
            Structured HTML records of debates, questions and proceedings —
            ordered contributions you can read, search and print. Prefer the
            official PDF where cited as the authoritative source.
          </p>
          <PrintPageButton />
        </div>
      </div>

      <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-6" />

      <form method="GET" className="govuk-!-margin-bottom-6">
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
          <div className="govuk-grid-column-one-half">
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
        <button type="submit" className="govuk-button govuk-button--secondary">
          Apply filters
        </button>
        {(q || term) && (
          <Link
            href="/government/legislature/hansard/senate"
            className="govuk-link govuk-!-margin-left-3"
          >
            Clear filters
          </Link>
        )}
      </form>

      <h2 className="govuk-heading-m">
        {sittings.length} sitting{sittings.length !== 1 ? "s" : ""}
      </h2>

      {sittings.length > 0 ? (
        <div className="govuk-grid-row">
          {sittings.map((sitting) => (
            <div key={sitting._id} className="govuk-grid-column-one-half">
              <div className="govuk-summary-card govuk-!-margin-bottom-4">
                <div className="govuk-summary-card__title-wrapper">
                  <h3 className="govuk-summary-card__title">
                    <Link
                      href={`/government/legislature/hansard/senate/${sitting.sittingDate}`}
                      className="govuk-link"
                    >
                      {new Date(
                        sitting.sittingDate + "T12:00:00",
                      ).toLocaleDateString("en-KE", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Link>
                  </h3>
                </div>
                <div className="govuk-summary-card__content">
                  <p className="govuk-body-s govuk-!-margin-bottom-1">
                    <strong>{sitting.title}</strong>
                  </p>
                  <p className="govuk-body-s govuk-!-margin-bottom-1">
                    {sitting.sittingPeriod}
                    {sitting.parliamentaryTerm
                      ? ` · ${sitting.parliamentaryTerm}`
                      : ""}
                    {sitting.contributionCount != null
                      ? ` · ${sitting.contributionCount} contributions`
                      : ""}
                  </p>

                  {sitting.editorialSummary &&
                    Array.isArray(sitting.editorialSummary) &&
                    sitting.editorialSummary.length > 0 && (
                      <div className="govuk-body-s govuk-!-margin-bottom-2">
                        <PortableText
                          value={sitting.editorialSummary as never}
                        />
                      </div>
                    )}

                  {sitting.topics && sitting.topics.length > 0 && (
                    <div className="govuk-!-margin-bottom-2">
                      {sitting.topics.slice(0, 4).map((topic) => (
                        <span
                          key={topic}
                          className="govuk-tag govuk-tag--blue govuk-!-margin-right-1 govuk-!-font-size-14"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {sitting.officialHansardUrl && (
                    <p className="govuk-body-s">
                      <a
                        href={sitting.officialHansardUrl}
                        className="govuk-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Official PDF
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="govuk-inset-text">
          <h3 className="govuk-heading-s">No sittings found</h3>
          <p className="govuk-body">
            {q || term
              ? "No results match your filters."
              : "No published Senate Hansard records yet."}
          </p>
        </div>
      )}

      <p className="govuk-body govuk-!-margin-top-6">
        <Link
          href="/government/legislature/hansard/national-assembly"
          className="govuk-link"
        >
          National Assembly Hansard
        </Link>
      </p>
    </>
  );
}
