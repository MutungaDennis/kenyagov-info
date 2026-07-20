import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const env = fs.readFileSync(path.join(root, ".env.local"), "utf8");
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : "";
};
const url = get("NEXT_PUBLIC_SUPABASE_URL");
const key = get("SUPABASE_SERVICE_ROLE_KEY");
const leaderId = process.argv[2] || "3bc35450-c8e7-4c5c-932f-0c65199ef16f";

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function main() {
  // Sample any role for columns
  const sampleRes = await fetch(
    `${url}/rest/v1/leader_roles?select=*&limit=1`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  const sample = await sampleRes.json();
  console.log("sample_status", sampleRes.status);
  if (Array.isArray(sample) && sample[0]) {
    console.log("columns", Object.keys(sample[0]).sort().join(", "));
  } else {
    console.log("sample", JSON.stringify(sample).slice(0, 800));
  }

  // OpenAPI defs if any
  const open = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const ot = await open.text();
  try {
    const j = JSON.parse(ot);
    const def = j.definitions?.leader_roles || j.components?.schemas?.leader_roles;
    if (def?.properties) {
      console.log("openapi_cols", Object.keys(def.properties).sort().join(", "));
      console.log("required", def.required);
    }
  } catch {
    /* ignore */
  }

  // Try minimal insert
  const minimal = {
    leader_id: leaderId,
    title: "Test Position Schema Check",
    term_start_date: "2024-01-01",
    status: "Active",
  };
  const r1 = await fetch(`${url}/rest/v1/leader_roles`, {
    method: "POST",
    headers,
    body: JSON.stringify(minimal),
  });
  const t1 = await r1.text();
  console.log("insert_minimal", r1.status, t1.slice(0, 600));

  // Try admin-like payload
  const full = {
    leader_id: leaderId,
    title: "Cabinet Secretary",
    organization: "Ministry of Health",
    constituency: null,
    county: null,
    ward: null,
    party: null,
    term_start_date: "2024-06-01",
    term_end_date: null,
    status: "Active",
    entry_type: "Appointed",
    official_email: null,
    office_location: null,
    level: "National",
    position_id: null,
    institution_id: null,
    party_id: null,
    county_id: null,
    constituency_id: null,
    ward_id: null,
  };
  const r2 = await fetch(`${url}/rest/v1/leader_roles`, {
    method: "POST",
    headers,
    body: JSON.stringify(full),
  });
  const t2 = await r2.text();
  console.log("insert_full", r2.status, t2.slice(0, 600));

  // Cleanup test rows
  await fetch(
    `${url}/rest/v1/leader_roles?leader_id=eq.${leaderId}&title=eq.Test%20Position%20Schema%20Check`,
    {
      method: "DELETE",
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    },
  );
  await fetch(
    `${url}/rest/v1/leader_roles?leader_id=eq.${leaderId}&title=eq.Cabinet%20Secretary&term_start_date=eq.2024-06-01`,
    {
      method: "DELETE",
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    },
  );

  // Count existing
  const list = await fetch(
    `${url}/rest/v1/leader_roles?leader_id=eq.${leaderId}&select=id,title,status,term_start_date`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  console.log("existing", list.status, await list.text());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
