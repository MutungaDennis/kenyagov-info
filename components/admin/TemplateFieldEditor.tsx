"use client";

import { useMemo } from "react";
import { getInstitutionTemplate } from "@/lib/institutions/templates";

type Props = { templateKey: string; value: string; onChange: (value: string) => void };

function readData(value: string): Record<string, unknown> {
  try { const parsed = JSON.parse(value || "{}"); return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {}; } catch { return {}; }
}

export default function TemplateFieldEditor({ templateKey, value, onChange }: Props) {
  const template = useMemo(() => getInstitutionTemplate(templateKey), [templateKey]);
  const data = readData(value);
  const update = (key: string, next: unknown) => onChange(JSON.stringify({ ...data, [key]: next }, null, 2));

  if (!template.fields.length) return null;

  return (
    <div className="template-field-editor">
      <div className="govuk-inset-text">
        <strong>{template.name}</strong><br />Complete only the information this facility needs. Existing institution fields are used automatically when these fields are left blank.
      </div>
      {template.fields.map((field) => {
        const current = field.key === "faqs"
          ? (Array.isArray(data[field.key]) ? (data[field.key] as { question?: string; answer?: string }[]).map((faq) => `${faq.question || ""} | ${faq.answer || ""}`).join("\n") : "")
          : field.kind === "list" ? (Array.isArray(data[field.key]) ? (data[field.key] as string[]).join("\n") : "") : String(data[field.key] || "");
        return (
          <div className="govuk-form-group" key={field.key}>
            <label className="govuk-label govuk-label--m" htmlFor={`template-${field.key}`}>{field.label}</label>
            <p className="govuk-hint">{field.description}</p>
            <textarea className="govuk-textarea" id={`template-${field.key}`} rows={field.kind === "list" ? 4 : 3} value={current} onChange={(event) => update(field.key, field.key === "faqs" ? event.target.value.split("\n").map((item) => { const [question, ...answer] = item.split("|"); return { question: question.trim(), answer: answer.join("|").trim() }; }).filter((faq) => faq.question && faq.answer) : field.kind === "list" ? event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) : event.target.value)} />
          </div>
        );
      })}
      <p className="govuk-hint">This editor saves the content for the selected template. You do not need to write JSON.</p>
    </div>
  );
}
