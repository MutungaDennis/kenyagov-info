import { requireAdminApi } from "@/lib/admin-api";
import { z } from "zod";

type Context = { params: Promise<{ id: string }> };
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const sourceSchema = z.object({
  title: z.string().trim().min(2).max(250),
  publisher: z.string().trim().min(2).max(250),
  source_url: z.string().trim().url().refine((value) => /^https?:\/\//i.test(value), "Use an HTTP or HTTPS URL"),
  publication_date: z.string().date().nullable().optional(),
  reference_year: z.number().int().min(1800).max(2200).nullable().optional(),
  licence: z.string().trim().max(250).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  former_school_name: z.string().trim().max(250).nullable().optional(),
  first_published_date: z.string().date().nullable().optional(),
  dataset_last_updated: z.string().date().nullable().optional(),
  metadata_last_updated: z.string().date().nullable().optional(),
}).strict();

export async function GET(_request: Request, route: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await route.params;
  if (!z.uuid().safeParse(id).success) return reply({ error: "Invalid school ID" }, 400);
  const { data, error } = await auth.supabase
    .from("education_school_source_records")
    .select("id,external_record_id,external_name,raw_record,review_status,created_at,source:education_data_sources!education_school_source_records_source_id_fkey(id,source_key,title,publisher,source_url,publication_date,reference_year,licence,notes)")
    .eq("school_id", id)
    .order("created_at", { ascending: true });
  if (error) return reply({ error: "Could not load school sources" }, 500);
  return reply(data ?? []);
}

export async function POST(request: Request, route: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ error: "Invalid request origin" }, 403);
  const { id: schoolId } = await route.params;
  if (!z.uuid().safeParse(schoolId).success) return reply({ error: "Invalid school ID" }, 400);
  const parsed = sourceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return reply({ error: parsed.error.issues.map((issue) => issue.message).join("; ") }, 400);

  const { data: school, error: schoolError } = await auth.supabase
    .from("education_schools").select("id,official_name").eq("id", schoolId).maybeSingle();
  if (schoolError || !school) return reply({ error: "School not found" }, 404);

  const { former_school_name, first_published_date, dataset_last_updated, metadata_last_updated, ...sourceData } = parsed.data;
  const sourceKey = `${sourceData.publisher}-${sourceData.title}-${sourceData.reference_year ?? sourceData.publication_date ?? sourceData.source_url}`.toLowerCase().normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    .slice(0, 120) || `source-${crypto.randomUUID()}`;
  const { data: source, error: sourceError } = await auth.supabase
    .from("education_data_sources")
    .upsert({ source_key: sourceKey, ...sourceData }, { onConflict: "source_key" })
    .select("id")
    .single();
  if (sourceError || !source) return reply({ error: "Could not save source details" }, 500);

  const record = {
    school_id: schoolId,
    source_id: source.id,
    external_record_id: `admin-school:${schoolId}`,
    external_name: school.official_name,
    match_method: "source_only",
    match_confidence: null,
    review_status: "approved",
    raw_record: {
      citation_only: true,
      source_url: sourceData.source_url,
      school_metadata: {
        former_school_name,
        first_published_date,
        dataset_last_updated,
        metadata_last_updated,
      },
    },
  };
  const { data: existing, error: existingError } = await auth.supabase.from("education_school_source_records")
    .select("id").eq("school_id", schoolId).eq("source_id", source.id)
    .order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (existingError) return reply({ error: "Could not check existing source links" }, 500);
  const saved = existing
    ? await auth.supabase.from("education_school_source_records").update(record)
      .eq("id", existing.id)
      .select("id,external_record_id,external_name,raw_record,review_status,created_at,source:education_data_sources!education_school_source_records_source_id_fkey(id,source_key,title,publisher,source_url,publication_date,reference_year,licence,notes)").single()
    : await auth.supabase.from("education_school_source_records").insert(record)
      .select("id,external_record_id,external_name,raw_record,review_status,created_at,source:education_data_sources!education_school_source_records_source_id_fkey(id,source_key,title,publisher,source_url,publication_date,reference_year,licence,notes)").single();
  if (saved.error || !saved.data) return reply({ error: "Could not link the source to this school" }, 500);
  return reply(saved.data, existing ? 200 : 201);
}

export async function PATCH(request: Request, route: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ error: "Invalid request origin" }, 403);
  const { id: schoolId } = await route.params;
  if (!z.uuid().safeParse(schoolId).success) return reply({ error: "Invalid school ID" }, 400);
  const parsed = sourceSchema.extend({ id: z.uuid() }).strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return reply({ error: parsed.error.issues.map((issue) => issue.message).join("; ") }, 400);

  const { data: schoolSource, error: linkError } = await auth.supabase.from("education_school_source_records")
    .select("id,source_id,raw_record").eq("school_id", schoolId).eq("id", parsed.data.id).maybeSingle();
  if (linkError) return reply({ error: "Could not find the source linked to this school" }, 500);
  if (!schoolSource) return reply({ error: "Source record not found" }, 404);

  const { data: updatedSource, error: updateError } = await auth.supabase.from("education_data_sources")
    .update({
      title: parsed.data.title,
      publisher: parsed.data.publisher,
      source_url: parsed.data.source_url,
      publication_date: parsed.data.publication_date ?? null,
      reference_year: parsed.data.reference_year ?? null,
      licence: parsed.data.licence ?? null,
      notes: parsed.data.notes ?? null,
    })
    .eq("id", schoolSource.source_id).select("id").maybeSingle();
  if (updateError) return reply({ error: "Could not update source details" }, 500);
  if (!updatedSource) return reply({ error: "Source details not found" }, 404);

  const existingRawRecord = schoolSource.raw_record && typeof schoolSource.raw_record === "object"
    ? schoolSource.raw_record as Record<string, unknown>
    : {};
  const existingSchoolMetadata = existingRawRecord.school_metadata && typeof existingRawRecord.school_metadata === "object"
    ? existingRawRecord.school_metadata as Record<string, unknown>
    : {};
  const { former_school_name, first_published_date, dataset_last_updated, metadata_last_updated } = parsed.data;
  const { data: updatedLink, error: linkUpdateError } = await auth.supabase.from("education_school_source_records")
    .update({ raw_record: {
      ...existingRawRecord,
      source_url: parsed.data.source_url,
      school_metadata: {
        ...existingSchoolMetadata,
        former_school_name: former_school_name ?? null,
        first_published_date: first_published_date ?? null,
        dataset_last_updated: dataset_last_updated ?? null,
        metadata_last_updated: metadata_last_updated ?? null,
      },
    } })
    .eq("id", schoolSource.id).eq("school_id", schoolId).select("id").maybeSingle();
  if (linkUpdateError || !updatedLink) return reply({ error: "Source updated, but school-specific metadata could not be saved" }, 500);
  return reply({ updated: true });
}

export async function DELETE(request: Request, route: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ error: "Invalid request origin" }, 403);
  const { id: schoolId } = await route.params;
  if (!z.uuid().safeParse(schoolId).success) return reply({ error: "Invalid school ID" }, 400);
  const parsed = z.object({ id: z.uuid() }).strict().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return reply({ error: "Invalid source record" }, 400);
  const { data, error } = await auth.supabase.from("education_school_source_records")
    .delete().eq("id", parsed.data.id).eq("school_id", schoolId).select("id").maybeSingle();
  if (error) return reply({ error: "Could not remove source from school" }, 500);
  return data ? reply({ removed: true }) : reply({ error: "Source record not found" }, 404);
}
