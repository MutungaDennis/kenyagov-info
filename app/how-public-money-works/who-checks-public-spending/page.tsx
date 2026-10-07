import type { Metadata } from "next";
import PageIntro from "@/components/site/PageIntro";
import AutoContents from "@/components/site/AutoContents";
import RelatedNav from "@/components/site/RelatedNav";
import SectionPager from "@/components/site/SectionPager";
import { buildPageMetadata } from "@/lib/seo";
import ExternalLink from "@/components/site/ExternalLink";
import { guideBase, guideName, lastUpdated, relatedLinks, sections } from "../_shared";

export const revalidate = 86400;

const index = 12;

export const metadata: Metadata = buildPageMetadata({
  title: "Who checks public spending - How public money works",
  description: "The Controller of Budget is an independent office established under Article 228 of the Constitution.",
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
          { text: "Who checks public spending" },
        ]}
        caption={`${guideName} · Part ${index + 1} of ${sections.length}`}
        title="Who checks public spending"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AutoContents />

          <h2 className="govuk-heading-m">
            Controller of Budget
          </h2>

          <p className="govuk-body">
            The Controller of Budget is an independent office established under
            Article 228 of the Constitution.
          </p>

          <p className="govuk-body">
            The Controller oversees implementation of national and county
            budgets by authorising withdrawals from specified public funds.
            A withdrawal cannot be approved unless the Controller is satisfied
            that it is authorised by law.
          </p>

          <p className="govuk-body">
            The office also publishes reports on national and county budget
            implementation.
          </p>

          <p className="govuk-body">
            <ExternalLink href="https://cob.go.ke/">
              Office of the Controller of Budget
            </ExternalLink>
          </p>

          <h2 className="govuk-heading-m">
            Auditor-General
          </h2>

          <p className="govuk-body">
            The Auditor-General independently audits the accounts of national
            and county government institutions and other public entities that
            fall within the constitutional mandate.
          </p>

          <p className="govuk-body">
            An audit looks back at how public money was accounted for and used.
            Audit reports can identify matters requiring explanation,
            correction, recovery or further scrutiny.
          </p>

          <p className="govuk-body">
            <ExternalLink href="https://www.oagkenya.go.ke/">
              Office of the Auditor-General
            </ExternalLink>
          </p>

          <h2 className="govuk-heading-m">
            Parliament and county assemblies
          </h2>

          <p className="govuk-body">
            Parliament exercises national-level budget and financial oversight
            through the constitutional and legislative process, including
            committees that examine expenditure and audit findings.
          </p>

          <p className="govuk-body">
            County assemblies perform corresponding legislative and oversight
            functions over county budgets and county public finances.
          </p>

          <h2 className="govuk-heading-m">
            National Treasury and county treasuries
          </h2>

          <p className="govuk-body">
            The National Treasury manages the national public finance framework
            and national budget process within its legal mandate.
          </p>

          <p className="govuk-body">
            County treasuries perform public financial management functions for
            their respective county governments.
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
