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
  institution_type?: string | null;
  description?: string | null;
  mandate?: string | null;
  current_head_id?: string | null;
  current_head?: string | null;
  head_title?: string | null;
  head_appointment_date?: string | null;
  board_chair?: string | null;
  website_url?: string | null;
  email?: string | null;
  phone?: string | null;
  headquarters?: string | null;
  physical_address?: string | null;
  status?: string | null;
  status_effective_date?: string | null;
  parent_institution_id?: string | null;
};

type LinkedInstitution = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
};

export default function InstitutionProfileClient() {
  const params = useParams();
  const slug = params.slug as string;

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [parentChain, setParentChain] = useState<LinkedInstitution[]>([]);
  const [successors, setSuccessors] = useState<LinkedInstitution[]>([]); // Changed to array for splits
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
          .select(`*, institution_leaders (*), institution_locations (*)`)
          .eq("slug", slug)
          .eq("is_active", true)
          .maybeSingle();

        if (withJoins.data) {
          instData = withJoins.data as Institution;
        } else {
          const historical = await supabase
            .from("institutions")
            .select(`*, institution_leaders (*), institution_locations (*)`)
            .eq("slug", slug)
            .maybeSingle();

          if (historical.data) {
            instData = historical.data as Institution;
          } else {
            const basic = await supabase.from("institutions").select("*").eq("slug", slug).maybeSingle();
            if (basic.error || !basic.data) throw withJoins.error || historical.error || basic.error || new Error("Not found");
            instData = basic.data as Institution;
          }
        }

        if (!instData) throw new Error("Institution not found");
        setInstitution(instData);

        // Build parent chain
        const chain: LinkedInstitution[] = [];
        let parentId = instData.parent_institution_id;
        const seen = new Set<string>([instData.id]);
        for (let i = 0; i < 8 && parentId; i++) {
          if (seen.has(parentId)) break;
          seen.add(parentId);
          const { data: parentData } = await supabase
            .from("institutions")
            .select("id, slug, name, short_name")
            .eq("id", parentId)
            .maybeSingle();
          if (!parentData) break;
          chain.unshift(parentData as LinkedInstitution);
          parentId = (parentData as { parent_institution_id?: string }).parent_institution_id;
        }
        setParentChain(chain);

        // ✅ Fetch ALL successors (handles the "Split" pattern where one ministry becomes two)
        const { data: succs } = await supabase
          .from("institutions")
          .select("id, slug, name, short_name")
          .eq("predecessor_institution_id", instData.id)
          .order("name");
        if (succs) setSuccessors(succs as LinkedInstitution[]);

        // Resolve linked head
        if (instData.current_head_id) {
          const { data: headLeader } = await supabase
            .from("leaders")
            .select("slug, full_name, first_name, other_names, surname")
            .eq("id", instData.current_head_id)
            .maybeSingle();
          
          if (headLeader?.slug) {
            setHeadLeaderSlug(String(headLeader.slug));
            if (!instData.current_head) {
              const parts = [headLeader.first_name, headLeader.other_names, headLeader.surname].filter(Boolean).join(" ").trim();
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
        <main className="govuk-main-wrapper"><p className="govuk-body">Loading institution profile...</p></main>
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

            {/* ✅ Enhanced Historical Banner showing all successors */}
            {historical && (
              <div className="govuk-warning-text">
                <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-warning-text__assistive">Warning</span>
                  Historical record — this organisation {statusLifecyclePhrase(institution.status)}{institution.status_effective_date ? ` on ${formatGovUKDate(institution.status_effective_date)}` : ""}.
                  {successors.length > 0 && (
                    <> Replaced by: {successors.map((s, i) => (
                      <span key={s.id}>
                        <Link href={`/government/institutions/${s.slug}`} className="govuk-link">{s.name}</Link>
                        {i < successors.length - 1 ? " and " : ""}
                      </span>
                    ))}</>
                  )}
                </strong>
              </div>
            )}

            <h2 className="govuk-heading-l">Mandate</h2>
            <p className="govuk-body">
              {institution.mandate || institution.description || "Information about this organisation's responsibilities and activities."}
            </p>
            <p className="govuk-body">
              <Link href={`/government/institutions/${slug}/about`} className="govuk-link">
                Read more about the mandate, history, and corporate information
              </Link>
            </p>

            {(institution.current_head || institution.head_title || institution.board_chair) && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Leadership</h2>
                <dl className="govuk-summary-list">
                  {(institution.current_head || institution.head_title) && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">{institution.head_title || "Head"}</dt>
                      <dd className="govuk-summary-list__value">
                        {headLeaderSlug ? (
                          <Link href={`/government/people/${headLeaderSlug}`} className="govuk-link">{institution.current_head}</Link>
                        ) : (
                          institution.current_head || "Unknown"
                        )}
                        {institution.head_appointment_date && (
                          <span className="govuk-hint govuk-!-margin-bottom-0"> · Appointed {formatGovUKDate(institution.head_appointment_date)}</span>
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