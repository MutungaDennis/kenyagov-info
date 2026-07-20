import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import {
  DATASET_THEMES,
  getDatasetsByTheme,
  type DatasetTheme,
} from "@/lib/open-data/catalogue";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ theme: string }>;
};

const THEME_IDS = DATASET_THEMES.filter((t) => t.id !== "all").map((t) => t.id);

export async function generateStaticParams() {
  return THEME_IDS.map((theme) => ({ theme }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { theme } = await params;
  const meta = DATASET_THEMES.find((t) => t.id === theme);
  if (!meta || meta.id === "all") return { title: "Theme not found" };
  return {
    title: `${meta.label} — Open data`,
    description: meta.description,
  };
}

export default async function OpenDataThemePage({ params }: PageProps) {
  const { theme } = await params;
  if (!THEME_IDS.includes(theme as DatasetTheme)) notFound();

  const meta = DATASET_THEMES.find((t) => t.id === theme)!;
  const datasets = getDatasetsByTheme(theme as DatasetTheme);

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Open data", href: "/open-data" },
          { text: "Themes", href: "/open-data#themes" },
          { text: meta.label },
        ]}
        caption="Open data theme"
        title={meta.label}
        lead={meta.description}
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-m">Datasets</h2>
          {datasets.length === 0 ? (
            <p className="govuk-body">No datasets in this theme yet.</p>
          ) : (
            <ul className="govuk-list app-open-data-catalogue">
              {datasets.map((ds) => (
                <li key={ds.slug} className="app-open-data-catalogue__item">
                  <h3 className="govuk-heading-s">
                    <Link href={`/open-data/${ds.slug}`} className="govuk-link">
                      {ds.title}
                    </Link>
                  </h3>
                  <p className="govuk-body">{ds.shortDescription}</p>
                  <p className="govuk-body-s govuk-!-margin-bottom-0">
                    {ds.temporalCoverage}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <p className="govuk-body govuk-!-margin-top-6">
            <Link href="/open-data#themes" className="govuk-link">
              All themes
            </Link>
            {" · "}
            <Link
              href={`/open-data?theme=${theme}#datasets`}
              className="govuk-link"
            >
              Filter full catalogue
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
