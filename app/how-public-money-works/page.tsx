// app/how-public-money-works/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import { guideBase, lastUpdated, relatedLinks, sections } from "./_shared";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "How public money works",
  description:
    "How public money works in Kenya — taxes, budgets, borrowing, national and county revenue sharing, spending, auditing and public participation.",
};

export default function HowPublicMoneyWorksPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "How public money works" },
        ]}
        caption="Public finance"
        title="How public money works"
        lead="Government raises money, decides how it will be spent, pays for public services and accounts for what was actually used. This guide explains that process at national and county level."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            Public money is not simply money held by a ministry or county
            department. Its collection, allocation, withdrawal, spending and
            auditing are governed by the Constitution and public finance laws.
          </div>

          <h2 className="govuk-heading-l">Parts of this guide</h2>

          <ol className="govuk-list govuk-list--number govuk-list--spaced">
            {sections.map((section) => (
              <li key={section.slug}>
                <Link href={`${guideBase}/${section.slug}`} className="govuk-link govuk-!-font-weight-bold">
                  {section.title}
                </Link>
                {section.description ? (
                  <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">{section.description}</p>
                ) : null}
              </li>
            ))}
          </ol>

          <p className="govuk-body govuk-!-margin-top-8">
            <strong>Last updated:</strong> {lastUpdated}
          </p>
        </div>

        <RelatedNav links={[...relatedLinks]} />
      </div>
    </>
  );
}
