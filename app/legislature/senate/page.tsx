import Link from "next/link";
//import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function SenatePage() {
  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/legislature" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Legislature", href: "/legislature" },
          { text: "The Senate", href: "/legislature/senate" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">The Senate</h1>
            <p className="govuk-body-l">
              The Upper House of the Parliament of Kenya, representing the interests of the 47 counties.
            </p>

            <div className="govuk-inset-text">
              Established under Chapter 8 of the Constitution of Kenya 2010 to protect devolution and county governments.
            </div>

            <GovUKSummaryList
              items={[
                { key: "Constitutional Role", value: "Representation and protection of counties and devolution" },
                { key: "Total Members", value: "67" },
                { key: "Current Speaker", value: "Hon. Amason Jeffah Kingi" },
                { key: "Term", value: "Five years" },
              ]}
            />

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Composition</h2>
            <GovUKSummaryList
              items={[
                { key: "Elected Senators", value: "47 (one Senator per county)" },
                { key: "Nominated Members", value: "16 women + 2 representing youth + 2 representing persons with disabilities" },
                { key: "The Speaker", value: "Hon. Amason Kingi (non-voting except in a tie)" },
              ]}
            />

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Key Functions of the Senate</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>Representing and protecting the interests of the 47 counties</li>
              <li>Participating in the law-making process, especially Bills affecting counties</li>
              <li>Approving the division of revenue between national and county governments</li>
              <li>Oversight of national institutions and county governments</li>
              <li>Impeachment of the President, Deputy President, and Governors</li>
              <li>Approval of international treaties and agreements that affect counties</li>
            </ul>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Unique Powers</h2>
            <p className="govuk-body">
              Unlike the National Assembly, the Senate has special responsibility for matters concerning devolution 
              and the protection of county governments. It ensures that counties are not undermined by national legislation.
            </p>

            <div className="govuk-!-margin-top-9">
              <Link href="/legislature/senate/senators" className="govuk-link">
                View Current Senators →
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