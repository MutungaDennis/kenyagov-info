import Link from "next/link";
import type { ReactNode } from "react";
import ExternalLink from "@/components/site/ExternalLink";

type Props = {
  text: string;
  className?: string;
};

const linkPattern = /\[((?:\\.|[^\]])+)\]\(([^)\s]+)\)/g;

function safeLinkTarget(href: string): "internal" | "external" | null {
  if (/^\/government\/institutions\/(?!\/|\\)[^\s]*$/i.test(href)) {
    return "internal";
  }

  try {
    return new URL(href).protocol === "https:" ? "external" : null;
  } catch {
    return null;
  }
}

function renderInlineLinks(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  linkPattern.lastIndex = 0;
  while ((match = linkPattern.exec(text)) !== null) {
    const target = safeLinkTarget(match[2]);
    if (!target) continue;

    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const label = match[1].replace(/\\([\\[\]])/g, "$1");
    const link = target === "external" ? (
      <ExternalLink href={match[2]} key={`bio-link-${index}`}>
        {label}
      </ExternalLink>
    ) : (
      <Link href={match[2]} className="govuk-link" key={`bio-link-${index}`}>
        {label}
      </Link>
    );

    nodes.push(link);
    cursor = linkPattern.lastIndex;
    index += 1;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export default function LinkedBiography({ text, className = "govuk-body" }: Props) {
  return (
    <>
      {text.split(/\n\n+/).map((paragraph, index) => (
        <p key={`bio-paragraph-${index}`} className={className}>
          {renderInlineLinks(paragraph)}
        </p>
      ))}
    </>
  );
}
