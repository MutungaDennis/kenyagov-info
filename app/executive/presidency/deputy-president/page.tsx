'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";


type DeputyPresidentSpeech = {
  id: string;
  date: string;
  title: string;
  forum: string;
  assignment: 'Intergovernmental Relations' | 'Policy Coordination' | 'Official Briefing' | 'National Development';
  pdfUrl: string;
  fileSize: string;
};

// Official dispatches from the Office of the Deputy President Press Secretariat up to 2026
const deputySpeechesData: DeputyPresidentSpeech[] = [
  {
    id: "dp-sp-2026-04",
    date: "16 April 2026",
    title: "Opening Address at the National and County Government Co-ordination Summit",
    forum: "Mombasa State House Executive Boardroom",
    assignment: "Intergovernmental Relations",
    pdfUrl: "/documents/speeches/dp-intergovernmental-summit-2026.pdf",
    fileSize: "290KB"
  },
  {
    id: "dp-sp-2026-02",
    date: "11 February 2026",
    title: "Progress Briefing on the Implementation Monitoring of Cabinet Decisions",
    forum: "Harambee House Annex, Nairobi",
    assignment: "Policy Coordination",
    pdfUrl: "/documents/speeches/dp-cabinet-monitoring-brief-2026.pdf",
    fileSize: "195KB"
  },
  {
    id: "dp-sp-2025-11",
    date: "25 November 2025",
    title: "Keynote on Decentralized Agricultural Interventions and Subsidies Tracking",
    forum: "Nyeri County Cultural Hub",
    assignment: "National Development",
    pdfUrl: "/documents/speeches/dp-agricultural-subsidy-2025.pdf",
    fileSize: "230KB"
  }
];

export default function DeputyPresidentProfilePage() {
  const [selectedAssignment, setSelectedAssignment] = useState("");

  const filteredSpeeches = useMemo(() => {
    return deputySpeechesData.filter((s) => !selectedAssignment || s.assignment === selectedAssignment);
  }, [selectedAssignment]);

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
          { text: "The Presidency", href: "/executive/presidency" },
          { text: "Office of the Deputy President", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        {/* Header Block */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Office of the Deputy President</h1>
            <p className="govuk-body govuk-!-margin-bottom-6">
              Constitutional mandate, institutional responsibilities under Article 147, and the official dispatch registry of the Principal Assistant to the President.
            </p>
          </div>
        </div>

        {/* GOV.UK Guide Layout Grid Structure Split */}
        <div className="govuk-grid-row">
          {/* Navigation Sidebar */}
          <div className="govuk-grid-column-one-third print-hide govuk-!-margin-bottom-6">
            <nav style={{ borderTop: '2px solid #1d70b8', padding: '15px 0' }} aria-label="Office Secondary Navigation">
              <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
                <li style={{ paddingLeft: '12px', borderLeft: '4px solid #1d70b8', fontWeight: 'bold', color: '#1d70b8' }}>
                  Profile & Functions
                </li>
                <li style={{ paddingLeft: '16px' }}>
                  <Link href="/executive/presidency/cabinet-office" className="govuk-link govuk-!-font-size-19" style={{ textDecoration: 'none', display: 'block' }}>
                    Cabinet Co-ordination
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Primary Profile Data Pane */}
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Executive Summary</h2>
            <GovUKSummaryList
              items={[
                { key: "Incumbent", value: "H.E. Prof. Kithure Kindiki, EGH" },
                { key: "Constitutional Basis", value: "Article 147 (Principal Assistant, Deputizes the President in executive duties)" },
                { key: "Primary Statutory Role", value: "Chair of the Intergovernmental Budget and Economic Council (IBEC)" },
                { key: "Official Headquarters", value: "Harambee House Annex, Harambee Avenue, Nairobi" },
              ]}
            />

            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Constitutional Functions</h2>
            <p className="govuk-body">
              Under the constitutional framework, the Deputy President executes specific mandates allocated directly by the Head of State, alongside institutional oversight boards:
            </p>
            <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-6">
              <li>Chairs meetings of the Intergovernmental Budget and Economic Council (IBEC) to synchronize county and national fiscal policies.</li>
              <li>Coordinates the implementation of national development projects and conditional grant infrastructure rollouts.</li>
              <li>Oversees intergovernmental relations and coordinates institutional resolution tracks between Ministries and the Council of Governors.</li>
              <li>Performs any supplementary state operations, legal processing acts, and international briefs delegated by the President.</li>
            </ul>

            {/* Speeches & Official Statements Registry */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Speeches & Briefings</h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Official data log tracking addresses, policy statements, and statutory operational declarations issued by the Deputy President.
            </p>

            {/* Filter Selector */}
            <div className="govuk-form-group govuk-!-margin-bottom-4" style={{ maxWidth: '340px' }}>
              <label className="govuk-label govuk-!-font-weight-bold" htmlFor="assignment-filter">
                Filter by function category
              </label>
              <select
                className="govuk-select govuk-!-width-full"
                id="assignment-filter"
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Intergovernmental Relations">Intergovernmental Relations</option>
                <option value="Policy Coordination">Policy Coordination</option>
                <option value="National Development">National Development</option>
                <option value="Official Briefing">Official Briefing</option>
              </select>
            </div>

            {/* Speeches Data Table Grid */}
            {filteredSpeeches.length > 0 ? (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
                <table className="govuk-table" style={{ minWidth: '600px' }}>
                  <caption className="govuk-table__caption govuk-visually-hidden">Register of deputy presidential public declarations.</caption>
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '110px' }}>Date</th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold' }}>Official Title & Forum</th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '140px' }}>Assignment</th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {filteredSpeeches.map((speech) => (
                      <tr key={speech.id} className="govuk-table__row">
                        <td className="govuk-table__cell govuk-body-s" style={{ whiteSpace: 'nowrap' }}>{speech.date}</td>
                        <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                          <span className="govuk-!-font-weight-bold" style={{ display: 'block', fontSize: '16px' }}>{speech.title}</span>
                          <span style={{ fontSize: '14px', color: '#505a5f', display: 'block', marginTop: '2px' }}>{speech.forum}</span>
                          <Link href={speech.pdfUrl} className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-14" style={{ display: 'inline-block', marginTop: '6px' }}>
                            Download Official Transcript PDF ({speech.fileSize})
                          </Link>
                        </th>
                        <td className="govuk-table__cell govuk-body-s">
                          <strong className={`govuk-tag ${speech.assignment === 'Intergovernmental Relations' ? 'govuk-tag--purple' : speech.assignment === 'Policy Coordination' ? 'govuk-tag--blue' : 'govuk-tag--grey'}`}>
                            {speech.assignment}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="govuk-body govuk-!-margin-top-4">
                <p>No transactions or addresses match your selected filter criteria parameters.</p>
              </div>
            )}

            
          </div>
        </div>
      </main>
    </div>
  );
}
