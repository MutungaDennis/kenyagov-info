import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Nairobi 2029 dates and venues",
  description:
    "Confirmed dates, stadium and venue information for the World Athletics Championships Nairobi 2029.",
};

const datePages = [
  {
    title: "Championship dates",
    href: "/world-athletics-championships-2029/championship-dates",
    description:
      "The confirmed event period, information still to be announced and what to check before booking travel.",
  },
];

const venuePages = [
  {
    title: "Kasarani Stadium",
    href: "/world-athletics-championships-2029/kasarani-stadium",
    description:
      "The principal stadium, its role in Nairobi's bid and venue information still awaiting confirmation.",
  },
  {
    title: "Competition and training venues",
    href: "/world-athletics-championships-2029/competition-training-venues",
    description:
      "Stadium, warm-up and training facilities and how venue confirmation will be reported.",
  },
  {
    title: "Road events and ceremonies",
    href: "/world-athletics-championships-2029/road-events-ceremonies",
    description:
      "Road-event routes, start and finish areas, public viewing and opening or closing ceremonies.",
  },
] as const;

export default function DatesVenuesPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          {
            text: "World Athletics Championships Nairobi 2029",
            href: "/world-athletics-championships-2029",
          },
          {
            text: "About the championships",
            href: "/world-athletics-championships-2029/about",
          },
          { text: "Dates and venues" },
        ]}
        title="Dates and venues"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            <strong>Exact competition dates have not been announced.</strong>{" "}
            <ExternalLink href="https://worldathletics.org/">
              World Athletics
            </ExternalLink>{" "}
            has confirmed Nairobi as host and September 2029 as the event
            period.
          </div>

          <h2 className="govuk-heading-l">When the championships take place</h2>
          <ul className="govuk-list govuk-list--spaced">
            {datePages.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold"
                >
                  {page.title}
                </Link>
                <p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  {page.description}
                </p>
              </li>
            ))}
          </ul>

          <h2 className="govuk-heading-l govuk-!-margin-top-8">Venues</h2>
          <ul className="govuk-list govuk-list--spaced">
            {venuePages.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold"
                >
                  {page.title}
                </Link>
                <p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                  {page.description}
                </p>
              </li>
            ))}
          </ul>

          <h2 className="govuk-heading-l govuk-!-margin-top-8">
            Travel to the venues
          </h2>
          <p className="govuk-body">
            Transport routes, parking, event shuttles, road closures and
            entrances are covered under{" "}
            getting to the venues
            .
          </p>
        </div>
      </div>
    </>
  );
}
