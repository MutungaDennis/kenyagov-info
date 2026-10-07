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
  title: "Sovereign power belongs to the people - How government works",
  description: "Kenya's constitutional system begins with the people rather than with the President, Parliament or any other institution.",
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
          { text: "Sovereign power belongs to the people" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Sovereign power belongs to the people"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            Kenya&apos;s constitutional system begins with the people rather
            than with the President, Parliament or any other institution.
          </p>

          <p className="govuk-body">
            Sovereign power may be exercised directly by the people or through
            democratically elected representatives.
          </p>

          <p className="govuk-body">
            Under the Constitution, that power is delegated to:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>Parliament and county legislative assemblies</li>
            <li>the national Executive and county executive structures</li>
            <li>the Judiciary and independent tribunals</li>
          </ul>

          <div className="govuk-inset-text">
            Holding a public office does not give a person unlimited authority.
            Every public institution can exercise only the powers given to it
            by the Constitution and the law.
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
