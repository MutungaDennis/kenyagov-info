'use client';

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";
import PrintPageButton from "@/components/govuk/PrintPageButton";
import { senateMembers } from "@/data/senate-members";

export default function SenatorProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const decodedSlug = decodeURIComponent(slug || "");

  // Match route parameters against the static datastore slice
  const senator = senateMembers.find((s) => s.slug === decodedSlug);

  if (!senator) {
    notFound();
  }

  // Mock technical committee dataset representing active house tracking logs
  const committeeAssignments = [
    { name: "Standing Committee on Roads, Transportation and Housing", role: "Member" },
    { name: "Sessional Committee on Delegated Legislation", role: "Vice-Chairperson" }
  ];

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Legislature", href: "/legislature" },
          { text: "Senate", href: "/legislature/senate" },
          { text: "Senators", href: "/legislature/senate/senators" },
          { text: senator.name, href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">{senator.name}</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-4">
              Member of the Senate representing the interests of <strong>{senator.county || "Special Interest Groups"}</strong>.
            </p>

            <div className="govuk-!-margin-bottom-6 print-hide">
              <PrintPageButton />
            </div>

            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Parliamentary Profile</h2>
            <GovUKSummaryList
              items={[
                { key: "Full Title", value: `Senator ${senator.name}` },
                { key: "County Delegation", value: senator.county || "Nominated Profile (National Scope)" },
                { key: "Political Party Affiliation", value: senator.party },
                { key: "Representation Model", value: senator.type === "Elected" ? "Elected Delegation Head (Article 98-1-a)" : "Nominated Senator (Article 98-1-b/c/d)" },
                { key: "Legislative Assembly", value: "13th Parliament Assembly (2022–2027)" }
              ]}
            />

            {/* Section 2: Committee Assignments Data Table */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">House Committee Assignments</h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Official standing and sessional committee responsibilities allocated under the Parliamentary Service Commission framework:
            </p>

            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
              <table className="govuk-table" style={{ minWidth: '100%' }}>
                <caption className="govuk-table__caption govuk-visually-hidden">List of statutory senate committees assigned to the member.</caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold' }}>Committee Designation</th>
                    <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '150px' }}>Assignment Role</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {committeeAssignments.map((committee, index) => (
                    <tr key={index} className="govuk-table__row">
                      <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                        {committee.name}
                      </th>
                      <td className="govuk-table__cell govuk-body-s">
                        <strong className={`govuk-tag ${committee.role === 'Vice-Chairperson' ? 'govuk-tag--blue' : 'govuk-tag--grey'}`}>
                          {committee.role}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="govuk-!-margin-top-6" style={{ borderTop: '1px solid #bfc1c3', paddingTop: '15px' }}>
              <Link href="/legislature/senate/senators" className="govuk-link govuk-!-font-weight-bold">
                &larr; Return to the full Senators register
              </Link>
            </div>

            
          </div>
        </div>
      </main>
    </div>
  );
}
