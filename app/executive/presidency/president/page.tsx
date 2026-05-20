'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKSummaryList from "@/components/govuk/SummaryList";
import GovUKFeedback from "@/components/govuk/Feedback";

type PresidentialSpeech = {
  id: string;
  date: string;
  title: string;
  forum: string;
  topic: 'Economic Policy' | 'Devolution' | 'International Relations' | 'State of the Nation';
  pdfUrl: string;
  fileSize: string;
};

// Official dispatches from the Executive Press Service up to 2026
const speechesData: PresidentialSpeech[] = [
  {
    id: "sp-2026-03",
    date: "26 March 2026",
    title: "Address to the Joint Session of Parliament on National Progress",
    forum: "Parliament Buildings, Nairobi",
    topic: "State of the Nation",
    pdfUrl: "/documents/speeches/state-of-the-nation-2026.pdf",
    fileSize: "340KB"
  },
  {
    id: "sp-2026-01",
    date: "15 January 2026",
    title: "Keynote on Digital Commerce Framework Expansion in East Africa",
    forum: "KICC, Nairobi",
    topic: "Economic Policy",
    pdfUrl: "/documents/speeches/digital-commerce-framework-2026.pdf",
    fileSize: "210KB"
  },
  {
    id: "sp-2025-12",
    date: "12 December 2025",
    title: "Jamhuri Day National Celebrations Presidential Address",
    forum: "Nyayo Stadium, Nairobi",
    topic: "State of the Nation",
    pdfUrl: "/documents/speeches/jamhuri-day-address-2025.pdf",
    fileSize: "415KB"
  },
  {
    id: "sp-2025-10",
    date: "20 October 2025",
    title: "Mashujaa Day Address on Decentralized Healthcare Milestones",
    forum: "Kwale County Stadium",
    topic: "Devolution",
    pdfUrl: "/documents/speeches/mashujaa-day-address-2025.pdf",
    fileSize: "285KB"
  }
];

export default function PresidentProfilePage() {
  const [selectedTopic, setSelectedTopic] = useState("");

  const filteredSpeeches = useMemo(() => {
    return speechesData.filter((s) => !selectedTopic || s.topic === selectedTopic);
  }, [selectedTopic]);

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
          { text: "The Presidency", href: "/executive/presidency" },
          { text: "Office of the President", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        {/* Header Block */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Office of the President</h1>
            <p className="govuk-body govuk-!-margin-bottom-6">
              Constitutional mandates, core administrative details, and an official archive of statutory speeches delivered by the Head of State.
            </p>
          </div>
        </div>

        {/* GOV.UK Guide Layout Multi-Page Split */}
        <div className="govuk-grid-row">
          {/* Navigation Sidebar */}
          <div className="govuk-grid-column-one-third print-hide govuk-!-margin-bottom-6">
            <nav style={{ borderTop: '2px solid #1d70b8', padding: '15px 0' }} aria-label="Office Secondary Navigation">
              <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
                <li style={{ paddingLeft: '12px', borderLeft: '4px solid #1d70b8', fontWeight: 'bold', color: '#1d70b8' }}>
                  Profile & Addresses
                </li>
                <li style={{ paddingLeft: '16px' }}>
                  <Link href="/executive/presidency/state-house-administration" className="govuk-link govuk-!-font-size-19" style={{ textDecoration: 'none', display: 'block' }}>
                    Advisers & Secretariat
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
                { key: "Incumbent", value: "H.E. Dr. William Samoei Ruto, CGH" },
                { key: "Inauguration Date", value: "13 September 2022" },
                { key: "Constitutional Powers", value: "Article 131 (Head of State, Head of Government, Commander-in-Chief)" },
                { key: "Principal Assistant", value: "H.E. Prof. Kithure Kindiki, EGH (Deputy President)" },
              ]}
            />

            {/* Speeches Registry Section */}
            <h2 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-3">Presidential Speeches & Briefings</h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              A comprehensive verification archive of official text statements and policy outlines issued by the President.
            </p>

            {/* Filter Selector */}
            <div className="govuk-form-group govuk-!-margin-bottom-4" style={{ maxWidth: '340px' }}>
              <label className="govuk-label govuk-!-font-weight-bold" htmlFor="topic-filter">
                Filter by policy topic
              </label>
              <select
                className="govuk-select govuk-!-width-full"
                id="topic-filter"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="">All Topics</option>
                <option value="State of the Nation">State of the Nation</option>
                <option value="Economic Policy">Economic Policy</option>
                <option value="Devolution">Devolution</option>
                <option value="International Relations">International Relations</option>
              </select>
            </div>

            {/* Speeches Data Table Grid */}
            {filteredSpeeches.length > 0 ? (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
                <table className="govuk-table" style={{ minWidth: '600px' }}>
                  <caption className="govuk-table__caption govuk-visually-hidden">Register of presidential public declarations.</caption>
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '110px' }}>Date</th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold' }}>Official Title & Forum</th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '130px' }}>Classification</th>
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
                          <strong className={`govuk-tag ${speech.topic === 'State of the Nation' ? 'govuk-tag--blue' : speech.topic === 'Economic Policy' ? 'govuk-tag--green' : 'govuk-tag--grey'}`}>
                            {speech.topic}
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

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}
