// components/admin/documents/DocumentUploadPanel.tsx
"use client";

import { useState } from "react";
import dynamic from 'next/dynamic';
import { htmlToPortableText } from "@/lib/html-to-portable-text";

const TipTapEditor = dynamic(() => import('./TipTapEditor'), { ssr: false });

type Props = {
  initialMode?: "grok" | "tiptap";
};

export default function DocumentUploadPanel({ initialMode = "grok" }: Props) {
  const [title, setTitle] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [yearPublished, setYearPublished] = useState(new Date().getFullYear().toString());
  const [issuingBody, setIssuingBody] = useState("");
  const [functionalCategory, setFunctionalCategory] = useState("strategic_planning");
  const [archivalCategory, setArchivalCategory] = useState("national_documentation_service");
  const [historicalEra, setHistoricalEra] = useState("constitution_2010");
  const [summary, setSummary] = useState("");
  
  const [pastedText, setPastedText] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [useTipTap, setUseTipTap] = useState(initialMode === "tiptap");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [processed, setProcessed] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleProcess = async () => {
    let payload: any = {
      title: title.trim(),
      referenceNumber: referenceNumber.trim(),
      yearPublished: Number(yearPublished) || new Date().getFullYear(),
      issuingBody: issuingBody.trim(),
      functionalCategory,
      archivalCategory,
      historicalEra,
      summary: summary.trim(),
    };

    if (useTipTap) {
      if (htmlContent.trim().length < 50) {
        setError("Please enter some content in the rich text editor.");
        return;
      }
      const portableText = htmlToPortableText(htmlContent);
      payload = { ...payload, isHtml: true, portableText, text: "" };
    } else {
      if (pastedText.trim().length < 200) {
        setError("Please enter at least ~200 characters of content.");
        return;
      }
      payload = { ...payload, isHtml: false, text: pastedText.trim() };
    }

    setIsProcessing(true);
    setError(null);
    setProcessed(null);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/admin/documents/process", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Processing failed");
      }

      setProcessed(json.processed);
      setTimeout(() => {
        document.getElementById("document-preview")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!processed) {
      setError("Nothing to save — process content first");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/admin/documents/save", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processed),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Save failed");
      }

      setSaveMessage(json.message || `Saved: ${processed.shortTitle}`);
      setProcessed(null);
      setPastedText("");
      setHtmlContent("");
      setTitle("");
      setReferenceNumber("");
      setYearPublished(new Date().getFullYear().toString());
      setIssuingBody("");
      setSummary("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h2 className="govuk-heading-l">Upload Government Publication</h2>
      
      <div className="govuk-radios govuk-!-margin-bottom-6">
        <div className="govuk-radios__item">
          <input 
            className="govuk-radios__input" 
            id="use-grok" 
            name="uploadMethod" 
            type="radio" 
            checked={!useTipTap} 
            onChange={() => setUseTipTap(false)} 
          />
          <label className="govuk-label govuk-radios__label" htmlFor="use-grok">
            <strong>Paste text and let Grok structure it automatically</strong>
          </label>
          <div className="govuk-hint govuk-radios__hint">
            Best for large documents. Grok will extract metadata and format headings, paragraphs, and tables.
          </div>
        </div>
        <div className="govuk-radios__item">
          <input 
            className="govuk-radios__input" 
            id="use-tiptap" 
            name="uploadMethod" 
            type="radio" 
            checked={useTipTap} 
            onChange={() => setUseTipTap(true)} 
          />
          <label className="govuk-label govuk-radios__label" htmlFor="use-tiptap">
            <strong>Use rich text editor to format manually</strong>
          </label>
          <div className="govuk-hint govuk-radios__hint">
            Best for shorter documents or when you want full control over formatting.
          </div>
        </div>
      </div>

      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error}</p>
          </div>
        </div>
      )}

      {saveMessage && (
        <div className="govuk-notification-banner govuk-notification-banner--success" role="status">
          <div className="govuk-notification-banner__header">
            <h2 className="govuk-notification-banner__title">Success</h2>
          </div>
          <div className="govuk-notification-banner__content">
            <p className="govuk-body">{saveMessage}</p>
          </div>
        </div>
      )}

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="doc_title">Document Title *</label>
            <input 
              id="doc_title" 
              className="govuk-input" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Kilifi County Integrated Development Plan 2023-2027" 
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="doc_ref">Reference Number *</label>
            <input 
              id="doc_ref" 
              className="govuk-input" 
              value={referenceNumber} 
              onChange={(e) => setReferenceNumber(e.target.value)} 
              placeholder="e.g. Sessional Paper No. 10 of 1965" 
            />
          </div>
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-quarter">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="doc_year">Year Published</label>
            <input 
              id="doc_year" 
              className="govuk-input" 
              type="number" 
              value={yearPublished} 
              onChange={(e) => setYearPublished(e.target.value)} 
            />
          </div>
        </div>
        <div className="govuk-grid-column-three-quarters">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="doc_issuing">Issuing Body</label>
            <input 
              id="doc_issuing" 
              className="govuk-input" 
              value={issuingBody} 
              onChange={(e) => setIssuingBody(e.target.value)} 
              placeholder="e.g. Ministry of Devolution" 
            />
          </div>
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="doc_func_cat">Functional Category</label>
            <select 
              id="doc_func_cat" 
              className="govuk-select govuk-!-width-full" 
              value={functionalCategory} 
              onChange={(e) => setFunctionalCategory(e.target.value)}
            >
              <option value="investigative_advisory">Investigative & Advisory</option>
              <option value="policy_formulation">Policy Formulation</option>
              <option value="strategic_planning">Strategic Planning</option>
              <option value="statutory_legislative">Statutory & Legislative</option>
            </select>
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="doc_arch_cat">Archival Category</label>
            <select 
              id="doc_arch_cat" 
              className="govuk-select govuk-!-width-full" 
              value={archivalCategory} 
              onChange={(e) => setArchivalCategory(e.target.value)}
            >
              <option value="national_documentation_service">National Documentation Service</option>
              <option value="government_press">Government Press</option>
              <option value="other">Other Public Records</option>
            </select>
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="doc_era">Historical Era</label>
            <select 
              id="doc_era" 
              className="govuk-select govuk-!-width-full" 
              value={historicalEra} 
              onChange={(e) => setHistoricalEra(e.target.value)}
            >
              <option value="post_independence">Post-Independence (1963–1979)</option>
              <option value="market_liberalization">Market Liberalization (1980–2009)</option>
              <option value="constitution_2010">Constitution 2010 Era (2010–Present)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="doc_summary">Brief Summary</label>
        <textarea 
          id="doc_summary" 
          className="govuk-textarea" 
          rows={3} 
          value={summary} 
          onChange={(e) => setSummary(e.target.value)} 
          placeholder="A 2-3 sentence plain-English explanation of the document's purpose." 
        />
      </div>

      <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--m govuk-!-margin-bottom-6" />

      {useTipTap ? (
        <div className="govuk-form-group">
          <label className="govuk-label">Document Content</label>
          <div className="govuk-hint">
            Use the rich text editor to format your document with headings, lists, and tables.
          </div>
          <TipTapEditor content={htmlContent} onChange={setHtmlContent} />
        </div>
      ) : (
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="doc_paste">Document Text</label>
          <div className="govuk-hint">
            Paste the full text. Grok will automatically structure it into paragraphs, headings, and tables.
          </div>
          <textarea 
            id="doc_paste" 
            className="govuk-textarea" 
            rows={20} 
            value={pastedText} 
            onChange={(e) => setPastedText(e.target.value)} 
          />
        </div>
      )}

      <button
        type="button"
        className="govuk-button"
        disabled={isProcessing || (useTipTap ? htmlContent.trim().length < 50 : pastedText.trim().length < 200)}
        onClick={() => void handleProcess()}
      >
        {isProcessing ? "Processing..." : useTipTap ? "Convert to Structured Format" : "Process with Grok"}
      </button>

      {processed && (
        <div id="document-preview" className="govuk-!-margin-top-8">
          <h3 className="govuk-heading-m">Preview</h3>
          <p className="govuk-body">Review the structured content before saving.</p>
          <div className="govuk-inset-text">
            <p className="govuk-body"><strong>Title:</strong> {processed.title}</p>
            <p className="govuk-body"><strong>Reference:</strong> {processed.referenceNumber}</p>
            <p className="govuk-body"><strong>Year:</strong> {processed.yearPublished}</p>
            <p className="govuk-body"><strong>Summary:</strong> {processed.summary}</p>
          </div>
          <button 
            type="button" 
            className="govuk-button" 
            disabled={isSaving} 
            onClick={() => void handleSave()}
          >
            {isSaving ? "Saving..." : "Save to Sanity"}
          </button>
        </div>
      )}
    </div>
  );
}