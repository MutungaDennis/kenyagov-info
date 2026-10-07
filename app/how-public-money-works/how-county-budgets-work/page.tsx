import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 8;

export const metadata: Metadata = buildPageMetadata({
  title: "How county budgets work - How public money works",
  description: "Each of Kenya's 47 county governments has its own budget process.",
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
          { text: "How county budgets work" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="How county budgets work"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            Each of Kenya&apos;s 47 county governments has its own budget
            process.
          </p>

          <p className="govuk-body">
            The county treasury prepares the county&apos;s fiscal plans and
            budget estimates, while the county assembly considers and approves
            the budget.
          </p>

          <h2 className="govuk-heading-m">
            County Fiscal Strategy Paper
          </h2>

          <p className="govuk-body">
            Each county prepares a County Fiscal Strategy Paper setting out its
            broad priorities and financial outlook for the coming financial
            year and the medium term.
          </p>

          <p className="govuk-body">
            The Public Finance Management Act requires the county treasury to
            seek and take into account views from the public when preparing this
            document.
          </p>

          <h2 className="govuk-heading-m">
            County budget estimates
          </h2>

          <p className="govuk-body">
            The county executive submits budget estimates to the county
            assembly. The estimates show expected revenue and planned
            expenditure by county entities and programmes.
          </p>

          <p className="govuk-body">
            The county assembly considers the estimates and takes public views
            into account before approving the county budget.
          </p>

          <h2 className="govuk-heading-m">
            County Finance and Appropriation laws
          </h2>

          <p className="govuk-body">
            Counties also enact laws necessary to implement their budgets.
            A county Finance Act may provide for county revenue measures, while
            a County Appropriation Act authorises expenditure from the county
            budget.
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
