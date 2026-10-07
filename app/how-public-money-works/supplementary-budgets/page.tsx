import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 14;

export const metadata: Metadata = buildPageMetadata({
  title: "Supplementary budgets - How public money works",
  description: "An approved annual budget can change during the financial year.",
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
          { text: "Supplementary budgets" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Supplementary budgets"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            An approved annual budget can change during the financial year.
          </p>

          <p className="govuk-body">
            Government may seek supplementary appropriations where additional
            spending or changes to previously approved allocations are legally
            justified.
          </p>

          <p className="govuk-body">
            A supplementary budget does not mean the ordinary approval process
            disappears. Changes to public expenditure still require the
            constitutional and legislative authority applicable to them.
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
