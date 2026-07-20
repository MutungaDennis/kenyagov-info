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

const id = "3bc35450-c8e7-4c5c-932f-0c65199ef16f";
const tries = [
  "leader_roles!leader_roles_leader_id_fkey(id,title,organization,status,term_start_date,term_end_date)",
  "leader_roles!leader_id(id,title,organization,status)",
  "leader_roles!inner(id,title,organization)",
];

for (const emb of tries) {
  const sel = `id, surname, full_name, ${emb}`;
  const { data, error } = await sb
    .from("leaders")
    .select(sel)
    .eq("id", id)
    .maybeSingle();
  console.log(
    emb.slice(0, 60),
    error?.message || "OK",
    Array.isArray(data?.leader_roles)
      ? data.leader_roles.length
      : data?.leader_roles,
  );
}

// Filter path without embed
const { data: roles } = await sb
  .from("leader_roles")
  .select("leader_id")
  .eq("organization", "Commission on Revenue Allocation");
const ids = (roles || []).map((r) => r.leader_id);
const { data: leaders, error: e2, count } = await sb
  .from("leaders")
  .select("id, surname, full_name, current_organization", { count: "exact" })
  .in("id", ids)
  .order("surname", { ascending: true })
  .range(0, 39);
console.log("filter_no_embed", e2?.message || "OK", count, leaders);
