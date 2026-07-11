"use client";

export default function PrintPageButton() {
  return (
    <button
      type="button"
      className="govuk-link app-button-as-link"
      onClick={() => window.print()}
    >
      Print this page
    </button>
  );
}