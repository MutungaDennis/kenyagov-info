import Link from "next/link";

type Props = {
  /** Extra context line, e.g. "This page summarises an Act of Parliament." */
  context?: string;
  className?: string;
};

/**
 * Compact YMYL / civic trust signal for AI crawlers and humans.
 * Not a substitute for the full /disclaimer page.
 */
export default function CivicDisclaimer({ context, className = "" }: Props) {
  return (
    <div
      className={`govuk-inset-text govuk-!-margin-top-2 govuk-!-margin-bottom-4 ${className}`.trim()}
      data-civic-disclaimer="true"
    >
      {context ? <p className="govuk-body">{context}</p> : null}
      <p className="govuk-body govuk-!-margin-bottom-0">
        <strong>CitizenGuide.KE</strong> is an independent civic reference — not
        an official Government of Kenya website and not a substitute for the{" "}
        <Link href="/kenya-gazette" className="govuk-link">
          Kenya Gazette
        </Link>{" "}
        or agency portals. See the{" "}
        <Link href="/disclaimer" className="govuk-link">
          full disclaimer
        </Link>
        .
      </p>
    </div>
  );
}
