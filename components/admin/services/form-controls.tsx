"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TextareaHTMLAttributes,
} from "react";

/** Auto-growing textarea — expands with content; user can still drag-resize. */
export function ExpandableTextarea({
  value,
  minRows = 3,
  maxRows = 24,
  className = "govuk-textarea",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string;
  minRows?: number;
  maxRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const style = window.getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight) || 24;
    const padding =
      parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const minH = lineHeight * minRows + padding;
    const maxH = lineHeight * maxRows + padding;
    const next = Math.min(Math.max(el.scrollHeight, minH), maxH);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxH ? "auto" : "hidden";
  }, [minRows, maxRows]);

  useEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      {...rest}
      ref={ref}
      className={className}
      value={value}
      rows={minRows}
      onInput={(e) => {
        resize();
        rest.onInput?.(e);
      }}
      style={{
        ...(typeof rest.style === "object" && rest.style ? rest.style : {}),
        resize: "vertical",
        overflow: "hidden",
        minHeight: `${minRows * 1.5}rem`,
      }}
    />
  );
}

type Option = { id: string; label: string; hint?: string };

/** Checkbox multi-select with filter — avoids Ctrl/Cmd+click. */
export function CheckboxMultiSelect({
  legend,
  hint,
  options,
  selectedIds,
  onChange,
  filterPlaceholder = "Filter…",
}: {
  legend: string;
  hint?: string;
  options: Option[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  filterPlaceholder?: string;
}) {
  const [filter, setFilter] = useState("");
  const filterId = `filter-${legend.replace(/\s+/g, "-").toLowerCase()}`;

  const filtered = options.filter((o) => {
    if (!filter.trim()) return true;
    const q = filter.trim().toLowerCase();
    return (
      o.label.toLowerCase().includes(q) ||
      (o.hint || "").toLowerCase().includes(q)
    );
  });

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <fieldset className="govuk-fieldset">
      <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
        {legend}
      </legend>
      {hint ? <div className="govuk-hint">{hint}</div> : null}
      <div className="govuk-form-group govuk-!-margin-bottom-2">
        <label className="govuk-label govuk-visually-hidden" htmlFor={filterId}>
          Filter
        </label>
        <input
          className="govuk-input govuk-!-width-full"
          id={filterId}
          type="search"
          placeholder={filterPlaceholder}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div
        className="govuk-checkboxes govuk-checkboxes--small"
        style={{
          maxHeight: "16rem",
          overflowY: "auto",
          border: "1px solid #b1b4b6",
          padding: "0.75rem 1rem",
          background: "#fff",
        }}
      >
        {filtered.length === 0 ? (
          <p className="govuk-body-s govuk-!-margin-0">No matches.</p>
        ) : (
          filtered.map((o) => {
            const checked = selectedIds.includes(o.id);
            const inputId = `chk-${filterId}-${o.id}`;
            return (
              <div className="govuk-checkboxes__item" key={o.id}>
                <input
                  className="govuk-checkboxes__input"
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(o.id)}
                />
                <label
                  className="govuk-label govuk-checkboxes__label"
                  htmlFor={inputId}
                >
                  {o.label}
                </label>
                {o.hint ? (
                  <div className="govuk-hint govuk-checkboxes__hint">
                    {o.hint}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
      {selectedIds.length > 0 ? (
        <p className="govuk-body-s govuk-!-margin-top-2">
          <strong>{selectedIds.length}</strong> selected
          {" · "}
          <button
            type="button"
            className="govuk-link"
            onClick={() => onChange([])}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              font: "inherit",
              cursor: "pointer",
            }}
          >
            Clear selection
          </button>
        </p>
      ) : null}
    </fieldset>
  );
}
