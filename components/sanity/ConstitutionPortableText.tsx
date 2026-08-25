"use client";

import { createContext, useContext } from "react";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import {
  constitutionArticleHref,
  constitutionChapterHref,
} from "@/lib/constitution-links";
import {
  blockPlainText,
  clauseLevelClass,
  detectClauseLevel,
  splitClauseLines,
} from "@/lib/constitution/clause-hierarchy";
import type { LinkPhrase } from "@/lib/constitution/link-phrases";
import {
  linkFirstHitsInParagraph,
  phraseHasDestination,
} from "@/lib/constitution/display-link";

type MarkProps = {
  children?: React.ReactNode;
  value?: Record<string, unknown>;
};

type BlockProps = {
  children?: React.ReactNode;
  value?: {
    children?: Array<{ text?: string; marks?: string[] }>;
    markDefs?: Array<{ _key?: string; _type?: string; [k: string]: unknown }>;
    [k: string]: unknown;
  };
};

const LinkPhrasesContext = createContext<LinkPhrase[]>([]);

function ExternalAffordance({
  href,
  label,
}: {
  href: string;
  label?: string | null;
}) {
  const name = label?.trim() || "official source";
  return (
    <a
      href={href}
      className="app-constitution-external"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Official source: ${name} (opens in a new tab)`}
      title={`Official source: ${name}`}
    >
      <span aria-hidden="true">↗</span>
      <span className="govuk-visually-hidden">
        {" "}
        Official source: {name} (opens in a new tab)
      </span>
    </a>
  );
}

function PhraseLink({
  text,
  phrase,
}: {
  text: string;
  phrase: LinkPhrase;
}) {
  if (
    phrase.constitutionChapter != null &&
    Number.isFinite(Number(phrase.constitutionChapter))
  ) {
    const ch = Number(phrase.constitutionChapter);
    const art =
      phrase.constitutionArticle != null
        ? Number(phrase.constitutionArticle)
        : null;
    const href =
      art != null && Number.isFinite(art)
        ? constitutionArticleHref(ch, art)
        : constitutionChapterHref(ch);
    return (
      <Link href={href} className="govuk-link">
        {text}
      </Link>
    );
  }

  const internal = phrase.internalHref?.trim() || "";
  const external = phrase.externalHref?.trim() || "";

  if (internal.startsWith("/")) {
    return (
      <span className="app-constitution-entity">
        <Link href={internal} className="govuk-link">
          {text}
        </Link>
        {external ? (
          <ExternalAffordance href={external} label={phrase.externalLabel} />
        ) : null}
      </span>
    );
  }

  if (external) {
    return (
      <a
        href={external}
        className="govuk-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {text}
        <span aria-hidden="true"> ↗</span>
      </a>
    );
  }

  return <>{text}</>;
}

function EntityLinkMark({ children, value }: MarkProps) {
  const internalHref =
    typeof value?.internalHref === "string" ? value.internalHref.trim() : "";
  const externalHref =
    typeof value?.externalHref === "string" ? value.externalHref.trim() : "";
  const externalLabel =
    typeof value?.externalLabel === "string" ? value.externalLabel : null;

  if (internalHref && internalHref.startsWith("/")) {
    return (
      <span className="app-constitution-entity">
        <Link href={internalHref} className="govuk-link">
          {children}
        </Link>
        {externalHref ? (
          <ExternalAffordance href={externalHref} label={externalLabel} />
        ) : null}
      </span>
    );
  }

  if (externalHref) {
    return (
      <a
        href={externalHref}
        className="govuk-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
        <span aria-hidden="true"> ↗</span>
      </a>
    );
  }

  return <span>{children}</span>;
}

function ConstitutionRefMark({ children, value }: MarkProps) {
  const chapter = Number(value?.chapter);
  if (!Number.isFinite(chapter)) return <span>{children}</span>;
  const articleRaw = value?.article;
  const article =
    articleRaw == null || articleRaw === "" ? null : Number(articleRaw);
  const href =
    article != null && Number.isFinite(article)
      ? constitutionArticleHref(chapter, article)
      : constitutionChapterHref(chapter);

  return (
    <Link href={href} className="govuk-link">
      {children}
    </Link>
  );
}

/** True if any span in the block already has annotation marks */
function blockHasAnnotations(value?: BlockProps["value"]): boolean {
  const children = value?.children || [];
  const defs = value?.markDefs || [];
  if (!defs.length) return false;
  return children.some((c) => Array.isArray(c.marks) && c.marks.length > 0);
}

function GlossaryParagraph({ text, level }: { text: string; level: number }) {
  const phrases = useContext(LinkPhrasesContext).filter(phraseHasDestination);
  const segments = linkFirstHitsInParagraph(text, phrases);
  return (
    <p
      className={`govuk-body app-constitution-para ${clauseLevelClass(level as 0 | 1 | 2 | 3 | 4)}`}
    >
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <span key={i}>{seg.text}</span>
        ) : (
          <PhraseLink key={i} text={seg.text} phrase={seg.phrase} />
        ),
      )}
    </p>
  );
}

function HierarchicalParagraph({ children, value }: BlockProps) {
  const plain = blockPlainText(value || {});
  const phrases = useContext(LinkPhrasesContext);
  const lines = splitClauseLines(plain);
  const useGlossary =
    phrases.length > 0 && !blockHasAnnotations(value);

  if (lines.length > 1) {
    return (
      <>
        {lines.map((line, i) =>
          useGlossary ? (
            <GlossaryParagraph
              key={i}
              text={line}
              level={detectClauseLevel(line)}
            />
          ) : (
            <p
              key={i}
              className={`govuk-body app-constitution-para ${clauseLevelClass(detectClauseLevel(line))}`}
            >
              {line}
            </p>
          ),
        )}
      </>
    );
  }

  const level = detectClauseLevel(plain);
  if (useGlossary) {
    return <GlossaryParagraph text={plain} level={level} />;
  }

  return (
    <p className={`govuk-body app-constitution-para ${clauseLevelClass(level)}`}>
      {children}
    </p>
  );
}

function ConstitutionTable({
  value,
}: {
  value?: {
    caption?: string;
    headers?: string[];
    rows?: Array<{ cells?: string[]; _key?: string }>;
  };
}) {
  const headers = value?.headers || [];
  const rows = value?.rows || [];
  if (!headers.length) return null;

  return (
    <div className="app-constitution-table-wrap govuk-!-margin-bottom-6">
      {value?.caption ? (
        <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-2">
          {value.caption}
        </p>
      ) : null}
      <table className="govuk-table app-constitution-table">
        <caption className="govuk-table__caption govuk-visually-hidden">
          {value?.caption || "Constitution schedule table"}
        </caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            {headers.map((h, i) => (
              <th key={`${h}-${i}`} scope="col" className="govuk-table__header">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {rows.map((row, ri) => (
            <tr key={row._key || `r-${ri}`} className="govuk-table__row">
              {(row.cells || []).map((cell, ci) =>
                ci === 0 ? (
                  <th
                    key={`c-${ci}`}
                    scope="row"
                    className="govuk-table__header"
                  >
                    {cell}
                  </th>
                ) : (
                  <td key={`c-${ci}`} className="govuk-table__cell">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const components = {
  types: {
    constitutionTable: ConstitutionTable,
    hansardTable: ConstitutionTable,
  },
  block: {
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="govuk-heading-s govuk-!-margin-top-4 govuk-!-margin-bottom-2">
        {children}
      </h3>
    ),
    normal: HierarchicalParagraph,
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <div className="govuk-inset-text">{children}</div>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="govuk-!-font-weight-bold">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => <em>{children}</em>,
    internalLink: ConstitutionRefMark,
    constitutionRef: ConstitutionRefMark,
    internalPage: ({ children, value }: MarkProps) => {
      const href =
        typeof value?.href === "string" && value.href.startsWith("/")
          ? value.href
          : null;
      if (!href) return <span>{children}</span>;
      return (
        <Link href={href} className="govuk-link">
          {children}
        </Link>
      );
    },
    externalUrl: ({ children, value }: MarkProps) => {
      const href = typeof value?.href === "string" ? value.href : "";
      const title =
        typeof value?.title === "string" ? value.title : "external website";
      if (!href) return <span>{children}</span>;
      return (
        <a
          href={href}
          className="govuk-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
          <span aria-hidden="true"> ↗</span>
          <span className="govuk-visually-hidden">
            {" "}
            (opens in a new tab: {title})
          </span>
        </a>
      );
    },
    entityLink: EntityLinkMark,
    link: ({ children, value }: MarkProps) => {
      const href = typeof value?.href === "string" ? value.href : "";
      if (!href) return <span>{children}</span>;
      const external = /^https?:\/\//i.test(href);
      if (external) {
        return (
          <a
            href={href}
            className="govuk-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
            <span aria-hidden="true"> ↗</span>
          </a>
        );
      }
      return (
        <Link href={href} className="govuk-link">
          {children}
        </Link>
      );
    },
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="govuk-list govuk-list--bullet">{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="govuk-list govuk-list--number">{children}</ol>
    ),
  },
};

type Props = {
  content: unknown;
  className?: string;
  /** Enabled glossary phrases — first hit per paragraph is linked */
  linkPhrases?: LinkPhrase[] | null;
};

export default function ConstitutionPortableText({
  content,
  className = "",
  linkPhrases = null,
}: Props) {
  if (!content) return null;

  const phrases = (linkPhrases || []).filter(
    (p) => p.enabled !== false && phraseHasDestination(p),
  );

  if (typeof content === "string") {
    return (
      <LinkPhrasesContext.Provider value={phrases}>
        <div className={`govuk-body ${className}`}>
          {content.split(/\n\s*\n/).map((para, i) => (
            <GlossaryParagraph
              key={i}
              text={para}
              level={detectClauseLevel(para)}
            />
          ))}
        </div>
      </LinkPhrasesContext.Provider>
    );
  }

  return (
    <LinkPhrasesContext.Provider value={phrases}>
      <div className={`app-constitution-prose ${className}`}>
        <PortableText
          value={content as never}
          components={components as never}
        />
      </div>
    </LinkPhrasesContext.Provider>
  );
}
