/** Kenya Constitution 2010 — six Schedules */

export type ScheduleMeta = {
  number: number;
  slug: string;
  fullTitle: string;
  title: string;
  citation: string;
  /** Hint for Grok / admin */
  notes: string;
};

export const CONSTITUTION_SCHEDULES: ScheduleMeta[] = [
  {
    number: 1,
    slug: "first",
    fullTitle: "FIRST SCHEDULE",
    title: "Counties",
    citation: "Article 6 (1)",
    notes: "Numbered list of 47 counties — not a wide table.",
  },
  {
    number: 2,
    slug: "second",
    fullTitle: "SECOND SCHEDULE",
    title: "National symbols",
    citation: "Article 9 (2)",
    notes: "Flag description, anthem verses, coat of arms, public seal.",
  },
  {
    number: 3,
    slug: "third",
    fullTitle: "THIRD SCHEDULE",
    title: "National Oaths and affirmations",
    citation: "Articles 74, 141, etc.",
    notes: "Multiple oath texts as separate sections.",
  },
  {
    number: 4,
    slug: "fourth",
    fullTitle: "FOURTH SCHEDULE",
    title: "Distribution of functions between the national government and the county governments",
    citation: "Articles 185(2), 186(1) and 187(2)",
    notes:
      "Two parts (National / County). Often pasted as numbered lists; may include table-like columns.",
  },
  {
    number: 5,
    slug: "fifth",
    fullTitle: "FIFTH SCHEDULE",
    title: "Legislation to be enacted by Parliament",
    citation: "Article 261 (1)",
    notes:
      "Typically a TABLE: Article | Time period — prefer markdown pipe table or [[TABLE]] fence.",
  },
  {
    number: 6,
    slug: "sixth",
    fullTitle: "SIXTH SCHEDULE",
    title: "Transitional and consequential provisions",
    citation: "Article 262",
    notes: "Parts and clauses like chapters; hierarchical numbering.",
  },
];

export function scheduleBySlug(slug: string): ScheduleMeta | undefined {
  return CONSTITUTION_SCHEDULES.find(
    (s) => s.slug === slug.toLowerCase().trim(),
  );
}

export function scheduleByNumber(n: number): ScheduleMeta | undefined {
  return CONSTITUTION_SCHEDULES.find((s) => s.number === n);
}

export function scheduleDocumentId(number: number): string {
  return `constitution-schedule-${number}`;
}
