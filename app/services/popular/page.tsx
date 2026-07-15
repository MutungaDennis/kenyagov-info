import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
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
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Services", href: "/services" },
          { text: "Popular" },
        ]}
        title="Popular services"
        lead="Common tasks people look for. These are curated starting points — not an official ranking. Always complete applications on official government systems."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              CitizenGuide.KE does not process applications. Use{" "}
              <Link href="/ecitizen" className="govuk-link">
                eCitizen
              </Link>{" "}
              or agency portals to apply and pay.
            </p>
          </div>

          <ol className="govuk-list govuk-list--number govuk-list--spaced">
            {popularServices.map((item) => (
              <li key={item.title} className="govuk-!-margin-bottom-5">
                <h2 className="govuk-heading-s govuk-!-margin-bottom-1">
                  <Link href={item.href} className="govuk-link">
                    {item.title}
                  </Link>
                </h2>
                <p className="govuk-body govuk-!-margin-bottom-0">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>

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
        </div>

        <RelatedNav
          links={[
            { text: "eCitizen explained", href: "/ecitizen" },
            { text: "Huduma Centres", href: "/huduma-centres" },
            { text: "Scams and fake websites", href: "/scams" },
            { text: "Contact government", href: "/contact-government" },
          ]}
        />
      </div>
    </>
  );
}
