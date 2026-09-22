import type { ReactNode } from "react";
import styles from "./ExternalLink.module.css";

type ExternalLinkProps = {
  href: string;
  children: ReactNode;
};

function ExternalLinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={styles.icon}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default function ExternalLink({
  href,
  children,
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      className="govuk-link govuk-link--no-visited-state"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ExternalLinkIcon />
      <span className="govuk-visually-hidden"> (opens in a new tab)</span>
    </a>
  );
}
