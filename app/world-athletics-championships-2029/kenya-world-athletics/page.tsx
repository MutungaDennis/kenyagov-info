import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Kenya and World Athletics",
  description:
    "Kenya's record in international athletics and experience of hosting major athletics competitions.",
};

export default function KenyaWorldAthleticsPage() {
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
          { text: "Kenya and World Athletics" },
        ]}
        title="Kenya and World Athletics"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            Kenyan athletes have shaped the history of international
            middle-distance, long-distance, road and cross-country running.
            Kenya has also developed growing experience as a host of major
            athletics competitions.
          </p>

          <h2 className="govuk-heading-l">World championship record</h2>
          <p className="govuk-body">
            Kenya has won world titles across track, road, marathon and
            steeplechase events and is among the leading nations in{" "}
            <ExternalLink href="https://worldathletics.org/">
              World Athletics
            </ExternalLink>{" "}
            Championships history. Medal totals change after each edition and
            can also change following official result revisions.
          </p>
          <p className="govuk-body">
            Current medal tables and athlete records should therefore be
            checked through World Athletics rather than copied as permanent
            totals.
          </p>

          <h2 className="govuk-heading-l">Notable Kenyan athletes</h2>
          <p className="govuk-body">
            Kenya&apos;s international athletics history includes Olympic and world
            champions such as Kipchoge Keino, David Rudisha, Vivian Cheruiyot,
            Faith Kipyegon, Eliud Kipchoge, Hellen Obiri, Paul Tergat and Tegla
            Loroupe. This is not a complete list.
          </p>

          <h2 className="govuk-heading-l">Major competitions hosted in Kenya</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>2007 World Cross Country Championships in Mombasa</li>
            <li>2010 African Athletics Championships in Nairobi</li>
            <li>2017 World Under-18 Championships in Nairobi</li>
            <li>2021 World Under-20 Championships in Nairobi</li>
            <li>Kip Keino Classic meetings in Nairobi</li>
          </ul>

          <h2 className="govuk-heading-l">Governance and integrity</h2>
          <p className="govuk-body">
            <ExternalLink href="https://www.athleticskenya.or.ke/">
              Athletics Kenya
            </ExternalLink>{" "}
            is Kenya&apos;s national athletics federation. Hosting and sporting
            success bring responsibilities for fair selection, athlete
            welfare, safeguarding and anti-doping.
          </p>
          <p className="govuk-body">
            The{" "}
            <ExternalLink href="https://www.athleticsintegrity.org/">
              Athletics Integrity Unit
            </ExternalLink>{" "}
            handles integrity matters for international athletics. Official
            eligibility and disciplinary decisions should be checked through
            the relevant governing or integrity body.
          </p>

          <p className="govuk-body govuk-!-margin-top-8">
            <Link
              href="/world-athletics-championships-2029/about"
              className="govuk-link govuk-link--no-visited-state"
            >
              Back to About the championships
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
