import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  buttonText?: string;
  onSearch?: () => void;
};

export default function GovUKSearchInput({
  label = "Search",
  buttonText = "Search",
  onSearch,
  ...props
}: Props) {
  return (
    <div className="govuk-form-group">
      {label && (
        <label className="govuk-label govuk-label--m" htmlFor={props.id}>
          {label}
        </label>
      )}
      <div className="govuk-input__wrapper">
        <input
          className="govuk-input govuk-input--width-full"
          type="search"
          {...props}
        />
        <button
          className="govuk-button govuk-!-margin-left-2"
          data-module="govuk-button"
          onClick={onSearch}
          type="button"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}