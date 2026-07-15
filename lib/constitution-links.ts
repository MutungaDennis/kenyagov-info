/**
 * Constitution URL helpers — match existing site routes:
 *   /constitution/chapter/{n}
 *   /constitution/chapter/{n}/article/{m}
 *
 * Link text convention (see elections + constitution TOC):
 *   "Article 35 — Access to information"
 *   "Chapter 11 — Devolved government"
 */

export function constitutionChapterHref(chapter: number | string): string {
  return `/constitution/chapter/${chapter}`;
}

export function constitutionArticleHref(
  chapter: number | string,
  article: number | string,
): string {
  return `/constitution/chapter/${chapter}/article/${article}`;
}

/** Standard visible label for an article link */
export function constitutionArticleLabel(
  article: number | string,
  title?: string,
): string {
  return title
    ? `Article ${article} — ${title}`
    : `Article ${article}`;
}

/** Standard visible label for a chapter link */
export function constitutionChapterLabel(
  chapter: number | string,
  title?: string,
): string {
  return title
    ? `Chapter ${chapter} — ${title}`
    : `Chapter ${chapter}`;
}

/**
 * Common Kenya Constitution 2010 anchors used across civic pages.
 * Chapter numbers follow the published structure on this site.
 */
export const constitutionRefs = {
  nationalValues: {
    href: constitutionArticleHref(2, 10),
    label: constitutionArticleLabel(10, "National values and principles of governance"),
  },
  billOfRights: {
    href: constitutionChapterHref(4),
    label: constitutionChapterLabel(4, "The Bill of Rights"),
  },
  accessToInformation: {
    href: constitutionArticleHref(4, 35),
    label: constitutionArticleLabel(35, "Access to information"),
  },
  economicSocialRights: {
    href: constitutionArticleHref(4, 43),
    label: constitutionArticleLabel(43, "Economic and social rights"),
  },
  leadershipIntegrity: {
    href: constitutionChapterHref(6),
    label: constitutionChapterLabel(6, "Leadership and integrity"),
  },
  representationOfThePeople: {
    href: constitutionChapterHref(7),
    label: constitutionChapterLabel(7, "Representation of the people"),
  },
  politicalRights: {
    href: constitutionArticleHref(7, 38),
    label: constitutionArticleLabel(38, "Political rights"),
  },
  legislature: {
    href: constitutionChapterHref(8),
    label: constitutionChapterLabel(8, "The Legislature"),
  },
  executive: {
    href: constitutionChapterHref(9),
    label: constitutionChapterLabel(9, "The Executive"),
  },
  judiciary: {
    href: constitutionChapterHref(10),
    label: constitutionChapterLabel(10, "Judiciary"),
  },
  devolvedGovernment: {
    href: constitutionChapterHref(11),
    label: constitutionChapterLabel(11, "Devolved government"),
  },
  publicFinance: {
    href: constitutionChapterHref(12),
    label: constitutionChapterLabel(12, "Public finance"),
  },
  commissions: {
    href: constitutionChapterHref(15),
    label: constitutionChapterLabel(15, "Commissions and independent offices"),
  },
  /** Fourth Schedule is not an article path on site — link chapter on devolution + constitution hub */
  fourthScheduleNote:
    "Fourth Schedule (distribution of functions between the national government and the county governments)",
} as const;
