import { createClient } from 'next-sanity';
import Link from 'next/link';

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Optional but recommended for admin
});

interface HansardSitting {
  _id: string;
  title: string;
  slug?: { current: string };
  houseType: string;
  sittingDate: string;
  sittingPeriod?: string;
  contributionCount: number;
  _createdAt: string;
}

export default async function HansardManagementPage() {
  // Fetch all Hansard sittings (sorted newest first)
  const sittings: HansardSitting[] = await sanity.fetch(
    `*[_type == "hansardSitting"] | order(sittingDate desc) {
      _id,
      title,
      slug,
      houseType,
      sittingDate,
      sittingPeriod,
      "contributionCount": count(contributions),
      _createdAt
    }`
  );

  const totalSittings = sittings.length;
  const totalContributions = sittings.reduce((sum, s) => sum + (s.contributionCount || 0), 0);
  const latestSitting = sittings[0];

  const houseCounts = sittings.reduce((acc: Record<string, number>, s) => {
    const house = s.houseType || 'unknown';
    acc[house] = (acc[house] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="govuk-heading-xl" style={{ marginBottom: '8px' }}>Hansard Management</h1>
          <p className="govuk-body-l" style={{ color: '#505a5f', maxWidth: '600px' }}>
            Upload, process, and publish structured Parliamentary Hansard sittings. 
            AI-powered extraction with Grok + LlamaParse.
          </p>
        </div>

        {/* Big prominent Upload Button */}
        <Link 
          href="/admin/hansard/upload" 
          className="govuk-button govuk-button--start"
          style={{ 
            backgroundColor: '#1d70b8', 
            color: 'white', 
            padding: '14px 28px', 
            fontSize: '18px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            borderRadius: '4px',
            fontWeight: 600
          }}
        >
          Upload New Hansard PDF
          <span aria-hidden="true" style={{ fontSize: '22px' }}>→</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="govuk-grid-row" style={{ marginBottom: '32px' }}>
        <div className="govuk-grid-column-one-quarter">
          <div className="govuk-card" style={{ border: '1px solid #b1b4b6', padding: '20px', borderRadius: '4px', background: '#fff' }}>
            <p style={{ fontSize: '14px', color: '#505a5f', marginBottom: '4px' }}>Total Sittings</p>
            <p style={{ fontSize: '42px', fontWeight: 700, color: '#1d70b8', margin: 0 }}>{totalSittings}</p>
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <div className="govuk-card" style={{ border: '1px solid #b1b4b6', padding: '20px', borderRadius: '4px', background: '#fff' }}>
            <p style={{ fontSize: '14px', color: '#505a5f', marginBottom: '4px' }}>Total Contributions</p>
            <p style={{ fontSize: '42px', fontWeight: 700, color: '#1d70b8', margin: 0 }}>{totalContributions}</p>
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <div className="govuk-card" style={{ border: '1px solid #b1b4b6', padding: '20px', borderRadius: '4px', background: '#fff' }}>
            <p style={{ fontSize: '14px', color: '#505a5f', marginBottom: '4px' }}>National Assembly</p>
            <p style={{ fontSize: '42px', fontWeight: 700, color: '#1d70b8', margin: 0 }}>{houseCounts['national-assembly'] || 0}</p>
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <div className="govuk-card" style={{ border: '1px solid #b1b4b6', padding: '20px', borderRadius: '4px', background: '#fff' }}>
            <p style={{ fontSize: '14px', color: '#505a5f', marginBottom: '4px' }}>Senate + County</p>
            <p style={{ fontSize: '42px', fontWeight: 700, color: '#1d70b8', margin: 0 }}>
              {(houseCounts['senate'] || 0) + (houseCounts['county-assembly'] || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '24px' }}>
        <h2 className="govuk-heading-m">Quick Actions</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link 
            href="/admin/hansard/upload" 
            className="govuk-button"
            style={{ backgroundColor: '#1d70b8', color: 'white', textDecoration: 'none' }}
          >
            + Upload & Process New PDF
          </Link>
          <a 
            href="https://your-sanity-studio-url.sanity.studio/desk/hansardSitting" 
            target="_blank" 
            rel="noopener noreferrer"
            className="govuk-button govuk-button--secondary"
            style={{ textDecoration: 'none' }}
          >
            Open in Sanity Studio
          </a>
        </div>
      </div>

      {/* Sittings List */}
      <h2 className="govuk-heading-l">Published Hansard Sittings</h2>

      {sittings.length === 0 ? (
        <div className="govuk-inset-text" style={{ background: '#f3f2f1', padding: '24px', borderRadius: '4px' }}>
          <p style={{ marginBottom: '16px' }}>No Hansard sittings have been published yet.</p>
          <Link 
            href="/admin/hansard/upload" 
            className="govuk-button"
            style={{ backgroundColor: '#1d70b8', color: 'white', textDecoration: 'none' }}
          >
            Upload your first Hansard PDF
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="govuk-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #b1b4b6' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', color: '#505a5f' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', color: '#505a5f' }}>Title</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '14px', color: '#505a5f' }}>House</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '14px', color: '#505a5f' }}>Speeches</th>
                <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '14px', color: '#505a5f' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sittings.map((sitting) => {
                const houseLabel = 
                  sitting.houseType === 'national-assembly' ? 'National Assembly' :
                  sitting.houseType === 'senate' ? 'Senate' : 'County Assembly';

                return (
                  <tr key={sitting._id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '14px 8px', fontSize: '15px', whiteSpace: 'nowrap' }}>
                      {new Date(sitting.sittingDate).toLocaleDateString('en-KE', { 
                        day: 'numeric', month: 'short', year: 'numeric' 
                      })}
                      {sitting.sittingPeriod && <div style={{ fontSize: '12px', color: '#505a5f' }}>{sitting.sittingPeriod}</div>}
                    </td>
                    <td style={{ padding: '14px 8px', fontSize: '15px', maxWidth: '420px' }}>
                      <strong>{sitting.title}</strong>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <span style={{
                        backgroundColor: sitting.houseType === 'national-assembly' ? '#e8f4fc' : 
                                        sitting.houseType === 'senate' ? '#fef3e8' : '#f0f0f0',
                        color: '#0b0c0c',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 500
                      }}>
                        {houseLabel}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'center', fontWeight: 600, fontSize: '16px' }}>
                      {sitting.contributionCount || 0}
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {sitting.slug?.current && (
                          <Link 
                            href={`/legislature/hansard/${sitting.slug.current}`} 
                            target="_blank"
                            className="govuk-link"
                            style={{ fontSize: '13px' }}
                          >
                            View Public
                          </Link>
                        )}
                        <a 
                          href={`https://your-sanity-studio-url.sanity.studio/desk/hansardSitting;${sitting._id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="govuk-link"
                          style={{ fontSize: '13px' }}
                        >
                          Edit in Studio
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="govuk-inset-text govuk-!-margin-top-8">
        <strong>Tip:</strong> Use the upload tool to process Hansard PDFs with AI. 
        The system extracts speakers, constituencies, parties, and full speeches automatically.
      </div>
    </div>
  );
}