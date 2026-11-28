import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { safeHtml } from "@/lib/safe-html";

export const dynamic = "force-dynamic";

const EDITABLE_TEXT_FIELDS = [
  "title",
  "short_title",
  "summary",
  "excerpt",
  "occasion",
  "venue",
  "locality",
  "county",
  "country",
] as const;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { data, error } = await auth.supabase
    .from("presidential_speeches")
    .select("id, slug, title, short_title, summary, excerpt, occasion, venue, locality, county, country, speech_date, body_html, transcript_html")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not load this presidential publication." }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Presidential publication not found." }, { status: 404 });

  const bodyHtml = data.body_html ?? data.transcript_html ?? "";
  return NextResponse.json(
    { data: { ...data, body_html: safeHtml(bodyHtml), html_field: data.body_html !== null ? "body_html" : "transcript_html" } },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const update: Record<string, string | null> = {};
  for (const field of EDITABLE_TEXT_FIELDS) {
    if (field in body) {
      if (typeof body[field] !== "string" && body[field] !== null) {
        return NextResponse.json({ error: `Invalid value for ${field}.` }, { status: 400 });
      }
      const value = typeof body[field] === "string" ? body[field].trim() : null;
      if (field === "title" && !value) {
        return NextResponse.json({ error: "A title is required." }, { status: 400 });
      }
      if (value && value.length > 20_000) {
        return NextResponse.json({ error: `${field} is too long.` }, { status: 400 });
      }
      update[field] = value;
    }
  }

  if ("speech_date" in body) {
    const date = typeof body.speech_date === "string" ? new Date(`${body.speech_date}T00:00:00.000Z`) : null;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(body.speech_date as string) || date.toISOString().slice(0, 10) !== body.speech_date) {
      return NextResponse.json({ error: "Enter a valid publication date." }, { status: 400 });
    }
    update.speech_date = body.speech_date as string;
  }

  if ("body_html" in body) {
    if (typeof body.body_html !== "string" || body.body_html.length > 2_000_000) {
      return NextResponse.json({ error: "The publication text is invalid or too large." }, { status: 400 });
    }
    const { data, error } = await auth.supabase
      .from("presidential_speeches")
      .select("body_html")
      .eq("id", id)
      .maybeSingle();
    if (error) return NextResponse.json({ error: "Could not verify the publication text." }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Presidential publication not found." }, { status: 404 });
    const field = data.body_html !== null ? "body_html" : "transcript_html";
    update[field] = safeHtml(body.body_html);
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No changes were provided." }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("presidential_speeches")
    .update(update)
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Could not save this presidential publication." }, { status: 400 });
  return NextResponse.json({ id }, { headers: { "Cache-Control": "no-store" } });
}
