import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ChevronLinkList from "@/components/site/ChevronLinkList";
import { popularServices } from "@/lib/popular-services";

export const metadata: Metadata = {
  title: "Popular services",
  description:
    "The most common government service journeys for Kenyan citizens — curated guides on CitizenGuide.KE.",
};

export default function PopularServicesPage() {
  return (
    <>
      <PageIntro
        fullWidth
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Services", href: "/services" },
          { text: "Popular" },
        ]}
        title="Popular services"
        lead="Common tasks people look for. These are curated starting points — not an official ranking. Always complete applications on official government systems."
      />

      <div className="govuk-inset-text">
        <p className="govuk-body govuk-!-margin-bottom-0">
          CitizenGuide.KE does not process applications. Use{" "}
          <Link href="/ecitizen" className="govuk-link">
            eCitizen
          </Link>{" "}
          or agency portals to apply and pay.
        </p>
      </div>

      <ChevronLinkList
        ariaLabel="Popular services"
        items={popularServices.map((item) => ({
          title: item.title,
          href: item.href,
          description: item.description,
        }))}
      />

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <h2 className="govuk-heading-m">More ways to find a service</h2>
      <ul className="govuk-list govuk-list--bullet">
        <li>
          <Link href="/services" className="govuk-link">
            Search and filter all services
          </Link>
        </li>
        <li>
          <Link href="/services/a-z" className="govuk-link">
            Services A to Z
          </Link>
        </li>
        <li>
          <Link href="/topics" className="govuk-link">
            Browse topics
          </Link>
        </li>
        <li>
          <Link href="/guides" className="govuk-link">
            Life-event and how-to guides
          </Link>
        </li>
      </ul>
    </>
  );
}
