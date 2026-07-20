/**
 * Honorific name titles + social media platforms for leaders.
 * Job office (MP, CS) is separate — stored on leaders.title / leader_roles.title.
 */

export const NAME_TITLE_OPTIONS = [
  { value: "H.E.", label: "H.E. (His/Her Excellency)" },
  { value: "Rt. Hon.", label: "Rt. Hon." },
  { value: "Hon.", label: "Hon." },
  { value: "Sen.", label: "Sen." },
  { value: "Prof.", label: "Prof." },
  { value: "Dr.", label: "Dr." },
  { value: "Eng.", label: "Eng." },
  { value: "Arch.", label: "Arch." },
  { value: "Rev.", label: "Rev." },
  { value: "Pastor", label: "Pastor" },
  { value: "Bishop", label: "Bishop" },
  { value: "Amb.", label: "Amb. (Ambassador)" },
  { value: "Gen.", label: "Gen." },
  { value: "Lt. Gen.", label: "Lt. Gen." },
  { value: "Maj. Gen.", label: "Maj. Gen." },
  { value: "Col.", label: "Col." },
  { value: "Mr.", label: "Mr." },
  { value: "Mrs.", label: "Mrs." },
  { value: "Ms.", label: "Ms." },
  { value: "Miss", label: "Miss" },
  { value: "Madam", label: "Madam" },
] as const;

/** Display order when multiple titles selected (e.g. Hon. Prof. Dr.) */
const TITLE_ORDER = NAME_TITLE_OPTIONS.map((t) => t.value);

/**
 * Kenyan national honours — post-nominals AFTER the name
 * (e.g. Hon. Jane Doe, E.G.H., O.G.W.).
 * Order follows customary precedence (highest first).
 */
export const NATIONAL_HONOUR_OPTIONS = [
  {
    value: "C.G.H.",
    label: "C.G.H. — Chief of the Order of the Golden Heart",
    order: 1,
  },
  {
    value: "E.G.H.",
    label: "E.G.H. — Elder of the Order of the Golden Heart",
    order: 2,
  },
  {
    value: "M.G.H.",
    label: "M.G.H. — Moran of the Order of the Golden Heart",
    order: 3,
  },
  {
    value: "C.B.S.",
    label: "C.B.S. — Chief of the Order of the Burning Spear",
    order: 4,
  },
  {
    value: "E.B.S.",
    label: "E.B.S. — Elder of the Order of the Burning Spear",
    order: 5,
  },
  {
    value: "M.B.S.",
    label: "M.B.S. — Moran of the Order of the Burning Spear",
    order: 6,
  },
  {
    value: "O.G.W.",
    label: "O.G.W. — Order of the Grand Warrior",
    order: 7,
  },
  {
    value: "H.S.C.",
    label: "H.S.C. — Head of State's Commendation",
    order: 8,
  },
  {
    value: "H.S.C. (Mil.)",
    label: "H.S.C. (Military Division)",
    order: 9,
  },
  {
    value: "H.S.C. (Civ.)",
    label: "H.S.C. (Civilian Division)",
    order: 10,
  },
  {
    value: "D.C.O.",
    label: "D.C.O. — Distinguished Conduct Order",
    order: 11,
  },
  {
    value: "D.S.M.",
    label: "D.S.M. — Distinguished Service Medal",
    order: 12,
  },
  {
    value: "S.S.",
    label: "S.S. — Silver Star",
    order: 13,
  },
  {
    value: "Uzalendo",
    label: "Uzalendo Award",
    order: 14,
  },
  {
    value: "Uhodari",
    label: "Uhodari Medal",
    order: 15,
  },
] as const;

const HONOUR_ORDER = new Map(
  NATIONAL_HONOUR_OPTIONS.map((h) => [h.value, h.order]),
);

/** Aliases people type → canonical post-nominal */
const HONOUR_ALIASES: Record<string, string> = {
  cgh: "C.G.H.",
  "c.g.h": "C.G.H.",
  "c.g.h.": "C.G.H.",
  egh: "E.G.H.",
  "e.g.h": "E.G.H.",
  "e.g.h.": "E.G.H.",
  mgh: "M.G.H.",
  "m.g.h": "M.G.H.",
  "m.g.h.": "M.G.H.",
  cbs: "C.B.S.",
  "c.b.s": "C.B.S.",
  "c.b.s.": "C.B.S.",
  ebs: "E.B.S.",
  "e.b.s": "E.B.S.",
  "e.b.s.": "E.B.S.",
  mbs: "M.B.S.",
  "m.b.s": "M.B.S.",
  "m.b.s.": "M.B.S.",
  ogw: "O.G.W.",
  "o.g.w": "O.G.W.",
  "o.g.w.": "O.G.W.",
  hsc: "H.S.C.",
  "h.s.c": "H.S.C.",
  "h.s.c.": "H.S.C.",
  dco: "D.C.O.",
  dsm: "D.S.M.",
  cmb: "C.B.S.", // common mis-type for CBS
};

export function normalizeHonourCode(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  const key = t.toLowerCase().replace(/\s+/g, "");
  if (HONOUR_ALIASES[key]) return HONOUR_ALIASES[key];
  // Already canonical?
  const hit = NATIONAL_HONOUR_OPTIONS.find(
    (h) => h.value.toLowerCase() === t.toLowerCase(),
  );
  if (hit) return hit.value;
  return t; // custom award as typed
}

/** Parse national_honours jsonb array / string */
export function parseNationalHonours(raw: unknown): string[] {
  const list = parseNameTitles(raw); // same array/string parsing
  return sortNationalHonours(
    list.map(normalizeHonourCode).filter(Boolean),
  );
}

export function sortNationalHonours(codes: string[]): string[] {
  return [...new Set(codes)].sort((a, b) => {
    const oa = HONOUR_ORDER.get(a as (typeof NATIONAL_HONOUR_OPTIONS)[number]["value"]);
    const ob = HONOUR_ORDER.get(b as (typeof NATIONAL_HONOUR_OPTIONS)[number]["value"]);
    const ra = oa ?? 999;
    const rb = ob ?? 999;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
}

/** Post-nominals string: "E.G.H., O.G.W." */
export function formatNationalHonoursSuffix(codes: string[]): string {
  const sorted = sortNationalHonours(codes);
  return sorted.join(", ");
}

export const SOCIAL_PLATFORM_OPTIONS = [
  { value: "x", label: "X (Twitter)" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "threads", label: "Threads" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
  { value: "other", label: "Other" },
] as const;

export type SocialLink = {
  platform: string;
  url: string;
};

/** Parse name_titles from jsonb array, string, or comma-separated. */
export function parseNameTitles(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((t) => String(t).trim())
      .filter(Boolean)
      .filter((t, i, arr) => arr.indexOf(t) === i);
  }
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return [];
    try {
      const p = JSON.parse(t);
      if (Array.isArray(p)) return parseNameTitles(p);
    } catch {
      /* plain text */
    }
    return t
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/** Stable order for display: Hon. before Prof. before Dr., etc. */
export function sortNameTitles(titles: string[]): string[] {
  return [...titles].sort((a, b) => {
    const ia = TITLE_ORDER.indexOf(a as (typeof TITLE_ORDER)[number]);
    const ib = TITLE_ORDER.indexOf(b as (typeof TITLE_ORDER)[number]);
    const ra = ia === -1 ? 999 : ia;
    const rb = ib === -1 ? 999 : ib;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
}

export function formatNameTitlesPrefix(titles: string[]): string {
  return sortNameTitles(titles).join(" ");
}

/**
 * Social media: prefer array of {platform, url}; also accept Record platform→url.
 */
export function parseSocialLinks(raw: unknown): SocialLink[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    try {
      return parseSocialLinks(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const o = item as Record<string, unknown>;
        const platform = String(o.platform || o.network || "").trim().toLowerCase();
        const url = String(o.url || o.href || o.link || "").trim();
        if (!platform || !url) return null;
        return { platform, url };
      })
      .filter((x): x is SocialLink => Boolean(x));
  }
  if (typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>)
      .filter(([, url]) => url && String(url).trim())
      .map(([platform, url]) => ({
        platform: platform.toLowerCase(),
        url: String(url).trim(),
      }));
  }
  return [];
}

/** Store as object for DB compatibility with existing social_media jsonb. */
export function socialLinksToRecord(
  links: SocialLink[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const link of links) {
    const p = link.platform.trim().toLowerCase();
    const u = link.url.trim();
    if (p && u) out[p] = u;
  }
  return out;
}

export function socialPlatformLabel(platform: string): string {
  const key = platform.toLowerCase();
  const hit = SOCIAL_PLATFORM_OPTIONS.find((p) => p.value === key);
  if (hit) return hit.label;
  if (key === "twitter") return "X (Twitter)";
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

export function normalizeSocialUrl(url: string): string {
  const u = url.trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}
