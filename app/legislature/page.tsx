import Link from "next/link";
import GovUKBackLink from "@/components/govuk/BackLink";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";
import { GovUKCard } from "@/components/govuk";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function LegislaturePage() {
  return (
    <div className="govuk-width-container">
      <GovUKBackLink href="/executive" />

      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
          { text: "The Legislature", href: "/legislature" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">The Legislature (Parliament of Kenya)</h1>
            
            <p className="govuk-body-l">
              The Parliament of Kenya is the bicameral legislative arm of government established under 
              Chapter 8 of the Constitution of Kenya 2010.
            </p>

            <div className="govuk-inset-text">
              Parliament consists of two Houses: the National Assembly and the Senate. 
              Together they make laws, approve budgets, and exercise oversight over the Executive.
            </div>

            {/* Overview of Parliament */}
            <h2 className="govuk-heading-l govuk-!-margin-top-9">Structure of Parliament</h2>

            <GovUKSummaryList
              items={[
                { 
                  key: "Type", 
                  value: "Bicameral Legislature (Two Houses)" 
                },
                { 
                  key: "Constitutional Basis", 
                  value: "Chapter 8 of the Constitution of Kenya 2010" 
                },
                { 
                  key: "Primary Functions", 
                  value: "Law-making, Budget approval, Representation, and Oversight of the Executive" 
                },
              ]}
            />

            {/* National Assembly */}
            <h3 className="govuk-heading-m govuk-!-margin-top-9">1. National Assembly (Lower House)</h3>
            <p className="govuk-body">
              The National Assembly is the larger house and represents the people of Kenya directly.
            </p>

            <GovUKSummaryList
              items={[
                { key: "Composition", value: "290 Elected MPs + 47 Women Representatives + 12 Nominated Members + Speaker" },
                { key: "Total Members", value: "Approximately 350" },
                { key: "Main Role", value: "Primary law-making body, approves national budget, and oversees government ministries" },
                { key: "Current Speaker", value: "Hon. Moses Wetangula" },
              ]}
            />

            <Link href="/legislature/national-assembly" className="govuk-link">
              Learn more about the National Assembly →
            </Link>

            {/* Senate */}
            <h3 className="govuk-heading-m govuk-!-margin-top-9">2. The Senate (Upper House)</h3>
            <p className="govuk-body">
              The Senate represents the counties and protects devolution.
            </p>

            <GovUKSummaryList
              items={[
                { key: "Composition", value: "47 Elected Senators (one per county) + 16 Nominated Women + 2 Youth + 2 Persons with Disabilities + Speaker" },
                { key: "Total Members", value: "67" },
                { key: "Main Role", value: "Protects the interests of the 47 counties and their governments" },
                { key: "Current Speaker", value: "Hon. Amason Kingi" },
              ]}
            />

            <Link href="/legislature/senate" className="govuk-link">
              Learn more about the Senate →
            </Link>

            <h2 className="govuk-heading-l govuk-!-margin-top-9">Key Functions of Parliament</h2>
            <ul className="govuk-list govuk-list--bullet">
              <li>Enacting legislation (making new laws and amending existing ones)</li>
              <li>Approving the national budget and public expenditure</li>
              <li>Oversight of the Executive (questioning Cabinet Secretaries)</li>
              <li>Representation of the people and counties</li>
              <li>Impeachment of the President, Deputy President, and Governors</li>
            </ul>
          </div>
        </div>

        {/* Feedback at the bottom */}
        <GovUKFeedback />
      </main>
    </div>
  );
}