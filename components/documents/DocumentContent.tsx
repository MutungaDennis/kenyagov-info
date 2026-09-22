
import { safeHtml } from "@/lib/safe-html";
import Link from "next/link";
import type { ReactNode } from "react";

export type PublicDocumentSection = {
  id: string;
  parent_id: string | null;
  section_number: string | null;
  heading: string | null;
  body_text: string | null;
  body_html: string | null;
  canonical_path: string | null;
  section_type: string;
};

function anchorFor(section: PublicDocumentSection) {
  return section.canonical_path?.split("#")[1] || `section-${section.id}`;
}

function label(section: PublicDocumentSection) {
  return [section.section_number, section.heading].filter(Boolean).join(" — ");
}

/**
 * Preserve the source wording while making embedded ordered clauses readable.
 * The imported historical PDFs frequently flatten list items such as
 * (i), (ii), (iii), (a), (b), or policy points (1), (2) into one paragraph.
 * We only add visual line breaks before those markers; we do not alter text.
 */
function formatStructuredSourceHtml(html: string) {
  return html
    // Roman numerals: (i) through (xx), etc.
    .replace(/\s+(\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv|xvi|xvii|xviii|xix|xx)\))\s*/gi, "<br />$1 ")
    // Alphabetic sub-items such as (a), (b), (c).
    .replace(/\s+(\([a-h]\))\s*/g, "<br />$1 ")
    // Numbered policy points such as (1) ... (58).
    .replace(/\s+(\((?:[1-9]|[1-5][0-9]|6[0-9])\))\s*/g, "<br />$1 ")
    // Avoid an unnecessary break immediately after an opening paragraph tag.
    .replace(/<p><br\s*\/?>/gi, "<p>");
}

function formatStructuredPlainText(text: string) {
  return text
    .replace(/\s+(\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv|xvi|xvii|xviii|xix|xx)\))\s*/gi, "\n$1 ")
    .replace(/\s+(\([a-h]\))\s*/g, "\n$1 ")
    .replace(/\s+(\((?:[1-9]|[1-5][0-9]|6[0-9])\))\s*/g, "\n$1 ");
}

export function DocumentContents({
  sections,
}: {
  sections: PublicDocumentSection[];
}) {
  const children = new Map<string | null, PublicDocumentSection[]>();

  for (const section of sections) {
    const key = section.parent_id || null;
    children.set(key, [...(children.get(key) || []), section]);
  }

  function render(parent: string | null, depth = 0): ReactNode {
    const rows = children.get(parent) || [];
    if (!rows.length) return null;

    return (
      <ul
        className={
          depth === 0
            ? "govuk-list cg-document-contents"
            : "govuk-list cg-document-contents__nested"
        }
      >
        {rows.map((section) => (
          <li key={section.id}>
            <Link className="govuk-link" href={`#${anchorFor(section)}`}>
              {label(section)}
            </Link>
            {render(section.id, depth + 1)}
          </li>
        ))}
      </ul>
    );
  }

  return <nav aria-label="Document contents">{render(null)}</nav>;
}

export function DocumentReadingText({
  sections,
}: {
  sections: PublicDocumentSection[];
}) {
  if (!sections.length) return null;

  return (
    <>
      <h2 className="govuk-heading-l govuk-!-margin-top-8">
        Read this document
      </h2>

      {sections.map((section) => {
        const Heading = section.section_type === "part" ? "h2" : "h3";

        return (
          <section
            key={section.id}
            id={anchorFor(section)}
            className="cg-document-section govuk-!-margin-bottom-8"
            style={{ scrollMarginTop: "2rem" }}
          >
            <Heading
              className={
                Heading === "h2" ? "govuk-heading-l" : "govuk-heading-m"
              }
            >
              {label(section)}
            </Heading>

            {section.body_html ? (
              <div
                className="cg-document-source-text govuk-body"
                dangerouslySetInnerHTML={{
                  __html: safeHtml(formatStructuredSourceHtml(section.body_html)),
                }}
              />
            ) : section.body_text ? (
              formatStructuredPlainText(section.body_text)
                .split(/\n\s*\n/)
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p className="govuk-body" key={index}>
                    {paragraph.split("\n").map((line, lineIndex) => (
                      <span key={lineIndex}>
                        {lineIndex > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </p>
                ))
            ) : null}
          </section>
        );
      })}
    </>
  );
}
