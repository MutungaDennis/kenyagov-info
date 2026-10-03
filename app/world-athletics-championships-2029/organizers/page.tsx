import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Nairobi 2029 championship organizers",
  description:
    "Organizations responsible for planning, governing and delivering the World Athletics Championships Nairobi 2029.",
};

export default function OrganizersPage() {
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
          { text: "Championship organizers" },
        ]}
        title="Championship organizers"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            The complete Nairobi 2029 organizing structure and contact details
            have not yet been published. Responsibilities will be updated when
            formal appointments are announced.
          </div>

          <h2 className="govuk-heading-l">World Athletics</h2>
          <p className="govuk-body">
            <ExternalLink href="https://worldathletics.org/">
              World Athletics
            </ExternalLink>{" "}
            is the international governing body for athletics and owns the
            World Athletics Championships. It sets competition, entry,
            technical, integrity and event-delivery requirements and oversees
            the host&apos;s preparations.
          </p>

          <h2 className="govuk-heading-l">Athletics Kenya</h2>
          <p className="govuk-body">
            <ExternalLink href="https://www.athleticskenya.or.ke/">
              Athletics Kenya
            </ExternalLink>{" "}
            is Kenya&apos;s national member federation. Its roles include
            national-team matters and working with international and Kenyan
            partners on athletics delivery.
          </p>

          <h2 className="govuk-heading-l">Kenyan public institutions</h2>
          <p className="govuk-body">
            The{" "}
            <ExternalLink href="https://www.sports.go.ke/">
              State Department for Sports
            </ExternalLink>{" "}
            and other national and county institutions may be responsible for
            public facilities, transport, security, immigration, health,
            tourism and other services. Their exact Nairobi 2029
            responsibilities should be taken from published mandates and
            formal event plans.
          </p>

          <h2 className="govuk-heading-l">Local organizing committee</h2>
          <p className="govuk-body">
            A local organizing structure is expected to coordinate delivery in
            Kenya. CitizenGuide.KE will publish its confirmed membership,
            legal status, responsibilities and official contacts after these
            are formally announced.
          </p>

          <h2 className="govuk-heading-l">Who to contact</h2>
          <p className="govuk-body">
            Use the organization responsible for the specific issue. Do not
            send passport information, payments or accreditation documents to
            an address that has not been published by an official body.
          </p>
          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Competition rules</dt>
              <dd className="govuk-summary-list__value">World Athletics</dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Kenyan team</dt>
              <dd className="govuk-summary-list__value">Athletics Kenya</dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Tickets and spectators</dt>
              <dd className="govuk-summary-list__value">
                Official event ticketing and spectator services, when appointed
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Travel authorization</dt>
              <dd className="govuk-summary-list__value">
                Kenya&apos;s official immigration and eTA services
              </dd>
            </div>
          </dl>

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
