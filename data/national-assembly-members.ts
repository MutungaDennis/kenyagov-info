// data/national-assembly-members.ts
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
