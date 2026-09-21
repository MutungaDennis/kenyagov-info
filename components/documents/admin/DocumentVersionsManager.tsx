"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DocumentVersionsManager({ documentId, versions }: any) {
  const router = useRouter();
  const [error,setError]=useState("");
  const [saving,setSaving]=useState(false);

  async function addVersion(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault(); setSaving(true); setError("");
    const form=new FormData(e.currentTarget); const body:Record<string,unknown>=Object.fromEntries(form.entries()); body.is_current=form.get("is_current")==="on";
    const res=await fetch(`/api/admin/documents/${documentId}/versions`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}); const json=await res.json(); setSaving(false);
    if(!res.ok)return setError(json.error||"Could not add version"); e.currentTarget.reset(); router.refresh();
  }
  async function removeVersion(versionId:string){
    if(!window.confirm("Remove this version record? Files assigned to it will remain and become unassigned."))return;
    const res=await fetch(`/api/admin/documents/${documentId}/versions?versionId=${encodeURIComponent(versionId)}`,{method:"DELETE"}); const json=await res.json(); if(!res.ok)return setError(json.error||"Could not remove version"); router.refresh();
  }
  return <>
    {error&&<div className="govuk-error-summary" role="alert"><div className="govuk-error-summary__body">{error}</div></div>}
    <h2 className="govuk-heading-l">Versions</h2>
    {versions.length===0?<p className="govuk-body">No versions recorded.</p>:<div className="govuk-table__container"><table className="govuk-table"><thead className="govuk-table__head"><tr className="govuk-table__row"><th className="govuk-table__header">Version</th><th className="govuk-table__header">Date</th><th className="govuk-table__header">Type</th><th className="govuk-table__header">Notes</th><th className="govuk-table__header"><span className="govuk-visually-hidden">Actions</span></th></tr></thead><tbody className="govuk-table__body">{versions.map((v:any)=><tr key={v.id} className="govuk-table__row"><td className="govuk-table__cell">{v.version_label||"—"} {v.is_current?<strong className="govuk-tag">Current</strong>:null}</td><td className="govuk-table__cell">{v.version_date||"—"}</td><td className="govuk-table__cell">{v.version_type}</td><td className="govuk-table__cell">{v.notes||"—"}</td><td className="govuk-table__cell"><button type="button" className="govuk-button govuk-button--warning govuk-button--small" onClick={()=>removeVersion(v.id)}>Remove</button></td></tr>)}</tbody></table></div>}
    <h2 className="govuk-heading-l govuk-!-margin-top-8">Add version</h2>
    <form onSubmit={addVersion}>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="version_label">Version label</label><input className="govuk-input" id="version_label" name="version_label" placeholder="For example: Revised edition 2024" /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="version_date">Version date</label><input className="govuk-input govuk-input--width-10" id="version_date" name="version_date" type="date" /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="version_type">Version type</label><select className="govuk-select" id="version_type" name="version_type">{["original","revised","consolidated","historical","other"].map(x=><option key={x}>{x}</option>)}</select></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="notes">Notes</label><textarea className="govuk-textarea" id="notes" name="notes" rows={4}/></div>
      <div className="govuk-form-group"><div className="govuk-checkboxes"><div className="govuk-checkboxes__item"><input className="govuk-checkboxes__input" id="is_current" name="is_current" type="checkbox"/><label className="govuk-label govuk-checkboxes__label" htmlFor="is_current">This is the current version</label></div></div></div>
      <button className="govuk-button" disabled={saving}>{saving?"Saving…":"Add version"}</button>
    </form>
  </>;
}
