"use client";

import { useState } from "react";
import {
  emptyServiceForm,
  type ServiceFormState,
} from "./types";

type Props = {
  onStructured: (form: ServiceFormState) => void;
};

export default function ServicesUploadPanel({ onStructured }: Props) {
  const [title, setTitle] = useState("");
  const [portalUrl, setPortalUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const process = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/services/process", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, title, portalUrl }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Grok processing failed");
      }
      const s = json.structured || {};
      const form = emptyServiceForm();
      form.title = String(s.title || title || "");
      form.summary = String(s.summary || "");
      form.processingTime = String(s.processingTime || "");
      form.baseCostLabel = String(s.baseCostLabel || "");
      form.executionMode =
        s.executionMode === "hybrid" || s.executionMode === "manual"
          ? s.executionMode
          : "online";
      form.beforeYouStart = Array.isArray(s.beforeYouStart)
        ? s.beforeYouStart.join("\n")
        : "";
      form.requiredDocuments = Array.isArray(s.requiredDocuments)
        ? s.requiredDocuments.join("\n")
        : "";
      form.timelineGuidancePoints = Array.isArray(s.timelineGuidancePoints)
        ? s.timelineGuidancePoints.join("\n")
        : "";
      form.bodyText = Array.isArray(s.bodyParagraphs)
        ? s.bodyParagraphs.join("\n\n")
        : "";
      form.steps =
        Array.isArray(s.steps) && s.steps.length
          ? s.steps.map(
              (
                step: {
                  stepNumber?: number;
                  stepTitle?: string;
                  stepDescription?: string;
                },
                i: number,
              ) => ({
                stepNumber: step.stepNumber || i + 1,
                stepTitle: String(step.stepTitle || ""),
                stepDescription: String(step.stepDescription || ""),
              }),
            )
          : form.steps;
      form.feesTable = Array.isArray(s.feesTable) ? s.feesTable : [];
      form.physicalVisits = Array.isArray(s.physicalVisits)
        ? s.physicalVisits
        : [];
      form.commonMistakes = Array.isArray(s.commonMistakes)
        ? s.commonMistakes
        : [];
      form.faqs = Array.isArray(s.faqs) ? s.faqs : [];
      form.moreInformationUrl = String(s.moreInformationUrl || "");
      form.transactionPortals =
        Array.isArray(s.transactionPortals) && s.transactionPortals.length
          ? s.transactionPortals
          : portalUrl
            ? [{ portalLabel: "Start on official website", portalUrl }]
            : form.transactionPortals;
      onStructured(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="govuk-heading-l">Paste official guidance</h2>
      <p className="govuk-body">
        Paste text from eCitizen, a ministry site, or an official leaflet. Grok
        will propose a GOV.UK-style structure. You review and save in the editor
        — nothing is published until you save.
      </p>

      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error}</p>
          </div>
        </div>
      )}

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="paste-title">
          Title hint (optional)
        </label>
        <input
          className="govuk-input"
          id="paste-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Apply for a police clearance certificate"
        />
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="paste-portal">
          Known Start now URL (optional)
        </label>
        <input
          className="govuk-input"
          id="paste-portal"
          value={portalUrl}
          onChange={(e) => setPortalUrl(e.target.value)}
          placeholder="https://accounts.ecitizen.go.ke/…"
        />
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="paste-text">
          Pasted guidance
        </label>
        <textarea
          className="govuk-textarea"
          id="paste-text"
          rows={16}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="govuk-button"
        disabled={loading || text.trim().length < 80}
        onClick={() => void process()}
      >
        {loading ? "Structuring with Grok…" : "Structure with Grok"}
      </button>
    </div>
  );
}
