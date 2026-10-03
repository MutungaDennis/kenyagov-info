import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "World Athletics Championships explained",
  description:
    "Understand what the World Athletics Championships are, how the competition works and how it differs from other international athletics events.",
};

export default function ChampionshipsExplainedPage() {
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
          { text: "Championships explained" },
        ]}
        title="World Athletics Championships explained"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            The World Athletics Championships are the main global championship
            organized by{" "}
            <ExternalLink href="https://worldathletics.org/">
              World Athletics
            </ExternalLink>
            . Athletes represent their countries in track, field, road and
            combined events.
          </p>

          <h2 className="govuk-heading-l">How often they take place</h2>
          <p className="govuk-body">
            The first championships were held in Helsinki in 1983. The event
            is normally held every 2 years. Nairobi will host the 2029 edition
            after Beijing hosts the 2027 championships.
          </p>

          <h2 className="govuk-heading-l">How they differ from the Olympics</h2>
          <p className="govuk-body">
            The World Athletics Championships are dedicated to athletics. The{" "}
            <ExternalLink href="https://www.olympics.com/en/">
              Olympic Games
            </ExternalLink>{" "}
            include many sports and are governed by the International Olympic
            Committee.
          </p>
          <p className="govuk-body">
            Both competitions include elite international athletics, but they
            use separate qualification systems, schedules and organizing
            structures. An athlete&apos;s result at one competition does not count
            as a result at the other.
          </p>

          <h2 className="govuk-heading-l">Other international competitions</h2>
          <p className="govuk-body">
            The championships are different from the{" "}
            <ExternalLink href="https://www.diamondleague.com/">
              Diamond League
            </ExternalLink>
            , which is a season-long series of one-day meetings. They are also
            different from continental championships, road-running
            championships and age-group competitions.
          </p>

          <h2 className="govuk-heading-l">Who can compete</h2>
          <p className="govuk-body">
            National federations select eligible athletes under qualification
            and entry rules issued by World Athletics. Qualification may be
            based on entry standards, world rankings, wild cards or other
            published rules for a particular event.
          </p>
          <p className="govuk-body">
            The final Nairobi 2029 qualification and entry rules have not yet
            been published.
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
