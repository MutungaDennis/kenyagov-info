import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";

export const metadata: Metadata = {
  title: "Emergency and safety information",
  description:
    "High-level emergency and safety pointers for Kenya. CitizenGuide.KE is not an emergency service.",
};

export default function EmergencyAndSafetyPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Help", href: "/help" },
          { text: "Emergency and safety" },
        ]}
        title="Emergency and safety information"
        lead="If you are in danger, contact the police or local emergency services immediately. This website cannot dispatch help."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">Warning </span>
              CitizenGuide.KE is not an emergency hotline. Use official
              emergency numbers and local responders.
            </strong>
          </div>

          <h2 className="govuk-heading-l">Immediate danger</h2>
          <p className="govuk-body">
            For crime in progress, fire, medical emergencies or other immediate
            threats, contact the National Police Service and other local
            emergency responders using the numbers published by official
            authorities in your area. Numbers and response arrangements can
            differ by locality.
          </p>
          <p className="govuk-body">
            If you can, move to a safe place and follow instructions from
            emergency personnel.
          </p>

          <h2 className="govuk-heading-l">Reporting crime (non-emergency)</h2>
          <p className="govuk-body">
            Visit a police station to report a crime and request an occurrence
            book (OB) record where appropriate. Keep copies of documents you
            submit.
          </p>
          <p className="govuk-body">
            <Link href="/topics/crime-justice" className="govuk-link">
              Crime, justice and the law
            </Link>
          </p>

          <h2 className="govuk-heading-l">Health emergencies</h2>
          <p className="govuk-body">
            Go to the nearest appropriate health facility or call local
            ambulance services where available. For public health programme
            information (not emergencies), see{" "}
            <Link href="/topics/health" className="govuk-link">
              health and social care
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">Disasters and drought</h2>
          <p className="govuk-body">
            National and county governments coordinate disaster response through
            specialised institutions. Drought, floods and related alerts are
            issued by official agencies. Follow evacuation and safety
            instructions from authorities — not unverified social media forwards.
          </p>

          <h2 className="govuk-heading-l">Online safety</h2>
          <p className="govuk-body">
            Many “emergencies” announced by SMS are scams. Verify through
            official channels. Read{" "}
            <Link href="/scams" className="govuk-link">
              scams and fake websites
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">Gender-based violence and protection</h2>
          <p className="govuk-body">
            Survivors of violence can seek help from the police, health
            facilities, and recognised protection and hotline services published
            by government and accredited organisations. If you are in immediate
            danger, prioritise safety and emergency responders.
          </p>

          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              We do not list phone numbers here that we cannot continuously
              verify. Always confirm emergency contacts from official police,
              county or national government publications.
            </p>
          </div>
        </div>

        <RelatedNav
          links={[
            { text: "Crime, justice and the law", href: "/topics/crime-justice" },
            { text: "Contact government", href: "/contact-government" },
            { text: "Scams and fake websites", href: "/scams" },
            { text: "Complain about government", href: "/complain-about-government" },
            { text: "Help", href: "/help" },
          ]}
        />
      </div>
    </>
  );
}
