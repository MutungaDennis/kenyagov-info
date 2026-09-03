// components/documents/CopyTextButton.tsx
"use client";

import { useState } from "react";

export default function CopyTextButton({ 
  fullText, 
  summary 
}: { 
  fullText: any[]; 
  summary: string;
}) {
  const [copied, setCopied] = useState(false);

  const extractTextWithLinks = (blocks: any[]): string => {
    return blocks
      .map((block: any) => {
        if (block._type === "block" && block.children) {
          return block.children
            .map((child: any) => {
              if (!child.text) return "";
              
              // Check if this span has link marks
              const linkMark = child.marks?.find((m: any) => 
                typeof m === 'object' && m._type === 'link'
              );
              
              if (linkMark && linkMark.href) {
                // Preserve link in markdown format
                return `[${child.text}](${linkMark.href})`;
              }
              
              // Check for internal page references
              const internalLink = child.marks?.find((m: any) => 
                typeof m === 'object' && m._type === 'internalPage'
              );
              
              if (internalLink && internalLink.href) {
                const fullUrl = `https://www.citizenguide.ke${internalLink.href}`;
                return `[${child.text}](${fullUrl})`;
              }
              
              // Check for entity links
              const entityLink = child.marks?.find((m: any) => 
                typeof m === 'object' && m._type === 'entityLink'
              );
              
              if (entityLink) {
                const href = entityLink.internalHref || entityLink.externalHref;
                if (href) {
                  const fullUrl = href.startsWith('/') 
                    ? `https://www.citizenguide.ke${href}` 
                    : href;
                  return `[${child.text}](${fullUrl})`;
                }
              }
              
              return child.text;
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
      })
      .filter(Boolean)
      .join("\n\n") || summary;
  };

  const handleCopy = async () => {
    const textToCopy = extractTextWithLinks(fullText);
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button 
      onClick={handleCopy}
      className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
      data-module="govuk-button"
      aria-label="Copy full document text to clipboard"
    >
      {copied ? (
        <>
          <span aria-hidden="true">✓</span> Copied to clipboard
        </>
      ) : (
        <>
          <span aria-hidden="true">📋</span> Copy full text
        </>
      )}
    </button>
  );
}