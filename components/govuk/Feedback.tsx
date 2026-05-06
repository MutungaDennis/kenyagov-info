import Link from "next/link";

export default function GovUKFeedback() {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h2 className="govuk-heading-m">Is this page useful?</h2>
        <div className="govuk-button-group">
          <button className="govuk-button govuk-button--secondary" type="button">
            Yes
          </button>
          <button className="govuk-button govuk-button--secondary" type="button">
            No
          </button>
        </div>
        <p className="govuk-body-s govuk-!-margin-top-3">
          <Link href="/feedback" className="govuk-link">Report a problem with this page</Link>
        </p>
      </div>
    </div>
  );
}