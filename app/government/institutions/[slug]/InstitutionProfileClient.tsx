'use client';

import Link from "next/link";
import { useState, useEffect, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { createBrowserClientAsync } from "@/lib/supabase/client";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import PublicSchools from "@/components/schools/PublicSchools";
import {
  isInstitutionEarmarked,
  isInstitutionHistorical,
  statusLifecyclePhrase,
} from "@/lib/institutions/fields";
import {
  formatSegmentRange,
  isJudicialAnnulmentStatus,
  relationshipTypeMeta,
} from "@/lib/institutions/lineage";

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
  predecessor_institution_id?: string | null;
  successor_institution_id?: string | null;
  former_names?: string[] | null;
  lifecycle_change_reason?: string | null;
};

type LinkedInstitution = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
};

type SegmentRow = {
  id: string;
  label: string | null;
  start_date: string | null;
  end_date: string | null;
  segment_status: string;
  legal_basis_name: string | null;
  notes: string | null;
};

type RelRow = {
  id: string;
  from_institution_id: string;
  to_institution_id: string;
  relationship_type: string;
  effective_date: string | null;
  legal_instrument: string | null;
  from_institution?: LinkedInstitution | null;
  to_institution?: LinkedInstitution | null;
};

type NameRow = {
  id: string;
  name: string;
  name_kind: string;
  start_date: string | null;
  end_date: string | null;
};

export default function InstitutionProfileClient({ people }: { people?: ReactNode }) {
  const params = useParams();
  const slug = params.slug as string;

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [parentChain, setParentChain] = useState<LinkedInstitution[]>([]);
  const [predecessors, setPredecessors] = useState<LinkedInstitution[]>([]);
  const [successors, setSuccessors] = useState<LinkedInstitution[]>([]); // Changed to array for splits
  const [segments, setSegments] = useState<SegmentRow[]>([]);
  const [relationships, setRelationships] = useState<RelRow[]>([]);
  const [nameHistory, setNameHistory] = useState<NameRow[]>([]);
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
            .eq("is_active", true)
            .maybeSingle();

          if (historical.data) {
            instData = historical.data as Institution;
          } else {
            const basic = await supabase.from("institutions").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
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
            .select("id, slug, name, short_name, parent_institution_id")
            .eq("is_active", true)
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
          .eq("is_active", true)
          .or(`predecessor_institution_id.eq.${instData.id},id.eq.${instData.successor_institution_id || instData.id}`)
          .neq("id", instData.id)
          .order("name");
        if (succs) setSuccessors(succs as LinkedInstitution[]);
        const { data: previous } = await supabase.from("institutions")
          .select("id,slug,name,short_name").eq("is_active", true)
          .or(`successor_institution_id.eq.${instData.id},id.eq.${instData.predecessor_institution_id || instData.id}`)
          .neq("id", instData.id).order("name");
        setPredecessors((previous || []) as LinkedInstitution[]);

        // Lifecycle segments / lineage / dated names (tables optional until migration)
        const [segRes, relRes, nameRes] = await Promise.all([
          supabase
            .from("institution_lifecycle_segments")
            .select(
              "id, label, start_date, end_date, segment_status, legal_basis_name, notes",
            )
            .eq("institution_id", instData.id)
            .order("sort_order", { ascending: true })
            .order("start_date", { ascending: true }),
          supabase
            .from("institution_relationships")
            .select(
              `id, from_institution_id, to_institution_id, relationship_type, effective_date, legal_instrument,
               from_institution:institutions!institution_relationships_from_institution_id_fkey ( id, slug, name, short_name ),
               to_institution:institutions!institution_relationships_to_institution_id_fkey ( id, slug, name, short_name )`,
            )
            .or(
              `from_institution_id.eq.${instData.id},to_institution_id.eq.${instData.id}`,
            ),
          supabase
            .from("institution_name_history")
            .select("id, name, name_kind, start_date, end_date")
            .eq("institution_id", instData.id)
            .order("start_date", { ascending: true }),
        ]);
        if (!segRes.error && segRes.data) {
          setSegments(segRes.data as SegmentRow[]);
        }
        if (!relRes.error && relRes.data) {
          setRelationships(relRes.data as unknown as RelRow[]);
        } else if (relRes.error) {
          // Fallback without embed if FK names differ
          const simple = await supabase
            .from("institution_relationships")
            .select(
              "id, from_institution_id, to_institution_id, relationship_type, effective_date, legal_instrument",
            )
            .or(
              `from_institution_id.eq.${instData.id},to_institution_id.eq.${instData.id}`,
            );
          if (!simple.error && simple.data) {
            const ids = Array.from(
              new Set(
                simple.data.flatMap((r) => [
                  r.from_institution_id,
                  r.to_institution_id,
                ]),
              ),
            );
            const { data: insts } = await supabase
              .from("institutions")
              .select("id, slug, name, short_name")
              .in("id", ids);
            const byId = new Map(
              (insts || []).map((i) => [i.id, i as LinkedInstitution]),
            );
            setRelationships(
              simple.data.map((r) => ({
                ...r,
                from_institution: byId.get(r.from_institution_id) || null,
                to_institution: byId.get(r.to_institution_id) || null,
              })) as RelRow[],
            );
          }
        }
        if (!nameRes.error && nameRes.data) {
          setNameHistory(nameRes.data as NameRow[]);
        }

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
  const judicial = isJudicialAnnulmentStatus(institution.status);

  const lineageOutgoing = relationships.filter(
    (r) => r.from_institution_id === institution.id,
  );
  const lineageIncoming = relationships.filter(
    (r) => r.to_institution_id === institution.id,
  );

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
            {["directorate-primary-education", "directorate-secondary-education"].includes(slug) && <PublicSchools fixedDirectorate={slug} />}

            {earmarked && (
              <div className="govuk-warning-text">
                <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-warning-text__assistive">Warning</span>
                  This organisation {statusLifecyclePhrase(institution.status)}{institution.status_effective_date ? ` (planned from ${formatGovUKDate(institution.status_effective_date)})` : ""}.
                </strong>
              </div>
            )}

            {judicial && (
              <div className="govuk-warning-text">
                <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-warning-text__assistive">Warning</span>
                  Legal status — this organisation{" "}
                  {statusLifecyclePhrase(institution.status)}
                  {institution.status_effective_date
                    ? ` on ${formatGovUKDate(institution.status_effective_date)}`
                    : ""}
                  . It is recorded here as a historical and legal trail, not as
                  a currently lawful office.
                </strong>
              </div>
            )}

            {/* ✅ Enhanced Historical Banner showing all successors */}
            {historical && !judicial && (
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

            {historical && <div className="govuk-inset-text"><p className="govuk-body govuk-!-margin-bottom-0">This page is retained for historical reference, including officials who served here. Its contact details and responsibilities may no longer be current.{institution.lifecycle_change_reason && <> {institution.lifecycle_change_reason}</>}</p></div>}
            {!historical && predecessors.length > 0 && <p className="govuk-body-s govuk-!-margin-bottom-4">Earlier organisations: {predecessors.map((previous, index) => <span key={previous.id}>{index > 0 && "; "}<Link className="govuk-link" href={`/government/institutions/${previous.slug}`}>{previous.name}</Link></span>)}</p>}
            {!!institution.former_names?.length && <p className="govuk-body-s">Former names: {institution.former_names.join("; ")}</p>}
            {nameHistory.length > 0 && (
              <p className="govuk-body">
                <strong>Also known as / formerly: </strong>
                {nameHistory.map((n, i) => (
                  <span key={n.id}>
                    {n.name}
                    {(n.start_date || n.end_date) && (
                      <span className="govuk-hint">
                        {" "}
                        ({formatSegmentRange(n.start_date, n.end_date)})
                      </span>
                    )}
                    {i < nameHistory.length - 1 ? "; " : ""}
                  </span>
                ))}
              </p>
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

            {people}
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

            {segments.length > 0 && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">
                  Operational history
                </h2>
                <p className="govuk-body">
                  This office has more than one recorded period of existence —
                  for example after abolition and later recreation.
                </p>
                <ol className="govuk-list govuk-list--number">
                  {segments.map((seg) => (
                    <li key={seg.id} className="govuk-!-margin-bottom-3">
                      <strong>
                        {seg.label || seg.segment_status || "Period"}
                      </strong>
                      <br />
                      <span className="govuk-body-s">
                        {formatSegmentRange(seg.start_date, seg.end_date)}
                        {seg.segment_status
                          ? ` · ${seg.segment_status}`
                          : ""}
                      </span>
                      {seg.legal_basis_name && (
                        <>
                          <br />
                          <span className="govuk-body-s">
                            Legal basis: {seg.legal_basis_name}
                          </span>
                        </>
                      )}
                      {seg.notes && (
                        <>
                          <br />
                          <span className="govuk-body-s">{seg.notes}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            )}

            {(lineageOutgoing.length > 0 || lineageIncoming.length > 0) && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">
                  Related institutions (lineage)
                </h2>
                <p className="govuk-body">
                  How this body connects to others through renames, mergers,
                  splits or succession.
                </p>
                {lineageOutgoing.length > 0 && (
                  <>
                    <h3 className="govuk-heading-s">This organisation led to</h3>
                    <ul className="govuk-list govuk-list--bullet">
                      {lineageOutgoing.map((r) => {
                        const meta = relationshipTypeMeta(r.relationship_type);
                        const other = r.to_institution;
                        return (
                          <li key={r.id}>
                            <strong>{meta.publicFromLabel}: </strong>
                            {other?.slug ? (
                              <Link
                                href={`/government/institutions/${other.slug}`}
                                className="govuk-link"
                              >
                                {other.short_name || other.name}
                              </Link>
                            ) : (
                              other?.name || "Related body"
                            )}
                            {r.effective_date && (
                              <span className="govuk-hint">
                                {" "}
                                ({formatGovUKDate(r.effective_date)})
                              </span>
                            )}
                            {r.legal_instrument && (
                              <span className="govuk-body-s">
                                {" "}
                                — {r.legal_instrument}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
                {lineageIncoming.length > 0 && (
                  <>
                    <h3 className="govuk-heading-s">This organisation came from</h3>
                    <ul className="govuk-list govuk-list--bullet">
                      {lineageIncoming.map((r) => {
                        const meta = relationshipTypeMeta(r.relationship_type);
                        const other = r.from_institution;
                        return (
                          <li key={r.id}>
                            <strong>{meta.publicToLabel}: </strong>
                            {other?.slug ? (
                              <Link
                                href={`/government/institutions/${other.slug}`}
                                className="govuk-link"
                              >
                                {other.short_name || other.name}
                              </Link>
                            ) : (
                              other?.name || "Related body"
                            )}
                            {r.effective_date && (
                              <span className="govuk-hint">
                                {" "}
                                ({formatGovUKDate(r.effective_date)})
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
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
