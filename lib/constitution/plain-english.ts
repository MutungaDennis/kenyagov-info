export type ChapterPlainEnglishOverride = {
  chapter: number;
  showPlainEnglish: boolean;
};

export type ConstitutionSettings = {
  _id?: string;
  showPlainEnglishGlobal?: boolean | null;
  chapterPlainEnglish?: ChapterPlainEnglishOverride[] | null;
};

/**
 * Resolve whether Plain English should appear for a chapter.
 * Per-chapter override wins when present; otherwise global (default true).
 */
export function resolveShowPlainEnglish(
  settings: ConstitutionSettings | null | undefined,
  chapter: number,
): boolean {
  const overrides = settings?.chapterPlainEnglish || [];
  const match = overrides.find(
    (o) => Number(o.chapter) === Number(chapter),
  );
  if (match && typeof match.showPlainEnglish === "boolean") {
    return match.showPlainEnglish;
  }
  if (typeof settings?.showPlainEnglishGlobal === "boolean") {
    return settings.showPlainEnglishGlobal;
  }
  return true;
}

export const CONSTITUTION_SETTINGS_ID = "constitutionSettings";
