import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 15;

export const metadata: Metadata = buildPageMetadata({
  title: "Public participation in budgets - How public money works",
  description: "Public participation is not simply a courtesy. Article 201 of the Constitution expressly includes public participation as a principle of public finance.",
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
          { text: "Public participation in budgets" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Public participation in budgets"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            Public participation is not simply a courtesy. Article 201 of the
            Constitution expressly includes public participation as a principle
            of public finance.
          </p>

          <p className="govuk-body">
            The Public Finance Management Act also builds public participation
            into national and county budget processes.
          </p>

          <p className="govuk-body">
            Opportunities may include:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>public budget hearings</li>
            <li>submissions to parliamentary committees</li>
            <li>county budget consultations</li>
            <li>comments on fiscal strategy documents</li>
            <li>participation through County Budget and Economic Forums</li>
          </ul>

          <p className="govuk-body">
            Notices, deadlines and submission methods change from one budget
            cycle to another, so check current notices from Parliament, the
            National Treasury, your county government and county assembly.
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
