"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DocumentEditor({ document, types = [] }: any) {
  const router = useRouter(); const [saving,setSaving]=useState(false); const [error,setError]=useState("");
  async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setSaving(true);setError("");const form=new FormData(e.currentTarget);const body=Object.fromEntries(form.entries());const url=document?.id?`/api/admin/documents/${document.id}`:"/api/admin/documents";const res=await fetch(url,{method:document?.id?"PATCH":"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});const json=await res.json();setSaving(false);if(!res.ok){setError(json.error||"Could not save document");return;}router.push(`/admin/documents/${json.id||document.id}`);router.refresh();}
  return <form onSubmit={submit}>
    {error&&<div className="govuk-error-summary"><div className="govuk-error-summary__body">{error}</div></div>}
    <div className="govuk-form-group"><label className="govuk-label govuk-label--m" htmlFor="title">Title</label><input className="govuk-input" id="title" name="title" required defaultValue={document?.title||""}/></div>
    <div className="govuk-form-group"><label className="govuk-label" htmlFor="short_title">Short title</label><input className="govuk-input" id="short_title" name="short_title" defaultValue={document?.short_title||""}/></div>
    <div className="govuk-form-group"><label className="govuk-label" htmlFor="slug">Slug</label><input className="govuk-input" id="slug" name="slug" required defaultValue={document?.slug||""}/></div>
    <div className="govuk-form-group"><label className="govuk-label" htmlFor="document_type_id">Document type</label><select className="govuk-select" id="document_type_id" name="document_type_id" defaultValue={document?.document_type_id||""}><option value="">Select</option>{types.map((t:any)=><option value={t.id} key={t.id}>{t.name}</option>)}</select></div>
    <div className="govuk-form-group"><label className="govuk-label" htmlFor="publication_date">Publication date</label><input className="govuk-input govuk-input--width-10" type="date" id="publication_date" name="publication_date" defaultValue={document?.publication_date||""}/></div>
    <div className="govuk-form-group"><label className="govuk-label" htmlFor="publisher_text">Publisher as printed</label><input className="govuk-input" id="publisher_text" name="publisher_text" defaultValue={document?.publisher_text||""}/></div>
    <div className="govuk-form-group"><label className="govuk-label" htmlFor="summary">Summary</label><textarea className="govuk-textarea" rows={4} id="summary" name="summary" defaultValue={document?.summary||""}/></div>
    <div className="govuk-form-group"><label className="govuk-label" htmlFor="description">Overview</label><textarea className="govuk-textarea" rows={8} id="description" name="description" defaultValue={document?.description||""}/></div>
    <div className="govuk-form-group"><label className="govuk-label" htmlFor="status">Status</label><select className="govuk-select" id="status" name="status" defaultValue={document?.status||"Current"}>{['Draft','Current','Superseded','Historical','Withdrawn','Archived'].map(v=><option key={v}>{v}</option>)}</select></div>
    <div className="govuk-form-group"><label className="govuk-label" htmlFor="official_source_url">Official source URL</label><input className="govuk-input" type="url" id="official_source_url" name="official_source_url" defaultValue={document?.official_source_url||""}/></div>
    <button className="govuk-button" disabled={saving}>{saving?"Saving…":"Save document"}</button>
  </form>;
}
