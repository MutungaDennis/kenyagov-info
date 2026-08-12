import { readFileSync, writeFileSync } from "fs";

const body = readFileSync("lib/data/election-eop.ts", "utf8");
const m = body.match(
  /(export type EopActivity[\s\S]*?export const EOP_SUBSECTION_LABELS: Record<string, string> = \{[\s\S]*?\};)/,
);
if (!m) {
  console.error("no match for election-eop body");
  process.exit(1);
}

const header = `/**
 * IEBC Election Operation Plan (EOP) 2025-2027 - Appendix I: Implementation Timelines.
 * Activity rows live in public/data/election-eop.json (not in the Worker bundle).
 */

import { loadStaticJson } from "@/lib/data/load-static-json";

`;

const footer = `

export type EopJsonBundle = {
  activities: EopActivity[];
  sections?: EopSection[];
  subsectionLabels?: Record<string, string>;
  meta?: typeof EOP_META;
};

let activitiesCache: EopActivity[] | null = null;

/** Load ~280 EOP activities without embedding them in the Worker bundle. */
export async function loadEopActivities(): Promise<EopActivity[]> {
  if (activitiesCache) return activitiesCache;
  const data = await loadStaticJson<EopJsonBundle>("data/election-eop.json");
  activitiesCache = data.activities ?? [];
  return activitiesCache;
}

/** Empty at module init for bundle size. Prefer loadEopActivities(). */
export const eopActivities2027: EopActivity[] = [];

export const eopActivitiesByElection: Record<number, EopActivity[]> = {
  2027: eopActivities2027,
};
`;

writeFileSync("lib/data/election-eop.ts", header + m[1] + footer);

writeFileSync(
  "data/national-assembly-members.ts",
  `// data/national-assembly-members.ts
// Full roster lives in public/data/national-assembly-members.json (Worker size).

import { loadStaticJson } from "@/lib/data/load-static-json";

export type Member = {
  id: number;
  name: string;
  constituency: string;
  party: string;
  type: "Constituency" | "Women Representative" | "Nominated";
  slug: string;
};

let cache: Member[] | null = null;

export async function loadNationalAssemblyMembers(): Promise<Member[]> {
  if (cache) return cache;
  cache = await loadStaticJson<Member[]>("data/national-assembly-members.json");
  return cache;
}

/** Empty at module init so the Worker does not embed ~350 MPs. */
export const nationalAssemblyMembers: Member[] = [];
`,
);

console.log(
  "ok",
  readFileSync("lib/data/election-eop.ts").length,
  readFileSync("data/national-assembly-members.ts").length,
);
