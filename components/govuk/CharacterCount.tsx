"use client";

import {
  forwardRef,
  type TextareaHTMLAttributes,
  type ReactNode,
  useId,
} from "react";

type Props = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className" | "id"
> & {
  id?: string;
  name: string;
  label: ReactNode;
  labelClassName?: string;
  hint?: ReactNode;
  errorMessage?: string;
  maxLength: number;
  /** Controlled value (recommended for React forms) */
  value: string;
  rows?: number;
  formGroupClassName?: string;
};

/**
 * GOV.UK Character count (controlled React variant).
 * Uses Design System classes; count text updates live without relying on JS module.
 * @see https://design-system.service.gov.uk/components/character-count/
 */
const GovUKCharacterCount = forwardRef<HTMLTextAreaElement, Props>(
  function GovUKCharacterCount(
    {
      id,
      name,
      label,
      labelClassName = "govuk-label govuk-label--m",
      hint,
      errorMessage,
      maxLength,
      value,
      rows = 5,
      formGroupClassName = "",
      onChange,
      ...textareaProps
    },
    ref
  ) {
    const autoId = useId().replace(/:/g, "");
    const fieldId = id ?? `character-count-${autoId}`;
    const hintId = `${fieldId}-hint`;
    const errorId = `${fieldId}-error`;
    const infoId = `${fieldId}-info`;

    const remaining = maxLength - (value?.length ?? 0);
    const hasError = Boolean(errorMessage) || remaining < 0;

    const describedBy = [
      hint ? hintId : null,
      hasError && errorMessage ? errorId : null,
      infoId,
    ]
      .filter(Boolean)
      .join(" ");

    const formGroupClasses = [
      "govuk-form-group",
      "govuk-character-count",
      hasError ? "govuk-form-group--error" : "",
      formGroupClassName,
    ]
      .filter(Boolean)
      .join(" ");

    const textareaClasses = [
      "govuk-textarea",
      "govuk-js-character-count",
      hasError ? "govuk-textarea--error" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const countMessage =
      remaining >= 0
        ? `You have ${remaining} character${remaining === 1 ? "" : "s"} remaining`
        : `You have ${Math.abs(remaining)} character${Math.abs(remaining) === 1 ? "" : "s"} too many`;

    return (
      <div
        className={formGroupClasses}
        data-module="govuk-character-count"
        data-maxlength={maxLength}
      >
        <label className={labelClassName} htmlFor={fieldId}>
          {label}
        </label>

        {hint && (
          <div id={hintId} className="govuk-hint">
            {hint}
          </div>
        )}

        {errorMessage && (
          <p id={errorId} className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {errorMessage}
          </p>
        )}

        <textarea
          {...textareaProps}
          ref={ref}
          id={fieldId}
          name={name}
          rows={rows}
          className={textareaClasses}
          value={value}
          onChange={onChange}
          aria-describedby={describedBy || undefined}
        />

        <div
          id={infoId}
          className={[
            "govuk-hint",
            "govuk-character-count__message",
            remaining < 0 ? "govuk-error-message" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-live="polite"
        >
          {countMessage}
        </div>
      </div>
    );
  }
);

export default GovUKCharacterCount;
