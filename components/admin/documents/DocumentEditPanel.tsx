// components/admin/documents/DocumentEditPanel.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { htmlToPortableText } from "@/lib/html-to-portable-text";
import { portableTextToHtml } from "@/lib/portable-text-to-html";

const TipTapEditor = dynamic(() => import('./TipTapEditor'), { ssr: false });

type FullDocument = {
  _id: string;
  title: string;
  shortTitle: string;
  slug: string;
  referenceNumber: string;
  yearPublished: number;
  issuingBody: string;
  functionalCategory: string;
  archivalCategory: string;
  historicalEra: string;
  summary: string;
  fullText: any[];
  officialExternalUrl?: string | null;
};

// ✅ Props interface matches what DocumentsHub.tsx expects
type Props = {
  documentId: string;
  onCancel: () => void;
  onSuccess: () => void;
};

export default function DocumentEditPanel({ documentId, onCancel, onSuccess }: Props) {
  const router = useRouter();
  const [doc, setDoc] = useState<FullDocument | null>(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`/api/admin/documents/fetch?id=${documentId}`, { credentials: "include" });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Failed to fetch document");
        
        setDoc(json.document);
        setHtmlContent(portableTextToHtml(json.document.fullText || []));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load document");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoc();
  }, [documentId]);

  const handleSave = async () => {
    if (!doc) return;
    setIsSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const updatedFullText = htmlToPortableText(htmlContent);
      
      const res = await fetch("/api/admin/documents/update", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...doc, fullText: updatedFullText }),
      });
      
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Save failed");
      
      setSaveMessage("Document updated successfully!");
      setTimeout(() => onSuccess(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!doc) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${doc.title}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/documents/delete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doc._id }),
      });
      
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Delete failed");
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setIsDeleting(false);
    }
  };

  const updateDoc = (patch: Partial<FullDocument>) => {
    if (!doc) return;
    setDoc({ ...doc, ...patch });
  };

  if (isLoading) return <p className="govuk-body">Loading document...</p>;
  if (!doc) return <p className="govuk-error-message">{error || "Document not found."}</p>;

  return (
    <div>
      <div className="govuk-!-display-flex govuk-!-justify-content-space-between govuk-!-align-items-center govuk-!-margin-bottom-4">
        <h2 className="govuk-heading-l govuk-!-margin-bottom-0">Edit Document</h2>
        <button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" onClick={onCancel}>
          ← Back to list
        </button>
      </div>

      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <div className="govuk-error-summary__body"><p className="govuk-body">{error}</p></div>
        </div>
      )}

      {saveMessage && (
        <div className="govuk-notification-banner govuk-notification-banner--success" role="status">
          <div className="govuk-notification-banner__header"><h2 className="govuk-notification-banner__title">Success</h2></div>
          <div className="govuk-notification-banner__content"><p className="govuk-body">{saveMessage}</p></div>
        </div>
      )}

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="edit_title">Full Title</label>
            <input id="edit_title" className="govuk-input" value={doc.title} onChange={(e) => updateDoc({ title: e.target.value })} />
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="edit_short_title">Short Title</label>
            <input id="edit_short_title" className="govuk-input" value={doc.shortTitle} onChange={(e) => updateDoc({ shortTitle: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="edit_slug">URL Slug</label>
            <input id="edit_slug" className="govuk-input" value={doc.slug} onChange={(e) => updateDoc({ slug: e.target.value })} />
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="edit_ref">Reference Number</label>
            <input id="edit_ref" className="govuk-input" value={doc.referenceNumber} onChange={(e) => updateDoc({ referenceNumber: e.target.value })} />
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="edit_year">Year Published</label>
            <input id="edit_year" className="govuk-input" type="number" value={doc.yearPublished} onChange={(e) => updateDoc({ yearPublished: Number(e.target.value) })} />
          </div>
        </div>
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="edit_issuing">Issuing Body</label>
        <input id="edit_issuing" className="govuk-input" value={doc.issuingBody} onChange={(e) => updateDoc({ issuingBody: e.target.value })} />
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="edit_func_cat">Functional Category</label>
            <select id="edit_func_cat" className="govuk-select govuk-!-width-full" value={doc.functionalCategory} onChange={(e) => updateDoc({ functionalCategory: e.target.value })}>
              <option value="investigative_advisory">Investigative & Advisory</option>
              <option value="policy_formulation">Policy Formulation</option>
              <option value="strategic_planning">Strategic Planning</option>
              <option value="statutory_legislative">Statutory & Legislative</option>
            </select>
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="edit_arch_cat">Archival Category</label>
            <select id="edit_arch_cat" className="govuk-select govuk-!-width-full" value={doc.archivalCategory} onChange={(e) => updateDoc({ archivalCategory: e.target.value })}>
              <option value="national_documentation_service">National Documentation Service</option>
              <option value="government_press">Government Press</option>
              <option value="other">Other Public Records</option>
            </select>
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="edit_era">Historical Era</label>
            <select id="edit_era" className="govuk-select govuk-!-width-full" value={doc.historicalEra} onChange={(e) => updateDoc({ historicalEra: e.target.value })}>
              <option value="post_independence">Post-Independence (1963–1979)</option>
              <option value="market_liberalization">Market Liberalization (1980–2009)</option>
              <option value="constitution_2010">Constitution 2010 Era (2010–Present)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="edit_summary">Summary</label>
        <textarea id="edit_summary" className="govuk-textarea" rows={3} value={doc.summary} onChange={(e) => updateDoc({ summary: e.target.value })} />
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="edit_external_url">Official External URL (Optional)</label>
        <input id="edit_external_url" className="govuk-input" type="url" value={doc.officialExternalUrl || ""} onChange={(e) => updateDoc({ officialExternalUrl: e.target.value || null })} placeholder="https://kenyalaw.org/..." />
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label">Full Text Content</label>
        <div className="govuk-hint">Edit the document content directly using the rich text editor below.</div>
        <TipTapEditor content={htmlContent} onChange={setHtmlContent} />
      </div>

      <div className="govuk-!-margin-top-6 govuk-!-display-flex govuk-!-gap-3">
        <button type="button" className="govuk-button" disabled={isSaving} onClick={() => void handleSave()}>
          {isSaving ? "Saving changes…" : "Save Changes"}
        </button>
        <button type="button" className="govuk-button govuk-button--warning" disabled={isDeleting} onClick={() => void handleDelete()}>
          {isDeleting ? "Deleting…" : "Delete Document"}
        </button>
      </div>
    </div>
  );
}