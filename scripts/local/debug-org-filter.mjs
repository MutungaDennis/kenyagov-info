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

// Sample organisations from roles
const { data: roles, error: re } = await sb
  .from("leader_roles")
  .select("leader_id, organization, title, status")
  .not("organization", "is", null)
  .limit(20);
console.log("roles_err", re?.message);
console.log(
  "sample_roles",
  (roles || []).map((r) => ({
    org: r.organization,
    orgLen: r.organization?.length,
    leader_id: r.leader_id,
  })),
);

const orgs = [
  ...new Set((roles || []).map((r) => r.organization).filter(Boolean)),
];
const testOrg = orgs[0];
console.log("testOrg", JSON.stringify(testOrg));

if (testOrg) {
  const { data: byEq } = await sb
    .from("leader_roles")
    .select("leader_id, organization")
    .eq("organization", testOrg)
    .limit(10);
  console.log("eq_count", byEq?.length, byEq?.[0]);

  const { data: byIlike } = await sb
    .from("leader_roles")
    .select("leader_id, organization")
    .ilike("organization", testOrg)
    .limit(10);
  console.log("ilike_exact_count", byIlike?.length);

  const ids = [...new Set((byEq || []).map((r) => r.leader_id))];
  console.log("ids", ids);

  if (ids.length) {
    const { data: leaders, error: le } = await sb
      .from("leaders")
      .select("id, full_name, current_organization, surname")
      .in("id", ids)
      .limit(10);
    console.log("leaders_err", le?.message);
    console.log("leaders", leaders);

    // same with range like admin
    const { data: leaders2, error: le2, count } = await sb
      .from("leaders")
      .select(
        `id, slug, full_name, first_name, surname, current_organization,
         leader_roles ( id, title, organization, status )`,
        { count: "exact" },
      )
      .in("id", ids)
      .order("surname", { ascending: true })
      .range(0, 39);
    console.log("full_query_err", le2?.message, "count", count);
    console.log(
      "full_query",
      (leaders2 || []).map((l) => l.full_name || l.surname),
    );
  }
}

// Orgs that exist only on current_organization
const { data: snaps } = await sb
  .from("leaders")
  .select("id, full_name, current_organization")
  .not("current_organization", "is", null)
  .limit(15);
console.log(
  "snap_orgs",
  (snaps || []).map((s) => s.current_organization),
);
