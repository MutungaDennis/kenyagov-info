import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 12;

export const metadata: Metadata = buildPageMetadata({
  title: "Checks and accountability - How government works",
  description: "No single institution is responsible for all government accountability.",
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
          { text: "Checks and accountability" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Checks and accountability"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            No single institution is responsible for all government
            accountability.
          </p>

          <p className="govuk-body">
            Different mechanisms include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>parliamentary and county assembly oversight</li>
            <li>independent courts</li>
            <li>constitutional commissions and independent offices</li>
            <li>financial audit</li>
            <li>budget oversight</li>
            <li>public participation</li>
            <li>access to information</li>
            <li>administrative complaint procedures</li>
            <li>elections</li>
          </ul>

          <p className="govuk-body">
            If you have a problem with a government service or public body, the
            correct route depends on the type of complaint.
          </p>

          <p className="govuk-body">
            <Link
              href="/complain-about-government"
              className="govuk-link"
            >
              How to complain about government
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
