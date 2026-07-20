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
const headers = { apikey: key, Authorization: `Bearer ${key}` };

const cols = [
  "institution_category",
  "institution_nature",
  "government_level",
  "arm_of_government",
  "constitutional_status",
  "legal_basis_type",
  "operational_model",
  "funding_model",
  "verification_status",
  "status",
  "institution_type",
  "mtef_sector",
];

for (const col of cols) {
  const r = await fetch(
    `${url}/rest/v1/institutions?select=${col}&limit=2000`,
    { headers },
  );
  const data = await r.json();
  if (!Array.isArray(data)) {
    console.log(col, "ERR", data);
    continue;
  }
  const set = new Set(
    data.map((x) => x[col]).filter((v) => v != null && v !== ""),
  );
  console.log(col, [...set].sort().join(" | ") || "(none)");
}
