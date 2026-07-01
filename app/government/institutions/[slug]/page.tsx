// app/government/institutions/[slug]/page.tsx
'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

type InstitutionLeader = {
  name: string;
  title: string;
  start_date: string | null;
  is_current: boolean;
};

type InstitutionLocation = {
  id: string;
  office_name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  is_headquarters: boolean;
};

type Institution = {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  institution_type: string | null;
  institution_category: string | null;
  arm_of_government: string | null;
  government_level: string | null;
  mtef_sector: string | null;
  description: string | null;
  parent_institution_id: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  institution_leaders: InstitutionLeader[] | null;
  institution_locations: InstitutionLocation[] | null;
};

type ParentInstitution = {
  id: string;
  slug: string;
  name: string;
};

type ChildInstitution = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

export default function InstitutionProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [parentInstitution, setParentInstitution] = useState<ParentInstitution | null>(null);
  const [childInstitutions, setChildInstitutions] = useState<ChildInstitution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchInstitution = async () => {
      if (!slug) return;

      try {
        // Fetch main institution data with related records
        const { data: instData, error: instError } = await supabase
          .from('institutions')
          .select(`
            *,
            institution_leaders (
              name,
              title,
              start_date,
              is_current
            ),
            institution_locations (
              id,
              office_name,
              address,
              latitude,
              longitude,
              is_headquarters
            )
          `)
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (instError) throw instError;
        if (!instData) throw new Error('Institution not found');

        setInstitution(instData);

        // Fetch parent institution if exists
        if (instData.parent_institution_id) {
          const { data: parentData } = await supabase
            .from('institutions')
            .select('id, slug, name')
            .eq('id', instData.parent_institution_id)
            .single();

          if (parentData) {
            setParentInstitution(parentData);
          }
        }

        // Fetch child institutions if this is a parent
        const { data: childrenData } = await supabase
          .from('institutions')
          .select('id, slug, name, description')
          .eq('parent_institution_id', instData.id)
          .eq('is_active', true)
          .order('name');

        if (childrenData) {
          setChildInstitutions(childrenData);
        }

      } catch (err: any) {
        console.error('Error fetching institution:', err);
        setError('Failed to load institution profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstitution();
  }, [slug, supabase]);

  if (isLoading) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <p className="govuk-body">Loading institution profile...</p>
        </main>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="govuk-width-container">
        <GovUKBreadcrumbs
          items={[
            { text: "Home", href: "/" },
            { text: "Government", href: "/government" },
            { text: "Institutions", href: "/government/institutions" },
          ]}
        />
        <main className="govuk-main-wrapper">
          <h1 className="govuk-heading-xl">Page not found</h1>
          <p className="govuk-body">
            The institution you are looking for does not exist or has been removed.
          </p>
          <Link href="/government/institutions" className="govuk-link">
            Return to all institutions
          </Link>
        </main>
      </div>
    );
  }

  // Get current leaders
  const currentLeaders = institution.institution_leaders?.filter(l => l.is_current) || [];
  const formerLeaders = institution.institution_leaders?.filter(l => !l.is_current) || [];

  // Get headquarters location
  const headquarters = institution.institution_locations?.find(l => l.is_headquarters);
  const otherLocations = institution.institution_locations?.filter(l => !l.is_headquarters) || [];

  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Date not recorded';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Institutions", href: "/government/institutions" },
          ...(parentInstitution ? [{ text: parentInstitution.name, href: `/government/institutions/${parentInstitution.slug}` }] : []),
          { text: institution.name, href: `/government/institutions/${institution.slug}` },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* Header Section */}
            <div className="institution-profile__header">
              <span className="govuk-caption-l">{institution.institution_type || 'Public Institution'}</span>
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
                {institution.name}
              </h1>
              {institution.short_name && (
                <p className="govuk-body-l govuk-!-margin-bottom-4">
                  Also known as: <strong>{institution.short_name}</strong>
                </p>
              )}
            </div>

            {/* Key Facts - GOV.UK Summary List */}
            <dl className="govuk-summary-list govuk-!-margin-bottom-9">
              {institution.arm_of_government && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Arm of Government</dt>
                  <dd className="govuk-summary-list__value">{institution.arm_of_government}</dd>
                </div>
              )}
              
              {institution.institution_category && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Category</dt>
                  <dd className="govuk-summary-list__value">{institution.institution_category}</dd>
                </div>
              )}

              {institution.government_level && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Government Level</dt>
                  <dd className="govuk-summary-list__value">{institution.government_level}</dd>
                </div>
              )}

              {institution.mtef_sector && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">MTEF Sector</dt>
                  <dd className="govuk-summary-list__value">{institution.mtef_sector}</dd>
                </div>
              )}

              {parentInstitution && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Parent Institution</dt>
                  <dd className="govuk-summary-list__value">
                    <Link href={`/government/institutions/${parentInstitution.slug}`} className="govuk-link">
                      {parentInstitution.name}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Description / Mandate */}
            {institution.description && (
              <>
                <h2 className="govuk-heading-l">What this institution does</h2>
                <div className="govuk-body">
                  {institution.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="govuk-body">{paragraph}</p>
                  ))}
                </div>
              </>
            )}

            {/* Current Leadership */}
            {currentLeaders.length > 0 && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Current Leadership</h2>
                <dl className="govuk-summary-list">
                  {currentLeaders.map((leader, index) => (
                    <div key={index} className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">{leader.title}</dt>
                      <dd className="govuk-summary-list__value">
                        {leader.name}
                        {leader.start_date && (
                          <span className="govuk-body-s govuk-!-display-block govuk-!-margin-top-1">
                            In office since {formatDate(leader.start_date)}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            )}

            {/* Former Leadership */}
            {formerLeaders.length > 0 && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Former Leadership</h2>
                <ul className="govuk-list govuk-list--bullet">
                  {formerLeaders.map((leader, index) => (
                    <li key={index}>
                      <strong>{leader.name}</strong> — {leader.title}
                      {leader.start_date && (
                        <span className="govuk-body-s"> (from {formatDate(leader.start_date)})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Sub-Departments / Child Institutions */}
            {childInstitutions.length > 0 && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Sub-departments and agencies</h2>
                <p className="govuk-body">
                  This institution oversees the following {childInstitutions.length} sub-department{childInstitutions.length !== 1 ? 's' : ''}:
                </p>
                <ul className="govuk-list govuk-list--spaced">
                  {childInstitutions.map((child) => (
                    <li key={child.id}>
                      <Link 
                        href={`/government/institutions/${child.slug}`} 
                        className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold"
                      >
                        {child.name}
                      </Link>
                      {child.description && (
                        <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                          {child.description.length > 120 
                            ? `${child.description.substring(0, 120)}...` 
                            : child.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Headquarters Location */}
            {headquarters && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Headquarters</h2>
                <div className="govuk-body">
                  <p className="govuk-body govuk-!-font-weight-bold">{headquarters.office_name}</p>
                  {headquarters.address && (
                    <p className="govuk-body">{headquarters.address}</p>
                  )}
                  {headquarters.latitude && headquarters.longitude && (
                    <p className="govuk-body-s">
                      <a 
                        href={`https://www.google.com/maps?q=${headquarters.latitude},${headquarters.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="govuk-link"
                      >
                        View on map
                      </a>
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Other Locations */}
            {otherLocations.length > 0 && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Other Locations</h2>
                <ul className="govuk-list govuk-list--spaced">
                  {otherLocations.map((location) => (
                    <li key={location.id}>
                      <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                        {location.office_name}
                      </p>
                      {location.address && (
                        <p className="govuk-body-s govuk-!-margin-bottom-0">
                          {location.address}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Contact Information */}
            {(institution.email || institution.phone || institution.website_url) && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Contact Information</h2>
                <dl className="govuk-summary-list">
                  {institution.email && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Email</dt>
                      <dd className="govuk-summary-list__value">
                        <a href={`mailto:${institution.email}`} className="govuk-link">
                          {institution.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  {institution.phone && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Phone</dt>
                      <dd className="govuk-summary-list__value">
                        <a href={`tel:${institution.phone}`} className="govuk-link">
                          {institution.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {institution.website_url && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Website</dt>
                      <dd className="govuk-summary-list__value">
                        <a href={institution.website_url} target="_blank" rel="noreferrer" className="govuk-link">
                          {institution.website_url}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </>
            )}

          </div>
          
          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">
                Related content
              </h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  {parentInstitution && (
                    <li>
                      <Link href={`/government/institutions/${parentInstitution.slug}`} className="govuk-link">
                        {parentInstitution.name}
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link href="/government/institutions" className="govuk-link">
                      All institutions
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/ministers" className="govuk-link">
                      Cabinet Secretaries
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/people" className="govuk-link">
                      All government officials
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Quick Actions */}
              {(institution.website_url || institution.email) && (
                <>
                  <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible govuk-!-margin-top-6" />
                  <h3 className="govuk-heading-s govuk-!-margin-bottom-3">Quick actions</h3>
                  <ul className="govuk-list">
                    {institution.website_url && (
                      <li>
                        <a 
                          href={institution.website_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="govuk-link"
                        >
                          Visit official website
                        </a>
                      </li>
                    )}
                    {institution.email && (
                      <li>
                        <a href={`mailto:${institution.email}`} className="govuk-link">
                          Send email
                        </a>
                      </li>
                    )}
                  </ul>
                </>
              )}
            </aside>
          </div>

        </div>
      </main>
    </div>
  );
}