// lib/data/ministers.ts
// Full biographies live in public/data/ministers.json (keeps Worker under CF Free limit).

import { loadStaticJson } from "@/lib/data/load-static-json";

export interface Assignment {
  roleTitle: string;
  department?: string;
  departmentSlug?: string;
  isExecutiveOffice?: boolean;
}

export interface CabinetOfficial {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  fullName: string;
  biography: string;
  responsibilities: string[];
  education?: string[];
  politicalCareer?: string[];
  personalLife?: string;
  assignments: Assignment[];
}

export const executiveLeadershipIds = [
  "william-ruto",
  "kithure-kindiki",
  "musalia-mudavadi",
];

export const cabinetSecretariesIds = [
  "musalia-mudavadi",
  "onesimus-kipchumba-murkomen",
  "john-mbadi-ngongo",
  "aden-duale",
  "soipan-tuya",
  "hassan-ali-joho",
  "julius-migos-ogamba",
  "alice-wahome",
  "wycliffe-ambetsa-oparanya",
  "alfred-mutua",
  "rebecca-miano",
  "salim-mvurya",
  "davis-chirchir",
  "eric-muriithi-muuga",
  "deborah-mulongo-barasa",
  "lee-maiyani-kinyanjui",
  "mutahi-kagwe",
  "james-opiyo-wandayi",
  "william-kabogo-gitau",
  "geoffrey-kiringa-ruku",
  "beatrice-asukul-moe",
];

export const alsoAttendsCabinetIds = ["dorcas-oduor", "mercy-kiiru-wanjau"];

let registryCache: Record<string, CabinetOfficial> | null = null;

export async function loadOfficialsRegistry(): Promise<
  Record<string, CabinetOfficial>
> {
  if (registryCache) return registryCache;
  registryCache = await loadStaticJson<Record<string, CabinetOfficial>>(
    "data/ministers.json",
  );
  return registryCache;
}

/**
 * Empty at module init so biographies are not embedded in the Worker.
 * Prefer loadOfficialsRegistry() or client fetch of /data/ministers.json.
 */
export const officialsRegistry: Record<string, CabinetOfficial> = {};
