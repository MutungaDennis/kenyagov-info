/**
 * Dump large static datasets to public/data/*.json (Worker size relief).
 * Run: pnpm exec tsx scripts/extract-public-data.mjs
 */
import { writeFileSync, mkdirSync, statSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "data");
mkdirSync(outDir, { recursive: true });

function dump(name, data) {
  const p = join(outDir, name);
  writeFileSync(p, JSON.stringify(data));
  console.log(name, Math.round(statSync(p).size / 1024) + "KB");
}

async function load(rel) {
  return import(pathToFileURL(join(root, rel)).href);
}

// NOTE: Large arrays now live ONLY in public/data/*.json.
// This script refreshes small companion fields; it will NOT overwrite
// activity/member/minister rosters if the TS modules export empty arrays.

const eop = await load("lib/data/election-eop.ts");
if ((eop.eopActivities2027 || []).length > 0) {
  dump("election-eop.json", {
    meta: eop.EOP_META,
    sections: eop.EOP_SECTIONS,
    subsectionLabels: eop.EOP_SUBSECTION_LABELS,
    activities: eop.eopActivities2027,
    byElection: eop.eopActivitiesByElection,
  });
} else {
  console.log("skip election-eop.json (source of truth is public/data — TS array empty)");
}

const members = await load("data/national-assembly-members.ts");
if ((members.nationalAssemblyMembers || []).length > 0) {
  dump("national-assembly-members.json", members.nationalAssemblyMembers);
} else {
  console.log("skip national-assembly-members.json (TS array empty)");
}

const ministers = await load("lib/data/ministers.ts");
const registry = ministers.officialsRegistry || {};
if (Object.keys(registry).length > 0) {
  dump("ministers.json", registry);
} else {
  console.log("skip ministers.json (TS registry empty)");
}

const ask = await load("lib/data/ask-shows.ts");
dump("ask-shows.json", {
  theme2026: ask.askTheme2026,
  profiles: ask.askShowProfiles,
  calendarByYear: ask.askCalendarByYear,
  tierLabels: ask.askTierLabels,
});

const events = await load("lib/data/national-events.ts");
dump("national-events.json", {
  categories: events.nationalEventCategories,
  events: events.nationalEvents,
});

const huduma = await load("lib/data/huduma-centres.ts");
dump("huduma-centres.json", {
  source: huduma.HUDUMA_SOURCE,
  regions: huduma.HUDUMA_REGIONS,
  centres: huduma.hudumaCentres,
});

console.log("Done → public/data/");
