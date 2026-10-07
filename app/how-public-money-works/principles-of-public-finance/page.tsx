import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 1;

export const metadata: Metadata = buildPageMetadata({
  title: "Principles of public finance - How public money works",
  description: "Article 201 of the Constitution sets principles that apply to public finance in Kenya.",
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
          { text: "Principles of public finance" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Principles of public finance"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            Article 201 of the Constitution sets principles that apply to public
            finance in Kenya.
          </p>

          <p className="govuk-body">
            They include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>openness and accountability</li>
            <li>public participation in financial matters</li>
            <li>fair sharing of the burden of taxation</li>
            <li>
              equitable sharing of nationally raised revenue between national
              and county governments
            </li>
            <li>equitable development of the country</li>
            <li>
              fairness between present and future generations when public
              resources and borrowing are used
            </li>
            <li>prudent and responsible use of public money</li>
            <li>responsible financial management</li>
            <li>clear fiscal reporting</li>
          </ul>

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
