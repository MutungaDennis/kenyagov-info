import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import ExternalLink from "@/components/site/ExternalLink";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 17;

export const metadata: Metadata = buildPageMetadata({
  title: "Where to find official public finance information - How public money works",
  description: "Where to find official public finance information — part of how public money works on CitizenGuide.KE.",
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
          { text: "Where to find official public finance information" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Where to find official public finance information"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <ul className="govuk-list">
            <li>
              <ExternalLink href="https://www.treasury.go.ke/">
                National Treasury
              </ExternalLink>
              <br />
              <span className="govuk-body-s">
                National budgets, fiscal policy, Budget Policy Statements and
                related documents.
              </span>
            </li>

            <li className="govuk-!-margin-top-3">
              <ExternalLink href="https://cra.go.ke/">
                Commission on Revenue Allocation
              </ExternalLink>
              <br />
              <span className="govuk-body-s">
                Revenue-sharing recommendations and information about financing
                county governments.
              </span>
            </li>

            <li className="govuk-!-margin-top-3">
              <ExternalLink href="https://cob.go.ke/">
                Office of the Controller of Budget
              </ExternalLink>
              <br />
              <span className="govuk-body-s">
                National and county budget implementation reports.
              </span>
            </li>

            <li className="govuk-!-margin-top-3">
              <ExternalLink href="https://www.oagkenya.go.ke/">
                Office of the Auditor-General
              </ExternalLink>
              <br />
              <span className="govuk-body-s">
                Audit reports for ministries, counties, state corporations and
                other public entities.
              </span>
            </li>

            <li className="govuk-!-margin-top-3">
              <ExternalLink href="https://new.kenyalaw.org/">
                Kenya Law
              </ExternalLink>
              <br />
              <span className="govuk-body-s">
                The Constitution, Public Finance Management Act, annual finance
                and appropriation legislation and other laws.
              </span>
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
