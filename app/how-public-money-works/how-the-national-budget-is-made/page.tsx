import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import ExternalLink from "@/components/site/ExternalLink";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 4;

export const metadata: Metadata = buildPageMetadata({
  title: "How the national budget is made - How public money works",
  description: "Kenya's budget is a process, not a single event on Budget Day. Work on the next financial year begins months before Parliament approves the final spending plans.",
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
          { text: "How the national budget is made" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="How the national budget is made"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <p className="govuk-body">
            Kenya&apos;s budget is a process, not a single event on Budget Day.
            Work on the next financial year begins months before Parliament
            approves the final spending plans.
          </p>

          <p className="govuk-body">
            The National Treasury manages the national government budget
            process.
          </p>

          <h2 className="govuk-heading-m">
            Budget Policy Statement
          </h2>

          <p className="govuk-body">
            An important stage is the Budget Policy Statement (BPS). It sets out
            broad strategic priorities and the fiscal framework for the coming
            financial year and the medium term.
          </p>

          <p className="govuk-body">
            It includes information such as:
          </p>

          <ul className="govuk-list govuk-list--bullet">
            <li>the economic outlook</li>
            <li>expected revenue</li>
            <li>planned expenditure</li>
            <li>borrowing and deficit financing</li>
            <li>proposed expenditure limits</li>
            <li>indicative transfers to county governments</li>
            <li>fiscal risks and financial objectives</li>
          </ul>

          <p className="govuk-body">
            <ExternalLink href="https://www.treasury.go.ke/budget-policy-statement">
              Budget Policy Statements — National Treasury
            </ExternalLink>
          </p>

          <h2 className="govuk-heading-m">
            Budget estimates
          </h2>

          <p className="govuk-body">
            Ministries and other national government entities prepare detailed
            estimates showing how much they expect to spend and on which
            programmes.
          </p>

          <p className="govuk-body">
            The Public Finance Management Act requires the national budget
            estimates to identify expenditure by vote and programme and to
            distinguish recurrent and development expenditure.
          </p>

          <h2 className="govuk-heading-m">
            National Assembly approval
          </h2>

          <p className="govuk-body">
            The national government&apos;s estimates are considered by the
            National Assembly. Parliamentary committees examine proposed
            expenditure and are required to take public views into account.
          </p>

          <p className="govuk-body">
            Approval of budget estimates does not by itself mean every public
            body can immediately take money from the Treasury. Spending must
            also have the required legal authority.
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
