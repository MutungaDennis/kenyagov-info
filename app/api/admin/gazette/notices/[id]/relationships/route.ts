import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import {
  NOTICE_RELATIONSHIP_TYPES,
  PERSON_RELATIONSHIP_TYPES,
  INSTITUTION_RELATIONSHIP_TYPES,
} from "@/lib/gazette/relationship-types";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

function uniqueIds(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[]));
}

async function loadRelationships(supabase: any, noticeId: string) {
  const [peopleRes, institutionsRes, outgoingRes, incomingRes, corrigendaRes] =
    await Promise.all([
      supabase
        .from("gazette_notice_people")
        .select("*")
        .eq("notice_id", noticeId)
        .order("created_at", { ascending: true }),

      supabase
        .from("gazette_notice_institutions")
        .select("*")
        .eq("notice_id", noticeId)
        .order("created_at", { ascending: true }),

      supabase
        .from("gazette_notice_relationships")
        .select("*")
        .eq("source_notice_id", noticeId)
        .order("created_at", { ascending: true }),

      supabase
        .from("gazette_notice_relationships")
        .select("*")
        .eq("target_notice_id", noticeId)
        .order("created_at", { ascending: true }),

      supabase
        .from("gazette_corrigenda_entries")
        .select("*")
        .eq("target_notice_id", noticeId)
        .order("effective_date", { ascending: true }),
    ]);

  const firstError =
    peopleRes.error ||
    institutionsRes.error ||
    outgoingRes.error ||
    incomingRes.error ||
    corrigendaRes.error;

  if (firstError) throw firstError;

  const people = peopleRes.data || [];
  const institutionLinks = institutionsRes.data || [];
  const outgoing = outgoingRes.data || [];
  const incoming = incomingRes.data || [];
  const corrigenda = corrigendaRes.data || [];

  const leaderIds = uniqueIds(people.map((r: any) => r.leader_id));
  const mcaIds = uniqueIds(people.map((r: any) => r.mca_id));
  const institutionIds = uniqueIds([
    ...people.map((r: any) => r.institution_id),
    ...institutionLinks.map((r: any) => r.institution_id),
  ]);
  const targetNoticeIds = uniqueIds(outgoing.map((r: any) => r.target_notice_id));
  const sourceNoticeIds = uniqueIds(incoming.map((r: any) => r.source_notice_id));
  const issueSectionIds = uniqueIds(corrigenda.map((r: any) => r.issue_section_id));

  const [
    leadersRes,
    mcasRes,
    institutionsDataRes,
    relatedNoticesRes,
    issueSectionsRes,
  ] = await Promise.all([
    leaderIds.length
      ? supabase
          .from("leaders")
          .select("id, slug, full_name, first_name, other_names, surname, title, current_organization")
          .in("id", leaderIds)
      : Promise.resolve({ data: [], error: null }),

    mcaIds.length
      ? supabase
          .from("mcas")
          .select("id, slug, first_name, other_names, surname, assembly_role, status")
          .in("id", mcaIds)
      : Promise.resolve({ data: [], error: null }),

    institutionIds.length
      ? supabase
          .from("institutions")
          .select("id, slug, name, short_name, institution_type, government_level")
          .in("id", institutionIds)
      : Promise.resolve({ data: [], error: null }),

    [...targetNoticeIds, ...sourceNoticeIds].length
      ? supabase
          .from("gazette_notices")
          .select("id, notice_number, title, issue_id")
          .in("id", uniqueIds([...targetNoticeIds, ...sourceNoticeIds]))
      : Promise.resolve({ data: [], error: null }),

    issueSectionIds.length
      ? supabase
          .from("gazette_issue_sections")
          .select("id, title, issue_id")
          .in("id", issueSectionIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const hydrateError =
    leadersRes.error ||
    mcasRes.error ||
    institutionsDataRes.error ||
    relatedNoticesRes.error ||
    issueSectionsRes.error;

  if (hydrateError) throw hydrateError;

  const relatedNoticeRows = relatedNoticesRes.data || [];
  const issueIds = uniqueIds([
    ...relatedNoticeRows.map((r: any) => r.issue_id),
    ...(issueSectionsRes.data || []).map((r: any) => r.issue_id),
  ]);

  const issuesRes = issueIds.length
    ? await supabase
        .from("gazette_issues")
        .select("id, year, volume, issue_number, date")
        .in("id", issueIds)
    : { data: [], error: null };

  if (issuesRes.error) throw issuesRes.error;

  const leaderMap = new Map((leadersRes.data || []).map((r: any) => [r.id, r]));
  const mcaMap = new Map((mcasRes.data || []).map((r: any) => [r.id, r]));
  const institutionMap = new Map(
    (institutionsDataRes.data || []).map((r: any) => [r.id, r]),
  );
  const issueMap = new Map((issuesRes.data || []).map((r: any) => [r.id, r]));
  const noticeMap = new Map(
    relatedNoticeRows.map((r: any) => [
      r.id,
      {
        ...r,
        gazette_issues: issueMap.get(r.issue_id) || null,
      },
    ]),
  );
  const sectionMap = new Map(
    (issueSectionsRes.data || []).map((r: any) => [
      r.id,
      {
        ...r,
        gazette_issues: issueMap.get(r.issue_id) || null,
      },
    ]),
  );

  return {
    people: people.map((row: any) => ({
      ...row,
      leaders: row.leader_id ? leaderMap.get(row.leader_id) || null : null,
      mcas: row.mca_id ? mcaMap.get(row.mca_id) || null : null,
      institutions: row.institution_id
        ? institutionMap.get(row.institution_id) || null
        : null,
    })),

    institutions: institutionLinks.map((row: any) => ({
      ...row,
      institutions: institutionMap.get(row.institution_id) || null,
    })),

    outgoing: outgoing.map((row: any) => ({
      ...row,
      target: noticeMap.get(row.target_notice_id) || null,
    })),

    incoming: incoming.map((row: any) => ({
      ...row,
      source: noticeMap.get(row.source_notice_id) || null,
    })),

    corrigenda: corrigenda.map((row: any) => ({
      ...row,
      gazette_issue_sections: sectionMap.get(row.issue_section_id) || null,
    })),
  };
}

export async function GET(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  try {
    const data = await loadRelationships(auth.supabase, id);
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Gazette relationships GET failed:", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to load Gazette relationships",
        code: error?.code,
        hint:
          "Check that the Gazette relationship migration has been run and that the admin Supabase client can read the new relationship tables.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id: noticeId } = await context.params;

  let body: Record<string, any>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const kind = String(body.kind || "");

  try {
    if (kind === "person") {
      const relationshipType = String(body.relationship_type || "");
      if (!PERSON_RELATIONSHIP_TYPES.includes(relationshipType as any)) {
        return NextResponse.json(
          { error: "Invalid person relationship type" },
          { status: 400 },
        );
      }

      const personKind = String(body.person_kind || "");
      const personId = String(body.person_id || "");

      if (!["leader", "mca"].includes(personKind) || !personId) {
        return NextResponse.json(
          { error: "Choose a valid leader or MCA" },
          { status: 400 },
        );
      }

      const { data, error } = await auth.supabase
        .from("gazette_notice_people")
        .insert({
          notice_id: noticeId,
          leader_id: personKind === "leader" ? personId : null,
          mca_id: personKind === "mca" ? personId : null,
          leader_role_id: body.leader_role_id || null,
          relationship_type: relationshipType,
          capacity_title: body.capacity_title || null,
          position_title: body.position_title || null,
          institution_id: body.institution_id || null,
          effective_from: body.effective_from || null,
          effective_to: body.effective_to || null,
          fiduciary_authority: Boolean(body.fiduciary_authority),
          fiduciary_basis: body.fiduciary_basis || null,
          verification_status: body.verification_status || "Verified",
          notes: body.notes || null,
        })
        .select("*")
        .single();

      if (error) throw error;
      return NextResponse.json({ data }, { status: 201 });
    }

    if (kind === "institution") {
      const relationshipType = String(body.relationship_type || "");
      if (!INSTITUTION_RELATIONSHIP_TYPES.includes(relationshipType as any)) {
        return NextResponse.json(
          { error: "Invalid institution relationship type" },
          { status: 400 },
        );
      }

      const { data, error } = await auth.supabase
        .from("gazette_notice_institutions")
        .insert({
          notice_id: noticeId,
          institution_id: body.institution_id,
          relationship_type: relationshipType,
          verification_status: body.verification_status || "Verified",
          notes: body.notes || null,
        })
        .select("*")
        .single();

      if (error) throw error;
      return NextResponse.json({ data }, { status: 201 });
    }

    if (kind === "notice") {
      const relationshipType = String(body.relationship_type || "");
      if (!NOTICE_RELATIONSHIP_TYPES.includes(relationshipType as any)) {
        return NextResponse.json(
          { error: "Invalid Gazette relationship type" },
          { status: 400 },
        );
      }

      const targetNoticeId = String(body.target_notice_id || "");
      if (!targetNoticeId || targetNoticeId === noticeId) {
        return NextResponse.json(
          { error: "Choose a different target Gazette notice" },
          { status: 400 },
        );
      }

      const { data, error } = await auth.supabase
        .from("gazette_notice_relationships")
        .insert({
          source_notice_id: noticeId,
          target_notice_id: targetNoticeId,
          relationship_type: relationshipType,
          effective_date: body.effective_date || null,
          description: body.description || null,
          source_excerpt: body.source_excerpt || null,
          verification_status: body.verification_status || "Verified",
          notes: body.notes || null,
        })
        .select("*")
        .single();

      if (error) throw error;
      return NextResponse.json({ data }, { status: 201 });
    }

    if (kind === "corrigendum") {
      if (!body.issue_section_id || !body.sequence_no || !body.entry_text) {
        return NextResponse.json(
          {
            error:
              "Corrigenda section, entry number and full Corrigenda entry are required",
          },
          { status: 400 },
        );
      }

      const { data, error } = await auth.supabase
        .from("gazette_corrigenda_entries")
        .insert({
          issue_section_id: body.issue_section_id,
          sequence_no: Number(body.sequence_no),
          target_notice_id: noticeId,
          relationship_type: body.relationship_type || "corrects",
          affected_field: body.affected_field || null,
          original_text: body.original_text || null,
          corrected_text: body.corrected_text || null,
          entry_text: body.entry_text,
          effective_date: body.effective_date || null,
          verification_status: body.verification_status || "Verified",
          notes: body.notes || null,
        })
        .select("*")
        .single();

      if (error) throw error;
      return NextResponse.json({ data }, { status: 201 });
    }

    return NextResponse.json(
      { error: "Unknown relationship kind" },
      { status: 400 },
    );
  } catch (error: any) {
    console.error("Gazette relationships POST failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create relationship", code: error?.code },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  await context.params;

  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind");
  const linkId = searchParams.get("link_id");

  const table =
    kind === "person"
      ? "gazette_notice_people"
      : kind === "institution"
        ? "gazette_notice_institutions"
        : kind === "notice"
          ? "gazette_notice_relationships"
          : kind === "corrigendum"
            ? "gazette_corrigenda_entries"
            : null;

  if (!table || !linkId) {
    return NextResponse.json(
      { error: "kind and link_id are required" },
      { status: 400 },
    );
  }

  const { error } = await auth.supabase.from(table).delete().eq("id", linkId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
