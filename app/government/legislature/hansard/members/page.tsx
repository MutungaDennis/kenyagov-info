import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase/public';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';
import Pagination from '@/components/govuk/Pagination';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    party?: string;
    county?: string;
    house?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 20;

export default async function FindMembersPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const currentPage = Math.max(1, parseInt(filters.page || '1', 10));

  const supabase = createPublicClient();

  // Build query
  let query = supabase
    .from('leaders')
    .select('id, slug, full_name, title, current_party, current_county, current_constituency, level', { count: 'exact' })
    .order('full_name', { ascending: true });

  // ========== SMART HOUSE FILTER (works with current data) ==========
  if (filters.house) {
    if (filters.house === 'National Assembly') {
      // National Assembly members have a constituency
      query = query.not('current_constituency', 'is', null);
    } else if (filters.house === 'Senate') {
      // Senators usually do NOT have a constituency
      query = query.is('current_constituency', null);
    } else {
      // Fallback for raw level values
      query = query.eq('level', filters.house);
    }
  }

  if (filters.party) {
    query = query.eq('current_party', filters.party);
  }

  if (filters.county) {
    query = query.eq('current_county', filters.county);
  }

  const searchTerm = filters.q?.trim() || '';
  if (searchTerm) {
    query = query.or(
      `full_name.ilike.%${searchTerm}%,current_constituency.ilike.%${searchTerm}%,current_county.ilike.%${searchTerm}%`
    );
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: leaders, count } = await query.range(from, to);

  const totalCount = typeof count === 'number' ? count : 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // === Filter options ===
  const { data: partiesData } = await supabase
    .from('leaders')
    .select('current_party')
    .not('current_party', 'is', null);

  const { data: countiesData } = await supabase
    .from('leaders')
    .select('current_county')
    .not('current_county', 'is', null);

  const uniqueParties = Array.from(
    new Set((partiesData || []).map((p) => p.current_party).filter(Boolean))
  ).sort();

  const uniqueCounties = Array.from(
    new Set((countiesData || []).map((c) => c.current_county).filter(Boolean))
  ).sort();

  const buildBaseUrl = () => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.party) params.set('party', filters.party);
    if (filters.county) params.set('county', filters.county);
    if (filters.house) params.set('house', filters.house);
    return `/government/legislature/hansard/members${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const baseUrl = buildBaseUrl();

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: 'Home', href: '/' },
          { text: 'Government', href: '/government' },
          { text: 'Legislature', href: '/government/legislature' },
          { text: 'Hansard', href: '/government/legislature/hansard/national-assembly' },
          { text: 'Find Members' },
        ]}
      />

      
        <h1 className="govuk-heading-l">Find Members of Parliament</h1>
        <p className="govuk-body">
          Search and filter Members of the National Assembly and Senate.
        </p>

        {/* Filters */}
        <form method="GET" className="govuk-!-margin-bottom-5">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <div className="govuk-form-group govuk-!-margin-bottom-3">
                <label className="govuk-label" htmlFor="q">Search by name, constituency or county</label>
                <input
                  className="govuk-input"
                  id="q"
                  name="q"
                  type="text"
                  defaultValue={filters.q}
                  placeholder="e.g. Chepkonga, Ainabkoi, or Uasin Gishu"
                />
              </div>
            </div>
          </div>

          <div className="govuk-grid-row">
            {/* House Filter */}
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group govuk-!-margin-bottom-3">
                <label className="govuk-label" htmlFor="house">House</label>
                <select className="govuk-select" id="house" name="house" defaultValue={filters.house || ''}>
                  <option value="">All Houses</option>
                  <option value="National Assembly">National Assembly</option>
                  <option value="Senate">Senate</option>
                </select>
              </div>
            </div>

            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group govuk-!-margin-bottom-3">
                <label className="govuk-label" htmlFor="party">Party</label>
                <select className="govuk-select" id="party" name="party" defaultValue={filters.party || ''}>
                  <option value="">All Parties</option>
                  {uniqueParties.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group govuk-!-margin-bottom-3">
                <label className="govuk-label" htmlFor="county">County</label>
                <select className="govuk-select" id="county" name="county" defaultValue={filters.county || ''}>
                  <option value="">All Counties</option>
                  {uniqueCounties.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="govuk-button-group">
            <button type="submit" className="govuk-button">Search</button>
            <Link href="/government/legislature/hansard/members" className="govuk-button govuk-button--secondary">
              Clear filters
            </Link>
          </div>
        </form>

        {/* Accurate count */}
        <h2 className="govuk-heading-m govuk-!-margin-bottom-4">
          {totalCount} members found
        </h2>

        {/* Table */}
        {leaders && leaders.length > 0 ? (
          <div className="govuk-!-margin-bottom-6">
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">Name</th>
                  <th scope="col" className="govuk-table__header">Party</th>
                  <th scope="col" className="govuk-table__header">County / Constituency</th>
                  <th scope="col" className="govuk-table__header govuk-table__header--numeric">Action</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {leaders.map((leader) => (
                  <tr key={leader.id} className="govuk-table__row">
                    <td className="govuk-table__cell">
                      <strong>{leader.full_name}</strong>
                      {leader.title && (
                        <span className="govuk-body-s govuk-!-margin-left-1">({leader.title})</span>
                      )}
                    </td>
                    <td className="govuk-table__cell">
                      {leader.current_party && (
                        <span className="govuk-tag govuk-tag--blue">{leader.current_party}</span>
                      )}
                    </td>
                    <td className="govuk-table__cell">
                      {leader.current_county && <div>{leader.current_county}</div>}
                      {leader.current_constituency && (
                        <span className="govuk-body-s govuk-!-margin-top-1" style={{ color: '#505a5f' }}>
                          {leader.current_constituency}
                        </span>
                      )}
                    </td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      <Link
                        href={`/government/legislature/hansard/member/${leader.slug}`}
                        className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                      >
                        View contributions →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="govuk-inset-text">No members found matching your search criteria.</div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl={baseUrl}
        />

        <p className="govuk-body-s govuk-!-margin-top-6" style={{ color: '#505a5f' }}>
          Showing Members of the National Assembly and Senate. Data sourced from official parliamentary records.
        </p>
      
    
  
  </>
);
}