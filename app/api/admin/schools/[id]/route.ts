import { requireAdminApi } from "@/lib/admin-api";
import { schoolEditSchema, schoolDeleteSchema } from "@/lib/schools/admin-schema";
import { z } from "zod";

type Context = { params: Promise<{ id: string }> };
const fields = "id,slug,official_name,ownership,main_tier,description,county,county_code,sub_county,sub_county_id,constituency,constituency_id,ward,ward_id,is_published,short_name,operational_status,institution_type,moe_category,gender_type,accommodation_type,registration_status,sponsor_name,special_needs_status,sne_categories,physical_address,postal_address,latitude,longitude,public_phone,public_email,website_url,nemis_code,knec_code,tsc_code,total_enrollment,total_teachers,water_source,power_source,internet_connectivity,verification_status,created_at,updated_at";
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
  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.county_code !== undefined && parsed.data.county_code !== null) {
    const { data: county, error: countyError } = await auth.supabase
      .from("education_counties").select("name").eq("code", parsed.data.county_code).maybeSingle();
    if (countyError || !county) return reply({ error: "Select a valid county" }, 400);
    updates.county = county.name;
  }
  if (parsed.data.sub_county_id !== undefined && parsed.data.sub_county_id !== null) {
    const { data: subCounty, error: subCountyError } = await auth.supabase
      .from("education_sub_counties").select("name,county_code").eq("id", parsed.data.sub_county_id).maybeSingle();
    if (subCountyError || !subCounty) return reply({ error: "Select a valid sub-county" }, 400);
    if (parsed.data.county_code !== undefined && subCounty.county_code !== parsed.data.county_code) {
      return reply({ error: "The sub-county must belong to the selected county" }, 400);
    }
    updates.sub_county = subCounty.name;
  }
  if (parsed.data.constituency_id !== undefined && parsed.data.constituency_id !== null) {
    const { data: constituency, error: constituencyError } = await auth.supabase
      .from("constituencies").select("name,county_id").eq("id", parsed.data.constituency_id).maybeSingle();
    if (constituencyError || !constituency) return reply({ error: "Select a valid constituency" }, 400);
    if (parsed.data.county_code == null) return reply({ error: "Select a county before selecting a constituency" }, 400);
    const { data: linkedCounty, error: linkedCountyError } = await auth.supabase
      .from("counties").select("id").eq("code", parsed.data.county_code).maybeSingle();
    if (linkedCountyError || !linkedCounty || constituency.county_id !== linkedCounty.id) {
      return reply({ error: "The constituency must belong to the selected county" }, 400);
    }
    updates.constituency = constituency.name;
  }
  if (parsed.data.ward_id !== undefined && parsed.data.ward_id !== null) {
    const { data: ward, error: wardError } = await auth.supabase
      .from("wards").select("name,constituency_id").eq("id", parsed.data.ward_id).maybeSingle();
    if (wardError || !ward) return reply({ error: "Select a valid ward" }, 400);
    if (!parsed.data.constituency_id || ward.constituency_id !== parsed.data.constituency_id) {
      return reply({ error: "The ward must belong to the selected constituency" }, 400);
    }
    updates.ward = ward.name;
  }
  const { data, error } = await auth.supabase.from("education_schools").update({
    ...updates,
    normalized_name: parsed.data.official_name.toLowerCase().replace(/\s+/g, " "),
    updated_at: new Date().toISOString(),
  }).eq("id", id).select(fields).maybeSingle();
  if (error) {
    if (/slug|url/i.test(error.message)) return reply({ error: "That URL is already in use or is not a valid school URL." }, 409);
    return reply({ error: "Could not save school" }, 500);
  }
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
