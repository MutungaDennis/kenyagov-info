const scheduleSlugs: Record<string, string> = {
  First: "first",
  Second: "second",
  Third: "third",
  Fourth: "fourth",
  Fifth: "fifth",
  Sixth: "sixth",
};

export function linkInternalConstitutionReferences(html: string) {
  let out = html;

  // The imported HTML contains only trusted constitutional text + our own
  // structural markup. These replacements target visible legal citations.
  out = out.replace(
    /\bArticle\s+(\d{1,3})(\s*\([^<)]*\))?/g,
    (_full, article, suffix = "") =>
      `<a class="govuk-link constitution-internal-link" href="/constitution/article/${article}">Article ${article}${suffix}</a>`,
  );

  out = out.replace(
    /\b(First|Second|Third|Fourth|Fifth|Sixth)\s+Schedule\b/g,
    (_full, ordinal) =>
      `<a class="govuk-link constitution-internal-link" href="/constitution/schedules/${scheduleSlugs[ordinal]}">${ordinal} Schedule</a>`,
  );

  return out;
}
