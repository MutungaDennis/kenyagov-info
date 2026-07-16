"use client";

/**
 * GOV.UK-style “Print this page” control.
 * Hidden when printing (govuk-!-display-none-print).
 * @see https://design-system.service.gov.uk/styles/page-template/
 */
export default function PrintPageButton({
  className = "",
  label = "Print this page",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={`app-print-link govuk-!-display-none-print govuk-!-margin-bottom-6 ${className}`.trim()}
    >
      <button
        type="button"
        className="govuk-link govuk-body-s app-print-link__button app-button-as-link"
        data-module="print-link"
        onClick={() => {
          if (typeof window !== "undefined") window.print();
        }}
      >
        {label}
      </button>
    </div>
  );
}
