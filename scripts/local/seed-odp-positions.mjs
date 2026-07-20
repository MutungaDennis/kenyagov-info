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
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

// Remove probe row
await fetch(
  `${url}/rest/v1/positions?title=eq.Chief%20of%20Staff%20(probe)`,
  { method: "DELETE", headers: { apikey: key, Authorization: `Bearer ${key}` } },
);

const titles = [
  "Chief of Staff",
  "Principal Administrative Secretary",
  "Secretary, IBEC",
  "Secretary, International Development Partnership Coordination",
  "Head - North and North Eastern Development Initiatives (NEDI)",
  "Chief of Staff - Office of the Spouse of the Deputy President",
  "Head, Communication",
  "Secretary Administration",
  "Director Human Resource Management",
  "Head, Finance",
  "Head, Central Planning Unit (CPPMU)",
  "Head, Supply Chain Management",
  "Head, ICT",
  "Head of Accounting Unit",
  "Head, Coordination Operation and Protocol",
  "Head, Hospitality",
];

for (const title of titles) {
  const code =
    title
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 50) + "_ODP";
  const r = await fetch(`${url}/rest/v1/positions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title,
      code,
      level: "National",
      description: "Office of the Deputy President (catalogue)",
    }),
  });
  const t = await r.text();
  if (r.ok) {
    console.log("OK", title);
  } else if (/unique|duplicate/i.test(t)) {
    console.log("exists", title);
  } else {
    console.log("FAIL", title, t.slice(0, 150));
  }
}
