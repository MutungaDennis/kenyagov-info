import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import {
  DATASET_THEMES,
  OPEN_DATA_MISSION,
  OPEN_DATASETS,
} from "@/lib/open-data/catalogue";
import { DATA_COLLECTIONS } from "@/lib/open-data/collections";
import { getHubCounts } from "@/lib/open-data/aggregates";

export const revalidate = 3600;

export const metadata = {
  title: "Open data",
  description:
    "The home of curated Kenyan public data on CitizenGuide.KE — collections, themes, datasets and links to official portals.",
};

/**
 * data.gov.uk-style landing: short intro → collections → theme cards → spotlight.
 * Full catalogue and filters live on /open-data/datasets so this page stays scannable.
 */
export default async function OpenDataPage() {
  const counts = await getHubCounts();
  const featured = DATA_COLLECTIONS.find((c) => c.featured);
  const themes = DATASET_THEMES.filter((t) => t.id !== "all");

  const themeHints: Record<string, string> = {
    geography: "Counties, regions and place profiles",
    elections:
      "Boundaries, registration, parties and polling geography",
    government: "Institutions, arms and levels of government",
    leadership: "Office holders and county assembly members",
    parliament: "Structured Hansard sittings on this site",
    energy: "EPRA price cycles for public tools",
    society: "Census years and reference indicators",
  };

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Open data" },
        ]}
        title="Open data"
        lead={
          <>
            The home of curated Kenyan public data to inform decisions, research
            and civic tools.{" "}
            <Link href="/open-data/standards" className="govuk-link">
              How we publish open data
            </Link>
          </>
        }
        showPrint
      >
        <p className="govuk-body govuk-!-margin-bottom-2">
          {OPEN_DATA_MISSION.principle}
        </p>
        <p className="govuk-body-s govuk-!-margin-bottom-0">
          {OPEN_DATA_MISSION.role}
        </p>
      </PageIntro>

      {/* Full-width theme board — like data.gov.uk topic cards */}
      <section className="govuk-!-margin-bottom-8" aria-labelledby="themes-heading">
        <h2 className="govuk-heading-m" id="themes-heading">
          Browse by theme
        </h2>
        <p className="govuk-body">
          Choose a topic to see related datasets. Pages stay short — you open
          only what you need.
        </p>
        <div className="app-od-card-grid">
          {themes.map((t) => {
            const n = OPEN_DATASETS.filter((d) => d.theme === t.id).length;
            return (
              <Link
                key={t.id}
                href={`/open-data/themes/${t.id}`}
                className="app-od-card"
              >
                <h3 className="app-od-card__title">{t.label}</h3>
                <p className="app-od-card__desc">
                  {themeHints[t.id] || t.description}
                </p>
                <p className="app-od-card__meta">
                  {n} dataset{n === 1 ? "" : "s"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <section aria-labelledby="collections-heading">
            <h2 className="govuk-heading-m" id="collections-heading">
              Collections
            </h2>
            <p className="govuk-body">
              Curated packs of high-quality, related data — ready to explore
              without scanning the full catalogue.
            </p>
            <div className="app-od-card-grid app-od-card-grid--stack">
              {DATA_COLLECTIONS.map((col) => (
                <Link
                  key={col.slug}
                  href={`/open-data/collections/${col.slug}`}
                  className="app-od-card app-od-card--collection"
                >
                  <h3 className="app-od-card__title">
                    {col.title}
                    {col.featured && (
                      <span className="govuk-tag govuk-tag--green govuk-!-margin-left-2 govuk-!-font-size-14">
                        Featured
                      </span>
                    )}
                  </h3>
                  <p className="app-od-card__desc">{col.shortDescription}</p>
                  <p className="app-od-card__meta">
                    {col.datasetSlugs.length} datasets
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <section aria-labelledby="spotlight-heading">
            <h2 className="govuk-heading-m" id="spotlight-heading">
              Spotlight
            </h2>
            {featured ? (
              <div className="app-od-spotlight">
                <h3 className="govuk-heading-s">
                  <Link
                    href={`/open-data/collections/${featured.slug}`}
                    className="govuk-link"
                  >
                    {featured.title}
                  </Link>
                </h3>
                <p className="govuk-body">{featured.shortDescription}</p>
                <p className="govuk-body govuk-!-margin-bottom-0">
                  <Link
                    href={`/open-data/collections/${featured.slug}`}
                    className="govuk-link govuk-!-font-weight-bold"
                  >
                    Open spotlight collection
                  </Link>
                </p>
              </div>
            ) : (
              <p className="govuk-body">No spotlight collection configured.</p>
            )}
          </section>

          <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

          <h2 className="govuk-heading-m">Find a dataset</h2>
          <p className="govuk-body">
            Search or filter the full catalogue when you know what you need.
          </p>
          <div className="govuk-button-group">
            <Link href="/open-data/datasets" className="govuk-button">
              Browse all datasets
            </Link>
            <Link
              href="/open-data/suggest"
              className="govuk-button govuk-button--secondary"
            >
              Suggest a dataset
            </Link>
          </div>

          <p className="govuk-body-s">
            {OPEN_DATASETS.length} datasets ·{" "}
            {(counts.counties || 0) > 0 && (
              <>{counts.counties} counties · </>
            )}
            {(counts.polling || 0) > 0 && (
              <>{counts.polling.toLocaleString()} polling stations (2022)</>
            )}
          </p>
        </div>

        <div className="govuk-grid-column-one-third">
          <aside className="govuk-!-display-none-print" role="complementary">
            <h2 className="govuk-heading-m">Also on open data</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/open-data/datasets" className="govuk-link">
                  Full dataset catalogue
                </Link>
              </li>
              <li>
                <Link href="/open-data/portals" className="govuk-link">
                  Official &amp; international portals
                </Link>
              </li>
              <li>
                <Link href="/open-data/standards" className="govuk-link">
                  Standards &amp; guidance
                </Link>
              </li>
              <li>
                <Link href="/open-data/suggest" className="govuk-link">
                  Suggest a dataset
                </Link>
              </li>
              <li>
                <Link href="/api/data/datasets" className="govuk-link">
                  Machine-readable catalogue (JSON)
                </Link>
              </li>
            </ul>

            <div className="govuk-inset-text">
              <p className="govuk-body-s govuk-!-margin-bottom-0">
                Independent compilation — not KNBS or IEBC. Official producers
                remain the source of truth for formal statistics.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
