import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Nairobi 2029 competition and training venues",
  description:
    "Confirmed and pending information about competition, warm-up and training venues for the World Athletics Championships Nairobi 2029.",
};

export default function CompetitionTrainingVenuesPage() {
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
            text: "Dates and venues",
            href: "/world-athletics-championships-2029/dates-venues",
          },
          { text: "Competition and training venues" },
        ]}
        title="Competition and training venues"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            <strong>The complete venue plan has not been announced.</strong>{" "}
            Kasarani is identified as the principal stadium, but additional
            competition, warm-up and training facilities are still to be
            confirmed publicly.
          </div>

          <h2 className="govuk-heading-l">Competition venues</h2>
          <p className="govuk-body">
            Different disciplines can require a stadium, approved road routes,
            dedicated start and finish areas and technical facilities. The
            final Nairobi 2029 programme will determine which venues are used
            and on which days.
          </p>

          <h2 className="govuk-heading-l">Warm-up facilities</h2>
          <p className="govuk-body">
            Athletes require controlled warm-up areas close enough to the
            competition venue for call-room and reporting procedures. The
            location, access rules and events supported by each warm-up
            facility have not been published.
          </p>

          <h2 className="govuk-heading-l">Training venues</h2>
          <p className="govuk-body">
            Official training venues may be used by accredited teams before
            and during the championships. Public access may be restricted even
            where a facility is normally open to the public.
          </p>

          <h2 className="govuk-heading-l">How venues will be assessed</h2>
          <p className="govuk-body">
            Venue information should be confirmed through the event organizers
            and <ExternalLink href="https://worldathletics.org/">World Athletics</ExternalLink>.
            CitizenGuide.KE will distinguish among proposed, approved and
            operational venues.
          </p>

          <h2 className="govuk-heading-l">Information published for each venue</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>official name and address</li>
            <li>events or functions assigned to it</li>
            <li>days and hours of operation</li>
            <li>who may enter and whether a ticket or accreditation is needed</li>
            <li>accessibility arrangements</li>
            <li>transport and security information</li>
            <li>temporary closures or changes to normal public access</li>
          </ul>

          <h2 className="govuk-heading-l">Spectators and training venues</h2>
          <p className="govuk-body">
            Training and warm-up facilities should not be treated as spectator
            venues unless public access is explicitly confirmed. A championship
            ticket may not grant entry to a training venue.
          </p>

          <p className="govuk-body govuk-!-margin-top-8">
            <Link
              href="/world-athletics-championships-2029/dates-venues"
              className="govuk-link govuk-link--no-visited-state"
            >
              Back to Dates and venues
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
