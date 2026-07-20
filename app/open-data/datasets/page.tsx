import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import {
  DATASET_THEMES,
  OPEN_DATASETS,
  getDatasetsByTheme,
  searchDatasets,
  type DatasetTheme,
} from "@/lib/open-data/catalogue";
import { getHubCounts } from "@/lib/open-data/aggregates";

export const revalidate = 3600;

export const metadata = {
  title: "Dataset catalogue — Open data",
  description:
    "Search and filter all open datasets published by CitizenGuide.KE.",
};

type PageProps = {
  searchParams: Promise<{ theme?: string; q?: string }>;
};

export default async function OpenDataDatasetsPage({ searchParams }: PageProps) {
  const { theme: themeRaw = "all", q = "" } = await searchParams;
  const theme = (
    DATASET_THEMES.some((t) => t.id === themeRaw) ? themeRaw : "all"
  ) as DatasetTheme | "all";

  const counts = await getHubCounts();

  let datasets = q.trim() ? searchDatasets(q) : getDatasetsByTheme(theme);
  if (q.trim() && theme !== "all") {
    datasets = datasets.filter((d) => d.theme === theme);
  }

  const countBySlug: Record<string, number | undefined> = {
    counties: counts.counties,
    wards: counts.wards,
    constituencies: counts.constituencies,
    institutions: counts.institutions,
    leaders: counts.leaders,
    "polling-stations": counts.polling,
    "political-parties": counts.parties,
    coalitions: counts.coalitions,
    mcas: counts.mcas,
    "hansard-sittings": counts.hansard,
  };

  const themeLabel =
    DATASET_THEMES.find((t) => t.id === theme)?.label || theme;

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Open data", href: "/open-data" },
          { text: "Datasets" },
        ]}
        title="Dataset catalogue"
        lead="Search or filter every dataset we publish. Open a dataset for summaries, charts and downloads."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <form method="GET" className="govuk-!-margin-bottom-6">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="q">
                Search datasets
              </label>
              <div className="govuk-hint" id="q-hint">
                Title, theme, publisher or table name
              </div>
              <input
                className="govuk-input"
                id="q"
                name="q"
                type="search"
                defaultValue={q}
                aria-describedby="q-hint"
              />
            </div>
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="theme">
                Theme
              </label>
              <select
                className="govuk-select"
                id="theme"
                name="theme"
                defaultValue={theme}
              >
                {DATASET_THEMES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="govuk-button govuk-button--secondary"
            >
              Apply filters
            </button>
            {(q || theme !== "all") && (
              <Link
                href="/open-data/datasets"
                className="govuk-link govuk-!-margin-left-3"
              >
                Clear filters
              </Link>
            )}
          </form>

          <p className="govuk-body-s">
            Showing {datasets.length} of {OPEN_DATASETS.length} datasets
            {theme !== "all" ? ` in ${themeLabel}` : ""}
            {q.trim() ? ` matching “${q.trim()}”` : ""}.
          </p>

          {datasets.length === 0 ? (
            <div className="govuk-inset-text">
              <p className="govuk-body">
                No datasets match.{" "}
                <Link href="/open-data/datasets" className="govuk-link">
                  Clear filters
                </Link>{" "}
                or{" "}
                <Link href="/open-data/suggest" className="govuk-link">
                  suggest a dataset
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="govuk-list app-open-data-catalogue">
              {datasets.map((ds) => {
                const n = countBySlug[ds.slug];
                return (
                  <li key={ds.slug} className="app-open-data-catalogue__item">
                    <h2 className="govuk-heading-s govuk-!-margin-bottom-1">
                      <Link
                        href={`/open-data/${ds.slug}`}
                        className="govuk-link"
                      >
                        {ds.title}
                      </Link>
                    </h2>
                    <p className="govuk-body-s govuk-!-margin-bottom-1">
                      <span className="govuk-tag govuk-tag--grey govuk-!-font-size-14">
                        {ds.themeLabel}
                      </span>
                      {n != null && n > 0 && (
                        <span className="govuk-!-margin-left-2">
                          {n.toLocaleString()} records
                        </span>
                      )}
                      {ds.formats.length > 0 && (
                        <span className="govuk-!-margin-left-2">
                          · {ds.formats.map((f) => f.toUpperCase()).join(", ")}
                        </span>
                      )}
                    </p>
                    <p className="govuk-body govuk-!-margin-bottom-1">
                      {ds.shortDescription}
                    </p>
                    <p className="govuk-body-s govuk-!-margin-bottom-0">
                      Publisher: {ds.publisher}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="govuk-body govuk-!-margin-top-6">
            <Link href="/open-data" className="govuk-link">
              Back to open data home
            </Link>
          </p>
        </div>

        <div className="govuk-grid-column-one-third">
          <aside className="govuk-!-display-none-print">
            <h2 className="govuk-heading-m">Browse by theme</h2>
            <ul className="govuk-list govuk-list--spaced">
              {DATASET_THEMES.filter((t) => t.id !== "all").map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/open-data/themes/${t.id}`}
                    className="govuk-link"
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
