'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createBrowserClientAsync } from "@/lib/supabase/client";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import {
  isInstitutionEarmarked,
  isInstitutionHistorical,
  statusLifecyclePhrase,
} from "@/lib/institutions/fields";

function formatGovUKDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getUTCDate();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

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
  status_effective_date?: string | null;
  lifecycle_change_reason?: string | null;
  appointing_authority?: string | null;
  funding_model?: string | null;
  status?: string | null;
  is_active?: boolean | null;
  parent_institution_id?: string | null;
  supervising_ministry_id?: string | null;
  reports_to_institution_id?: string | null;
  predecessor_institution_id?: string | null;
  successor_institution_id?: string | null;
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
};

export default function InstitutionProfilePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [parentChain, setParentChain] = useState<LinkedInstitution[]>([]);
  const [successor, setSuccessor] = useState<LinkedInstitution | null>(null);
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
          `
          )
          .eq("slug", slug)
          .eq("is_active", true)
          .maybeSingle();

        if (withJoins.data) {
          instData = withJoins.data as Institution;
        } else {
          const historical = await supabase
            .from("institutions")
            .select(
              `
              *,
              institution_leaders (*),
              institution_locations (*)
            `
            )
            .eq("slug", slug)
            .maybeSingle();

          if (historical.data) {
            instData = historical.data as Institution;
          } else {
            const basic = await supabase
              .from("institutions")
              .select("*")
              .eq("slug", slug)
              .maybeSingle();
            
            if (basic.error || !basic.data) {
              throw withJoins.error || historical.error || basic.error || new Error("Not found");
            }
            instData = basic.data as Institution;
          }
        }

        if (!instData) throw new Error("Institution not found");
        setInstitution(instData);

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
          parentId = (parentData as { parent_institution_id?: string }).parent_institution_id;
        }
        setParentChain(chain);

        if (instData.successor_institution_id) {
          const { data: succ } = await supabase
            .from("institutions")
            .select("id, slug, name, short_name, institution_type")
            .eq("id", instData.successor_institution_id)
            .maybeSingle();
          if (succ) setSuccessor(succ as LinkedInstitution);
        }

        // Resolve linked head → people profile slug (Safe, separate query)
        if (instData.current_head_id) {
          const { data: headLeader } = await supabase
            .from("leaders")
            .select("slug, full_name, first_name, other_names, surname")
            .eq("id", instData.current_head_id)
            .maybeSingle();
          
          if (headLeader?.slug) {
            setHeadLeaderSlug(String(headLeader.slug));
            // Prefer live name from leaders table when available
            if (!instData.current_head) {
              const parts = [headLeader.first_name, headLeader.other_names, headLeader.surname]
                .filter(Boolean)
                .join(" ")
                .trim();
              instData.current_head = parts || headLeader.full_name || instData.current_head;
              setInstitution({ ...instData });
            }
          }
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
      <div className="govuk-width-container">
        <GovUKBreadcrumbs items={[{ text: "Home", href: "/" }, { text: "Government", href: "/government" }, { text: "Institutions", href: "/government/institutions" }]} />
        <main className="govuk-main-wrapper">
          <p className="govuk-body">Loading institution profile...</p>
        </main>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="govuk-width-container">
        <GovUKBreadcrumbs items={[{ text: "Home", href: "/" }, { text: "Government", href: "/government" }, { text: "Institutions", href: "/government/institutions" }]} />
        <main className="govuk-main-wrapper">
          <h1 className="govuk-heading-xl">Page not found</h1>
          <p className="govuk-body">The institution you are looking for does not exist or has been removed.</p>
          <Link href="/government/institutions" className="govuk-link">Return to all institutions</Link>
        </main>
      </div>
    );
  }

  const historical = isInstitutionHistorical(institution.status);
  const earmarked = isInstitutionEarmarked(institution.status);

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={[
        { text: "Home", href: "/" },
        { text: "Government", href: "/government" },
        { text: "Institutions", href: "/government/institutions" },
        ...parentChain.map((p) => ({ text: p.short_name || p.name, href: `/government/institutions/${p.slug}` })),
        { text: institution.name },
      ]} />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <span className="govuk-caption-l">{institution.institution_type || "Public body"}</span>
            <h1 className="govuk-heading-xl">{institution.name}</h1>

            {earmarked && (
              <div className="govuk-warning-text">
                <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-warning-text__assistive">Warning</span>
                  This organisation {statusLifecyclePhrase(institution.status)}{institution.status_effective_date ? ` (planned from ${formatGovUKDate(institution.status_effective_date)})` : ""}.
                </strong>
              </div>
            )}

            {historical && (
              <div className="govuk-warning-text">
                <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-warning-text__assistive">Warning</span>
                  Historical record — this organisation {statusLifecyclePhrase(institution.status)}{institution.status_effective_date ? ` on ${formatGovUKDate(institution.status_effective_date)}` : ""}.
                  {successor ? <> Successor: <Link href={`/government/institutions/${successor.slug}`} className="govuk-link">{successor.name}</Link></> : null}
                </strong>
              </div>
            )}

            {/* 1. Mandate */}
            <h2 className="govuk-heading-l">Mandate</h2>
            <p className="govuk-body">
              {institution.mandate || institution.description || "Information about this organisation's responsibilities and activities."}
            </p>
            <p className="govuk-body">
              <Link href={`/government/institutions/${slug}/about`} className="govuk-link">
                Read more about the mandate and corporate information
              </Link>
            </p>

            {/* 2. Leadership (Reverted to simple, reliable fields) */}
            {(institution.current_head || institution.head_title || institution.board_chair) && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Leadership</h2>
                <dl className="govuk-summary-list">
                  {(institution.current_head || institution.head_title) && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">
                        {institution.head_title || "Head"}
                      </dt>
                      <dd className="govuk-summary-list__value">
                        {headLeaderSlug ? (
                          <Link href={`/government/people/${headLeaderSlug}`} className="govuk-link">
                            {institution.current_head}
                          </Link>
                        ) : (
                          institution.current_head || "Unknown"
                        )}
                        {institution.head_appointment_date && (
                          <span className="govuk-hint govuk-!-margin-bottom-0">
                            {" "}· Appointed {formatGovUKDate(institution.head_appointment_date)}
                          </span>
                        )}
                      </dd>
                    </div>
                  )}
                  {institution.board_chair && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Board Chair</dt>
                      <dd className="govuk-summary-list__value">{institution.board_chair}</dd>
                    </div>
                  )}
                </dl>
              </>
            )}

            {/* 3. Contact */}
            {(institution.website_url || institution.email || institution.phone || institution.headquarters) && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Contact {institution.short_name || institution.name}</h2>
                <dl className="govuk-summary-list">
                  {institution.headquarters && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Address</dt>
                      <dd className="govuk-summary-list__value">
                        {institution.headquarters}
                        {institution.physical_address && <><br/>{institution.physical_address}</>}
                      </dd>
                    </div>
                  )}
                  {institution.website_url && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Website</dt>
                      <dd className="govuk-summary-list__value"><a href={institution.website_url} className="govuk-link">{institution.website_url}</a></dd>
                    </div>
                  )}
                  {institution.email && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Email</dt>
                      <dd className="govuk-summary-list__value"><a href={`mailto:${institution.email}`} className="govuk-link">{institution.email}</a></dd>
                    </div>
                  )}
                  {institution.phone && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Phone</dt>
                      <dd className="govuk-summary-list__value"><a href={`tel:${institution.phone}`} className="govuk-link">{institution.phone}</a></dd>
                    </div>
                  )}
                </dl>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}