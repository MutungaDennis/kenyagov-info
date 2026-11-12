"use client";

import { useMemo, useState } from "react";
import { getInstitutionTemplate } from "@/lib/institutions/templates";
import InstitutionLinkPicker from "@/components/admin/InstitutionLinkPicker";

type Props = { templateKey: string; value: string; onChange: (value: string) => void };
type FAQ = { question: string; answer: string };
type VisitingPeriod = { days: string; hours: string; note?: string };
type TemplateFieldKind = "text" | "list" | "schedule";

type Drafts = Record<string, string>;

function RelatedFacilitiesEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const facilities = value.split("\\n").map((line) => line.trim()).filter(Boolean);
  return (
    <div>
      <InstitutionLinkPicker
        id="template-relatedFacilities-picker"
        label="Add a related facility"
        hint="Search the institution database, then select a facility to add it below."
        valueId=""
        valueLabel=""
        onChange={(pick) => {
          if (!pick.slug) return;
          const entry = `${pick.label} | /government/institutions/${pick.slug}`;
          if (!facilities.some((facility) => facility.endsWith(`| /government/institutions/${pick.slug}`))) {
            onChange([...facilities, entry].join("\\n"));
          }
        }}
      />
      {facilities.length > 0 && (
        <ul className="govuk-list govuk-list--bullet">
          {facilities.map((facility, index) => {
            const [name] = facility.split("|");
            return (
              <li key={`${facility}-${index}`}>
                {name.trim()} {" "}
                <button type="button" className="govuk-link" onClick={() => onChange(facilities.filter((_, itemIndex) => itemIndex !== index).join("\\n"))}>
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function VisitingHoursEditor({ value, onChange }: { value: unknown; onChange: (value: VisitingPeriod[]) => void }) {
  const periods = Array.isArray(value)
    ? value.filter((period): period is VisitingPeriod => Boolean(period && typeof period === "object" && "days" in period && "hours" in period)).map((period) => ({
        days: typeof period.days === "string" ? period.days : "",
        hours: typeof period.hours === "string" ? period.hours : "",
        note: typeof period.note === "string" ? period.note : "",
      }))
    : [];

  const updatePeriod = (index: number, patch: Partial<VisitingPeriod>) => {
    onChange(periods.map((period, periodIndex) => periodIndex === index ? { ...period, ...patch } : period));
  };

  return (
    <div>
      {periods.map((period, index) => (
        <fieldset className="template-visiting-hours__row" key={index}>
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Visiting period {index + 1}</legend>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor={`template-visitingHours-days-${index}`}>Days</label>
            <input className="govuk-input" id={`template-visitingHours-days-${index}`} value={period.days} placeholder="Monday to Friday" onChange={(event) => updatePeriod(index, { days: event.target.value })} />
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor={`template-visitingHours-hours-${index}`}>Visiting times</label>
            <input className="govuk-input" id={`template-visitingHours-hours-${index}`} value={period.hours} placeholder="2pm to 5pm" onChange={(event) => updatePeriod(index, { hours: event.target.value })} />
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor={`template-visitingHours-note-${index}`}>Note (optional)</label>
            <input className="govuk-input" id={`template-visitingHours-note-${index}`} value={period.note || ""} onChange={(event) => updatePeriod(index, { note: event.target.value })} />
          </div>
          <button type="button" className="govuk-button govuk-button--secondary" onClick={() => onChange(periods.filter((_, periodIndex) => periodIndex !== index))}>Remove period</button>
        </fieldset>
      ))}
      <button type="button" className="govuk-button govuk-button--secondary" onClick={() => onChange([...periods, { days: "", hours: "", note: "" }])}>Add visiting period</button>
    </div>
  );
}

function readData(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function draftsFromValue(value: string, fields: { key: string; kind: TemplateFieldKind }[]): Drafts {
  const data = readData(value);
  return Object.fromEntries(fields.map((field) => {
    if (field.kind === "schedule") return [field.key, ""];
    if (field.key === "quickLinks") {
      const links = Array.isArray(data[field.key]) ? (data[field.key] as { label?: string; href?: string }[]) : [];
      return [field.key, links.map((link) => `${link.label || ""} | ${link.href || ""}`).join("\n")];
    }
    if (field.key === "faqs") {
      const faqs = Array.isArray(data[field.key]) ? (data[field.key] as FAQ[]) : [];
      return [field.key, faqs.map((faq) => `${faq.question || ""} | ${faq.answer || ""}`).join("\n")];
    }
    return [field.key, field.kind === "list" ? (Array.isArray(data[field.key]) ? (data[field.key] as unknown[]).map(String).join("\n") : "") : String(data[field.key] || "")];
  }));
}

export default function TemplateFieldEditor({ templateKey, value, onChange }: Props) {
  const template = useMemo(() => getInstitutionTemplate(templateKey), [templateKey]);
  const [drafts, setDrafts] = useState<Drafts>(() => draftsFromValue(value, template.fields));

  if (!template.fields.length) return null;

  const update = (key: string, next: string) => {
    const nextDrafts = { ...drafts, [key]: next };
    setDrafts(nextDrafts);
    const nextData: Record<string, unknown> = { ...readData(value) };
    for (const field of template.fields) {
      if (field.kind === "schedule") continue;
      const draft = nextDrafts[field.key] || "";
      delete nextData[field.key];
      if (field.key === "quickLinks") {
        nextData[field.key] = draft.split("\n").map((item) => { const [label, ...href] = item.split("|"); return { label: label.trim(), href: href.join("|").trim() }; }).filter((link) => link.label && link.href);
      } else if (field.key === "faqs") {
        nextData[field.key] = draft.split("\n").map((item) => {
          const [question, ...answer] = item.split("|");
          return { question: question.trim(), answer: answer.join("|").trim() };
        }).filter((faq) => faq.question && faq.answer);
      } else if (field.kind === "list") {
        nextData[field.key] = draft.split("\n").map((item) => item.trim()).filter(Boolean);
      } else if (draft.trim()) {
        nextData[field.key] = draft;
      }
    }
    onChange(JSON.stringify(nextData, null, 2));
  };

  const updateStructuredField = (key: string, next: unknown) => {
    onChange(JSON.stringify({ ...readData(value), [key]: next }, null, 2));
  };

  return (
    <div className="template-field-editor">
      <div className="govuk-inset-text">
        <strong>{template.name} — additional details</strong><br />These fields add template-specific information. Shared institution fields remain available below and are saved alongside this template data.
      </div>
      {template.fields.map((field) => field.kind === "schedule" ? (
        <fieldset className="govuk-fieldset govuk-!-margin-bottom-4" key={field.key}>
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">{field.label}</legend>
          <p className="govuk-hint">{field.description}</p>
          <VisitingHoursEditor value={readData(value)[field.key]} onChange={(next) => updateStructuredField(field.key, next)} />
        </fieldset>
      ) : (
        <div className="govuk-form-group" key={field.key}>
          <label className="govuk-label govuk-label--m" htmlFor={`template-${field.key}`}>{field.label}</label>
          <p className="govuk-hint">{field.description}{field.key === "faqs" ? " Write one per line as: Question | Answer." : ""}</p>
          {field.key === "relatedFacilities" ? (
            <RelatedFacilitiesEditor value={drafts[field.key] || ""} onChange={(value) => update(field.key, value)} />
          ) : (
            <textarea
              className="govuk-textarea"
              id={`template-${field.key}`}
              rows={field.kind === "list" ? 4 : 3}
              value={drafts[field.key] || ""}
              onChange={(event) => update(field.key, event.target.value)}
            />
          )}
        </div>
      ))}
      <p className="govuk-hint">This editor saves the content for the selected template. You do not need to write JSON.</p>
    </div>
  );
}
