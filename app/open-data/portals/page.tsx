import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import { PORTAL_REGIONS, portalsByRegion } from "@/lib/open-data/portals";

export const revalidate = 86400;

export const metadata = {
  title: "Open data portals directory",
  description:
    "Kenya-first directory of official and international open-data portals, plus open-data standards. Independent guide by CitizenGuide.KE.",
};

export default function OpenDataPortalsPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Open data", href: "/open-data" },
          { text: "Portals directory" },
        ]}
        title="Open data portals"
        lead="Links to official Kenyan sources, African and global open-data platforms, and publishing standards. This directory does not host their data."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              Prefer Kenyan official producers (KNBS, IEBC, Treasury, CRA,
              Parliament) for authoritative figures. CitizenGuide hosts{" "}
              <Link href="/open-data" className="govuk-link">
                curated civic datasets
              </Link>{" "}
              separately.
            </p>
          </div>

          {PORTAL_REGIONS.map((region) => {
            const portals = portalsByRegion(region.id);
            return (
              <section
                key={region.id}
                id={region.id}
                className="govuk-!-margin-bottom-8"
              >
                <h2 className="govuk-heading-m">{region.title}</h2>
                <p className="govuk-body">{region.intro}</p>
                <details className="govuk-details" open={region.id === "kenya"}>
                  <summary className="govuk-details__summary">
                    <span className="govuk-details__summary-text">
                      {portals.length} links — {region.title}
                    </span>
                  </summary>
                  <div className="govuk-details__text">
                    <dl className="govuk-summary-list">
                      {portals.map((p) => (
                        <div key={p.href} className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">
                            <a
                              href={p.href}
                              className="govuk-link"
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              {p.name}
                            </a>
                          </dt>
                          <dd className="govuk-summary-list__value">
                            {p.description}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </details>
              </section>
            );
          })}

          <p className="govuk-body">
            Suggest a missing portal via{" "}
            <Link href="/open-data/suggest" className="govuk-link">
              suggest a dataset
            </Link>
            .
          </p>
          <p className="govuk-body">
            <Link href="/open-data" className="govuk-link">
              Back to open data
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
