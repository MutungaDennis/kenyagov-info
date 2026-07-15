import Link from "next/link";

type Props = {
  tag?: string;
};

/**
 * Site-wide GOV.UK phase banner.
 * Mount once in the page template (layout), not on individual pages.
 */
export default function GovUKPhaseBanner({ tag = "Beta" }: Props) {
  return (
    <div className="govuk-phase-banner">
      <p className="govuk-phase-banner__content">
        <strong className="govuk-tag govuk-phase-banner__content__tag">
          {tag}
        </strong>
        <span className="govuk-phase-banner__text">
          This is an independent new website (not a government service) — your{" "}
          <Link className="govuk-link" href="/feedback">
            feedback
          </Link>{" "}
          will help us improve it.
        </span>
      </p>
    </div>
  );
}
