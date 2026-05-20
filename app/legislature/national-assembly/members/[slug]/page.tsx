'use client';

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";
import GovUKFeedback from "@/components/govuk/Feedback";
import PrintPageButton from "@/components/govuk/PrintPageButton";
import { nationalAssemblyMembers } from "@/data/national-assembly-members";

export default function MemberProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const decodedSlug = decodeURIComponent(slug || "");

  // Match route parameters against the static datastore slice
  const member = nationalAssemblyMembers.find((m) => m.slug === decodedSlug);

  if (!member) {
    notFound();
  }

  // Mock technical committee dataset representing active lower house tracking logs
  const committeeAssignments = [
    { name: "Departmental Committee on Finance and National Planning", role: "Member" },
    { name: "Select Committee on Public Accounts (PAC)", role: "Member" }
  ];

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Legislature", href: "/legislature" },
          { text: "National Assembly", href: "/legislature/national-assembly" },
          { text: "Members", href: "/legislature/national-assembly/members" },
          { text: member.name, href: "" },
        ]}
      />

      {/* Reduced layout padding top to maximize initial viewport height */}
      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Downscaled title header size from heading-xl to heading-l to sit above the fold */}
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">{member.name}</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-4">
              Member of Parliament representing the electorate of <strong>{member.constituency}</strong>.
            </p>

            <div className="govuk-!-margin-bottom-6 print-hide">
              <PrintPageButton />
            </div>

            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Parliamentary Profile</h2>
            <GovUKSummaryList
              items={[
                { key: "Full Title", value: `Hon. ${member.name}, MP` },
                { key: "Constituency / County", value: member.constituency },
                { key: "Political Party Affiliation", value: member.party },
                { key: "Representation Model", value: member.type === "Constituency" ? "Elected Constituency Representative (Article 95-1-a)" : member.type === "Women Representative" ? "Elected County Women Representative (Article 95-1-b)" : "Nominated Member (Article 95-1-c)" },
                { key: "Legislative Assembly", value: "13th Parliament Assembly (2022–2027)" }
              ]}
            />

            {/* Section 2: Committee Assignments Data Table */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">House Committee Assignments</h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Official standing, departmental, and sessional committee responsibilities allocated under the Parliamentary Service Commission framework:
            </p>

            {/* Mobile Safe Horizontal Scroll Layer Wrapper to ensure full responsiveness */}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
              <table className="govuk-table" style={{ minWidth: '100%' }}>
                <caption className="govuk-table__caption govuk-visually-hidden">List of statutory assembly committees assigned to the member.</caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold' }}>Committee Designation</th>
                    <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '120px' }}>Assignment Role</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {committeeAssignments.map((committee, index) => (
                    <tr key={index} className="govuk-table__row">
                      <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                        {committee.name}
                      </th>
                      <td className="govuk-table__cell govuk-body-s">
                        <strong className="govuk-tag govuk-tag--grey">
                          {committee.role}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="govuk-!-margin-top-6" style={{ borderTop: '1px solid #bfc1c3', paddingTop: '15px' }}>
              <Link href="/legislature/national-assembly/members" className="govuk-link govuk-!-font-weight-bold">
                &larr; Return to the full National Assembly members register
              </Link>
            </div>

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}
