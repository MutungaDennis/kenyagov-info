'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createBrowserClientAsync } from "@/lib/supabase/client";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

type Institution = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  official_name?: string | null;
  institution_type?: string | null;
  institution_category?: string | null;
  arm_of_government?: string | null;
  government_level?: string | null;
  mtef_sector?: string | null;
  cofog_division?: string | null;
  description?: string | null;
  mandate?: string | null;
  vision?: string | null;
  mission?: string | null;
  functions?: string[] | null;
  regulated_sectors?: string[] | null;
  current_head?: string | null;
  head_title?: string | null;
  board_chair?: string | null;
  website_url?: string | null;
  email?: string | null;
  phone?: string | null;
  postal_address?: string | null;
  headquarters?: string | null;
  physical_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  social_media?: any;
  legal_basis_name?: string | null;
  parent_institution_id?: string | null;
  supervising_ministry_id?: string | null;
  reports_to_institution_id?: string | null;
  institution_leaders?: any[] | null;
  institution_locations?: any[] | null;
};

type LinkedInstitution = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  institution_type?: string | null;
};

type ChildInstitution = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  institution_type?: string | null;
};

export default function InstitutionProfilePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [institution, setInstitution] = useState<Institution | null>(null);
  /** Root-first chain of parents (ministry → … → direct parent) */
  const [parentChain, setParentChain] = useState<LinkedInstitution[]>([]);
  const [supervisingMinistry, setSupervisingMinistry] =
    useState<LinkedInstitution | null>(null);
  const [reportsTo, setReportsTo] = useState<LinkedInstitution | null>(null);
  const [childInstitutions, setChildInstitutions] = useState<ChildInstitution[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstitution = async () => {
      if (!slug) return;

      try {
        const supabase = await createBrowserClientAsync();
        let instData: Institution | null = null;
        const withJoins = await supabase
          .from("institutions")
          .select(
            `
            *,
            institution_leaders (*),
            institution_locations (*)
          `,
          )
          .eq("slug", slug)
          .eq("is_active", true)
          .single();

        if (withJoins.error) {
          const basic = await supabase
            .from("institutions")
            .select("*")
            .eq("slug", slug)
            .eq("is_active", true)
            .single();
          if (basic.error || !basic.data) throw withJoins.error || basic.error;
          instData = basic.data as Institution;
        } else {
          instData = withJoins.data as Institution;
        }

        if (!instData) throw new Error("Institution not found");
        setInstitution(instData);

        // Walk parent chain upward (max depth 8)
        const chain: LinkedInstitution[] = [];
        let parentId = instData.parent_institution_id;
        const seen = new Set<string>([instData.id]);
        for (let i = 0; i < 8 && parentId; i++) {
          if (seen.has(parentId)) break;
          seen.add(parentId);
          const { data: parentData } = await supabase
            .from("institutions")
            .select("id, slug, name, short_name, institution_type, parent_institution_id")
            .eq("id", parentId)
            .maybeSingle();
          if (!parentData) break;
          chain.unshift(parentData as LinkedInstitution);
          parentId = (parentData as { parent_institution_id?: string })
            .parent_institution_id;
        }
        setParentChain(chain);

        if (instData.supervising_ministry_id) {
          const { data: sup } = await supabase
            .from("institutions")
            .select("id, slug, name, short_name, institution_type")
            .eq("id", instData.supervising_ministry_id)
            .maybeSingle();
          if (sup) setSupervisingMinistry(sup as LinkedInstitution);
        } else {
          setSupervisingMinistry(null);
        }

        if (
          instData.reports_to_institution_id &&
          instData.reports_to_institution_id !==
            instData.parent_institution_id
        ) {
          const { data: rep } = await supabase
            .from("institutions")
            .select("id, slug, name, short_name, institution_type")
            .eq("id", instData.reports_to_institution_id)
            .maybeSingle();
          if (rep) setReportsTo(rep as LinkedInstitution);
        } else {
          setReportsTo(null);
        }

        const { data: childrenData } = await supabase
          .from("institutions")
          .select("id, slug, name, description, institution_type")
          .eq("parent_institution_id", instData.id)
          .eq("is_active", true)
          .order("name");

        if (childrenData) setChildInstitutions(childrenData);
      } catch (err: unknown) {
        console.error("Error fetching institution:", err);
        setError("Failed to load institution profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstitution();
  }, [slug]);

  if (isLoading) {
    return (
      
        
          <p className="govuk-body">Loading institution profile...</p>
        
      
    );
  }

  if (error || !institution) {
    return (
  <>
      
        <GovUKBreadcrumbs items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Institutions", href: "/government/institutions" },
        ]} />
        
          <h1 className="govuk-heading-xl">Page not found</h1>
          <p className="govuk-body">The institution you are looking for does not exist or has been removed.</p>
          <Link href="/government/institutions" className="govuk-link">Return to all institutions</Link>
        
      
    
  </>
);
  }

  const currentLeaders = institution.institution_leaders?.filter((l: any) => l.is_current) || [];
  const headquarters = institution.institution_locations?.find((l: any) => l.is_headquarters);
  const otherLocations = institution.institution_locations?.filter((l: any) => !l.is_headquarters) || [];
  const directParent = parentChain.length
    ? parentChain[parentChain.length - 1]
    : null;

  return (
  <>
    
      <GovUKBreadcrumbs items={[
        { text: "Home", href: "/" },
        { text: "Government", href: "/government" },
        { text: "Institutions", href: "/government/institutions" },
        ...parentChain.map((p) => ({
          text: p.short_name || p.name,
          href: `/government/institutions/${p.slug}`,
        })),
        { text: institution.name },
      ]} />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">

            <span className="govuk-caption-l">{institution.institution_type || 'Public Institution'}</span>
            <h1 className="govuk-heading-xl">{institution.name}</h1>

            {institution.short_name && (
              <p className="govuk-body-l">Also known as: <strong>{institution.short_name}</strong></p>
            )}

            {parentChain.length > 0 && (
              <p className="govuk-body">
                <strong>Part of:</strong>{" "}
                {parentChain.map((p, i) => (
                  <span key={p.id}>
                    {i > 0 && " → "}
                    <Link
                      href={`/government/institutions/${p.slug}`}
                      className="govuk-link"
                    >
                      {p.name}
                    </Link>
                  </span>
                ))}
              </p>
            )}

            {/* Key Facts - Now includes COFOG and MTEF */}
            <dl className="govuk-summary-list govuk-!-margin-bottom-9">
              {institution.arm_of_government && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Arm of Government</dt>
                  <dd className="govuk-summary-list__value">{institution.arm_of_government}</dd>
                </div>
              )}
              {institution.government_level && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Government Level</dt>
                  <dd className="govuk-summary-list__value">{institution.government_level}</dd>
                </div>
              )}
              {institution.cofog_division && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">COFOG Division</dt>
                  <dd className="govuk-summary-list__value">{institution.cofog_division}</dd>
                </div>
              )}
              {institution.mtef_sector && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">MTEF Sector</dt>
                  <dd className="govuk-summary-list__value">{institution.mtef_sector}</dd>
                </div>
              )}
              {institution.legal_basis_name && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Legal Basis</dt>
                  <dd className="govuk-summary-list__value">{institution.legal_basis_name}</dd>
                </div>
              )}
              {directParent && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Parent institution</dt>
                  <dd className="govuk-summary-list__value">
                    <Link href={`/government/institutions/${directParent.slug}`} className="govuk-link">
                      {directParent.name}
                    </Link>
                  </dd>
                </div>
              )}
              {supervisingMinistry && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Supervising ministry</dt>
                  <dd className="govuk-summary-list__value">
                    <Link
                      href={`/government/institutions/${supervisingMinistry.slug}`}
                      className="govuk-link"
                    >
                      {supervisingMinistry.name}
                    </Link>
                  </dd>
                </div>
              )}
              {reportsTo && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Reports to</dt>
                  <dd className="govuk-summary-list__value">
                    <Link
                      href={`/government/institutions/${reportsTo.slug}`}
                      className="govuk-link"
                    >
                      {reportsTo.name}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>

            {childInstitutions.length > 0 && (
              <>
                <h2 className="govuk-heading-m">
                  Bodies under this institution
                </h2>
                <p className="govuk-body">
                  Services and agencies that report to or form part of{" "}
                  {institution.short_name || institution.name}.
                </p>
                <ul className="govuk-list govuk-list--bullet">
                  {childInstitutions.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/government/institutions/${child.slug}`}
                        className="govuk-link"
                      >
                        {child.name}
                      </Link>
                      {child.institution_type
                        ? ` — ${child.institution_type}`
                        : ""}
                      {child.description ? (
                        <span className="govuk-hint govuk-!-margin-bottom-0">
                          {" "}
                          {child.description.length > 120
                            ? `${child.description.slice(0, 120)}…`
                            : child.description}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Mandate & Description */}
            {(institution.mandate || institution.description) && (
              <>
                <h2 className="govuk-heading-l">What this institution does</h2>
                {institution.mandate && <p className="govuk-body">{institution.mandate}</p>}
                {institution.description && <p className="govuk-body">{institution.description}</p>}
              </>
            )}

            {/* Vision & Mission */}
            {(institution.vision || institution.mission) && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Vision and Mission</h2>
                {institution.vision && <p className="govuk-body"><strong>Vision:</strong> {institution.vision}</p>}
                {institution.mission && <p className="govuk-body"><strong>Mission:</strong> {institution.mission}</p>}
              </>
            )}

            {/* Leadership */}
            {(currentLeaders.length > 0 || institution.board_chair) && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Leadership</h2>
                <dl className="govuk-summary-list">
                  {currentLeaders.map((leader: any, index: number) => (
                    <div key={index} className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">{leader.title}</dt>
                      <dd className="govuk-summary-list__value">{leader.name}</dd>
                    </div>
                  ))}
                  {institution.board_chair && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Board Chair</dt>
                      <dd className="govuk-summary-list__value">{institution.board_chair}</dd>
                    </div>
                  )}
                </dl>
              </>
            )}

            {/* Regulated Sectors */}
            {institution.regulated_sectors && institution.regulated_sectors.length > 0 && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Regulated Sectors</h2>
                <ul className="govuk-list govuk-list--bullet">
                  {institution.regulated_sectors.map((sector, i) => (
                    <li key={i}>{sector}</li>
                  ))}
                </ul>
              </>
            )}

            {/* Key Functions */}
            {institution.functions && institution.functions.length > 0 && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Key Functions</h2>
                <ul className="govuk-list govuk-list--bullet">
                  {institution.functions.map((func, i) => (
                    <li key={i}>{func}</li>
                  ))}
                </ul>
              </>
            )}

            {/* Headquarters & Locations */}
            {headquarters && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Headquarters</h2>
                <div className="govuk-body">
                  <p className="govuk-body govuk-!-font-weight-bold">{headquarters.office_name}</p>
                  {headquarters.address && <p className="govuk-body">{headquarters.address}</p>}
                  {headquarters.latitude && headquarters.longitude && (
                    <p className="govuk-body-s">
                      <a href={`https://www.google.com/maps?q=${headquarters.latitude},${headquarters.longitude}`} target="_blank" rel="noreferrer" className="govuk-link">
                        View on map
                      </a>
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Contact Information */}
            {(institution.website_url || institution.email || institution.phone || institution.postal_address) && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Contact Information</h2>
                <dl className="govuk-summary-list">
                  {institution.website_url && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Website</dt>
                      <dd className="govuk-summary-list__value">
                        <a href={institution.website_url} target="_blank" rel="noreferrer" className="govuk-link">{institution.website_url}</a>
                      </dd>
                    </div>
                  )}
                  {institution.email && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Email</dt>
                      <dd className="govuk-summary-list__value">
                        <a href={`mailto:${institution.email}`} className="govuk-link">{institution.email}</a>
                      </dd>
                    </div>
                  )}
                  {institution.phone && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Phone</dt>
                      <dd className="govuk-summary-list__value">
                        <a href={`tel:${institution.phone}`} className="govuk-link">{institution.phone}</a>
                      </dd>
                    </div>
                  )}
                  {institution.postal_address && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Postal Address</dt>
                      <dd className="govuk-summary-list__value">{institution.postal_address}</dd>
                    </div>
                  )}
                </dl>
              </>
            )}

          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Related content</h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  {directParent && (
                    <li>
                      <Link
                        href={`/government/institutions/${directParent.slug}`}
                        className="govuk-link"
                      >
                        Parent: {directParent.name}
                      </Link>
                    </li>
                  )}
                  {supervisingMinistry && (
                    <li>
                      <Link
                        href={`/government/institutions/${supervisingMinistry.slug}`}
                        className="govuk-link"
                      >
                        Supervising: {supervisingMinistry.name}
                      </Link>
                    </li>
                  )}
                  {parentChain
                    .filter((p) => !directParent || p.id !== directParent.id)
                    .map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/government/institutions/${p.slug}`}
                          className="govuk-link"
                        >
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  {childInstitutions.slice(0, 8).map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/government/institutions/${c.slug}`}
                        className="govuk-link"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/government/institutions"
                      className="govuk-link"
                    >
                      All institutions
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/cabinet" className="govuk-link">
                      The Cabinet
                    </Link>
                  </li>
                  <li>
                    <Link href="/government/people" className="govuk-link">
                      All government officials
                    </Link>
                  </li>
                </ul>
              </nav>

              {(institution.website_url || institution.email) && (
                <>
                  <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible govuk-!-margin-top-6" />
                  <h3 className="govuk-heading-s govuk-!-margin-bottom-3">Quick actions</h3>
                  <ul className="govuk-list">
                    {institution.website_url && (
                      <li><a href={institution.website_url} target="_blank" rel="noreferrer" className="govuk-link">Visit official website</a></li>
                    )}
                    {institution.email && (
                      <li><a href={`mailto:${institution.email}`} className="govuk-link">Send email</a></li>
                    )}
                  </ul>
                </>
              )}
            </aside>
          </div>
        </div>
      
    
  
  </>
);
}