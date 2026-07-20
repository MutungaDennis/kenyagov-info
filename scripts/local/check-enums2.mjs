import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const env = fs.readFileSync(path.join(root, ".env.local"), "utf8");
const get = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim() : "";
};
const url = get("NEXT_PUBLIC_SUPABASE_URL");
const key = get("SUPABASE_SERVICE_ROLE_KEY");
const leaderId = "3bc35450-c8e7-4c5c-932f-0c65199ef16f";
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function tryInsert(label, body) {
  const r = await fetch(`${url}/rest/v1/leader_roles`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const t = await r.text();
  console.log(label, r.status, r.ok ? "OK" : t.slice(0, 160));
  if (r.ok) {
    const j = JSON.parse(t);
    await fetch(`${url}/rest/v1/leader_roles?id=eq.${j[0].id}`, {
      method: "DELETE",
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
  }
}

const levels = [
  "national",
  "county",
  "county_government",
  "sub_national",
  "subnational",
  "regional",
  "local",
  "international",
  "independent",
  "constitutional",
  "other",
  "ward",
];
for (const level of levels) {
  await tryInsert(`level=${level}`, {
    leader_id: leaderId,
    title: "P",
    level,
    seat_type: "Elected",
    term_start_date: "2024-01-01",
    status: "Active",
  });
}

for (const seat_type of ["Elected", "Nominated", "Ex-Officio", "Appointed"]) {
  await tryInsert(`seat=${seat_type}`, {
    leader_id: leaderId,
    title: "P",
    level: "national",
    seat_type,
    term_start_date: "2024-01-01",
    status: "Active",
  });
}

for (const status of ["Active", "Former", "Ended", "Suspended", "Inactive"]) {
  await tryInsert(`status=${status}`, {
    leader_id: leaderId,
    title: "P",
    level: "national",
    seat_type: "Elected",
    term_start_date: "2024-01-01",
    status,
  });
}

// institution_id as uuid text
const inst = await fetch(
  `${url}/rest/v1/institutions?select=id,name&limit=1`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
);
const instData = await inst.json();
console.log("sample_institution", instData?.[0]);

if (instData?.[0]?.id) {
  await tryInsert("with_institution", {
    leader_id: leaderId,
    title: "Cabinet Secretary",
    level: "national",
    seat_type: "Nominated",
    term_start_date: "2024-06-01",
    status: "Active",
    organization: instData[0].name,
    institution_id: instData[0].id,
  });
}
