import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSanityClient } from "@/lib/sanity/createSanityClient";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';

const sanityClient = createSanityClient();

interface Leader {
  id: string;
  slug: string;
  full_name: string;
  title?: string | null;
  current_party?: string | null;
  current_constituency?: string | null;
  current_county?: string | null;
  bio?: string | null;
  image_url?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  official_website?: string | null;
  social_media?: Record<string, string> | null;
  contact_email?: string | null;
  phone?: string | null;
  category?: string | null;
  level?: string | null;
  status?: string | null;
}

interface Contribution {
  _key: string;
  order: number;
  startTime?: string;
  sectionHeader?: string;
  speech: any[];
  sittingDate: string;
  houseType: string;
  sittingTitle: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    keyword?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: 'newest' | 'oldest';
    section?: string;
    view?: 'chart' | 'table';
    month?: string;
  }>;
}

export default async function MemberContributionsPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const filters = await searchParams;

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data: leaderData } = await supabase
    .from('leaders')
    .select(`id, slug, full_name, title, current_party, current_constituency, current_county, bio, image_url, gender, date_of_birth, official_website, social_media, contact_email, phone, category, level, status`)
    .eq('slug', slug)
    .single();

  if (!leaderData) notFound();

  const leader = leaderData as Leader;

  const { data: historicalRoles } = await supabase
    .from('leader_roles')
    .select('title, party, constituency, term_start_date, term_end_date')
    .eq('leader_id', leader.id)
    .order('term_start_date', { ascending: false });

  const rawSittings: any[] = await sanityClient.fetch(
    `*[_type == "hansardSitting" && count(contributions[supabaseLeaderId == $leaderId]) > 0] | order(sittingDate desc) {
      sittingDate, houseType, title, sittingPeriod,
      "matchingContributions": contributions[supabaseLeaderId == $leaderId] {
        _key, order, startTime, sectionHeader, speech
      }
    }`,
    { leaderId: leader.id }
  );

  let allContributions: Contribution[] = rawSittings.flatMap((sitting) =>
    sitting.matchingContributions.map((c: any) => ({
      ...c,
      sittingDate: sitting.sittingDate,
      houseType: sitting.houseType,
      sittingTitle: sitting.title,
    }))
  );

  // Filters
  const keyword = filters.keyword?.toLowerCase().trim();
  let dateFrom = filters.dateFrom;
  let dateTo = filters.dateTo;
  const sort = filters.sort || 'newest';
  const sectionFilter = filters.section;
  const viewMode = filters.view === 'table' ? 'table' : 'chart';

  if (filters.month) {
    dateFrom = `${filters.month}-01`;
    const lastDay = new Date(new Date(dateFrom).getFullYear(), new Date(dateFrom).getMonth() + 1, 0).getDate();
    dateTo = `${filters.month}-${lastDay.toString().padStart(2, '0')}`;
  }

  if (keyword) {
    allContributions = allContributions.filter((c) => extractTextFromPortableText(c.speech).toLowerCase().includes(keyword));
  }
  if (dateFrom) allContributions = allContributions.filter((c) => c.sittingDate >= dateFrom);
  if (dateTo) allContributions = allContributions.filter((c) => c.sittingDate <= dateTo);
  if (sectionFilter && sectionFilter !== 'All') {
    allContributions = allContributions.filter((c) => c.sectionHeader === sectionFilter);
  }

  allContributions.sort((a, b) => sort === 'oldest' ? a.sittingDate.localeCompare(b.sittingDate) : b.sittingDate.localeCompare(a.sittingDate));

  const total = allContributions.length;

  const uniqueSittings = new Set(allContributions.map((c) => c.sittingDate)).size;
  const firstSpeech = allContributions.length > 0 ? allContributions[allContributions.length - 1].sittingDate : null;
  const lastSpeech = allContributions.length > 0 ? allContributions[0].sittingDate : null;
  const yearsActive = firstSpeech ? new Date().getFullYear() - new Date(firstSpeech).getFullYear() + 1 : 0;

  const monthlyMap = new Map<string, number>();
  allContributions.forEach((c) => {
    const key = c.sittingDate.slice(0, 7);
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
  });
  const timelineData = Array.from(monthlyMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  const maxCount = Math.max(...timelineData.map(([, count]) => count), 1);

  const currentRole = historicalRoles?.[0];

  const hasContact = leader.contact_email || leader.phone || leader.official_website || (leader.social_media && Object.keys(leader.social_media).length > 0);
  const hasBio = !!leader.bio;
  const hasExtraInfo = leader.gender || leader.date_of_birth || leader.category || leader.level || leader.status;

  const buildUrl = (overrides: Record<string, string | undefined> = {}) => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    if (sort !== 'newest') params.set('sort', sort);
    if (sectionFilter && sectionFilter !== 'All') params.set('section', sectionFilter);
    if (viewMode === 'table') params.set('view', 'table');
    Object.entries(overrides).forEach(([k, v]) => { if (!v) params.delete(k); else params.set(k, v); });
    const qs = params.toString();
    return `/legislature/hansard/member/${slug}${qs ? `?${qs}` : ''}`;
  };

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: 'Home', href: '/' },
          { text: 'Legislature', href: '/legislature' },
          { text: 'Hansard', href: '/legislature/hansard' },
          { text: 'Find Members', href: '/legislature/hansard/members' },
          { text: leader.full_name.split(' ').slice(-1)[0] || 'Member', href: '' },
        ]}
      />

      
        <Link href="/legislature/hansard/members" className="govuk-back-link">← Back to all members</Link>

        {/* Header */}
        <div className="govuk-panel govuk-panel--confirmation" style={{ backgroundColor: '#f3e8ff', padding: '24px', borderRadius: '4px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {leader.image_url ? (
              <img src={leader.image_url} alt={leader.full_name} style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f3f2f1' }} />
            ) : (
              <div style={{ width: '110px', height: '110px', borderRadius: '50%', backgroundColor: '#1d70b8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', fontWeight: 700, flexShrink: 0 }}>
                {leader.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}

            <div style={{ flex: 1, minWidth: '260px' }}>
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-1">{leader.full_name}</h1>
              <p className="govuk-body-l govuk-!-margin-bottom-1" style={{ color: '#505a5f' }}>
                {leader.current_party} {leader.current_constituency && `• ${leader.current_constituency}`} {leader.current_county && `• ${leader.current_county}`}
              </p>
              {leader.title && <p className="govuk-body">{leader.title}</p>}
              {currentRole && <p className="govuk-body-s govuk-!-margin-top-1">{currentRole.title}</p>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="govuk-grid-row govuk-!-margin-bottom-6">
          {[
            { label: 'Total Contributions', value: total },
            { label: 'Sittings Spoken In', value: uniqueSittings },
            { label: 'Years Active', value: yearsActive },
            { label: 'Latest Activity', value: lastSpeech ? new Date(lastSpeech).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' }) : '—' }
          ].map((stat, i) => (
            <div key={i} className="govuk-grid-column-one-quarter">
              <div className="govuk-summary-card">
                <div className="govuk-summary-card__title-wrapper"><h3 className="govuk-summary-card__title">{stat.label}</h3></div>
                <div className="govuk-summary-card__content"><p className="govuk-heading-xl govuk-!-margin-bottom-0">{stat.value}</p></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bio */}
        {hasBio && (
          <div className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-m">About</h2>
            <div className="govuk-body" style={{ whiteSpace: 'pre-line' }}>{leader.bio}</div>
          </div>
        )}

        {/* Contact */}
        {hasContact && (
          <details className="govuk-details govuk-!-margin-bottom-6">
            <summary className="govuk-details__summary"><span className="govuk-details__summary-text">Contact &amp; Online Presence</span></summary>
            <div className="govuk-details__text">
              <ul className="govuk-list govuk-list--bullet">
                {leader.contact_email && <li><a href={`mailto:${leader.contact_email}`} className="govuk-link">{leader.contact_email}</a></li>}
                {leader.phone && <li><a href={`tel:${leader.phone}`} className="govuk-link">{leader.phone}</a></li>}
                {leader.official_website && <li><a href={leader.official_website} target="_blank" rel="noopener" className="govuk-link">Official website →</a></li>}
              </ul>
            </div>
          </details>
        )}

        {/* Extra Info */}
        {hasExtraInfo && (
          <div className="govuk-!-margin-bottom-6">
            <h2 className="govuk-heading-s">Additional Information</h2>
            <div className="govuk-grid-row">
              {leader.gender && <div className="govuk-grid-column-one-quarter"><p className="govuk-body-s"><strong>Gender:</strong> {leader.gender}</p></div>}
              {leader.date_of_birth && <div className="govuk-grid-column-one-quarter"><p className="govuk-body-s"><strong>Born:</strong> {new Date(leader.date_of_birth).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>}
              {leader.category && <div className="govuk-grid-column-one-quarter"><p className="govuk-body-s"><strong>Category:</strong> {leader.category}</p></div>}
              {leader.level && <div className="govuk-grid-column-one-quarter"><p className="govuk-body-s"><strong>Level:</strong> {leader.level}</p></div>}
              {leader.status && <div className="govuk-grid-column-one-quarter"><p className="govuk-body-s"><strong>Status:</strong> {leader.status}</p></div>}
            </div>
          </div>
        )}

        {/* Parliamentary History */}
        {historicalRoles && historicalRoles.length > 0 && (
          <details className="govuk-details govuk-!-margin-bottom-6">
            <summary className="govuk-details__summary"><span className="govuk-details__summary-text">Parliamentary History &amp; Role Changes</span></summary>
            <div className="govuk-details__text">
              <ul className="govuk-list govuk-list--bullet">
                {historicalRoles.map((role, idx) => (
                  <li key={idx}>
                    <strong>{new Date(role.term_start_date).getFullYear()} – {role.term_end_date ? new Date(role.term_end_date).getFullYear() : 'Present'}</strong>: {role.title} {role.constituency && `for ${role.constituency}`}
                  </li>
                ))}
              </ul>
            </div>
          </details>
        )}

        {/* Filters */}
        <form method="GET" className="govuk-!-margin-bottom-6" style={{ backgroundColor: '#f8f8f8', padding: '20px', borderRadius: '4px' }}>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="keyword">Keyword(s)</label>
                <input className="govuk-input" id="keyword" name="keyword" type="text" defaultValue={keyword} placeholder="Search speeches..." />
              </div>
            </div>
          </div>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group"><label className="govuk-label">Date from</label><input className="govuk-input" type="date" name="dateFrom" defaultValue={dateFrom} /></div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group"><label className="govuk-label">Date to</label><input className="govuk-input" type="date" name="dateTo" defaultValue={dateTo} /></div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-form-group"><label className="govuk-label">Sort by</label>
                <select className="govuk-select" name="sort" defaultValue={sort}>
                  <option value="newest">Date (newest first)</option>
                  <option value="oldest">Date (oldest first)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="govuk-button-group">
            <button type="submit" className="govuk-button">Search</button>
            <Link href={buildUrl({ keyword: undefined, dateFrom: undefined, dateTo: undefined, month: undefined })} className="govuk-button govuk-button--secondary">Clear filters</Link>
          </div>
        </form>

        {/* Timeline */}
        <div className="govuk-!-margin-bottom-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Results timeline (accessibility information)</h2>
            <Link href={buildUrl({ view: viewMode === 'chart' ? 'table' : undefined })} className="govuk-button govuk-button--secondary govuk-!-margin-bottom-2">
              {viewMode === 'chart' ? 'Change to Table View' : 'Change to chart view'}
            </Link>
          </div>

          <div className="govuk-inset-text govuk-!-margin-bottom-4" style={{ fontSize: '0.95rem' }}>
            The results timeline offers another way of graphically showing results. Unfortunately, the technology used for it is not compatible with assistive technologies.
          </div>

          {viewMode === 'chart' ? (
            timelineData.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', minWidth: `${timelineData.length * 32}px`, height: '160px', borderBottom: '2px solid #b1b4b6', paddingBottom: '4px' }}>
                  {timelineData.map(([month, count]) => {
                    const height = Math.max((count / maxCount) * 100, 10);
                    const monthLabel = new Date(month + '-01').toLocaleDateString('en-KE', { month: 'short', year: '2-digit' });
                    return (
                      <Link key={month} href={buildUrl({ month, view: 'table' })} style={{ flex: '0 0 28px', textAlign: 'center', textDecoration: 'none' }} title={`${monthLabel}: ${count} contributions`}>
                        <div style={{ height: `${height}%`, backgroundColor: '#1d70b8', borderRadius: '2px 2px 0 0', minHeight: '8px' }} />
                        <div style={{ fontSize: '9px', color: '#505a5f', marginTop: '4px', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{monthLabel}</div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : <p className="govuk-body-s">No timeline data available.</p>
          ) : (
            <div className="govuk-table--responsive">
              <table className="govuk-table">
                <thead className="govuk-table__head"><tr><th className="govuk-table__header">Month</th><th className="govuk-table__header govuk-table__header--numeric">Contributions</th></tr></thead>
                <tbody className="govuk-table__body">
                  {timelineData.map(([month, count]) => (
                    <tr key={month} className="govuk-table__row">
                      <td className="govuk-table__cell">{new Date(month + '-01').toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}</td>
                      <td className="govuk-table__cell govuk-table__cell--numeric">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Contributions List */}
        <h2 className="govuk-heading-m">Spoken contributions ({total})</h2>
        {total === 0 ? (
          <div className="govuk-inset-text">No contributions found matching your filters.</div>
        ) : (
          <div className="space-y-4">
            {allContributions.map((contrib, index) => {
              const preview = extractTextFromPortableText(contrib.speech);
              return (
                <div key={`${contrib.sittingDate}-${index}`} className="govuk-summary-card">
                  <div className="govuk-summary-card__title-wrapper">
                    <h3 className="govuk-summary-card__title">
                      <span className="govuk-tag govuk-tag--blue govuk-!-margin-right-2">{new Date(contrib.sittingDate).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }).toUpperCase()}</span>
                      {contrib.sittingTitle}
                    </h3>
                  </div>
                  <div className="govuk-summary-card__content">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      {contrib.sectionHeader && <span className="govuk-tag govuk-tag--grey">{contrib.sectionHeader}</span>}
                      {contrib.startTime && <span className="govuk-body-s">⏱ {contrib.startTime}</span>}
                      <span className="govuk-tag" style={{ backgroundColor: '#1d70b8', color: 'white' }}>{contrib.houseType.replace('-', ' ')}</span>
                    </div>
                    <p className="govuk-body">{preview.length > 280 ? preview.slice(0, 280) + '...' : preview}</p>
                    <Link href={`/legislature/hansard/${contrib.houseType}/${contrib.sittingDate}`} className="govuk-link govuk-!-font-weight-bold">View full contribution in sitting →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      
    
  
  </>
);
}

function extractTextFromPortableText(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return '';
  return blocks.filter((b) => b._type === 'block' && b.children).flatMap((b) => b.children.map((ch: any) => ch.text || '')).join(' ').trim();
}