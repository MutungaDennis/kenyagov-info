import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import ExternalLink from "@/components/site/ExternalLink";

export const metadata: Metadata = {
  title: "Huduma Centres",
  description:
    "What Huduma Centres are, how they relate to eCitizen, and how they help you access government services in person.",
};

export default function HudumaCentresPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Digital government", href: "/topics/digital-government" },
          { text: "Huduma Centres" },
        ]}
        caption="Digital government"
        title="Huduma Centres"
        lead="Huduma Centres are government one-stop service centres where you can access many public services in person, often with staff assistance. They complement online services such as eCitizen."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">What you can typically do</h2>
          <p className="govuk-body">
            Available services vary by centre and over time, but commonly
            include identity and registration services, selected business
            services, and support for digital applications that still need
            biometrics or document checks.
          </p>
          <p className="govuk-body">
            Always confirm which services your local centre offers before you
            travel. Bring original documents and copies as required for the
            service.
          </p>

          <h2 className="govuk-heading-l">How Huduma relates to eCitizen</h2>
          <p className="govuk-body">
            Many services start online on{" "}
            <Link href="/ecitizen" className="govuk-link">
              eCitizen
            </Link>
            . A Huduma Centre may help you complete steps that cannot be finished
            fully online, or assist people who need help using digital systems.
          </p>
          <p className="govuk-body">
            Paying an unofficial “broker” outside the centre does not replace
            official fees and can expose you to fraud.
          </p>

          <h2 className="govuk-heading-l">Finding a centre</h2>
          <p className="govuk-body">
            Centres are located across counties, including major urban hubs.
            Opening hours and queue systems can change. Use official Huduma
            Kenya / government announcements and local public notices for the
            current list and locations.
          </p>
          <p className="govuk-body">
            <ExternalLink href="https://www.ecitizen.go.ke">
              Start from eCitizen
            </ExternalLink>{" "}
            for online applications, then attend a centre if instructed.
          </p>

          <h2 className="govuk-heading-l">Tips for your visit</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>Check which documents and fees apply to your service</li>
            <li>Arrive early where queues are long</li>
            <li>Use only official payment points</li>
            <li>
              Keep application reference numbers and receipts
            </li>
            <li>
              Ask staff about accessible or priority arrangements if you need
              them
            </li>
          </ul>

          <h2 className="govuk-heading-l">County services</h2>
          <p className="govuk-body">
            Not every county licence or local payment is handled at Huduma
            Centres. Some services remain with county offices or county digital
            portals. See{" "}
            <Link href="/county-vs-national" className="govuk-link">
              county vs national government
            </Link>
            .
          </p>

          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              CitizenGuide.KE does not operate Huduma Centres and cannot book
              appointments on your behalf.
            </p>
          </div>
        </div>

        <RelatedNav
          links={[
            { text: "eCitizen explained", href: "/ecitizen" },
            { text: "Browse services", href: "/services" },
            { text: "Identity and civil registration", href: "/topics/identity-civil-registration" },
            { text: "Contact government", href: "/contact-government" },
            { text: "Scams and fake websites", href: "/scams" },
          ]}
        />
      </div>
    </>
  );
}
