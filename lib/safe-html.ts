import sanitizeHtml from "sanitize-html";

/** Shared browser/server allowlist for imported editorial HTML, including previews. */
export function safeHtml(value: string | null | undefined): string {
  return sanitizeHtml(value || "", {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "sup", "sub", "mark", "del", "ins"],
    allowedAttributes: {
      "*": ["class", "id", "title", "lang", "dir", "aria-label", "aria-hidden",
        "data-constitution-inline-link", "data-gazette-inline-link", "data-legislation-inline-link"],
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      td: ["colspan", "rowspan", "headers"],
      th: ["colspan", "rowspan", "scope", "headers"],
      ol: ["start", "type", "reversed"],
      li: ["value"],
    },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https", "http"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: { ...attributes, ...(attributes.target === "_blank" ? { rel: "noopener noreferrer" } : {}) },
      }),
    },
  });
}

export function escapeHtml(value: string | null | undefined): string {
  return (value || "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}
