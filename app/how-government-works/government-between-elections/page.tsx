import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 9;

export const metadata: Metadata = buildPageMetadata({
  title: "Government between elections - How government works",
  description: "Democracy does not end after an election. Citizens can take part in government and hold institutions accountable between elections.",
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
          { text: "Government between elections" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Government between elections"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            Democracy does not end after an election. Citizens can take part in
            government and hold institutions accountable between elections.
          </p>

          <p className="govuk-body">
            Depending on the issue, this can include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>taking part in public participation processes</li>
            <li>submitting views on Bills and budgets</li>
            <li>petitioning Parliament or a county assembly</li>
            <li>requesting information from public bodies</li>
            <li>contacting elected representatives</li>
            <li>making complaints about public services</li>
            <li>challenging unlawful government action through legal processes</li>
          </ul>

          <p className="govuk-body">
            <Link
              href="/find-your-representatives"
              className="govuk-link"
            >
              Find your representatives
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
