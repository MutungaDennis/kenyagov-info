import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const env = fs.readFileSync(path.join(root, ".env.local"), "utf8");
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim() : "";
};

const sb = createClient(
  get("NEXT_PUBLIC_SUPABASE_URL"),
  get("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false } },
);

const org = "Commission on Revenue Allocation";
const { data: roleEq } = await sb
  .from("leader_roles")
  .select("leader_id")
  .eq("organization", org);
const ids = [...new Set((roleEq || []).map((r) => r.leader_id))];
console.log("ids", ids);

const select = `id, slug, full_name, first_name, other_names, surname, title,
       current_party, current_constituency, current_county, current_organization,
       level, image_url, is_active, status, updated_at,
       leader_roles!leader_roles_leader_id_fkey (
  id, title, organization, status, term_start_date, term_end_date
)`;

const { data, error, count } = await sb
  .from("leaders")
  .select(select, { count: "exact" })
  .in("id", ids)
  .order("surname", { ascending: true })
  .range(0, 39);

console.log("err", error?.message || "OK");
console.log("count", count);
console.log(
  "rows",
  (data || []).map((d) => ({
    name: d.full_name || d.surname,
    roles: (d.leader_roles || []).map((r) => r.organization),
  })),
);
