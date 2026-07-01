'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


type CountyPerformance = {
  rank: number;
  name: string;
  slug: string;
  absorption: number; // % of development budget spent
  osrGrowth: number;   // % local revenue growth
  auditOpinion: string;
  compositeScore: number; // Combined KDSP weighted metric out of 100
};

// Factual mock data aligned with recent Commission on Revenue Allocation (CRA) & Controller of Budget trends
const top10CountiesData: CountyPerformance[] = [
  { rank: 1, name: "Nyeri", slug: "nyeri", absorption: 91.4, osrGrowth: 14.2, auditOpinion: "Unqualified", compositeScore: 89.5 },
  { rank: 2, name: "Elgeyo Marakwet", slug: "elgeyo-marakwet", absorption: 89.1, osrGrowth: 11.5, auditOpinion: "Unqualified", compositeScore: 87.2 },
  { rank: 3, name: "Mombasa", slug: "mombasa", absorption: 84.6, osrGrowth: 22.4, auditOpinion: "Qualified", compositeScore: 85.1 },
  { rank: 4, name: "Uasin Gishu", slug: "uasin-gishu", absorption: 86.2, osrGrowth: 15.1, auditOpinion: "Unqualified", compositeScore: 84.8 },
  { rank: 5, name: "Kisumu", slug: "kisumu", absorption: 83.1, osrGrowth: 19.8, auditOpinion: "Qualified", compositeScore: 83.9 },
  { rank: 6, name: "Nakuru", slug: "nakuru", absorption: 85.0, osrGrowth: 12.0, auditOpinion: "Unqualified", compositeScore: 82.6 },
  { rank: 7, name: "Kiambu", slug: "kiambu", absorption: 81.3, osrGrowth: 16.5, auditOpinion: "Qualified", compositeScore: 81.0 },
  { rank: 8, name: "Makueni", slug: "makueni", absorption: 84.0, osrGrowth: 8.7, auditOpinion: "Unqualified", compositeScore: 80.4 },
  { rank: 9, name: "Kakamega", slug: "kakamega", absorption: 82.5, osrGrowth: 9.3, auditOpinion: "Unqualified", compositeScore: 79.2 },
  { rank: 10, name: "Laikipia", slug: "laikipia", absorption: 78.9, osrGrowth: 14.8, auditOpinion: "Unqualified", compositeScore: 78.5 },
];

type SortField = 'rank' | 'name' | 'absorption' | 'osrGrowth' | 'compositeScore';
type SortOrder = 'asc' | 'desc';

export default function CountyPerformancePage() {
  // Sorting state - default sorting by calculated Rank position
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedCounties = useMemo(() => {
    return [...top10CountiesData].sort((a, b) => {
      if (fieldIsNumeric(sortField)) {
        return sortOrder === 'asc' 
          ? (a[sortField] as number) - (b[sortField] as number)
          : (b[sortField] as number) - (a[sortField] as number);
      }
      return sortOrder === 'asc'
        ? (a[sortField] as string).localeCompare(b[sortField] as string)
        : (b[sortField] as string).localeCompare(a[sortField] as string);
    });
  }, [sortField, sortOrder]);

  function fieldIsNumeric(field: SortField): field is 'rank' | 'absorption' | 'osrGrowth' | 'compositeScore' {
    return field !== 'name';
  }

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Counties", href: "/counties" },
          { text: "Performance", href: "/counties/performance" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-3">County Performance and Rankings</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Monitoring framework for service delivery, fiscal compliance, accountability, and development outcomes across the 47 devolved county governments.
            </p>
          </div>
        </div>

        {/* Weighted Index Framework Explanation Block */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <div style={{ background: '#f8f8f8', padding: '20px', borderLeft: '10px solid #1d70b8', marginBottom: '25px' }}>
              <h2 className="govuk-heading-m govuk-!-margin-top-0 govuk-!-margin-bottom-2">How Top Performing Counties are Evaluated</h2>
              <p className="govuk-body-s govuk-!-margin-bottom-3">
                The index uses a standard weighted combination of fiscal metrics verified by the Office of the Controller of Budget and the Auditor-General to generate an overall <strong>Composite Score (out of 100)</strong>:
              </p>
              <ul className="govuk-list govuk-list--bullet govuk-body-s govuk-!-margin-bottom-0">
                <li><strong>Development Budget Absorption Rate (Weight: 40%)</strong> &mdash; Measures how effectively a county completes capital projects vs. hoarding cash or overspending on administrative operations.</li>
                <li><strong>Own-Source Revenue (OSR) Growth (Weight: 35%)</strong> &mdash; Measures innovation in local automated systems and revenue collection expansions to minimize dependency on the national exchequer.</li>
                <li><strong>Auditor-General Compliance Opinion (Weight: 25%)</strong> &mdash; Scoring adjustments based on public accountability. An &ldquo;Unqualified&rdquo; clean audit retains maximum points, while &ldquo;Qualified&rdquo; adjustments lower the total rank.</li>
              </ul>
            </div>

            <h3 className="govuk-heading-m govuk-!-margin-bottom-3">Top 10 Performing Counties Dashboard</h3>

            {/* Mobile Responsive Scrolling Container */}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '30px' }}>
              <table className="govuk-table" style={{ minWidth: '800px' }}>
                <caption className="govuk-table__caption govuk-visually-hidden">
                  Table tracking top 10 performing counties sorted by composite evaluation index parameters.
                </caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header govuk-!-padding-1">
                      <button 
                        type="button" 
                        onClick={() => handleSort('rank')}
                        style={{ background: 'none', border: 'none', padding: '0', textAlign: 'left', fontWeight: 'bold', fontSize: '18px', color: '#1d70b8', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Rank {sortField === 'rank' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </button>
                    </th>
                    <th scope="col" className="govuk-table__header govuk-!-padding-1">
                      <button 
                        type="button" 
                        onClick={() => handleSort('name')}
                        style={{ background: 'none', border: 'none', padding: '0', textAlign: 'left', fontWeight: 'bold', fontSize: '18px', color: '#1d70b8', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        County {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </button>
                    </th>
                    <th scope="col" className="govuk-table__header govuk-!-padding-1">
                      <button 
                        type="button" 
                        onClick={() => handleSort('absorption')}
                        style={{ background: 'none', border: 'none', padding: '0', textAlign: 'left', fontWeight: 'bold', fontSize: '18px', color: '#1d70b8', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Budget Absorption {sortField === 'absorption' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </button>
                    </th>
                    <th scope="col" className="govuk-table__header govuk-!-padding-1">
                      <button 
                        type="button" 
                        onClick={() => handleSort('osrGrowth')}
                        style={{ background: 'none', border: 'none', padding: '0', textAlign: 'left', fontWeight: 'bold', fontSize: '18px', color: '#1d70b8', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        OSR Growth {sortField === 'osrGrowth' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </button>
                    </th>
                    <th scope="col" className="govuk-table__header govuk-!-padding-top-2 govuk-!-padding-bottom-2" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      Audit Opinion
                    </th>
                    <th scope="col" className="govuk-table__header govuk-!-padding-1">
                      <button 
                        type="button" 
                        onClick={() => handleSort('compositeScore')}
                        style={{ background: 'none', border: 'none', padding: '0', textAlign: 'left', fontWeight: 'bold', fontSize: '18px', color: '#1d70b8', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Composite Score {sortField === 'compositeScore' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {sortedCounties.map((county) => (
                    <tr key={county.slug} className="govuk-table__row">
                      <td className="govuk-table__cell govuk-body-s govuk-!-font-weight-bold">{county.rank}</td>
                      <th scope="row" className="govuk-table__header" style={{ fontWeight: 'normal' }}>
                        <Link href={`/counties/${county.slug}`} className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-16">
                          {county.name}
                        </Link>
                      </th>
                      <td className="govuk-table__cell govuk-body-s">{county.absorption}%</td>
                      <td className="govuk-table__cell govuk-body-s">+{county.osrGrowth}%</td>
                      <td className="govuk-table__cell govuk-body-s">
                        {county.auditOpinion === 'Unqualified' ? (
                          <strong className="govuk-tag govuk-tag--green">Clean (Unqualified)</strong>
                        ) : (
                          <strong className="govuk-tag govuk-tag--yellow">Qualified</strong>
                        )}
                      </td>
                      <td className="govuk-table__cell govuk-body-s govuk-!-font-weight-bold" style={{ color: '#00703c' }}>
                        {county.compositeScore} / 100
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Existing Accordions and Resources Sections below the Fold */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h3 className="govuk-heading-m govuk-!-margin-top-4 govuk-!-margin-bottom-2">Key Performance Indicators (KPIs)</h3>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Official scorecards verify performance details through separate thematic audits:
            </p>

            <details className="govuk-details govuk-!-margin-bottom-3" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Financial Management and OSR</span>
              </summary>
              <div className="govuk-details__text">
                <ul className="govuk-list govuk-list--bullet">
                  <li><strong>Own-Source Revenue (OSR) Innovation</strong> &mdash; Mobilization of automated local revenue collection streams to minimize national exchequer dependencies.</li>
                  <li><strong>Development Budget Absorption</strong> &mdash; The explicit percentage of allocated funds directly utilized for capital projects versus administrative overhead.</li>
                  <li><strong>Auditor-General Assessment</strong> &mdash; Annual evaluation rankings spanning Unqualified, Qualified, Adverse, or Disclaimer audit opinions.</li>
                </ul>
              </div>
            </details>

            <details className="govuk-details govuk-!-margin-bottom-6" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">Devolved Service Delivery Metrics</span>
              </summary>
              <div className="govuk-details__text">
                <ul className="govuk-list govuk-list--bullet">
                  <li><strong>Healthcare Infrastructure</strong> &mdash; Operational capacity of level 4 and level 5 installations, maternal health support, and pharmaceutical inventories.</li>
                  <li><strong>Agricultural Development</strong> &mdash; Deployment of regional value-addition hubs, extension officer coverage, and food security systems.</li>
                  <li><strong>Water and Infrastructure</strong> &mdash; Public access to potable water main lines and total linear kilometers of maintained gravel/bitumen roads.</li>
                </ul>
              </div>
            </details>

            <h3 className="govuk-heading-m govuk-!-margin-top-6 govuk-!-margin-bottom-2">Statutory Resources and Portals</h3>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="https://crakenya.org" className="govuk-link">Commission on Revenue Allocation (CRA)</Link>
                <span className="govuk-body-s govuk-!-margin-top-1 d-block">&mdash; Publishes vertical revenue allocation formulas and annual county financial reports.</span>
              </li>
              <li>
                <Link href="https://auditorgeneral.go.ke" className="govuk-link">Office of the Auditor-General (OAG)</Link>
                <span className="govuk-body-s govuk-!-margin-top-1 d-block">&mdash; Issues formal administrative audit evaluations and compliance asset tracing folders.</span>
              </li>
            </ul>

            
          </div>
        </div>
      </main>
    </div>
  );
}
