export type PublicLegislationInlineLink = {
  id: string;
  link_type: "person" | "institution" | "law" | "internal" | "external";
  selected_text: string;
  semantic_role: string | null;
  target_href: string | null;
  target_name: string | null;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderLegislationInlineLinks(
  html: string,
  links: PublicLegislationInlineLink[],
) {
  let output = html || "";

  for (const link of links) {
    if (!link.target_href) continue;

    const id = escapeRegex(link.id);
    const regex = new RegExp(
      `<span\\s+[^>]*data-legislation-inline-link=["']${id}["'][^>]*>([\\s\\S]*?)<\\/span>`,
      "gi",
    );

    const href = escapeAttribute(link.target_href);
    const role = escapeAttribute(link.semantic_role || "references");
    const external =
      link.link_type === "external" || /^https:\/\//i.test(link.target_href);

    output = output.replace(regex, (_full, visibleHtml) => {
      return `<a class="govuk-link legislation-entity-link${
        external ? " legislation-entity-link--external" : ""
      }" href="${href}" data-legislation-relationship="${role}">${visibleHtml}${
        external
          ? '<span class="legislation-external-arrow" aria-hidden="true"> ↗</span><span class="govuk-visually-hidden"> (external website)</span>'
          : ""
      }</a>`;
    });
  }

  return output;
}
