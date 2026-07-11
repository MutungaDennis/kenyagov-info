import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from 'next-sanity';
import { PortableText } from '@portabletext/react';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

type ContributionType = 'spoken' | 'procedural' | 'header';

interface Contribution {
  _key: string;
  order: number;
  type: ContributionType;
  supabaseLeaderId?: string;
  startTime?: string;
  sectionHeader?: string;
  speech: any[];
}

interface EnrichedContribution extends Contribution {
  enrichedSpeaker?: {
    full_name: string;
    title?: string;
    current_constituency?: string;
    current_party?: string;
    slug?: string;
  };
}

interface Sitting {
  _id: string;
  title: string;
  houseType: string;
  countyName?: string;
  sittingDate: string;
  sittingPeriod?: string;
  parliamentaryTerm?: string;
  youtubeUrl?: string;
  editorialSummary?: any[];
  keyEvents?: string[];
  topics?: string[];
  contributions: Contribution[];
}

interface PageProps {
  params: Promise<{ house: string; date: string }>;
}

export default async function DailySittingPage({ params }: PageProps) {
  const { house, date } = await params;

  const validHouses = ['national-assembly', 'senate', 'county-assembly'];
  if (!validHouses.includes(house)) notFound();

  const sitting: Sitting | null = await sanityClient.fetch(
    `*[_type == "hansardSitting" && houseType == $house && sittingDate == $date][0] {
      _id, title, houseType, countyName, sittingDate, sittingPeriod, parliamentaryTerm,
      youtubeUrl, editorialSummary, keyEvents, topics,
      contributions[] {
        _key, order, type, supabaseLeaderId, startTime, sectionHeader, speech
      }
    }`,
    { house, date }
  );

  if (!sitting) {
    return (
  <>
      
        <GovUKBreadcrumbs items={[
          { text: 'Home', href: '/' },
          { text: 'Legislature', href: '/legislature' },
          { text: 'Hansard', href: '/legislature/hansard' },
          { text: house.replace('-', ' '), href: `/legislature/hansard/${house}` },
          { text: date, href: '' },
        ]} />
        
          <h1 className="govuk-heading-xl">Sitting Not Found</h1>
          <p className="govuk-body">No Hansard record found for <strong>{house.replace('-', ' ')}</strong> on <strong>{date}</strong>.</p>
        
      
    
  </>
);
  }

  const enrichedContributions = await enrichContributions(sitting.contributions || []);

  return (
  <>
    
      <GovUKBreadcrumbs items={[
        { text: 'Home', href: '/' },
        { text: 'Legislature', href: '/legislature' },
        { text: 'Hansard', href: '/legislature/hansard' },
        { text: sitting.houseType.replace('-', ' '), href: `/legislature/hansard/${sitting.houseType}` },
        { text: new Date(sitting.sittingDate).toLocaleDateString('en-KE'), href: '' },
      ]} />

      
        {/* Header */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">
              {sitting.houseType.replace('-', ' ').toUpperCase()} • {sitting.parliamentaryTerm}
            </span>
            <h1 className="govuk-heading-xl">{sitting.title}</h1>
            <p className="govuk-body-l govuk-!-margin-bottom-1">
              {new Date(sitting.sittingDate).toLocaleDateString('en-KE', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })} — {sitting.sittingPeriod}
            </p>
            {sitting.countyName && <p className="govuk-body">{sitting.countyName} County Assembly</p>}
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-6" />

        {/* Contributions */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-m">Debate Contributions</h2>

            {enrichedContributions.length === 0 ? (
              <div className="govuk-inset-text">No contributions have been added for this sitting yet.</div>
            ) : (
              <div className="space-y-6 govuk-!-margin-top-4">
                {enrichedContributions
                  .sort((a, b) => a.order - b.order)
                  .map((contrib) => {
                    const speaker = contrib.enrichedSpeaker;
                    const party = speaker?.current_party?.toUpperCase() || '';
                    const partyColor = party.includes('UDA') ? '#1d70b8' : party.includes('ODM') ? '#f47738' : party.includes('JUBILEE') ? '#28a197' : '#505a5f';

                    // === SECTION HEADER ===
                    if (contrib.type === 'header') {
                      return (
                        <div key={contrib._key} className="govuk-!-margin-top-8 govuk-!-margin-bottom-4">
                          <h3 className="govuk-heading-m govuk-!-margin-bottom-2" style={{ color: '#1d70b8' }}>
                            {contrib.sectionHeader || 'Section'}
                          </h3>
                          <hr className="govuk-section-break govuk-section-break--visible" />
                        </div>
                      );
                    }

                    // === PROCEDURAL NOTE ===
                    if (contrib.type === 'procedural') {
                      return (
                        <div key={contrib._key} className="govuk-inset-text govuk-!-margin-bottom-4" style={{ fontStyle: 'italic', backgroundColor: '#f8f8f8' }}>
                          <div className="govuk-body-s govuk-!-margin-bottom-1" style={{ color: '#505a5f' }}>
                            {contrib.startTime && `⏱ ${contrib.startTime} • `}
                            Procedural Note
                          </div>
                          <div className="prose prose-sm max-w-none govuk-body">
                            <PortableText value={contrib.speech} />
                          </div>
                        </div>
                      );
                    }

                    // === SPOKEN CONTRIBUTION (default rich card) ===
                    return (
                      <div key={contrib._key} className="govuk-summary-card">
                        <div className="govuk-summary-card__title-wrapper">
                          <h3 className="govuk-summary-card__title">
                            <span style={{
                              backgroundColor: '#1d70b8',
                              color: 'white',
                              padding: '2px 10px',
                              borderRadius: '3px',
                              fontSize: '14px',
                              fontWeight: 600,
                              marginRight: '10px'
                            }}>
                              {contrib.order}
                            </span>

                            {speaker ? (
                              <>
                                {speaker.title ? `${speaker.title} ` : ''}
                                <strong>{speaker.full_name}</strong>

                                {speaker.slug && (
                                  <Link
                                    href={`/legislature/hansard/member/${speaker.slug}`}
                                    className="govuk-link govuk-!-margin-left-1"
                                    style={{ fontSize: '1.5em', fontWeight: 700, lineHeight: 1, color: '#1d70b8' }}
                                    aria-label={`View all contributions by ${speaker.full_name}`}
                                  >
                                    ›
                                  </Link>
                                )}

                                {speaker.current_party && (
                                  <span
                                    className="govuk-body-s govuk-!-margin-left-2"
                                    style={{
                                      backgroundColor: partyColor,
                                      color: 'white',
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      fontSize: '13px'
                                    }}
                                  >
                                    {speaker.current_party}
                                  </span>
                                )}
                                {speaker.current_constituency && (
                                  <span className="govuk-body-s govuk-!-margin-left-2" style={{ color: '#505a5f' }}>
                                    {speaker.current_constituency}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span style={{ color: '#505a5f' }}>Speaker details not linked</span>
                            )}
                          </h3>
                        </div>

                        <div className="govuk-summary-card__content">
                          <div className="govuk-!-margin-bottom-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {contrib.sectionHeader && <span className="govuk-tag govuk-tag--grey">{contrib.sectionHeader}</span>}
                            {contrib.startTime && <span className="govuk-body-s" style={{ color: '#505a5f' }}>⏱ {contrib.startTime}</span>}
                          </div>

                          <div className="prose prose-sm max-w-none govuk-body">
                            <PortableText value={contrib.speech} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        <div className="govuk-!-margin-top-8">
        </div>
      
    
  
  </>
);
}

// ============================================
// SUPABASE ENRICHMENT
// ============================================
async function enrichContributions(contributions: Contribution[]): Promise<EnrichedContribution[]> {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const leaderIds = Array.from(
    new Set(contributions.map(c => c.supabaseLeaderId).filter(Boolean) as string[])
  );

  if (leaderIds.length === 0) {
    return contributions.map(c => ({ ...c }));
  }

  const { data: leaders } = await supabase
    .from('leaders')
    .select('id, slug, full_name, title, current_constituency, current_party')
    .in('id', leaderIds);

  const leaderMap = new Map((leaders || []).map(l => [l.id, l]));

  return contributions.map(contrib => {
    const leader = contrib.supabaseLeaderId ? leaderMap.get(contrib.supabaseLeaderId) : null;

    return {
      ...contrib,
      enrichedSpeaker: leader
        ? {
            full_name: leader.full_name,
            title: leader.title,
            current_constituency: leader.current_constituency,
            current_party: leader.current_party,
            slug: leader.slug,
          }
        : undefined,
    };
  });
}