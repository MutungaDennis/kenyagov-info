import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const year = Number(searchParams.get("year") || 0);
  const issueNumber = Number(searchParams.get("issue") || 0);
  const reviewStatus = (searchParams.get("review_status") || "").trim();
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 50));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

  let issueIds: string[] | null = null;
  if (year || issueNumber) {
    let issueQuery = auth.supabase.from("gazette_issues").select("id");
    if (year) issueQuery = issueQuery.eq("year", year);
    if (issueNumber) issueQuery = issueQuery.eq("issue_number", issueNumber);
    const issueResult = await issueQuery.limit(1000);
    if (issueResult.error) {
      return NextResponse.json({ error: issueResult.error.message }, { status: 500 });
    }
    issueIds = (issueResult.data || []).map((r) => r.id);
    if (!issueIds.length) return NextResponse.json({ data: [], total: 0, limit, offset });
  }

  let query = auth.supabase
    .from("gazette_notices")
    .select(
      `id, issue_id, notice_number, title, notice_type, transcription_status,
       relationship_review_status, source_page_start, source_page_end,
       gazette_issues!inner(id, year, volume, issue_number, date, is_special_issue)`,
      { count: "exact" },
    )
    .order("notice_number", { ascending: true })
    .range(offset, offset + limit - 1);

  if (issueIds) query = query.in("issue_id", issueIds);
  if (reviewStatus) query = query.eq("relationship_review_status", reviewStatus);

  if (q) {
    if (/^\d+$/.test(q)) query = query.eq("notice_number", Number(q));
    else {
      const safe = q.replace(/[%_,]/g, " ");
      query = query.or(
        `title.ilike.%${safe}%,notice_type.ilike.%${safe}%,act_referenced.ilike.%${safe}%`,
      );
    }
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data || [], total: count || 0, limit, offset });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const issueId = String(body.issue_id || "").trim();
  const noticeNumber = Number(body.notice_number);
  const title = String(body.title || "").trim();

  if (!issueId || !Number.isFinite(noticeNumber) || !title) {
    return NextResponse.json(
      { error: "issue_id, notice_number and title are required" },
      { status: 400 },
    );
  }

  const { data, error } = await auth.supabase
    .from("gazette_notices")
    .insert({
      issue_id: issueId,
      notice_number: noticeNumber,
      title,
      notice_type: body.notice_type ? String(body.notice_type) : null,
      act_referenced: body.act_referenced ? String(body.act_referenced) : null,
      content_html: body.content_html ? String(body.content_html) : null,
      source_page_start: body.source_page_start == null ? null : Number(body.source_page_start),
      source_page_end: body.source_page_end == null ? null : Number(body.source_page_end),
      transcription_status: body.transcription_status ? String(body.transcription_status) : "transcribed",
      transcription_notes: body.transcription_notes ? String(body.transcription_notes) : null,
      relationship_review_status: "Not reviewed",
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
