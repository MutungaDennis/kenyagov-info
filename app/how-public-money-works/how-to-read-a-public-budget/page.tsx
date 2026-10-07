import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 16;

export const metadata: Metadata = buildPageMetadata({
  title: "How to read a public budget - How public money works",
  description: "When you see a budget figure, ask:",
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
          { text: "How to read a public budget" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="How to read a public budget"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            When you see a budget figure, ask:
          </p>

          <ol className="govuk-list govuk-list--number">
            <li>
              <strong>Which financial year is this?</strong>
            </li>
            <li>
              <strong>Is the figure proposed, approved or actual?</strong>
            </li>
            <li>
              <strong>Is it recurrent or development expenditure?</strong>
            </li>
            <li>
              <strong>Which ministry, department, agency or county owns it?</strong>
            </li>
            <li>
              <strong>What programme or project is the money for?</strong>
            </li>
            <li>
              <strong>Has the money actually been released?</strong>
            </li>
            <li>
              <strong>How much has actually been spent?</strong>
            </li>
            <li>
              <strong>What was actually delivered?</strong>
            </li>
            <li>
              <strong>What did the Controller of Budget report?</strong>
            </li>
            <li>
              <strong>What did the Auditor-General find?</strong>
            </li>
          </ol>

          <div className="govuk-inset-text">
            <strong>Allocation does not mean expenditure.</strong>
            <br />
            A budget tells you what government plans or is authorised to spend.
            Budget implementation and audit reports help show what happened
            afterwards.
          </div>

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
