import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function NationalAssemblyPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/legislature" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Legislature", href: "/legislature" },
          { text: "National Assembly", href: "/legislature/national-assembly" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">National Assembly</h1>
            <p className="govuk-body-l">
              The lower house of the Parliament of Kenya and the primary law-making body of the nation.
            </p>

            <div className="govuk-inset-text">
              Established under Chapter 8 of the Constitution of Kenya 2010.
            </div>

            <GovUKSummaryList
              items={[
                { key: "Constitutional Role", value: "Primary legislative house representing the people of Kenya" },
                { key: "Total Members", value: "349 (as of 2022–2027 term)" },
                { key: "Current Speaker", value: "Hon. Moses Masika Wetangula" },
                { key: "Term", value: "Five years" },
                { key: "Election", value: "Directly elected from 290 constituencies + special seats" },
              ]}
            />

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Composition</h2>
            <GovUKSummaryList
              items={[
                { key: "Elected Members", value: "290 Members of Parliament (one per constituency)" },
                { key: "Women Representatives", value: "47 (one per county)" },
                { key: "Nominated Members", value: "12 (representing special interests: youth, persons with disabilities, and workers)" },
                { key: "The Speaker", value: "Hon. Moses Wetangula (non-voting except in tie)" },
              ]}
            />

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Key Functions</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>Enacting legislation (Bills) for the whole country</li>
              <li>Approving the national Budget and overseeing public spending</li>
              <li>Oversight of the Executive (summoning Cabinet Secretaries, investigations)</li>
              <li>Representation of the people through constituency and county women representatives</li>
              <li>Approving international treaties and agreements</li>
              <li>Impeachment of the President or Deputy President (together with the Senate)</li>
            </ul>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">How a Bill Becomes Law</h2>
            <p className="govuk-body">
              Most Bills are introduced in the National Assembly. After passing here, they go to the Senate 
              (if they affect counties) and finally receive Presidential Assent to become law.
            </p>

            <div className="govuk-!-margin-top-9">
              <Link href="/legislature/national-assembly/members" className="govuk-link">
                View Current Members of the National Assembly →
              </Link>
            </div>
          </div>
        </div>

        {/* Feedback at the bottom */}
        <GovUKFeedback />
      </main>
    </div>
  );
}