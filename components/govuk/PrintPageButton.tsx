"use client";

export default function PrintPageButton() {
  return (
    <button
      type="button"
      className="govuk-link print-button"
      onClick={() => window.print()}
    >
      Print this page
    </button>
  );
}