import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 10;

export const metadata: Metadata = buildPageMetadata({
  title: "What happens when revenue is not enough - How public money works",
  description: "A government budget can plan to spend more than the revenue expected from taxes and other ordinary sources. The difference is a budget deficit.",
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
          { text: "What happens when revenue is not enough" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="What happens when revenue is not enough"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            A government budget can plan to spend more than the revenue expected
            from taxes and other ordinary sources. The difference is a{" "}
            <strong>budget deficit</strong>.
          </p>

          <p className="govuk-body">
            A deficit may be financed through borrowing and other lawful
            financing arrangements.
          </p>

          <p className="govuk-body">
            Public borrowing is therefore part of public finance. It can provide
            resources now, but the debt, interest and other obligations affect
            future budgets.
          </p>

          <div className="govuk-inset-text">
            Article 201 requires the burdens and benefits of the use of public
            resources and public borrowing to be shared equitably between
            present and future generations.
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
