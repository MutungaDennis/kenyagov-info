'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createBrowserClientAsync } from "@/lib/supabase/client";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import {
  parseSocialLinks,
  socialPlatformLabel,
  normalizeSocialUrl,
} from "@/lib/leaders/titles-social";

type Institution = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  official_name?: string | null;
  former_names?: string[] | null;
  aliases?: string[] | null;
  institution_type?: string | null;
  institution_category?: string | null;
  institution_subtype?: string | null;
  institution_nature?: string | null;
  arm_of_government?: string | null;
  government_level?: string | null;
  constitutional_status?: string | null;
  mtef_sector?: string | null;
  cofog_division?: string | null;
  cofog_group?: string | null;
  operational_model?: string | null;
  jurisdiction_scope?: string | null;
  description?: string | null;
  mandate?: string | null;
  vision?: string | null;
  mission?: string | null;
  functions?: string[] | null;
  keywords?: string[] | null;
  target_population?: string | null;
  regulated_sectors?: string[] | null;
  current_head_id?: string | null;
  current_head?: string | null;
  head_title?: string | null;
  head_appointment_date?: string | null;
  board_chair?: string | null;
  website_url?: string | null;
  portal_url?: string | null;
  email?: string | null;
  phone?: string | null;
  toll_free?: string | null;
  whatsapp?: string | null;
  postal_address?: string | null;
  headquarters?: string | null;
  physical_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  social_media?: unknown;
  legal_basis_type?: string | null;
  legal_basis_name?: string | null;
  legal_basis_reference?: string | null;
  establishment_act?: string | null;
  established_date?: string | null;
  operational_date?: string | null;
  appointing_authority?: string | null;
  funding_model?: string | null;
  status?: string | null;
  parent_institution_id?: string | null;
  supervising_ministry_id?: string | null;
  reports_to_institution_id?: string | null;
  citizen_charter_url?: string | null;
  complaints_mechanism_url?: string | null;
  procurement_portal_url?: string | null;
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
  /** Resolved from current_head_id for public people link */
  const [headLeaderSlug, setHeadLeaderSlug] = useState<string | null>(null);
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

        // Resolve linked head → people profile slug
        if (instData.current_head_id) {
          const { data: headLeader } = await supabase
            .from("leaders")
            .select("slug, full_name, first_name, other_names, surname")
            .eq("id", instData.current_head_id)
            .maybeSingle();
          if (headLeader?.slug) {
            setHeadLeaderSlug(String(headLeader.slug));
          } else {
            setHeadLeaderSlug(null);
          }
          // Prefer live name from leaders when available
          if (headLeader && !instData.current_head) {
            const parts = [
              headLeader.first_name,
              headLeader.other_names,
              headLeader.surname,
            ]
              .filter(Boolean)
              .join(" ")
              .trim();
            instData.current_head =
              parts || headLeader.full_name || instData.current_head;
            setInstitution({ ...instData });
          }
        } else {
          setHeadLeaderSlug(null);
        }
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
  const socialLinks = parseSocialLinks(institution.social_media);
  const hasHead =
    Boolean(institution.current_head) ||
    Boolean(institution.head_title) ||
    Boolean(institution.board_chair) ||
    currentLeaders.length > 0;

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

            {/* Key Facts */}
            <dl className="govuk-summary-list govuk-!-margin-bottom-9">
              {institution.official_name &&
                institution.official_name !== institution.name && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Official name</dt>
                    <dd className="govuk-summary-list__value">
                      {institution.official_name}
                    </dd>
                  </div>
                )}
              {institution.institution_category && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Category</dt>
                  <dd className="govuk-summary-list__value">
                    {institution.institution_category}
                  </dd>
                </div>
              )}
              {institution.institution_type && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Type</dt>
                  <dd className="govuk-summary-list__value">
                    {institution.institution_type}
                    {institution.institution_subtype
                      ? ` · ${institution.institution_subtype}`
                      : ""}
                  </dd>
                </div>
              )}
              {institution.institution_nature && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Nature</dt>
                  <dd className="govuk-summary-list__value">
                    {institution.institution_nature}
                  </dd>
                </div>
              )}
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
              {institution.constitutional_status && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Constitutional status</dt>
                  <dd className="govuk-summary-list__value">
                    {institution.constitutional_status}
                  </dd>
                </div>
              )}
              {institution.operational_model && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Operational model</dt>
                  <dd className="govuk-summary-list__value">
                    {institution.operational_model}
                  </dd>
                </div>
              )}
              {institution.jurisdiction_scope && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Jurisdiction</dt>
                  <dd className="govuk-summary-list__value">
                    {institution.jurisdiction_scope}
                  </dd>
                </div>
              )}
              {institution.cofog_division && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">COFOG Division</dt>
                  <dd className="govuk-summary-list__value">{institution.cofog_division}</dd>
                </div>
              )}
              {institution.cofog_group && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">COFOG Group</dt>
                  <dd className="govuk-summary-list__value">
                    {institution.cofog_group}
                  </dd>
                </div>
              )}
              {institution.mtef_sector && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">MTEF Sector</dt>
                  <dd className="govuk-summary-list__value">{institution.mtef_sector}</dd>
                </div>
              )}
              {(institution.legal_basis_name ||
                institution.legal_basis_type ||
                institution.establishment_act) && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Legal basis</dt>
                  <dd className="govuk-summary-list__value">
                    {[
                      institution.legal_basis_type,
                      institution.legal_basis_name,
                      institution.establishment_act,
                    ]
                      .filter(Boolean)
                      .join(" — ")}
                    {institution.legal_basis_reference ? (
                      <span className="govuk-hint govuk-!-margin-bottom-0">
                        {" "}
                        ({institution.legal_basis_reference})
                      </span>
                    ) : null}
                  </dd>
                </div>
              )}
              {institution.established_date && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Established</dt>
                  <dd className="govuk-summary-list__value">
                    {String(institution.established_date).slice(0, 10)}
                    {institution.operational_date
                      ? ` · Operational ${String(institution.operational_date).slice(0, 10)}`
                      : ""}
                  </dd>
                </div>
              )}
              {institution.appointing_authority && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Appointing authority</dt>
                  <dd className="govuk-summary-list__value">
                    {institution.appointing_authority}
                  </dd>
                </div>
              )}
              {institution.funding_model && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Funding model</dt>
                  <dd className="govuk-summary-list__value">
                    {institution.funding_model}
                  </dd>
                </div>
              )}
              {institution.status && institution.status !== "Active" && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Status</dt>
                  <dd className="govuk-summary-list__value">
                    {institution.status}
                  </dd>
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

            {(Array.isArray(institution.former_names) &&
              institution.former_names.length > 0) ||
            (Array.isArray(institution.aliases) &&
              institution.aliases.length > 0) ? (
              <p className="govuk-body">
                {Array.isArray(institution.former_names) &&
                  institution.former_names.length > 0 && (
                    <>
                      <strong>Formerly:</strong>{" "}
                      {institution.former_names.join("; ")}
                      <br />
                    </>
                  )}
                {Array.isArray(institution.aliases) &&
                  institution.aliases.length > 0 && (
                    <>
                      <strong>Also known as:</strong>{" "}
                      {institution.aliases.join("; ")}
                    </>
                  )}
              </p>
            ) : null}

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
            {hasHead && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Leadership</h2>
                <dl className="govuk-summary-list">
                  {(institution.current_head || institution.head_title) && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">
                        {institution.head_title || "Current head"}
                      </dt>
                      <dd className="govuk-summary-list__value">
                        {institution.current_head ? (
                          headLeaderSlug ? (
                            <Link
                              href={`/government/people/${headLeaderSlug}`}
                              className="govuk-link"
                            >
                              {institution.current_head}
                            </Link>
                          ) : (
                            institution.current_head
                          )
                        ) : (
                          "—"
                        )}
                        {institution.head_appointment_date && (
                          <span className="govuk-hint govuk-!-margin-bottom-0">
                            {" "}
                            · Appointed{" "}
                            {String(institution.head_appointment_date).slice(
                              0,
                              10,
                            )}
                          </span>
                        )}
                      </dd>
                    </div>
                  )}
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

            {institution.target_population && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-top-6">
                  Who it serves
                </h2>
                <p className="govuk-body">{institution.target_population}</p>
              </>
            )}

            {Array.isArray(institution.keywords) &&
              institution.keywords.length > 0 && (
                <p className="govuk-body-s">
                  <strong>Keywords:</strong> {institution.keywords.join(", ")}
                </p>
              )}

            {/* Contact Information */}
            {(institution.website_url ||
              institution.portal_url ||
              institution.email ||
              institution.phone ||
              institution.toll_free ||
              institution.whatsapp ||
              institution.postal_address ||
              institution.physical_address ||
              institution.headquarters ||
              socialLinks.length > 0 ||
              institution.citizen_charter_url ||
              institution.complaints_mechanism_url ||
              institution.procurement_portal_url) && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Contact Information</h2>
                <dl className="govuk-summary-list">
                  {institution.headquarters && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Headquarters</dt>
                      <dd className="govuk-summary-list__value">
                        {institution.headquarters}
                      </dd>
                    </div>
                  )}
                  {institution.physical_address && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Physical address</dt>
                      <dd className="govuk-summary-list__value">
                        {institution.physical_address}
                      </dd>
                    </div>
                  )}
                  {institution.website_url && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Website</dt>
                      <dd className="govuk-summary-list__value">
                        <a href={institution.website_url} target="_blank" rel="noreferrer" className="govuk-link">{institution.website_url}</a>
                      </dd>
                    </div>
                  )}
                  {institution.portal_url && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Service portal</dt>
                      <dd className="govuk-summary-list__value">
                        <a
                          href={institution.portal_url}
                          target="_blank"
                          rel="noreferrer"
                          className="govuk-link"
                        >
                          {institution.portal_url}
                        </a>
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
                  {institution.toll_free && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Toll free</dt>
                      <dd className="govuk-summary-list__value">
                        {institution.toll_free}
                      </dd>
                    </div>
                  )}
                  {institution.whatsapp && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">WhatsApp</dt>
                      <dd className="govuk-summary-list__value">
                        {institution.whatsapp}
                      </dd>
                    </div>
                  )}
                  {institution.postal_address && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Postal Address</dt>
                      <dd className="govuk-summary-list__value">{institution.postal_address}</dd>
                    </div>
                  )}
                  {institution.citizen_charter_url && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Citizen charter</dt>
                      <dd className="govuk-summary-list__value">
                        <a
                          href={institution.citizen_charter_url}
                          target="_blank"
                          rel="noreferrer"
                          className="govuk-link"
                        >
                          View
                        </a>
                      </dd>
                    </div>
                  )}
                  {institution.complaints_mechanism_url && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Complaints</dt>
                      <dd className="govuk-summary-list__value">
                        <a
                          href={institution.complaints_mechanism_url}
                          target="_blank"
                          rel="noreferrer"
                          className="govuk-link"
                        >
                          How to complain
                        </a>
                      </dd>
                    </div>
                  )}
                  {institution.procurement_portal_url && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Procurement</dt>
                      <dd className="govuk-summary-list__value">
                        <a
                          href={institution.procurement_portal_url}
                          target="_blank"
                          rel="noreferrer"
                          className="govuk-link"
                        >
                          Procurement portal
                        </a>
                      </dd>
                    </div>
                  )}
                  {socialLinks.map((link) => (
                    <div
                      key={`${link.platform}-${link.url}`}
                      className="govuk-summary-list__row"
                    >
                      <dt className="govuk-summary-list__key">
                        {socialPlatformLabel(link.platform)}
                      </dt>
                      <dd className="govuk-summary-list__value">
                        <a
                          href={normalizeSocialUrl(link.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="govuk-link"
                        >
                          {link.url}
                        </a>
                      </dd>
                    </div>
                  ))}
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