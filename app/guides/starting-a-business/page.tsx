import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import PageContents from "@/components/site/PageContents";

export const revalidate = 86400;
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Starting a business — government steps",
  description:
    "Life-event guide: business name or company registration, tax PIN, county permits and common licences in Kenya.",
};

export default function StartingABusinessGuidePage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Guides", href: "/guides" },
          { text: "Starting a business" },
        ]}
        caption="Life event"
        title="Starting a business — government steps"
        lead="Typical public steps when you start trading in Kenya. Requirements differ by activity and county — always confirm on official portals."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <PageContents
            items={[
              { href: "#choose", text: "Choose a structure" },
              { href: "#register", text: "Register the business" },
              { href: "#tax", text: "Tax registration" },
              { href: "#county", text: "County permits" },
              { href: "#sector", text: "Sector licences" },
              { href: "#employ", text: "If you employ people" },
            ]}
          />

          <section id="choose" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">1. Choose a structure</h2>
            <p className="govuk-body">
              Common options include a business name (sole proprietor or
              partnership style) or a limited company. Your choice affects
              liability, filing and naming rules.
            </p>
          </section>

          <section id="register" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">2. Register the business</h2>
            <p className="govuk-body">
              Business names and companies are registered through official
              business registration channels, often via{" "}
              <Link href="/ecitizen" className="govuk-link">
                eCitizen
              </Link>
              .
            </p>
            <p className="govuk-body">
              <Link href="/topics/business" className="govuk-link">
                Business and self-employed topic
              </Link>
            </p>
          </section>

          <section id="tax" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">3. Tax registration</h2>
            <p className="govuk-body">
              Most businesses need a KRA PIN and must understand filing
              obligations (for example income tax, and VAT if thresholds apply).
            </p>
            <p className="govuk-body">
              <Link href="/topics/money-tax" className="govuk-link">
                Money and tax
              </Link>
            </p>
          </section>

          <section id="county" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">4. County permits</h2>
            <p className="govuk-body">
              A single business permit or equivalent local licence is usually
              issued by the county where you operate. Fees and categories vary by
              county.
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                <Link href="/county-vs-national" className="govuk-link">
                  County vs national government
                </Link>
              </li>
              <li>
                <Link href="/government/counties" className="govuk-link">
                  County governments
                </Link>
              </li>
            </ul>
          </section>

          <section id="sector" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">5. Sector licences</h2>
            <p className="govuk-body">
              Some activities need extra licences (food safety, transport,
              energy, professional practice). Check regulators for your sector
              via{" "}
              <Link href="/government/institutions" className="govuk-link">
                institutions
              </Link>
              .
            </p>
          </section>

          <section id="employ" className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-l">6. If you employ people</h2>
            <p className="govuk-body">
              Employers have duties under labour law and statutory contributions
              where applicable.
            </p>
            <p className="govuk-body">
              <Link href="/topics/work-employment" className="govuk-link">
                Work and employment
              </Link>
            </p>
          </section>

          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              Beware of people who charge to “guarantee” licences. See{" "}
              <Link href="/scams" className="govuk-link">
                scams and fake websites
              </Link>
              .
            </p>
          </div>
        </div>

        <RelatedNav
          links={[
            { text: "Having a baby", href: "/guides/having-a-baby" },
            { text: "Registering a death", href: "/guides/registering-a-death" },
            { text: "Popular services", href: "/services/popular" },
            { text: "Services A to Z", href: "/services/a-z" },
          ]}
        />
      </div>
    </>
  );
}
