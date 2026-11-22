import { requireAdminApi } from "@/lib/admin-api";
import { z } from "zod";

type Context = { params: Promise<{ id: string }> };
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

export async function GET(_request: Request, route: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await route.params;
  if (!z.uuid().safeParse(id).success) return reply({ error: "Invalid school ID" }, 400);
  const { data, error } = await auth.supabase.from("education_school_officials")
    .select("id,full_name,role_title,start_date,end_date,biography,photo_url,is_published,created_at,updated_at")
    .eq("school_id", id).order("start_date", { ascending: false, nullsFirst: false });
  if (error) return reply({ error: "Could not load school officials. Apply the school-officials database migration first." }, 503);
  return reply(data ?? []);
}

export async function POST(request: Request, route: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ error: "Invalid request origin" }, 403);
  const { id: schoolId } = await route.params;
  if (!z.uuid().safeParse(schoolId).success) return reply({ error: "Invalid school ID" }, 400);
  const parsed = officialSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return reply({ error: parsed.error.issues.map((issue) => issue.message).join("; ") }, 400);
  const { data, error } = await auth.supabase.from("education_school_officials")
    .insert({ school_id: schoolId, ...parsed.data }).select("id,full_name,role_title,start_date,end_date,biography,photo_url,is_published,created_at,updated_at").single();
  if (error || !data) return reply({ error: "Could not add school official. Check that the school-officials migration is applied." }, 500);
  return reply(data, 201);
}
