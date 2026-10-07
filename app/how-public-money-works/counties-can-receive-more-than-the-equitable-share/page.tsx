import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 7;

export const metadata: Metadata = buildPageMetadata({
  title: "Counties can receive more than the equitable share - How public money works",
  description: "The equitable share is not necessarily the only transfer a county receives from the national level.",
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
          { text: "Counties can receive more than the equitable share" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Counties can receive more than the equitable share"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            The equitable share is not necessarily the only transfer a county
            receives from the national level.
          </p>

          <p className="govuk-body">
            Counties may also receive additional allocations from the national
            government&apos;s share of revenue, including allocations connected
            to particular programmes or purposes where provided for by law.
          </p>

          <p className="govuk-body">
            They may also receive grants and other lawful financing.
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
