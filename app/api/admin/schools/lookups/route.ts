import { requireAdminApi } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const [counties, subCounties, constituencies, wards] = await Promise.all([
    auth.supabase.from("counties").select("id,code,name").order("name"),
    auth.supabase.from("education_sub_counties").select("id,county_code,name").order("name"),
    auth.supabase.from("constituencies").select("id,county_id,name").order("name"),
    auth.supabase.from("wards").select("id,constituency_id,name").order("name"),
  ]);
  const failed = [counties, subCounties, constituencies, wards].find((result) => result.error);
  if (failed?.error) {
    return Response.json({ error: "Could not load geographic options" }, { status: 500 });
  }
  return Response.json({
    counties: counties.data ?? [],
    subCounties: subCounties.data ?? [],
    constituencies: constituencies.data ?? [],
    wards: wards.data ?? [],
  }, { headers: { "Cache-Control": "private, no-store" } });
}
