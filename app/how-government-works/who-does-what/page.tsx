import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 6;

export const metadata: Metadata = buildPageMetadata({
  title: "Who does what? - How government works",
  description: "One of the most common sources of confusion is which level of government is responsible for a service.",
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
          { text: "Who does what?" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Who does what?"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            One of the most common sources of confusion is which level of
            government is responsible for a service.
          </p>

          <p className="govuk-body">
            Examples of functions assigned nationally include areas such as:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>foreign affairs</li>
            <li>defence and national security</li>
            <li>immigration and citizenship</li>
            <li>national economic policy</li>
            <li>national transport functions</li>
          </ul>

          <p className="govuk-body">
            County functions include many locally delivered services, such as:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>county health services</li>
            <li>county transport functions</li>
            <li>trade development and regulation within county functions</li>
            <li>county planning and development</li>
            <li>pre-primary education</li>
            <li>certain agriculture functions</li>
          </ul>

          <p className="govuk-body">
            Some sectors involve responsibilities at both levels, so the precise
            constitutional or statutory function matters.
          </p>

          <p className="govuk-body">
            <Link href="/county-vs-national" className="govuk-link">
              Check county and national government responsibilities
            </Link>
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
