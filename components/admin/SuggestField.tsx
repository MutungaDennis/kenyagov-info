"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useMemo } from "react";
import { mergeOptionLists, withCurrentOption } from "@/lib/institutions/cofog";

type Props = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  /** Seed options (static catalogue) */
  options?: readonly string[] | string[];
  /** Values already used in the database (grow the list after save) */
  dbOptions?: readonly string[] | string[];
  hint?: string;
  placeholder?: string;
  required?: boolean;
};

/**
 * Combobox-style field: type freely or pick a suggestion.
 * New values saved on the institution reappear next time via dbOptions.
 */
export default function SuggestField({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  dbOptions = [],
  hint,
  placeholder,
  required,
}: Props) {
  const listId = `${id}-suggest-list`;
  const merged = useMemo(
    () =>
      withCurrentOption(mergeOptionLists(options, dbOptions), value),
    [options, dbOptions, value],
  );

  return (
    <div className="govuk-form-group">
      <label className="govuk-label" htmlFor={id}>
        {label}
      </label>
      {hint && <div className="govuk-hint">{hint}</div>}
      <input
        className="govuk-input"
        id={id}
        name={name}
        list={listId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      <datalist id={listId}>
        {merged.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </div>
  );
}

type SelectOrCustomProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  options: readonly string[] | string[];
  dbOptions?: readonly string[] | string[];
  hint?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  children?: ReactNode;
};

/**
 * Select with all known options (static + DB + current). Prefer SuggestField
 * when free-text is common; use this when a fixed list is preferred but
 * historic custom values must still show.
 */
export function ExtensibleSelect({
  id,
  name,
  label,
  value,
  onChange,
  options,
  dbOptions = [],
  hint,
  allowEmpty = true,
  emptyLabel = "— Select —",
}: SelectOrCustomProps) {
  const merged = useMemo(
    () => withCurrentOption(mergeOptionLists(options, dbOptions), value),
    [options, dbOptions, value],
  );

  return (
    <div className="govuk-form-group">
      <label className="govuk-label" htmlFor={id}>
        {label}
      </label>
      {hint && <div className="govuk-hint">{hint}</div>}
      <select
        className="govuk-select"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
      >
        {allowEmpty && <option value="">{emptyLabel}</option>}
        {merged.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <p className="govuk-hint govuk-!-margin-top-1">
        Need a value not listed? Type it in the box below, then save — it will
        appear in this list next time.
      </p>
      <input
        className="govuk-input govuk-!-margin-top-1"
        id={`${id}-custom`}
        name={name}
        value={value}
        onChange={onChange}
        placeholder="Or type a custom value…"
        autoComplete="off"
        aria-label={`${label} custom value`}
      />
    </div>
  );
}
