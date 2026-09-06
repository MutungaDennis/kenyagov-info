import type { ReactNode } from "react";
import Link from "next/link";

type ConstitutionShellProps = {
  children: ReactNode;
  title: string;
  caption?: string;
};

export default function ConstitutionShell({
  children,
  title,
  caption,
}: ConstitutionShellProps) {
  return (
    <main className="govuk-width-container govuk-!-padding-top-5 govuk-!-padding-bottom-9">
      <nav
        className="govuk-breadcrumbs govuk-!-margin-bottom-5"
        aria-label="Breadcrumb"
      >
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" href="/">
              Home
            </Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" href="/constitution">
              Constitution
            </Link>
          </li>
        </ol>
      </nav>

      {caption ? <span className="govuk-caption-xl">{caption}</span> : null}

      <h1 className="govuk-heading-xl govuk-!-margin-bottom-6">{title}</h1>

      {children}
    </main>
  );
}