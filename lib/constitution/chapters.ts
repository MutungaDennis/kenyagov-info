/** Official chapter titles — Constitution of Kenya, 2010 */

export const CONSTITUTION_CHAPTER_TITLES: Record<number, string> = {
  0: "Preamble",
  1: "Sovereignty of the People and Supremacy of this Constitution",
  2: "The Republic",
  3: "Citizenship",
  4: "The Bill of Rights",
  5: "Land and Environment",
  6: "Leadership and Integrity",
  7: "Representation of the People",
  8: "The Legislature",
  9: "The Executive",
  10: "Judiciary",
  11: "Devolved Government",
  12: "Public Finance",
  13: "The Public Service",
  14: "National Security",
  15: "Commissions and Independent Offices",
  16: "Amendment of this Constitution",
  17: "General Provisions",
  18: "Transitional and Consequential Provisions",
};

export function defaultChapterTitle(chapter: number): string {
  return CONSTITUTION_CHAPTER_TITLES[chapter] || `Chapter ${chapter}`;
}
