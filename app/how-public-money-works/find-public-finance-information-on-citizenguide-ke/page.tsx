import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 18;

export const metadata: Metadata = buildPageMetadata({
  title: "Find public finance information on CitizenGuide.KE - How public money works",
  description: "Find public finance information on CitizenGuide.KE — part of how public money works on CitizenGuide.KE.",
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
          { text: "Find public finance information on CitizenGuide.KE" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Find public finance information on CitizenGuide.KE"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <ul className="govuk-list govuk-list--bullet">
            <li>
              <Link
                href="/government/counties/devolution"
                className="govuk-link"
              >
                How devolution works
              </Link>
            </li>

            <li>
              <Link href="/county-vs-national" className="govuk-link">
                County government vs national government
              </Link>
            </li>

            <li>
              <Link href="/topics/money-tax" className="govuk-link">
                Money and tax
              </Link>
            </li>

            <li>
              <Link href="/open-data" className="govuk-link">
                Open data
              </Link>
            </li>

            <li>
              <Link href="/documents" className="govuk-link">
                Policy documents
              </Link>
            </li>

            <li>
              <Link href="/access-to-information" className="govuk-link">
                Access to information
              </Link>
            </li>

            <li>
              <Link href="/legislation/acts" className="govuk-link">
                Acts of Parliament
              </Link>
            </li>
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
