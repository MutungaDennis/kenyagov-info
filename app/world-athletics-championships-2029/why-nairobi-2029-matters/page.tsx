import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Why Nairobi 2029 matters",
  description:
    "Why hosting the 2029 World Athletics Championships matters for Nairobi, Kenya, East Africa and the African continent.",
};

export default function WhyNairobiMattersPage() {
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
          { text: "Why Nairobi 2029 matters" },
        ]}
        title="Why Nairobi 2029 matters"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            Nairobi 2029 will be the first{" "}
            <ExternalLink href="https://worldathletics.org/">
              World Athletics
            </ExternalLink>{" "}
            Championships held in Africa. The decision brings the sport&apos;s main
            global championship to a continent with a long and influential
            athletics history.
          </p>

          <h2 className="govuk-heading-l">For Kenya</h2>
          <p className="govuk-body">
            Kenya is one of the most successful nations in international
            distance and middle-distance running. Hosting allows spectators to
            experience a senior global championship in Kenya and creates a
            test of the country&apos;s ability to deliver a complex international
            event.
          </p>

          <h2 className="govuk-heading-l">For East Africa and Africa</h2>
          <p className="govuk-body">
            The championships can widen access for regional spectators,
            officials, volunteers, media and businesses. They may also support
            future African bids for major sporting events if the event is
            delivered safely, transparently and sustainably.
          </p>

          <h2 className="govuk-heading-l">Possible long-term benefits</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>improved competition and training facilities</li>
            <li>experience for Kenyan and African event officials</li>
            <li>greater participation and interest among young people</li>
            <li>international tourism and media attention</li>
            <li>opportunities for local suppliers and workers</li>
            <li>stronger systems for staging future events</li>
          </ul>

          <h2 className="govuk-heading-l">Benefits are not automatic</h2>
          <p className="govuk-body">
            Expected benefits should not be presented as completed outcomes.
            Public authorities and organizers will need measurable plans for
            costs, procurement, accessibility, environmental impact, facility
            use and community benefit after the championships.
          </p>

          <h2 className="govuk-heading-l">How CitizenGuide.KE will report progress</h2>
          <p className="govuk-body">
            CitizenGuide.KE will separate commitments from completed work and
            link to responsible institutions. Published budgets, contracts,
            delivery milestones and post-event reports will be added when
            reliable information becomes available.
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
