import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
};

/**
 * External link with accessible new-tab indication (GOV.UK pattern).
 */
export default function ExternalLink({
  href,
  children,
  className = "govuk-link",
}: Props) {
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <span className="govuk-visually-hidden"> (opens in a new tab)</span>
    </a>
  );
}
