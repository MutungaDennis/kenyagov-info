/**
 * UN Classification of the Functions of Government (COFOG)
 * Divisions (2-digit) and groups (3-digit).
 * Stored values use "CODE Label" form for readability in admin and public UI.
 */

export type CofogOption = { code: string; label: string; value: string };

function opt(code: string, label: string): CofogOption {
  return { code, label, value: `${code} ${label}` };
}

/** Level 1 — Divisions */
export const COFOG_DIVISIONS: CofogOption[] = [
  opt("01", "General public services"),
  opt("02", "Defence"),
  opt("03", "Public order and safety"),
  opt("04", "Economic affairs"),
  opt("05", "Environmental protection"),
  opt("06", "Housing and community amenities"),
  opt("07", "Health"),
  opt("08", "Recreation, culture and religion"),
  opt("09", "Education"),
  opt("10", "Social protection"),
];

/** Level 2 — Groups, keyed by division code */
export const COFOG_GROUPS_BY_DIVISION: Record<string, CofogOption[]> = {
  "01": [
    opt("011", "Executive and legislative organs, financial and fiscal affairs, external affairs"),
    opt("012", "Foreign economic aid"),
    opt("013", "General services"),
    opt("014", "Basic research"),
    opt("015", "R&D General public services"),
    opt("016", "General public services n.e.c."),
    opt("017", "Public debt transactions"),
    opt("018", "Transfers of a general character between different levels of government"),
  ],
  "02": [
    opt("021", "Military defence"),
    opt("022", "Civil defence"),
    opt("023", "Foreign military aid"),
    opt("024", "R&D Defence"),
    opt("025", "Defence n.e.c."),
  ],
  "03": [
    opt("031", "Police services"),
    opt("032", "Fire-protection services"),
    opt("033", "Law courts"),
    opt("034", "Prisons"),
    opt("035", "R&D Public order and safety"),
    opt("036", "Public order and safety n.e.c."),
  ],
  "04": [
    opt("041", "General economic, commercial and labour affairs"),
    opt("042", "Agriculture, forestry, fishing and hunting"),
    opt("043", "Fuel and energy"),
    opt("044", "Mining, manufacturing and construction"),
    opt("045", "Transport"),
    opt("046", "Communication"),
    opt("047", "Other industries"),
    opt("048", "R&D Economic affairs"),
    opt("049", "Economic affairs n.e.c."),
  ],
  "05": [
    opt("051", "Waste management"),
    opt("052", "Waste water management"),
    opt("053", "Pollution abatement"),
    opt("054", "Protection of biodiversity and landscape"),
    opt("055", "R&D Environmental protection"),
    opt("056", "Environmental protection n.e.c."),
  ],
  "06": [
    opt("061", "Housing development"),
    opt("062", "Community development"),
    opt("063", "Water supply"),
    opt("064", "Street lighting"),
    opt("065", "R&D Housing and community amenities"),
    opt("066", "Housing and community amenities n.e.c."),
  ],
  "07": [
    opt("071", "Medical products, appliances and equipment"),
    opt("072", "Outpatient services"),
    opt("073", "Hospital services"),
    opt("074", "Public health services"),
    opt("075", "R&D Health"),
    opt("076", "Health n.e.c."),
  ],
  "08": [
    opt("081", "Recreational and sporting services"),
    opt("082", "Cultural services"),
    opt("083", "Broadcasting and publishing services"),
    opt("084", "Religious and other community services"),
    opt("085", "R&D Recreation, culture and religion"),
    opt("086", "Recreation, culture and religion n.e.c."),
  ],
  "09": [
    opt("091", "Pre-primary and primary education"),
    opt("092", "Secondary education"),
    opt("093", "Post-secondary non-tertiary education"),
    opt("094", "Tertiary education"),
    opt("095", "Education not definable by level"),
    opt("096", "Subsidiary services to education"),
    opt("097", "R&D Education"),
    opt("098", "Education n.e.c."),
  ],
  "10": [
    opt("101", "Sickness and disability"),
    opt("102", "Old age"),
    opt("103", "Survivors"),
    opt("104", "Family and children"),
    opt("105", "Unemployment"),
    opt("106", "Housing"),
    opt("107", "Social exclusion n.e.c."),
    opt("108", "R&D Social protection"),
    opt("109", "Social protection n.e.c."),
  ],
};

export function cofogDivisionCode(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  const m = v.match(/^(\d{2})\b/);
  if (m) return m[1];
  const hit = COFOG_DIVISIONS.find(
    (d) =>
      d.value === v ||
      d.label.toLowerCase() === v.toLowerCase() ||
      d.code === v,
  );
  return hit?.code ?? null;
}

export function groupsForDivisionValue(divisionValue: string): CofogOption[] {
  const code = cofogDivisionCode(divisionValue);
  if (!code) return Object.values(COFOG_GROUPS_BY_DIVISION).flat();
  return COFOG_GROUPS_BY_DIVISION[code] || [];
}

/** Ensure current free-text value appears in a select/datalist option list */
export function withCurrentOption(
  options: string[],
  current: string | null | undefined,
): string[] {
  const set = new Set(options.filter(Boolean));
  const c = (current || "").trim();
  if (c) set.add(c);
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function mergeOptionLists(
  ...lists: (readonly string[] | string[] | undefined)[]
): string[] {
  const set = new Set<string>();
  for (const list of lists) {
    for (const v of list || []) {
      const t = String(v).trim();
      if (t) set.add(t);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
