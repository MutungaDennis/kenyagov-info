import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

function markerRegex(id: string) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Global flag is required because one logical Gazette entity may be
  // represented by multiple fragments carrying the same relationship UUID.
  return new RegExp(
    `<span\\s+[^>]*data-gazette-inline-link=["']${escaped}["'][^>]*>([\\s\\S]*?)<\\/span>`,
    "gi",
  );
}

export async function GET(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id: noticeId } = await context.params;

  const { data, error } = await auth.supabase
    .from("gazette_inline_links")
    .select("*")
    .eq("notice_id", noticeId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data || [];
  const leaderIds = Array.from(
    new Set(rows.map((r: any) => r.leader_id).filter(Boolean)),
  );
  const mcaIds = Array.from(
    new Set(rows.map((r: any) => r.mca_id).filter(Boolean)),
  );
  const institutionIds = Array.from(
    new Set(rows.map((r: any) => r.institution_id).filter(Boolean)),
  );

  const [leaders, mcas, institutions] = await Promise.all([
    leaderIds.length
      ? auth.supabase
          .from("leaders")
          .select("id, slug, full_name, first_name, other_names, surname")
          .in("id", leaderIds)
      : Promise.resolve({ data: [], error: null }),

    mcaIds.length
      ? auth.supabase
          .from("mcas")
          .select("id, slug, first_name, other_names, surname")
          .in("id", mcaIds)
      : Promise.resolve({ data: [], error: null }),

    institutionIds.length
      ? auth.supabase
          .from("institutions")
          .select("id, slug, name, short_name")
          .in("id", institutionIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const hydrateError = leaders.error || mcas.error || institutions.error;
  if (hydrateError) {
    return NextResponse.json({ error: hydrateError.message }, { status: 500 });
  }

  const leaderMap = new Map((leaders.data || []).map((r: any) => [r.id, r]));
  const mcaMap = new Map((mcas.data || []).map((r: any) => [r.id, r]));
  const institutionMap = new Map(
    (institutions.data || []).map((r: any) => [r.id, r]),
  );

  return NextResponse.json({
    data: rows.map((row: any) => ({
      ...row,
      leader: row.leader_id ? leaderMap.get(row.leader_id) || null : null,
      mca: row.mca_id ? mcaMap.get(row.mca_id) || null : null,
      institution: row.institution_id
        ? institutionMap.get(row.institution_id) || null
        : null,
    })),
  });
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

  const id = String(body.id || "").trim();
  const linkType = String(body.link_type || "");
  const selectedText = String(body.selected_text || "").trim();
  const contentHtml = String(body.content_html || "");

  if (!id || !selectedText || !contentHtml) {
    return NextResponse.json(
      { error: "id, selected_text and content_html are required" },
      { status: 400 },
    );
  }

  if (!["person", "institution"].includes(linkType)) {
    return NextResponse.json({ error: "Invalid link_type" }, { status: 400 });
  }

  if (!contentHtml.includes(`data-gazette-inline-link="${id}"`)) {
    return NextResponse.json(
      {
        error:
          "The submitted transcription does not contain the inline-link marker.",
      },
      { status: 400 },
    );
  }

  const row =
    linkType === "person"
      ? {
          id,
          notice_id: noticeId,
          link_type: "person",
          leader_id: body.person_kind === "leader" ? body.person_id : null,
          mca_id: body.person_kind === "mca" ? body.person_id : null,
          leader_role_id: body.leader_role_id || null,
          institution_id: null,
          selected_text: selectedText,
          historical_label: body.historical_label || selectedText,
          semantic_role: body.semantic_role || "mentioned_person",
          capacity_title: body.capacity_title || null,
          organization_name: body.organization_name || null,
          role_start_date: body.role_start_date || null,
          role_end_date: body.role_end_date || null,
          verification_status: body.verification_status || "Verified",
          notes: body.notes || null,
        }
      : {
          id,
          notice_id: noticeId,
          link_type: "institution",
          leader_id: null,
          mca_id: null,
          leader_role_id: null,
          institution_id: body.institution_id,
          selected_text: selectedText,
          historical_label: body.historical_label || selectedText,
          semantic_role: body.semantic_role || "mentioned_institution",
          capacity_title: null,
          organization_name: body.organization_name || null,
          role_start_date: null,
          role_end_date: null,
          verification_status: body.verification_status || "Verified",
          notes: body.notes || null,
        };

  const { data: link, error: linkError } = await auth.supabase
    .from("gazette_inline_links")
    .insert(row)
    .select("*")
    .single();

  if (linkError) {
    return NextResponse.json({ error: linkError.message }, { status: 400 });
  }

  const { error: noticeError } = await auth.supabase
    .from("gazette_notices")
    .update({ content_html: contentHtml })
    .eq("id", noticeId);

  if (noticeError) {
    await auth.supabase.from("gazette_inline_links").delete().eq("id", id);

    return NextResponse.json(
      {
        error: noticeError.message,
        hint: "The inline-link row was rolled back because content_html could not be updated.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ data: link }, { status: 201 });
}

export async function DELETE(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id: noticeId } = await context.params;

  const { searchParams } = new URL(request.url);
  const linkId = String(searchParams.get("link_id") || "");

  if (!linkId) {
    return NextResponse.json({ error: "link_id is required" }, { status: 400 });
  }

  const { data: notice, error: noticeError } = await auth.supabase
    .from("gazette_notices")
    .select("content_html")
    .eq("id", noticeId)
    .single();

  if (noticeError || !notice) {
    return NextResponse.json(
      { error: noticeError?.message || "Gazette notice not found" },
      { status: 404 },
    );
  }

  const currentHtml = String(notice.content_html || "");

  // Because markerRegex is global, this removes every fragment with this ID
  // while preserving the Gazette text inside each span.
  const nextHtml = currentHtml.replace(markerRegex(linkId), "$1");

  const { error: htmlError } = await auth.supabase
    .from("gazette_notices")
    .update({ content_html: nextHtml })
    .eq("id", noticeId);

  if (htmlError) {
    return NextResponse.json({ error: htmlError.message }, { status: 400 });
  }

  const { error: deleteError } = await auth.supabase
    .from("gazette_inline_links")
    .delete()
    .eq("id", linkId)
    .eq("notice_id", noticeId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, content_html: nextHtml });
}