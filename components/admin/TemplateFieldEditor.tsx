"use client";

import { useMemo, useState } from "react";
import { getInstitutionTemplate } from "@/lib/institutions/templates";

type Props = { templateKey: string; value: string; onChange: (value: string) => void };
type FAQ = { question: string; answer: string };

type Drafts = Record<string, string>;

function readData(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function draftsFromValue(value: string, fields: { key: string; kind: "text" | "list" }[]): Drafts {
  const data = readData(value);
  return Object.fromEntries(fields.map((field) => {
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
    const nextData: Record<string, unknown> = {};
    for (const field of template.fields) {
      const draft = nextDrafts[field.key] || "";
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

  return (
    <div className="template-field-editor">
      <div className="govuk-inset-text">
        <strong>{template.name}</strong><br />Complete only the information this facility needs. Existing institution fields are used automatically when these fields are left blank.
      </div>
      {template.fields.map((field) => (
        <div className="govuk-form-group" key={field.key}>
          <label className="govuk-label govuk-label--m" htmlFor={`template-${field.key}`}>{field.label}</label>
          <p className="govuk-hint">{field.description}{field.key === "faqs" ? " Write one per line as: Question | Answer." : ""}</p>
          <textarea
            className="govuk-textarea"
            id={`template-${field.key}`}
            rows={field.kind === "list" ? 4 : 3}
            value={drafts[field.key] || ""}
            onChange={(event) => update(field.key, event.target.value)}
          />
        </div>
      ))}
      <p className="govuk-hint">This editor saves the content for the selected template. You do not need to write JSON.</p>
    </div>
  );
}
