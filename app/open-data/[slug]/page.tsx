import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import GovUKSummaryList from "@/components/govuk/SummaryList";
import { DataChart } from "@/components/open-data/charts";
import DatasetDownloads from "@/components/open-data/DatasetDownloads";
import {
  getAllDatasetSlugs,
  getDataset,
  getDatasetMetadata,
} from "@/lib/open-data/catalogue";
import { getDatasetSummary } from "@/lib/open-data/aggregates";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllDatasetSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const ds = getDataset(slug);
  if (!ds) return { title: "Dataset not found" };
  return {
    title: `${ds.title} — Open data`,
    description: ds.shortDescription,
  };
}

export default async function OpenDataDatasetPage({ params }: PageProps) {
  const { slug } = await params;
  const ds = getDataset(slug);
  if (!ds) notFound();

  const summary = await getDatasetSummary(slug);
  const meta = getDatasetMetadata(ds);

  const updatedLabel = summary
    ? new Date(summary.computedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Open data", href: "/open-data" },
          { text: ds.title },
        ]}
        caption="Open data"
        title={ds.title}
        lead={ds.description}
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body-s">
            <span className="govuk-tag govuk-tag--grey">{ds.themeLabel}</span>
            {summary && (
              <span className="govuk-!-margin-left-2">
                {summary.total.toLocaleString()} records in summary count
              </span>
            )}
          </p>

          <h2 className="govuk-heading-m">About this dataset</h2>
          <GovUKSummaryList
            items={[
              { key: "Publisher (original)", value: ds.publisher },
              { key: "Compiler", value: ds.compiler },
              { key: "Temporal coverage", value: ds.temporalCoverage },
              { key: "Geographic coverage", value: ds.geographicCoverage },
              { key: "Update frequency", value: ds.updateFrequency },
              {
                key: "Formats",
                value:
                  ds.formats.length > 0
                    ? ds.formats.map((f) => f.toUpperCase()).join(", ")
                    : "Summary only (no bulk export yet)",
              },
              {
                key: "Source system",
                value:
                  ds.sourceSystem === "sanity"
                    ? "Sanity CMS (structured content)"
                    : `Supabase${ds.tableName ? ` · ${ds.tableName}` : ""}`,
              },
            ]}
          />

          {summary && summary.stats.length > 0 && (
            <>
              <h2 className="govuk-heading-m">Key figures</h2>
              <GovUKSummaryList items={summary.stats} />
              {updatedLabel && (
                <p className="govuk-body-s">Summary computed: {updatedLabel}.</p>
              )}
            </>
          )}

          {summary && summary.charts.length > 0 && (
            <>
              <h2 className="govuk-heading-m">Visual summary</h2>
              <p className="govuk-body">
                Charts use small aggregates only — not the full download file —
                so pages stay fast. Types include bars, columns, lines, donuts
                and rankings depending on the data.
              </p>
              {summary.charts.map((chart) => (
                <DataChart key={chart.id} chart={chart} />
              ))}
            </>
          )}

          {summary?.preview && summary.preview.rows.length > 0 && (
            <>
              <h2 className="govuk-heading-m">Sample data</h2>
              <div className="app-table-scroll">
                <table className="govuk-table">
                  <caption className="govuk-table__caption govuk-table__caption--m">
                    {summary.preview.caption}
                  </caption>
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      {summary.preview.headers.map((h) => (
                        <th key={h} scope="col" className="govuk-table__header">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {summary.preview.rows.map((row, i) => (
                      <tr key={i} className="govuk-table__row">
                        {row.map((cell, j) => (
                          <td key={j} className="govuk-table__cell">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <DatasetDownloads
            exportEndpoint={ds.exportEndpoint}
            title={ds.title}
          />

          {ds.exportEndpoint?.includes("wards") && (
            <p className="govuk-body-s">
              Ward exports accept filters, for example{" "}
              <code>?county=Nairobi</code> or <code>?constituency=Westlands</code>.
            </p>
          )}

          <h2 className="govuk-heading-m">Licence and reuse</h2>
          <p className="govuk-body">{ds.licence}</p>

          <h2 className="govuk-heading-m">Sources</h2>
          <ul className="govuk-list govuk-list--bullet">
            {ds.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          {meta.sourceUrls.length > 0 && (
            <p className="govuk-body">
              {meta.sourceUrls.map((u, i) => (
                <span key={u.href}>
                  {i > 0 && " · "}
                  <a
                    href={u.href}
                    className="govuk-link"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {u.label}
                  </a>
                </span>
              ))}
            </p>
          )}

          <h2 className="govuk-heading-m">Fields</h2>
          <dl className="govuk-summary-list">
            {ds.fields.map((f) => (
              <div key={f.name} className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  <code>{f.name}</code>
                </dt>
                <dd className="govuk-summary-list__value">{f.description}</dd>
              </div>
            ))}
          </dl>

          {(summary?.notes?.length ||
            meta.qualityNotes.length ||
            0) > 0 && (
            <>
              <h2 className="govuk-heading-m">Notes and limitations</h2>
              <ul className="govuk-list govuk-list--bullet">
                {[...(summary?.notes || []), ...meta.qualityNotes].map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </>
          )}

          {meta.collections.length > 0 && (
            <>
              <h2 className="govuk-heading-m">Part of collections</h2>
              <ul className="govuk-list govuk-list--bullet">
                {meta.collections.map((c) => (
                  <li key={c.slug}>
                    <Link href={c.href} className="govuk-link">
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              CitizenGuide.KE is an independent guide. This dataset is a
              structured compilation of public information. It is not an official
              government statistics release.{" "}
              <Link href="/disclaimer" className="govuk-link">
                Read the disclaimer
              </Link>
              .{" "}
              <Link href="/open-data/standards" className="govuk-link">
                How we publish open data
              </Link>
              .
            </p>
          </div>

          <p className="govuk-body">
            <Link href="/open-data" className="govuk-link">
              Back to all open data
            </Link>
            {" · "}
            <Link href="/open-data/suggest" className="govuk-link">
              Suggest a dataset
            </Link>
          </p>
        </div>

        <div className="govuk-grid-column-one-third">
          <aside className="govuk-!-display-none-print" role="complementary">
            <h2 className="govuk-heading-m">Related</h2>
            <ul className="govuk-list govuk-list--spaced">
              {ds.relatedHrefs.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="govuk-link">
                    {r.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={`/open-data/themes/${ds.theme}`}
                  className="govuk-link"
                >
                  More in {ds.themeLabel}
                </Link>
              </li>
              <li>
                <Link href="/open-data" className="govuk-link">
                  All open data
                </Link>
              </li>
              <li>
                <Link href="/contact" className="govuk-link">
                  Report a data error
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
