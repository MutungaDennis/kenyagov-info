"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DocumentFilesManager({ documentId, files, versions }: any) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function addFile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const body: Record<string, unknown> = Object.fromEntries(form.entries());
    body.is_primary = form.get("is_primary") === "on";
    body.is_official_source = form.get("is_official_source") === "on";

    const res = await fetch(`/api/admin/documents/${documentId}/files`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) return setError(json.error || "Could not add file");
    event.currentTarget.reset();
    router.refresh();
  }

  async function removeFile(fileId: string) {
    if (!window.confirm("Remove this file record? This does not delete an object from Supabase Storage.")) return;
    const res = await fetch(`/api/admin/documents/${documentId}/files?fileId=${encodeURIComponent(fileId)}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) return setError(json.error || "Could not remove file");
    router.refresh();
  }

  return <>
    {error && <div className="govuk-error-summary" role="alert"><div className="govuk-error-summary__body">{error}</div></div>}

    <h2 className="govuk-heading-l">Source files</h2>
    {files.length === 0 ? <p className="govuk-body">No file records have been added.</p> :
      <div className="govuk-table__container"><table className="govuk-table">
        <thead className="govuk-table__head"><tr className="govuk-table__row"><th className="govuk-table__header">File</th><th className="govuk-table__header">Source</th><th className="govuk-table__header">Accessibility</th><th className="govuk-table__header">OCR / text</th><th className="govuk-table__header">Flags</th><th className="govuk-table__header"><span className="govuk-visually-hidden">Actions</span></th></tr></thead>
        <tbody className="govuk-table__body">{files.map((f:any)=><tr key={f.id} className="govuk-table__row">
          <td className="govuk-table__cell"><strong>{f.file_name || f.file_type || "File"}</strong>{f.page_count ? <><br/><span className="govuk-hint">{f.page_count} pages</span></> : null}</td>
          <td className="govuk-table__cell">{f.source_url ? <a className="govuk-link" href={f.source_url}>Official/source URL</a> : f.storage_path || "—"}</td>
          <td className="govuk-table__cell">{f.accessibility_status}</td>
          <td className="govuk-table__cell">{f.ocr_status}<br/><span className="govuk-hint">Text: {f.text_extraction_status}</span></td>
          <td className="govuk-table__cell">{f.is_primary ? <strong className="govuk-tag">Primary</strong> : null} {f.is_official_source ? <strong className="govuk-tag govuk-tag--green">Official</strong> : null}</td>
          <td className="govuk-table__cell"><button className="govuk-button govuk-button--warning govuk-button--small" type="button" onClick={()=>removeFile(f.id)}>Remove</button></td>
        </tr>)}</tbody>
      </table></div>}

    <h2 className="govuk-heading-l govuk-!-margin-top-8">Add a file record</h2>
    <div className="govuk-inset-text">This manager records official URLs or existing Supabase Storage paths. It deliberately does not delete Storage objects when a record is removed.</div>
    <form onSubmit={addFile}>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="file_name">File name</label><input className="govuk-input" id="file_name" name="file_name" /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="source_url">Official or source URL</label><input className="govuk-input" id="source_url" name="source_url" type="url" /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="storage_path">Supabase Storage path</label><span className="govuk-hint">Use this when the file is already in your configured Storage bucket.</span><input className="govuk-input" id="storage_path" name="storage_path" /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="version_id">Version</label><select className="govuk-select" id="version_id" name="version_id"><option value="">Not assigned</option>{versions.map((v:any)=><option key={v.id} value={v.id}>{v.version_label || v.version_date || v.version_type}</option>)}</select></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="file_type">File type</label><input className="govuk-input govuk-input--width-10" id="file_type" name="file_type" defaultValue="pdf" /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="mime_type">MIME type</label><input className="govuk-input" id="mime_type" name="mime_type" defaultValue="application/pdf" /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="page_count">Page count</label><input className="govuk-input govuk-input--width-5" id="page_count" name="page_count" type="number" min="1" /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="accessibility_status">Accessibility</label><select className="govuk-select" id="accessibility_status" name="accessibility_status">{["Unknown","Accessible","Partially accessible","Scanned image"].map(x=><option key={x}>{x}</option>)}</select></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="ocr_status">OCR status</label><select className="govuk-select" id="ocr_status" name="ocr_status">{["Unknown","Not required","Pending","Complete","Failed"].map(x=><option key={x}>{x}</option>)}</select></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="text_extraction_status">Text extraction</label><select className="govuk-select" id="text_extraction_status" name="text_extraction_status">{["Pending","Complete","Failed","Not applicable"].map(x=><option key={x}>{x}</option>)}</select></div>
      <div className="govuk-form-group"><div className="govuk-checkboxes"><div className="govuk-checkboxes__item"><input className="govuk-checkboxes__input" id="is_primary" name="is_primary" type="checkbox"/><label className="govuk-label govuk-checkboxes__label" htmlFor="is_primary">Primary file for this document</label></div><div className="govuk-checkboxes__item"><input className="govuk-checkboxes__input" id="is_official_source" name="is_official_source" type="checkbox"/><label className="govuk-label govuk-checkboxes__label" htmlFor="is_official_source">Official source file</label></div></div></div>
      <button className="govuk-button" type="submit" disabled={saving}>{saving ? "Saving…" : "Add file"}</button>
    </form>
  </>;
}
