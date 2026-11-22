import { requireAdminApi } from "@/lib/admin-api";
import { z } from "zod";

type Context = { params: Promise<{ id: string; officialId: string }> };
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const officialSchema = z.object({
  full_name: z.string().trim().min(2).max(250),
  role_title: z.string().trim().min(2).max(150),
  start_date: z.string().date().nullable().optional(),
  end_date: z.string().date().nullable().optional(),
  biography: z.string().trim().max(5000).nullable().optional(),
  photo_url: z.string().trim().url().refine((value) => /^https?:\/\//i.test(value), "Use an HTTP or HTTPS URL").nullable().optional(),
  is_published: z.boolean().optional(),
}).strict().refine((value) => !value.start_date || !value.end_date || value.end_date >= value.start_date, {
  message: "End date must be on or after start date",
});

export async function PATCH(request: Request, route: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ error: "Invalid request origin" }, 403);
  const { id: schoolId, officialId } = await route.params;
  if (!z.uuid().safeParse(schoolId).success || !z.uuid().safeParse(officialId).success) return reply({ error: "Invalid school official" }, 400);
  const parsed = officialSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return reply({ error: parsed.error.issues.map((issue) => issue.message).join("; ") }, 400);
  const { data, error } = await auth.supabase.from("education_school_officials")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", officialId).eq("school_id", schoolId)
    .select("id,full_name,role_title,start_date,end_date,biography,photo_url,is_published,created_at,updated_at").maybeSingle();
  if (error) return reply({ error: "Could not update school official" }, 500);
  return data ? reply(data) : reply({ error: "School official not found" }, 404);
}

export async function DELETE(request: Request, route: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ error: "Invalid request origin" }, 403);
  const { id: schoolId, officialId } = await route.params;
  if (!z.uuid().safeParse(schoolId).success || !z.uuid().safeParse(officialId).success) return reply({ error: "Invalid school official" }, 400);
  const { data, error } = await auth.supabase.from("education_school_officials")
    .delete().eq("id", officialId).eq("school_id", schoolId).select("id").maybeSingle();
  if (error) return reply({ error: "Could not remove school official" }, 500);
  return data ? reply({ removed: true }) : reply({ error: "School official not found" }, 404);
}
