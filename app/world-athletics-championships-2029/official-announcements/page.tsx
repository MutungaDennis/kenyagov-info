import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Nairobi 2029 official announcements",
  description:
    "A dated record of official announcements about the World Athletics Championships Nairobi 2029.",
};

export default function OfficialAnnouncementsPage() {
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
          { text: "Official announcements" },
        ]}
        title="Official announcements and updates"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            This page records significant Nairobi 2029 announcements from{" "}
            <ExternalLink href="https://worldathletics.org/">
              World Athletics
            </ExternalLink>{" "}
            and responsible Kenyan institutions. Newest announcements appear
            first.
          </p>

          <div className="govuk-inset-text">
            CitizenGuide.KE summarizes official announcements but does not
            issue event instructions. Check the named organization before
            acting, paying or sharing personal information.
          </div>

          <h2 className="govuk-heading-l">September 2026</h2>
          <h3 className="govuk-heading-m">
            Nairobi selected to host the 2029 championships
          </h3>
          <p className="govuk-body govuk-!-margin-bottom-2">
            <strong>Published:</strong> 15 September 2026
          </p>
          <p className="govuk-body govuk-!-margin-bottom-2">
            <strong>Issued by:</strong> World Athletics
          </p>
          <p className="govuk-body">
            The World Athletics Council selected Nairobi to host the 2029
            World Athletics Championships and Munich to host the 2031 edition.
            Nairobi 2029 will be the first World Athletics Championships held
            in Africa. World Athletics confirmed that the event will take
            place in September 2029.
          </p>

          <h2 className="govuk-heading-l">What is not yet announced</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>exact competition dates</li>
            <li>the complete venue and road-route plan</li>
            <li>ticket sale dates and prices</li>
            <li>the detailed competition timetable</li>
            <li>volunteer, recruitment and supplier processes</li>
            <li>spectator transport and entry arrangements</li>
          </ul>

          <h2 className="govuk-heading-l">Where updates may be published</h2>
          <p className="govuk-body">
            Kenyan announcements may be published by{" "}
            <ExternalLink href="https://www.athleticskenya.or.ke/">
              Athletics Kenya
            </ExternalLink>
            , the{" "}
            <ExternalLink href="https://www.sports.go.ke/">
              State Department for Sports
            </ExternalLink>{" "}
            or another institution responsible for a specific service. This
            page will identify the issuing body for every update.
          </p>

          <h2 className="govuk-heading-l">Reporting a suspicious announcement</h2>
          <p className="govuk-body">
            Treat requests for advance payments, personal documents or account
            credentials with caution. You can{" "}
            <Link
              href="/corrections"
              className="govuk-link govuk-link--no-visited-state"
            >
              report inaccurate information to CitizenGuide.KE
            </Link>{" "}
            or read the guidance on{" "}
            <Link
              href="/scams"
              className="govuk-link govuk-link--no-visited-state"
            >
              scams and fake websites
            </Link>
            .
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
