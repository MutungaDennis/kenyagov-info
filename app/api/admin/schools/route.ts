import { requireAdminApi, slugify } from "@/lib/admin-api";
import { schoolCreateSchema } from "@/lib/schools/admin-schema";
import { schoolWriteFailure } from "@/lib/schools/write-error";

const fields = "id,slug,official_name,ownership,main_tier,description,county,county_code,is_published,institution_type,operational_status,registration_status,gender_type,accommodation_type,created_at,updated_at";
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ error: "Invalid request origin" }, 403);

  const parsed = schoolCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return reply({ error: parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, 400);
  }

  const { data: county, error: countyError } = await auth.supabase
    .from("education_counties")
    .select("name")
    .eq("code", parsed.data.county_code)
    .maybeSingle();
  if (countyError || !county) return reply({ error: "Select a valid county" }, 400);

  const officialName = parsed.data.official_name.trim();
  const slug = parsed.data.slug?.trim() || slugify(officialName);
  if (!slug) return reply({ error: "Enter a school name that can be used to create a URL, or provide a URL manually." }, 400);

  const { data, error } = await auth.supabase
    .from("education_schools")
    .insert({
      ...parsed.data,
      official_name: officialName,
      normalized_name: officialName.toLowerCase().replace(/\s+/g, " "),
      slug,
      county: county.name,
      is_published: parsed.data.is_published ?? false,
    })
    .select(fields)
    .single();

  if (error) {
    const failure = schoolWriteFailure(error);
    console.error("Could not create school:", { code: error.code });
    return reply({ error: failure.message }, failure.status);
  }

  return reply(data, 201);
}
