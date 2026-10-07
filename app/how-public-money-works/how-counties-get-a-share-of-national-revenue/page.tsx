import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import ExternalLink from "@/components/site/ExternalLink";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 6;

export const metadata: Metadata = buildPageMetadata({
  title: "How counties get a share of national revenue - How public money works",
  description: "Revenue raised nationally is shared between the national and county levels of government.",
  path: `${guideBase}/${sections[index].slug}`,
});

export default function Page() {
  const previous = index > 0 ? sections[index - 1] : null;
  const next = index < sections.length - 1 ? sections[index + 1] : null;

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: guideName, href: guideBase },
          { text: "How counties get a share of national revenue" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="How counties get a share of national revenue"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            Revenue raised nationally is shared between the national and county
            levels of government.
          </p>

          <p className="govuk-body">
            This is commonly described using two terms:
          </p>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Vertical sharing
              </dt>
              <dd className="govuk-summary-list__value">
                Deciding how nationally raised revenue is divided between the
                national government and the county level of government.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Horizontal sharing
              </dt>
              <dd className="govuk-summary-list__value">
                Deciding how the county share is distributed among Kenya&apos;s
                47 county governments.
              </dd>
            </div>
          </dl>

          <h2 className="govuk-heading-m">
            The Commission on Revenue Allocation
          </h2>

          <p className="govuk-body">
            The Commission on Revenue Allocation (CRA) makes recommendations on
            the basis for equitable sharing of nationally raised revenue both
            between the two levels of government and among county governments.
          </p>

          <p className="govuk-body">
            CRA considers the constitutional criteria for equitable sharing,
            including the functions of the two levels of government, county
            needs, economic disparities and fiscal responsibility.
          </p>

          <p className="govuk-body">
            <ExternalLink href="https://cra.go.ke/">
              Commission on Revenue Allocation
            </ExternalLink>
          </p>

          <h2 className="govuk-heading-m">
            The 15% constitutional minimum
          </h2>

          <p className="govuk-body">
            Article 203 of the Constitution provides that the equitable share
            allocated to county governments must be at least{" "}
            <strong>15%</strong> of all revenue collected by the national
            government.
          </p>

          <p className="govuk-body">
            For this constitutional calculation, the percentage is based on the
            most recent audited accounts of revenue received that have been
            approved by the National Assembly.
          </p>

          <div className="govuk-inset-text">
            <strong>The 15% figure is a minimum, not a fixed county share.</strong>
            <br />
            The amount allocated to counties in a particular year can be higher
            than the constitutional minimum.
          </div>

          <h2 className="govuk-heading-m">
            How the money is divided among the 47 counties
          </h2>

          <p className="govuk-body">
            The Constitution gives the Senate the role of determining
            periodically the basis for sharing the county equitable share among
            the 47 counties, after considering CRA&apos;s recommendations and
            the constitutional criteria.
          </p>

          <p className="govuk-body">
            The formula can therefore change over time. Factors used in a
            particular revenue-sharing basis should be checked against the
            current parliamentary determination rather than assumed from an
            older formula.
          </p>

          <SectionPager
            previous={previous ? { href: `${guideBase}/${previous.slug}`, title: previous.title } : null}
            next={next ? { href: `${guideBase}/${next.slug}`, title: next.title } : null}
            parent={{ href: guideBase, title: guideName }}
          />

          <p className="govuk-body govuk-!-margin-top-8">
            <strong>Last updated:</strong> {lastUpdated}
          </p>
        </div>

        <RelatedNav links={[...relatedLinks]} />
      </div>
    </>
  );
}
