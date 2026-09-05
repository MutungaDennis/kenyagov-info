type GazetteSearchFormProps = {
  inputId: string;
  defaultValue?: string;
  year?: number;
  issueNumber?: number;
  heading?: string;
  hint?: string;
  compact?: boolean;
};

export default function GazetteSearchForm({
  inputId,
  defaultValue = "",
  year,
  issueNumber,
  heading = "Search the Kenya Gazette",
  hint = "Search notice numbers, people, organisations, laws, places and words appearing in Gazette notices.",
  compact = false,
}: GazetteSearchFormProps) {
  const hintId = `${inputId}-hint`;

  return (
    <form
      action="/kenya-gazette/search"
      method="get"
      role="search"
      className="govuk-!-margin-bottom-6"
    >
      {typeof year === "number" && (
        <input
          type="hidden"
          name="year"
          value={year}
        />
      )}

      {typeof issueNumber === "number" && (
        <input
          type="hidden"
          name="issueNumber"
          value={issueNumber}
        />
      )}

      <div className="govuk-form-group govuk-!-margin-bottom-3">
        <label
          className={
            compact
              ? "govuk-label govuk-label--s"
              : "govuk-label govuk-label--m"
          }
          htmlFor={inputId}
        >
          {heading}
        </label>

        <div id={hintId} className="govuk-hint">
          {hint}
        </div>

        <input
          className="govuk-input"
          id={inputId}
          name="q"
          type="search"
          defaultValue={defaultValue}
          aria-describedby={hintId}
          autoComplete="off"
          spellCheck
        />
      </div>

      <button
        className="govuk-button govuk-!-margin-bottom-0"
        data-module="govuk-button"
        type="submit"
      >
        Search
      </button>
    </form>
  );
}