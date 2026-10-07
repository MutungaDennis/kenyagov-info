import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 9;

export const metadata: Metadata = buildPageMetadata({
  title: "What recurrent and development spending mean - How public money works",
  description: "Government budgets distinguish between recurrent and development expenditure.",
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
          { text: "What recurrent and development spending mean" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="What recurrent and development spending mean"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            Government budgets distinguish between recurrent and development
            expenditure.
          </p>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Recurrent expenditure
              </dt>
              <dd className="govuk-summary-list__value">
                Ongoing costs of running government and delivering services,
                such as salaries, operations and other recurring expenses.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Development expenditure
              </dt>
              <dd className="govuk-summary-list__value">
                Spending associated with development programmes, projects and
                investment intended to create or improve public assets and
                services.
              </dd>
            </div>
          </dl>

          <p className="govuk-body">
            The label &quot;development&quot; does not by itself tell you whether
            money was well spent. Actual performance still needs to be examined
            against what was budgeted and what was delivered.
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
