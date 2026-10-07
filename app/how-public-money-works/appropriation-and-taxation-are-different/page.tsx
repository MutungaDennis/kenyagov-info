import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 5;

export const metadata: Metadata = buildPageMetadata({
  title: "Appropriation and taxation are different - How public money works",
  description: "Several Bills and Acts appear during a budget cycle. They do different jobs.",
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
          { text: "Appropriation and taxation are different" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Appropriation and taxation are different"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            Several Bills and Acts appear during a budget cycle. They do
            different jobs.
          </p>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Finance legislation
              </dt>
              <dd className="govuk-summary-list__value">
                Deals with revenue measures such as taxes and other fiscal
                proposals. It is about how government raises revenue.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Appropriation Act
              </dt>
              <dd className="govuk-summary-list__value">
                Gives legal authority for specified public expenditure. It is
                about what government is authorised to spend.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Division of Revenue Act
              </dt>
              <dd className="govuk-summary-list__value">
                Provides for the division of nationally raised revenue between
                the national and county levels of government for the financial
                year.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                County Allocation of Revenue Act
              </dt>
              <dd className="govuk-summary-list__value">
                Provides for the allocation among the 47 counties of the county
                governments&apos; share of nationally raised revenue and related
                allocations for the financial year.
              </dd>
            </div>
          </dl>

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
