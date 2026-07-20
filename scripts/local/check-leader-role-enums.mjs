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
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const leaderId = "3bc35450-c8e7-4c5c-932f-0c65199ef16f";

async function tryInsert(label, body) {
  const r = await fetch(`${url}/rest/v1/leader_roles`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const t = await r.text();
  console.log(label, r.status, t.slice(0, 350));
  if (r.ok) {
    try {
      const j = JSON.parse(t);
      const id = Array.isArray(j) ? j[0]?.id : j.id;
      if (id) {
        await fetch(`${url}/rest/v1/leader_roles?id=eq.${id}`, {
          method: "DELETE",
          headers: { apikey: key, Authorization: `Bearer ${key}` },
        });
        console.log("cleaned", id);
      }
    } catch {
      /* ignore */
    }
  }
  return r.status;
}

async function main() {
  // Distinct levels / seat_types in use
  for (const col of ["level", "seat_type", "status", "entry_type", "house"]) {
    const r = await fetch(
      `${url}/rest/v1/leader_roles?select=${col}&limit=1000`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    const data = await r.json();
    if (Array.isArray(data)) {
      const set = new Set(data.map((x) => x[col]).filter((v) => v != null));
      console.log(`distinct_${col}`, [...set].slice(0, 40));
    } else {
      console.log(`distinct_${col}_err`, data);
    }
  }

  // Probe level enum values
  const levels = [
    "national",
    "National",
    "NATIONAL",
    "county",
    "County",
    "COUNTY",
    "independent",
    "Independent",
    "local",
    "Local",
    "constituency",
    "ward",
  ];
  for (const level of levels) {
    await tryInsert(`level=${level}`, {
      leader_id: leaderId,
      title: "Probe Role",
      level,
      seat_type: "N/A",
      term_start_date: "2024-01-01",
      status: "Active",
    });
  }

  // Probe seat_type
  const seats = [
    "N/A",
    "n/a",
    "elected",
    "Elected",
    "nominated",
    "appointed",
    "constituency",
    "county",
    "none",
    "None",
    "other",
    "Other",
  ];
  for (const seat_type of seats) {
    await tryInsert(`seat=${seat_type}`, {
      leader_id: leaderId,
      title: "Probe Role",
      level: "national",
      seat_type,
      term_start_date: "2024-01-01",
      status: "Active",
    });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
