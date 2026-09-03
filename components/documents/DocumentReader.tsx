// components/documents/DocumentReader.tsx
"use client";

import { useState } from "react";
import { PortableText } from "@portabletext/react";

interface DocumentReaderProps {
  content: any[];
}

export default function DocumentReader({ content }: DocumentReaderProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Helper to extract plain text with markdown-style links for copying
  const extractBlockTextWithLinks = (block: any): string => {
    if (block._type === "block" && block.children) {
      return block.children
        .map((child: any) => {
          if (!child || typeof child.text !== "string") return "";
          const text = child.text.trim();
          if (!text) return "";

          const linkMark = child.marks?.find((m: any) => typeof m === "object" && m._type === "link");
          if (linkMark && linkMark.href) {
            return `[${text}](${linkMark.href})`;
          }

          const internalLink = child.marks?.find((m: any) => typeof m === "object" && m._type === "internalPage");
          if (internalLink && internalLink.href) {
            return `[${text}](https://www.citizenguide.ke${internalLink.href})`;
          }

          return text;
        })
        .join("");
    }

    if (block._type === "constitutionTable" && block.rows) {
      const header = block.headers?.join(" | ") || "";
      const separator = block.headers?.map(() => "---").join(" | ") || "";
      const rows = block.rows.map((r: any) => r.cells?.join(" | ") || "");
      return [header, separator, ...rows].join("\n");
    }

    return "";
  };

  const handleCopy = async (block: any, id: string) => {
    const textToCopy = extractBlockTextWithLinks(block);
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Custom components for robust, GOV.UK-compliant rendering
  const components = {
    block: {
      normal: ({ children, value }: any) => {
        // ✅ SAFEGUARD: Skip corrupted or empty blocks
        const text = value.children?.map((c: any) => (typeof c.text === "string" ? c.text : "")).join("").trim();
        if (text === "[object Object]" || !text) return null;

        const blockId = `block-${value._key}`;
        return (
          <div className="reader-section govuk-!-margin-bottom-4" style={{ position: "relative" }} id={blockId}>
            <button
              onClick={() => handleCopy(value, blockId)}
              className="copy-btn govuk-button govuk-button--secondary govuk-!-font-size-14"
              style={{
                position: "absolute",
                right: "0",
                top: "0",
                opacity: 0,
                transition: "opacity 0.2s",
                padding: "4px 8px",
                marginBottom: "0",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => { if (copiedId !== blockId) e.currentTarget.style.opacity = "0"; }}
              aria-label="Copy this paragraph"
            >
              {copiedId === blockId ? "✓ Copied" : "📋 Copy"}
            </button>
            <p className="govuk-body">{children}</p>
          </div>
        );
      },
      h2: ({ children, value }: any) => {
        const blockId = `block-${value._key}`;
        return (
          <div className="reader-section govuk-!-margin-bottom-4" style={{ position: "relative" }} id={blockId}>
            <button
              onClick={() => handleCopy(value, blockId)}
              className="copy-btn govuk-button govuk-button--secondary govuk-!-font-size-14"
              style={{
                position: "absolute",
                right: "0",
                top: "0",
                opacity: 0,
                transition: "opacity 0.2s",
                padding: "4px 8px",
                marginBottom: "0",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => { if (copiedId !== blockId) e.currentTarget.style.opacity = "0"; }}
              aria-label="Copy this heading"
            >
              {copiedId === blockId ? "✓ Copied" : "📋 Copy"}
            </button>
            <h2 className="govuk-heading-l govuk-!-padding-bottom-2 govuk-!-border-bottom-1">{children}</h2>
          </div>
        );
      },
      h3: ({ children, value }: any) => {
        const blockId = `block-${value._key}`;
        return (
          <div className="reader-section govuk-!-margin-bottom-4" style={{ position: "relative" }} id={blockId}>
            <button
              onClick={() => handleCopy(value, blockId)}
              className="copy-btn govuk-button govuk-button--secondary govuk-!-font-size-14"
              style={{
                position: "absolute",
                right: "0",
                top: "0",
                opacity: 0,
                transition: "opacity 0.2s",
                padding: "4px 8px",
                marginBottom: "0",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => { if (copiedId !== blockId) e.currentTarget.style.opacity = "0"; }}
              aria-label="Copy this heading"
            >
              {copiedId === blockId ? "✓ Copied" : "📋 Copy"}
            </button>
            <h3 className="govuk-heading-m">{children}</h3>
          </div>
        );
      },
      h4: ({ children, value }: any) => {
        const blockId = `block-${value._key}`;
        return (
          <div className="reader-section govuk-!-margin-bottom-4" style={{ position: "relative" }} id={blockId}>
            <h4 className="govuk-heading-s">{children}</h4>
          </div>
        );
      },
      blockquote: ({ children }: any) => (
        <blockquote className="govuk-!-margin-bottom-6" style={{ borderLeft: "4px solid #1d70b8", paddingLeft: "1rem", color: "#505a5f", fontStyle: "italic" }}>
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }: any) => <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-4">{children}</ul>,
      number: ({ children }: any) => <ol className="govuk-list govuk-list--number govuk-!-margin-bottom-4">{children}</ol>,
    },
    listItem: {
      bullet: ({ children }: any) => <li className="govuk-list__item">{children}</li>,
      number: ({ children }: any) => <li className="govuk-list__item">{children}</li>,
    },
    types: {
      constitutionTable: ({ value }: any) => (
        <div className="govuk-!-margin-bottom-6" style={{ overflowX: "auto" }}>
          <table className="govuk-table">
            {value.caption && <caption className="govuk-table__caption">{value.caption}</caption>}
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                {value.headers?.map((header: string, i: number) => (
                  <th key={i} scope="col" className="govuk-table__header">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {value.rows?.map((row: any, rowIndex: number) => (
                <tr key={rowIndex} className="govuk-table__row">
                  {row.cells?.map((cell: string, cellIndex: number) => (
                    <td key={cellIndex} className="govuk-table__cell">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    marks: {
      strong: ({ children }: any) => <strong className="govuk-!-font-weight-bold">{children}</strong>,
      em: ({ children }: any) => <em>{children}</em>,
      underline: ({ children }: any) => <u>{children}</u>,
      "strike-through": ({ children }: any) => <s>{children}</s>,
      code: ({ children }: any) => <code style={{ background: "#f3f2f1", padding: "2px 4px", borderRadius: "3px", fontFamily: "monospace" }}>{children}</code>,
      link: ({ children, value }: any) => (
        <a href={value.href} className="govuk-link" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
    },
  };

  return (
    <div className="document-reader govuk-!-font-size-19" style={{ lineHeight: "1.6" }}>
      <PortableText value={content} components={components} />
      
      <style jsx>{`
        .reader-section:hover .copy-btn { opacity: 1; }
        .document-reader :global(p) { margin-bottom: 1.5rem; }
      `}</style>
    </div>
  );
}