"use client";

export default function PrintPageButton() {
  return (
    <button
      type="button"
      className="govuk-link"
      onClick={() => window.print()}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontSize: "1rem",
      }}
    >
      Print this page
    </button>
  );
}