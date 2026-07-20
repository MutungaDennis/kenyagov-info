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

const r = await fetch(`${url}/rest/v1/institutions?select=*&limit=1`, {
  headers,
});
const data = await r.json();
console.log("status", r.status);
if (Array.isArray(data) && data[0]) {
  const cols = Object.keys(data[0]).sort();
  console.log("columns_count", cols.length);
  console.log("columns", cols.join("\n"));
  console.log("sample", JSON.stringify(data[0], null, 2).slice(0, 2500));
} else {
  console.log(JSON.stringify(data).slice(0, 800));
}
