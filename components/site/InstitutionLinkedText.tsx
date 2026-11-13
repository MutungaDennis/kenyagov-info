import Link from "next/link";
import type { ReactNode } from "react";

export type InstitutionRecord = {
  id: string | number;
  slug: string;
  name: string;
  short_name?: string | null;
  official_name?: string | null;
  former_names?: unknown;
  aliases?: unknown;
};

type InstitutionTerm = {
  id: string | number;
  label: string;
  href: string;
  priority: number;
};

export type InstitutionMatcher = {
  pattern: RegExp | null;
  termsByLabel: Map<string, InstitutionTerm>;
  termsById: Map<string, InstitutionTerm>;
};

function valuesFrom(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    // Plain-text aliases are supported alongside JSON and Postgres arrays.
  }

  return [value];
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildInstitutionMatcher(
  institutions: InstitutionRecord[],
): InstitutionMatcher {
  const termsByLabel = new Map<string, InstitutionTerm>();
  const termsById = new Map<string, InstitutionTerm>();

  for (const institution of institutions) {
    if (!institution.slug || !institution.name) continue;

    const href = `/government/institutions/${encodeURIComponent(institution.slug)}`;
    const byId = {
      id: institution.id,
      label: institution.name,
      href,
      priority: 0,
    };
    termsById.set(String(institution.id), byId);

    const labels = [
      { value: institution.name, priority: 0 },
      { value: institution.official_name, priority: 1 },
      { value: institution.short_name, priority: 2 },
      ...valuesFrom(institution.former_names).map((value) => ({ value, priority: 3 })),
      ...valuesFrom(institution.aliases).map((value) => ({ value, priority: 4 })),
    ];

    for (const { value, priority } of labels) {
      const label = value?.trim();
      if (!label || label.length < 3) continue;

      const key = label.toLocaleLowerCase("en");
      const previous = termsByLabel.get(key);
      if (!previous || priority < previous.priority) {
        termsByLabel.set(key, { id: institution.id, label, href, priority });
      }
    }
  }

  const terms = [...termsByLabel.values()].sort(
    (a, b) => b.label.length - a.label.length || a.label.localeCompare(b.label),
  );
  const pattern = terms.length
    ? new RegExp(
        `(?<![\\p{L}\\p{N}])(?:${terms.map((term) => escapeRegExp(term.label)).join("|")})(?![\\p{L}\\p{N}])`,
        "giu",
      )
    : null;

  return { pattern, termsByLabel, termsById };
}

type Props = {
  text: string | null | undefined;
  matcher: InstitutionMatcher;
  institutionId?: string | number | null;
};

export default function InstitutionLinkedText({
  text,
  matcher,
  institutionId,
}: Props) {
  if (!text) return null;

  const directInstitution = institutionId
    ? matcher.termsById.get(String(institutionId))
    : undefined;
  if (directInstitution) {
    return <Link href={directInstitution.href}>{text}</Link>;
  }

  if (!matcher.pattern) return text;

  const matches: { start: number; end: number; term: InstitutionTerm }[] = [];
  for (const match of text.matchAll(matcher.pattern)) {
    const term = matcher.termsByLabel.get(match[0].toLocaleLowerCase("en"));
    if (term) {
      matches.push({ start: match.index, end: match.index + match[0].length, term });
    }
  }

  if (!matches.length) return text;

  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const [index, item] of matches.entries()) {
    if (item.start < cursor) continue;
    if (item.start > cursor) nodes.push(text.slice(cursor, item.start));
    nodes.push(
      <Link href={item.term.href} key={`${item.start}-${index}`}>
        {text.slice(item.start, item.end)}
      </Link>,
    );
    cursor = item.end;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));

  return <>{nodes}</>;
}
