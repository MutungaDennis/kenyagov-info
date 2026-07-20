import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import {
  getAllCollectionSlugs,
  getCollection,
} from "@/lib/open-data/collections";
import { getDataset } from "@/lib/open-data/catalogue";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllCollectionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const col = getCollection(slug);
  if (!col) return { title: "Collection not found" };
  return {
    title: `${col.title} — Open data collection`,
    description: col.shortDescription,
  };
}

export default async function OpenDataCollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const col = getCollection(slug);
  if (!col) notFound();

  const datasets = col.datasetSlugs
    .map((s) => getDataset(s))
    .filter(Boolean);

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Open data", href: "/open-data" },
          { text: "Collections", href: "/open-data#collections" },
          { text: col.title },
        ]}
        caption="Open data collection"
        title={col.title}
        lead={col.description}
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-m">Datasets in this collection</h2>
          <p className="govuk-body">
            {datasets.length} dataset{datasets.length === 1 ? "" : "s"}. Open
            each for summaries, sources and downloads.
          </p>

          <ol className="govuk-list govuk-list--number app-open-data-catalogue">
            {datasets.map((ds) =>
              ds ? (
                <li key={ds.slug} className="app-open-data-catalogue__item">
                  <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                    <Link href={`/open-data/${ds.slug}`} className="govuk-link">
                      {ds.title}
                    </Link>
                  </h3>
                  <p className="govuk-body-s">
                    <span className="govuk-tag govuk-tag--grey govuk-!-font-size-14">
                      {ds.themeLabel}
                    </span>
                    {ds.formats.length > 0 && (
                      <span className="govuk-!-margin-left-2">
                        {ds.formats.map((f) => f.toUpperCase()).join(", ")}
                      </span>
                    )}
                  </p>
                  <p className="govuk-body">{ds.shortDescription}</p>
                  <p className="govuk-body-s govuk-!-margin-bottom-0">
                    Publisher: {ds.publisher}
                  </p>
                </li>
              ) : null,
            )}
          </ol>

          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              Collections are editorial packs. They do not replace official
              portals. Always check dataset pages for temporal coverage and
              limitations.
            </p>
          </div>

          <p className="govuk-body">
            <Link href="/open-data#collections" className="govuk-link">
              All collections
            </Link>
            {" · "}
            <Link href="/open-data" className="govuk-link">
              Open data home
            </Link>
          </p>
        </div>

        <div className="govuk-grid-column-one-third">
          <aside className="govuk-!-display-none-print">
            <h2 className="govuk-heading-m">Related on this site</h2>
            <ul className="govuk-list govuk-list--spaced">
              {col.relatedHrefs.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="govuk-link">
                    {r.label}
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
