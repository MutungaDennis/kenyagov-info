import { requireAdminApi } from "@/lib/admin-api";
import { schoolEditSchema, schoolDeleteSchema } from "@/lib/schools/admin-schema";
import { z } from "zod";

type Context = { params: Promise<{ id: string }> };
const fields = "id,slug,official_name,ownership,main_tier,description,county,sub_county,is_published,short_name,operational_status,physical_address,postal_address,public_phone,public_email,website_url,total_enrollment,total_teachers";
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(_request: Request, context: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) return reply({ error: "Invalid school ID" }, 400);
  const { data, error } = await auth.supabase.from("education_schools").select(fields).eq("id", id).maybeSingle();
  if (error) return reply({ error: "Could not load school" }, 500);
  return data ? reply(data) : reply({ error: "School not found" }, 404);
}

export async function PATCH(request: Request, context: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ error: "Invalid request origin" }, 403);
  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) return reply({ error: "Invalid school ID" }, 400);
  const parsed = schoolEditSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return reply({ error: parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, 400);
  const { data, error } = await auth.supabase.from("education_schools").update({
    ...parsed.data,
    normalized_name: parsed.data.official_name.toLowerCase().replace(/\s+/g, " "),
    updated_at: new Date().toISOString(),
  }).eq("id", id).select(fields).maybeSingle();
  if (error) return reply({ error: "Could not save school" }, 500);
  return data ? reply(data) : reply({ error: "School not found" }, 404);
}

export async function DELETE(request: Request, context: Context) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ error: "Invalid request origin" }, 403);
  const { id } = await context.params;
  if (!z.uuid().safeParse(id).success) return reply({ error: "Invalid school ID" }, 400);
  const parsed = schoolDeleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return reply({ error: "Type the school's exact saved name to confirm deletion." }, 400);
  const { data, error } = await auth.supabase.from("education_schools").delete()
    .eq("id", id).eq("official_name", parsed.data.confirmation).select("id").maybeSingle();
  if (error) return reply({ error: "Could not delete school. It may still have linked records; unpublish it instead." }, 409);
  return data ? reply({ deleted: true }) : reply({ error: "The name did not match, or the school has already been deleted. Reload and try again." }, 409);
}
