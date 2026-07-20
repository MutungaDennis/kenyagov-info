/**
 * End-to-end test of role insert as the fixed API would do it.
 */
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

const supabase = createClient(
  get("NEXT_PUBLIC_SUPABASE_URL"),
  get("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const leaderId = "3bc35450-c8e7-4c5c-932f-0c65199ef16f";

// Dynamic import of built helpers won't work with path aliases; inline minimal build
function normalizeLeaderLevel(raw, title) {
  const s = (raw || "").toLowerCase();
  if (s.includes("county")) return "county";
  if (s.includes("ward") || /mca/i.test(title || "")) return "ward";
  return "national";
}
function normalizeSeatType(raw, entry, title) {
  const c = `${raw || ""} ${entry || ""}`.toLowerCase();
  if (c.includes("elect")) return "Elected";
  if (c.includes("nominat")) return "Nominated";
  if (c.includes("ex-officio") || c.includes("ex officio")) return "Ex-Officio";
  if (c.includes("appoint") || /cabinet|commission|judge/i.test(title || ""))
    return "Appointed";
  return "Appointed";
}
function normalizeRoleStatus(raw, end) {
  const s = (raw || "").toLowerCase();
  if (s === "suspended") return "Suspended";
  if (s === "former" || s === "ended" || end) return "Former";
  return "Active";
}

const body = {
  title: "Chairperson",
  organization: "Commission on Revenue Allocation",
  level: "National Government",
  seat_type: "Appointed",
  term_start_date: "2020-01-15",
  term_end_date: null,
  status: "Active",
  entry_type: "Appointed",
  set_as_current: true,
};

const row = {
  leader_id: leaderId,
  title: body.title,
  organization: body.organization,
  level: normalizeLeaderLevel(body.level, body.title),
  seat_type: normalizeSeatType(body.seat_type, body.entry_type, body.title),
  term_start_date: body.term_start_date,
  term_end_date: body.term_end_date,
  status: normalizeRoleStatus(body.status, body.term_end_date),
  entry_type: body.entry_type,
  party: null,
  county: null,
  constituency: null,
  ward: null,
};

console.log("row", row);

const { data, error } = await supabase
  .from("leader_roles")
  .insert(row)
  .select("*")
  .single();

if (error) {
  console.error("FAIL", error.message);
  process.exit(1);
}
console.log("OK", {
  id: data.id,
  title: data.title,
  level: data.level,
  seat_type: data.seat_type,
  status: data.status,
  term_start_date: data.term_start_date,
});

// leave the real position for Jane - user wanted it! Don't delete.
// Actually this is a test - better leave it as it's a real useful position
console.log("Left position on leader for admin UI verification");
