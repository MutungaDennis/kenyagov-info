"use client";

import { PortableText } from "@portabletext/react";
import Link from "next/link";

type MarkProps = {
  children?: React.ReactNode;
  value?: Record<string, unknown>;
};

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

const components = {
  marks: {
    strong: ({ children }: MarkProps) => <strong>{children}</strong>,
    em: ({ children }: MarkProps) => <em>{children}</em>,
    internalPage: ({ children, value }: MarkProps) => {
      const href = String(value?.href || "");
      if (!href.startsWith("/")) return <>{children}</>;
      return (
        <Link href={href} className="govuk-link">
          {children}
        </Link>
      );
    },
    externalUrl: ({ children, value }: MarkProps) => {
      const href = String(value?.href || "");
      if (!href) return <>{children}</>;
      return (
        <>
          <a
            href={href}
            className="govuk-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
          <ExternalAffordance
            href={href}
            label={value?.title ? String(value.title) : null}
          />
        </>
      );
    },
    entityLink: ({ children, value }: MarkProps) => {
      const internal = value?.internalHref
        ? String(value.internalHref)
        : "";
      const external = value?.externalHref
        ? String(value.externalHref)
        : "";
      return (
        <>
          {internal.startsWith("/") ? (
            <Link href={internal} className="govuk-link">
              {children}
            </Link>
          ) : external ? (
            <a
              href={external}
              className="govuk-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ) : (
            children
          )}
          {external ? (
            <ExternalAffordance
              href={external}
              label={
                value?.externalLabel ? String(value.externalLabel) : null
              }
            />
          ) : null}
        </>
      );
    },
    serviceRef: ({ children, value }: MarkProps) => {
      // Resolved slug may be nested depending on query; fall back to plain text
      const slug =
        (value?.service as { slug?: string } | undefined)?.slug ||
        (value as { slug?: string })?.slug;
      if (!slug) return <>{children}</>;
      return (
        <Link href={`/${slug}`} className="govuk-link">
          {children}
        </Link>
      );
    },
  },
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="govuk-body">{children}</p>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="govuk-heading-s">{children}</h3>
    ),
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

export default function ServicePortableText({
  value,
}: {
  value: unknown;
}) {
  if (!Array.isArray(value) || value.length === 0) return null;
  return (
    <div className="app-service-body">
      <PortableText value={value as never} components={components as never} />
    </div>
  );
}
