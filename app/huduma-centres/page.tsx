import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import ExternalLink from "@/components/site/ExternalLink";
import LastUpdated from "@/components/govuk/LastUpdated";
import { HUDUMA_SOURCE } from "@/lib/data/huduma-centres";
import {
  getExtendedHoursCentres,
  hudumaStats,
} from "@/lib/data/huduma-centres.utils";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Huduma Centres",
  description:
    "What Huduma Centres are, opening hours, how they relate to eCitizen, and how to find a centre near you across Kenya.",
};

export default function HudumaCentresPage() {
  const stats = hudumaStats();
  const extendedCount = getExtendedHoursCentres().length;

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
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              We list <strong>{stats.total}</strong> Huduma Service Centres
              across <strong>{stats.counties}</strong> counties — including{" "}
              <strong>{extendedCount}</strong> with extended hours.{" "}
              <Link
                href="/huduma-centres/locations"
                className="govuk-link govuk-!-font-weight-bold"
              >
                Find a centre near you
              </Link>
            </p>
          </div>

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
            official fees and can expose you to fraud. See{" "}
            <Link href="/scams" className="govuk-link">
              scams and fake websites
            </Link>
            .
          </p>

          <h2 className="govuk-heading-l">Opening hours</h2>
          <p className="govuk-body">
            According to{" "}
            <ExternalLink href={HUDUMA_SOURCE.url}>
              Huduma Kenya
            </ExternalLink>
            :
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>
              <strong>Standard hours</strong> — typically 8:00 am to 5:00 pm (
              {stats.standard} centres in our directory)
            </li>
            <li>
              <strong>Extended hours</strong> — typically 7:00 am to 7:00 pm (
              {stats.extended} centres)
            </li>
          </ul>
          <p className="govuk-body">
            Hours can change for public holidays or local arrangements. Confirm
            before you travel.
          </p>

          <h2 className="govuk-heading-l">Finding a centre</h2>
          <p className="govuk-body">
            Centres are listed by Huduma operational region and by county. Use
            search or filters to find an address near you.
          </p>
          <p className="govuk-body">
            <Link
              href="/huduma-centres/locations"
              className="govuk-button govuk-!-margin-bottom-2"
            >
              Browse all Huduma Centre locations
            </Link>
          </p>
          <p className="govuk-body">
            <Link
              href="/huduma-centres/locations#extended-hours"
              className="govuk-link"
            >
              Centres with extended hours
            </Link>
            {" · "}
            <ExternalLink href={HUDUMA_SOURCE.url}>
              Official Huduma Kenya centres list
            </ExternalLink>
          </p>
          <p className="govuk-body">
            <Link href="/ecitizen" className="govuk-link">
              Start with our eCitizen guide
            </Link>{" "}
            for online applications (it links to the official portal), then
            attend a centre if instructed.
          </p>

          <h2 className="govuk-heading-l">Tips for your visit</h2>
          <ul className="govuk-list govuk-list--bullet">
            <li>Check which documents and fees apply to your service</li>
            <li>Arrive early where queues are long</li>
            <li>Use only official payment points</li>
            <li>Keep application reference numbers and receipts</li>
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
              appointments on your behalf. Official information:{" "}
              <ExternalLink href={HUDUMA_SOURCE.siteUrl}>
                {HUDUMA_SOURCE.siteLabel}
              </ExternalLink>
              .
            </p>
          </div>

          <LastUpdated published="2025-01-01" lastUpdated="2026-08-08" />
        </div>

        <RelatedNav
          links={[
            { text: "Locations by region and county", href: "/huduma-centres/locations" },
            { text: "eCitizen explained", href: "/ecitizen" },
            { text: "Popular services", href: "/services/popular" },
            {
              text: "Identity and civil registration",
              href: "/topics/identity-civil-registration",
            },
            { text: "Contact government", href: "/contact-government" },
            { text: "Scams and fake websites", href: "/scams" },
          ]}
        />
      </div>
    </>
  );
}
