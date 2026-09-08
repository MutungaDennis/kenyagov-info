import {
  linkInternalReferences,
} from "@/lib/constitution/link-internal-references";

export type ConstitutionPublicInlineLink = {
  id: string;
  link_type: "person" | "institution" | "law" | "internal" | "external";
  selected_text: string;
  semantic_role?: string | null;
  href: string | null;
  target_name: string;
  external_source_name?: string | null;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isExternalHref(href: string): boolean {
  try {
    const url = new URL(href, "https://citizenguide.ke");
    return url.hostname !== "citizenguide.ke" && !url.hostname.endsWith(".citizenguide.ke");
  } catch {
    return false;
  }
}

function replaceMarker(html: string, link: ConstitutionPublicInlineLink): string {
  if (!link.href) return html;

  const id = escapeRegex(link.id);
  const regex = new RegExp(
    `<span\\s+[^>]*data-constitution-inline-link=["']${id}["'][^>]*>([\\s\\S]*?)<\\/span>`,
    "gi",
  );

  const href = escapeAttribute(link.href);
  const role = escapeAttribute(link.semantic_role || "related");
  const linkType = escapeAttribute(link.link_type);
  const external = link.link_type === "external" || isExternalHref(link.href);

  const suffix = external
    ? ` <span class="constitution-external-link-icon" aria-hidden="true">↗</span><span class="govuk-visually-hidden"> (external website)</span>`
    : "";

  return html.replace(regex, (_full: string, visibleHtml: string) =>
    `<a class="govuk-link constitution-entity-link${external ? " constitution-external-link" : ""}" href="${href}" data-constitution-link-type="${linkType}" data-constitution-relationship="${role}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${visibleHtml}${suffix}</a>`,
  );
}

export function renderLinkedConstitutionHtml(
  html: string,
  links: ConstitutionPublicInlineLink[],
): string {
  let output = html || "";

  for (const link of links) {
    output = replaceMarker(output, link);
  }

  return linkInternalReferences(output);
}