// app/how-government-works/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import { guideBase, lastUpdated, relatedLinks, sections } from "./_shared";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "How government works",
  description:
    "How government works in Kenya under the Constitution — sovereign power, the Executive, Parliament, Judiciary, counties, commissions, elections and public accountability.",
};

export default function HowGovernmentWorksPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "How government works" },
        ]}
        caption="Government"
        title="How government works in Kenya"
        lead="Kenya is governed under the Constitution through national and county governments. Public power is exercised through institutions including the Executive, Parliament, the Judiciary, county governments and independent constitutional bodies."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            The Constitution starts from an important principle: sovereign power
            belongs to the people of Kenya. Government institutions exercise
            public authority on behalf of the people and within the limits of
            the Constitution.
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
