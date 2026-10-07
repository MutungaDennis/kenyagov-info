import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 11;

export const metadata: Metadata = buildPageMetadata({
  title: "A budget is not the same as actual spending - How public money works",
  description: "This distinction is important when reading government figures.",
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
          { text: "A budget is not the same as actual spending" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="A budget is not the same as actual spending"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            This distinction is important when reading government figures.
          </p>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Budgeted
              </dt>
              <dd className="govuk-summary-list__value">
                What government planned or was authorised to spend.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Released
              </dt>
              <dd className="govuk-summary-list__value">
                Money made available during budget implementation.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Spent
              </dt>
              <dd className="govuk-summary-list__value">
                Expenditure actually incurred or recorded.
              </dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">
                Audited
              </dt>
              <dd className="govuk-summary-list__value">
                Spending and financial statements examined later through the
                audit process.
              </dd>
            </div>
          </dl>

          <p className="govuk-body">
            A headline saying that KSh 10 billion was &quot;allocated&quot; does
            not necessarily mean KSh 10 billion was eventually spent or that the
            intended result was delivered.
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
