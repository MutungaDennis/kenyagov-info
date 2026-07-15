import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import { countiesWithHuduma, hudumaCentres } from "@/lib/huduma-centres";

export const metadata: Metadata = {
  title: "Huduma Centre locations",
  description:
    "Directory of major Huduma Centres by county. Confirm services and opening hours with official sources before you travel.",
};

export default function HudumaLocationsPage() {
  const counties = countiesWithHuduma();

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Huduma Centres", href: "/huduma-centres" },
          { text: "Locations" },
        ]}
        title="Huduma Centre locations"
        lead="Major centres by county. This list is a public-information guide — it may not include every kiosk or temporary site, and services vary by centre."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">Warning </span>
              Confirm opening hours, queues and which services are offered before
              travelling. Prefer official Huduma Kenya announcements.
            </strong>
          </div>

          <p className="govuk-body">
            <Link href="/huduma-centres" className="govuk-link">
              What Huduma Centres are
            </Link>
            {" · "}
            <Link href="/ecitizen" className="govuk-link">
              eCitizen explained
            </Link>
          </p>

          <nav className="govuk-!-margin-bottom-6" aria-label="Counties">
            <h2 className="govuk-heading-s">Jump to county</h2>
            <p className="govuk-body">
              {counties.map((county, index) => (
                <span key={county}>
                  {index > 0 ? " · " : null}
                  <a
                    className="govuk-link"
                    href={`#county-${county.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  >
                    {county}
                  </a>
                </span>
              ))}
            </p>
          </nav>

          {counties.map((county) => {
            const id = `county-${county.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
            const centres = hudumaCentres.filter((c) => c.county === county);
            return (
              <section key={county} id={id} className="govuk-!-margin-bottom-6">
                <h2 className="govuk-heading-m">{county}</h2>
                <table className="govuk-table">
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header">
                        Centre
                      </th>
                      <th scope="col" className="govuk-table__header">
                        Town / area
                      </th>
                      <th scope="col" className="govuk-table__header">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {centres.map((centre) => (
                      <tr key={centre.name} className="govuk-table__row">
                        <th scope="row" className="govuk-table__header">
                          {centre.name}
                        </th>
                        <td className="govuk-table__cell">
                          {centre.cityOrTown}
                        </td>
                        <td className="govuk-table__cell">
                          {centre.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            );
          })}

          <p className="govuk-body-s">
            If a centre is missing or renamed,{" "}
            <Link href="/corrections" className="govuk-link">
              request a correction
            </Link>
            .
          </p>
        </div>

        <div className="govuk-grid-column-one-third">
          <aside role="complementary">
            <h2 className="govuk-heading-m">Related</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/huduma-centres" className="govuk-link">
                  Huduma Centres overview
                </Link>
              </li>
              <li>
                <Link href="/government/counties" className="govuk-link">
                  County governments
                </Link>
              </li>
              <li>
                <Link href="/services/popular" className="govuk-link">
                  Popular services
                </Link>
              </li>
              <li>
                <Link href="/scams" className="govuk-link">
                  Scams and fake websites
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
