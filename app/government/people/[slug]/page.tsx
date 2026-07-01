'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createClient } from "@/lib/supabase/client";

// Define the shape of the joined leader_roles data
type LeaderRole = {
  id: string;
  title: string | null;
  organization: string | null;
  constituency: string | null;
  county: string | null;
  ward: string | null;
  party: string | null;
  term_start_date: string | null;
  term_end_date: string | null;
  status: string | null;
  official_email: string | null;
  office_location: string | null;
  committees: any[] | null;
};

// Define the shape of the leader data
type Leader = {
  id: string;
  slug: string;
  title: string | null;
  first_name: string | null;
  other_names: string | null;
  surname: string | null;
  full_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  bio: string | null;
  image_url: string | null;
  official_website: string | null;
  social_media: Record<string, string> | null;
  contact_email: string | null;
  phone: string | null;
  category: string | null;
  sub_category: string | null;
  level: string | null;
  current_party: string | null;
  current_organization: string | null;
  current_county: string | null;
  current_constituency: string | null;
  is_active: boolean;
  status: string;
  leader_roles: LeaderRole[] | null;
};

export default function PersonProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [person, setPerson] = useState<Leader | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch the specific leader and their roles from Supabase
  useEffect(() => {
    const fetchPerson = async () => {
      if (!slug) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('leaders')
          .select(`
            *,
            leader_roles!leader_roles_leader_id_fkey (
              id, title, organization, constituency, county, ward, party, 
              term_start_date, term_end_date, status, official_email, 
              office_location, committees
            )
          `)
          .eq('slug', slug)
          .single();

        if (fetchError) throw fetchError;
        setPerson(data);
      } catch (err: any) {
        console.error('Error fetching person:', err);
        setError('Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerson();
  }, [slug, supabase]);

  // Loading State
  if (isLoading) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <p className="govuk-body">Loading profile...</p>
        </main>
      </div>
    );
  }

  // Error / 404 State
  if (error || !person) {
    return (
      <div className="govuk-width-container">
        <GovUKBreadcrumbs
          items={[
            { text: "Home", href: "/" },
            { text: "Government", href: "/government" },
            { text: "People", href: "/government/people" },
          ]}
        />
        <main className="govuk-main-wrapper">
          <h1 className="govuk-heading-xl">Page not found</h1>
          <p className="govuk-body">
            The official you are looking for does not exist or has been removed.
          </p>
          <Link href="/government/people" className="govuk-link">
            Return to all government officials
          </Link>
        </main>
      </div>
    );
  }

  // ==========================================
  // DATA PROCESSING & FORMATTING
  // ==========================================
  
  // STRICT NAME FORMATTING: Uses only first_name and surname to remove titles like "Hon."
  const displayName = `${person.first_name || ''} ${person.surname || ''}`.trim();
  
  // Find the active role (fallback to the first role if none are explicitly marked 'Active')
  const activeRole = person.leader_roles?.find(r => r.status === 'Active') || person.leader_roles?.[0];
  
  // Fallback logic: Use data from leader_roles if available, otherwise fallback to the leaders table
  const roleTitle = activeRole?.title || person.category || 'Government Official';
  const orgName = activeRole?.organization || person.current_organization;
  const party = activeRole?.party || person.current_party;
  const constituency = activeRole?.constituency || person.current_constituency;
  const county = activeRole?.county || person.current_county;
  const ward = activeRole?.ward;
  
  // Generate organization slug for linking
  const generateOrgSlug = (org: string | null) => {
    if (!org) return 'unknown';
    return org.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };
  const orgSlug = generateOrgSlug(orgName);

  // Parse social media JSON
  const socialMedia = person.social_media || {};
  const socialEntries = Object.entries(socialMedia).filter(([_, url]) => url);

  // Parse committees JSON array
  const committees = activeRole?.committees || [];

  // Helper to format dates
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "People", href: "/government/people" },
          { text: displayName, href: `/government/people/${person.slug}` },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Header Section */}
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
              {displayName}
            </h1>
            
            <p className="govuk-body-l govuk-!-margin-bottom-6">
              {roleTitle}
              {orgName && <>, {orgName}</>}
            </p>

            {/* Key Facts - GOV.UK Summary List */}
            <dl className="govuk-summary-list govuk-!-margin-bottom-9">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Current Role</dt>
                <dd className="govuk-summary-list__value">{roleTitle}</dd>
              </div>
              
              {orgName && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Organisation</dt>
                  <dd className="govuk-summary-list__value">
                    <Link href={`/government/organisations/${orgSlug}`} className="govuk-link">
                      {orgName}
                    </Link>
                  </dd>
                </div>
              )}

              {party && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Political Party</dt>
                  <dd className="govuk-summary-list__value">{party}</dd>
                </div>
              )}

              {constituency && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Constituency</dt>
                  <dd className="govuk-summary-list__value">{constituency}</dd>
                </div>
              )}

              {county && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">County</dt>
                  <dd className="govuk-summary-list__value">{county}</dd>
                </div>
              )}

              {ward && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Ward</dt>
                  <dd className="govuk-summary-list__value">{ward}</dd>
                </div>
              )}

              {activeRole?.term_start_date && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Term Start Date</dt>
                  <dd className="govuk-summary-list__value">{formatDate(activeRole.term_start_date)}</dd>
                </div>
              )}
            </dl>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Biography */}
            {person.bio && (
              <>
                <h2 className="govuk-heading-m">Biography</h2>
                <p className="govuk-body">{person.bio}</p>
              </>
            )}

            {/* Committee Memberships */}
            {committees.length > 0 && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-top-8">Committee Memberships</h2>
                <ul className="govuk-list govuk-list--bullet">
                  {committees.map((committee: any, index: number) => (
                    <li key={index}>
                      {typeof committee === 'string' ? committee : committee.name || committee.title || 'Unnamed Committee'}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Contact Information */}
            {(person.contact_email || person.phone || person.official_website || activeRole?.official_email || activeRole?.office_location) && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-top-8">Contact Information</h2>
                <dl className="govuk-summary-list">
                  {(activeRole?.official_email || person.contact_email) && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Email</dt>
                      <dd className="govuk-summary-list__value">
                        <a href={`mailto:${activeRole?.official_email || person.contact_email}`} className="govuk-link">
                          {activeRole?.official_email || person.contact_email}
                        </a>
                      </dd>
                    </div>
                  )}
                  {person.phone && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Phone</dt>
                      <dd className="govuk-summary-list__value">
                        <a href={`tel:${person.phone}`} className="govuk-link">{person.phone}</a>
                      </dd>
                    </div>
                  )}
                  {activeRole?.office_location && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Office Location</dt>
                      <dd className="govuk-summary-list__value">{activeRole.office_location}</dd>
                    </div>
                  )}
                  {person.official_website && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Website</dt>
                      <dd className="govuk-summary-list__value">
                        <a href={person.official_website} target="_blank" rel="noreferrer" className="govuk-link">
                          {person.official_website}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </>
            )}

            {/* Social Media Links */}
            {socialEntries.length > 0 && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-top-8">Social Media</h2>
                <ul className="govuk-list">
                  {socialEntries.map(([platform, url]) => (
                    <li key={platform}>
                      <a href={url} target="_blank" rel="noreferrer" className="govuk-link">
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}

          </div>
          
          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print">
              <h2 className="govuk-heading-m">Related content</h2>
              <nav role="navigation">
                <ul className="govuk-list">
                  {orgName && (
                    <li>
                      <Link href={`/government/organisations/${orgSlug}`} className="govuk-link">
                        {orgName}
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link href="/government/people" className="govuk-link">
                      All government officials
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/cabinet" className="govuk-link">
                      The Cabinet
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>

        </div>
      </main>
    </div>
  );
}