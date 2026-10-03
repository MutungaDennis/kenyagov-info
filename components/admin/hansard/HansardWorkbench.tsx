"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { emptyHansardDocument, prepareHansardDocument, publicationIssues, type HansardDocument, type ContributionRecord, type MemberCandidate } from "@/lib/hansard/document";
import { documentFromGrok } from "@/lib/hansard/grok-document";
import { safeHtml } from "@/lib/safe-html";
import { PROCEEDING_TYPES, REPOSITORY_COMMUNITIES } from "@/lib/hansard/collections";
import { adminPath } from "@/lib/admin-path";

type Row = { _id: string; title: string; sittingDate: string; isActive: boolean };
const input = "w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900";
const button = "rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 disabled:opacity-50";
async function api(path: string, body?: unknown) {
  const response = await fetch(`/api/hansard/${path}`, body === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json().catch(() => { throw new Error("The server returned an unreadable response. Your editor content is unchanged. Try a shorter passage or sign in again."); });
  if (!response.ok) throw new Error(result.error || "Request failed");
  return result;
}

export default function HansardWorkbench({ sittings, initialDocument }: { sittings: Row[]; initialDocument?: HansardDocument | null }) {
  const router = useRouter();
  const [doc, setDoc] = useState<HansardDocument>(initialDocument || emptyHansardDocument());
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [json, setJson] = useState("");
  const [filter, setFilter] = useState("");
  const [unlinked, setUnlinked] = useState(false);
  const [linkKey, setLinkKey] = useState<string | null>(null);
  const [memberQuery, setMemberQuery] = useState("");
  const [members, setMembers] = useState<MemberCandidate[]>([]);
  const [grokText, setGrokText] = useState("");
  function change(next: HansardDocument) { setDoc(next); setDirty(true); }
  function metadata(patch: Partial<HansardDocument["sitting"]>) {
    const roleContextChanged = patch.house_type !== undefined || patch.sitting_date !== undefined || patch.proceeding_type !== undefined;
    const sourceChanged = patch.official_hansard_url !== undefined || patch.source_community_id !== undefined || patch.proceeding_type !== undefined;
    change({ ...doc, sitting: { ...doc.sitting, ...patch, source_access: patch.source_access ?? (sourceChanged ? "unknown" : doc.sitting.source_access), review_status: "pending" }, contributions: roleContextChanged ? doc.contributions.map(c => ({ ...c, link_status: c.leader_id ? "suggested" : c.link_status, review_status: "pending" })) : doc.contributions });
    if (roleContextChanged) { setMembers([]); setLinkKey(null); }
  }
  function patchContribution(key: string, patch: Partial<ContributionRecord>) {
    change({ ...doc, contributions: doc.contributions.map(c => c.contribution_key === key ? { ...c, review_status: "pending", ...patch } : c) });
  }
  async function run(action: () => Promise<void>) { setBusy(true); setNotice(""); try { await action(); } catch (error) { setNotice(error instanceof Error ? error.message : "Request failed"); } finally { setBusy(false); } }
  async function save(status: HansardDocument["sitting"]["status"]) {
    await run(async () => {
      const prepared = prepareHansardDocument({ ...doc, sitting: { ...doc.sitting, status } });
      if (status === "published") { const issues = publicationIssues(prepared); if (issues.length) throw new Error(issues.join("\n")); }
      const result = await api("save", prepared);
      setDoc({ ...prepared, sitting: { ...prepared.sitting, id: result.documentId } }); setDirty(false);
      setNotice(status === "published" ? "Published. The public reader and member pages are updated." : "Draft saved."); router.refresh();
    });
  }
  function confirmReplace() { return !dirty || window.confirm("Discard the unsaved changes in this editor?"); }
  function importJson(text: string) {
    if (!confirmReplace()) return;
    try {
      const parsed = JSON.parse(text);
      const next = prepareHansardDocument({ ...parsed, sitting: { ...parsed.sitting, id: undefined, status: "draft", review_status: "pending", source_access: "unknown" }, contributions: (parsed.contributions || []).map((c: ContributionRecord) => ({ ...c, review_status: "pending", link_status: c.leader_id ? "suggested" : ["guest", "collective", "office-holder"].includes(c.speaker_kind) ? "not-applicable" : "unmatched" })) });
      change(next); setNotice("Imported into the editor. Review the text and member links, then save a draft.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Invalid JSON"); }
  }
  function link(member: MemberCandidate, all: boolean) {
    const selected = doc.contributions.find(c => c.contribution_key === linkKey);
    if (!selected) return;
    change({ ...doc, contributions: doc.contributions.map(c => c.contribution_key === linkKey || (all && !!selected.speaker_name.trim() && c.speaker_name.trim().toLowerCase() === selected.speaker_name.trim().toLowerCase()) ? { ...c, speaker_kind: "member", leader_id: member.leader_id, leader_role_id: member.leader_role_id, speaker_title: member.title, party: member.party, constituency: member.constituency, county: member.county, link_status: "confirmed", review_status: "pending" } : c) });
    setLinkKey(null); setMembers([]);
  }
  function addContribution() {
    const key = `speech-${crypto.randomUUID()}`;
    change({ ...doc, contributions: [...doc.contributions, { contribution_key: key, section_key: doc.sections[0]?.section_key || "debate-1", sort_order: Math.max(0, ...doc.contributions.map(c => c.sort_order)) + 1, contribution_type: "speech", speaker_kind: "unknown", speaker_name: "", body_html: "", body_text: "", language: "en", is_chair: false, link_status: "unmatched", review_status: "pending" }] });
  }
  async function extract() {
    if (!confirmReplace()) return;
    await run(async () => {
      const result = await api("process", { text: grokText, houseType: doc.sitting.house_type });
      const next = documentFromGrok(doc, result.structured);
      change(next); setNotice("Grok suggestions loaded. Compare against the source PDF and confirm each member before publishing.");
    });
  }
  const visible = doc.contributions.filter(c => (!unlinked || ["unmatched", "suggested"].includes(c.link_status)) && `${c.speaker_name} ${c.body_text} ${c.body_html}`.toLowerCase().includes(filter.toLowerCase()));
  return <main className="mx-auto max-w-7xl space-y-6 p-4 text-slate-900 md:p-8">
    <header><h1 className="text-3xl font-bold">Hansard editor</h1><p className="mt-2 text-slate-600">Import a sitting, review its debates and link speakers to their parliamentary roles on the sitting date.</p></header>
    <div role="status" aria-live="polite" className="whitespace-pre-wrap text-sm">{notice}</div>
    <section className="flex flex-wrap items-center gap-3 rounded border p-4">
      <label className="min-w-64 flex-1">Existing sitting<select className={input} value={doc.sitting.id || ""} disabled={busy} onChange={e => { const id = e.target.value; if (!confirmReplace()) return; if (!id) { setDoc(emptyHansardDocument()); setDirty(false); return; } void run(async () => { const result = await api(`load-existing?id=${encodeURIComponent(id)}`); if (!result.document) throw new Error("Sitting not found"); setDoc(result.document); setDirty(false); }); }}><option value="">New sitting</option>{sittings.map(s => <option key={s._id} value={s._id}>{s.sittingDate} · {s.title} · {s.isActive ? "Published" : "Draft / review"}</option>)}</select></label>
      <button className={button} disabled={busy} onClick={() => { if (confirmReplace()) { setDoc(emptyHansardDocument()); setDirty(false); } }}>New sitting</button>
      <a className={button} href="/data/hansard-import-example.json" download>Download import example</a>
      <button className={button} onClick={() => { const url = URL.createObjectURL(new Blob([JSON.stringify(doc,null,2)], { type: "application/json" })); const a = document.createElement("a"); a.href = url; a.download = `${doc.sitting.slug || "hansard-draft"}.json`; a.click(); URL.revokeObjectURL(url); }}>Export current JSON</button>
    </section>
    <details className="rounded border p-4"><summary className="cursor-pointer font-semibold">Import extracted PDF content (JSON)</summary><p className="my-2 text-sm">Use the version 2 format. Import always starts a new draft; extracted IDs and links must be reviewed.</p><input aria-label="Import Hansard JSON file" type="file" accept=".json,application/json" onChange={e => { const file = e.target.files?.[0]; if (file) void file.text().then(importJson); e.target.value = ""; }} /><textarea aria-label="Extracted Hansard JSON" className={`${input} mt-3 font-mono text-xs`} rows={8} value={json} onChange={e => setJson(e.target.value)} /><button className={button} onClick={() => importJson(json)}>Import pasted JSON</button></details>
    <section className="grid gap-4 rounded border p-4 md:grid-cols-2">
      <h2 className="text-xl font-semibold md:col-span-2">Sitting details</h2>
      <label>Title<input className={input} value={doc.sitting.title} onChange={e => metadata({ title: e.target.value })} /></label>
      <label>URL slug<input className={input} placeholder="national-assembly-2026-09-29-afternoon" value={doc.sitting.slug} onChange={e => metadata({ slug: e.target.value })} /></label>
      <label>House<select className={input} value={doc.sitting.house_type} onChange={e => metadata({ house_type: e.target.value as HansardDocument["sitting"]["house_type"] })}><option value="national-assembly">National Assembly</option><option value="senate">Senate</option><option value="county-assembly">County Assembly</option></select></label>
      <label>Proceeding category<select className={input} value={doc.sitting.proceeding_type} onChange={e => metadata({ proceeding_type: e.target.value as HansardDocument["sitting"]["proceeding_type"], source_access: "unknown", source_community_id: null })}>{Object.entries(PROCEEDING_TYPES).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Official repository community<select className={input} value={doc.sitting.source_community_id || ""} onChange={e => { const c = REPOSITORY_COMMUNITIES.find(c => c.id === e.target.value); metadata({ source_community_id: c?.id || null, proceeding_type: c?.type || doc.sitting.proceeding_type, source_access: c && !c.public ? "restricted" : "unknown" }); }}><option value="">Other source / not yet identified</option>{REPOSITORY_COMMUNITIES.map(c => <option key={c.id} value={c.id}>{PROCEEDING_TYPES[c.type]}</option>)}</select></label>
      <label className="md:col-span-2"><input type="checkbox" checked={doc.sitting.source_access === "public"} onChange={e => metadata({ source_access: e.target.checked ? "public" : "unknown" })} /> I verified that this source is publicly accessible without restricted credentials. Restricted communities cannot be published.</label>
      <label>Sitting date<input className={input} type="date" value={doc.sitting.sitting_date} onChange={e => metadata({ sitting_date: e.target.value })} /></label>
      <label>Period<input className={input} value={doc.sitting.sitting_period} onChange={e => metadata({ sitting_period: e.target.value })} /></label>
      <label>Parliamentary term<input className={input} value={doc.sitting.parliamentary_term || ""} onChange={e => metadata({ parliamentary_term: e.target.value })} /></label>
      <label>Topics (comma separated)<input className={input} value={doc.sitting.topics.join(", ")} onChange={e => metadata({ topics: e.target.value.split(",").map(t => t.trim()) })} /></label>
      <label>County (for county assemblies)<input className={input} value={doc.sitting.county_name || ""} onChange={e => metadata({ county_name: e.target.value })} /></label>
      <label>Official PDF / source URL<input className={input} type="url" value={doc.sitting.official_hansard_url || ""} onChange={e => metadata({ official_hansard_url: e.target.value })} /></label>
      <label className="md:col-span-2">Summary (HTML or plain text)<textarea className={input} rows={3} value={doc.sitting.summary_html || doc.sitting.summary_text} onChange={e => metadata({ summary_html: e.target.value, summary_text: "" })} /></label>
      <label className="md:col-span-2"><input type="checkbox" checked={doc.sitting.review_status === "reviewed"} onChange={e => change({ ...doc, sitting: { ...doc.sitting, review_status: e.target.checked ? "reviewed" : "pending" } })} /> I have checked the sitting metadata against the source.</label>
    </section>
    <section className="space-y-3 rounded border p-4"><h2 className="text-xl font-semibold">Debate sections</h2>{doc.sections.map((section, index) => <div className="grid gap-2 md:grid-cols-3" key={section.section_key}><span className="self-center text-sm">{section.section_key}</span><label>Heading<input className={input} value={section.heading} onChange={e => change({ ...doc, sections: doc.sections.map((s,i) => i === index ? { ...s, heading: e.target.value } : s) })} /></label><label>Parent section<select className={input} value={section.parent_key || ""} onChange={e => change({ ...doc, sections: doc.sections.map((s,i) => i === index ? { ...s, parent_key: e.target.value || null } : s) })}><option value="">Top level</option>{doc.sections.filter(s => s.section_key !== section.section_key).map(s => <option key={s.section_key} value={s.section_key}>{s.heading}</option>)}</select></label></div>)}<button className={button} onClick={() => change({ ...doc, sections: [...doc.sections, { section_key: `debate-${crypto.randomUUID()}`, heading: "New debate", section_type: "debate", sort_order: doc.sections.length+1, body_html: "", body_text: "" }] })}>Add debate section</button></section>
    <section className="space-y-4"><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-semibold">Contributions ({doc.contributions.length})</h2><button className={button} onClick={addContribution}>Add contribution</button><input className={`${input} max-w-sm`} aria-label="Filter contributions" placeholder="Find a speaker or text" value={filter} onChange={e => setFilter(e.target.value)} /><label><input type="checkbox" checked={unlinked} onChange={e => setUnlinked(e.target.checked)} /> Unresolved links only</label></div>
      {visible.map(c => <article key={c.contribution_key} className="space-y-3 rounded border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{c.sort_order}. {c.speaker_name || "Unnamed speaker"}</h3><span className="text-sm">Link: {c.link_status} · Text: {c.review_status}</span><button className={button} onClick={() => { if (window.confirm("Remove this contribution from the draft?")) change({ ...doc, contributions: doc.contributions.filter(item => item.contribution_key !== c.contribution_key) }); }}>Remove</button></div>
        <div className="grid gap-3 md:grid-cols-3"><label>Speaker as printed<input className={input} value={c.speaker_name} onChange={e => patchContribution(c.contribution_key, { speaker_name: e.target.value, link_status: "unmatched", leader_id: null, leader_role_id: null })} /></label><label>Speaker type<select className={input} value={c.speaker_kind} onChange={e => { const kind = e.target.value as ContributionRecord["speaker_kind"]; patchContribution(c.contribution_key, { speaker_kind: kind, leader_id: null, leader_role_id: null, link_status: ["guest", "collective", "office-holder"].includes(kind) ? "not-applicable" : "unmatched" }); }}><option value="unknown">Needs identification</option><option value="member">MP / Senator / MCA</option><option value="office-holder">Other office holder</option><option value="guest">Guest</option><option value="collective">Collective response</option></select></label><label>Debate<select className={input} value={c.section_key} onChange={e => patchContribution(c.contribution_key, { section_key: e.target.value })}>{doc.sections.map(s => <option key={s.section_key} value={s.section_key}>{s.heading}</option>)}</select></label>
          <label>Order<input className={input} type="number" min={1} value={c.sort_order} onChange={e => patchContribution(c.contribution_key, { sort_order: Number(e.target.value) })} /></label><label>PDF page<input className={input} type="number" min={1} value={c.source_page || ""} onChange={e => patchContribution(c.contribution_key, { source_page: e.target.value ? Number(e.target.value) : null })} /></label><label>Capacity / role in this sitting<input className={input} value={c.capacity || ""} onChange={e => patchContribution(c.contribution_key, { capacity: e.target.value })} /></label></div>
        <p className="text-sm text-slate-600">{[c.speaker_title, c.constituency, c.county, c.party].filter(Boolean).join(" · ")}{c.leader_role_id ? " · Parliamentary role selected" : ""}</p>
        <button className={button} disabled={busy} onClick={() => { setLinkKey(c.contribution_key); setMemberQuery(c.speaker_name); setMembers([]); }}>Find / change parliamentary member</button>
        {linkKey === c.contribution_key && <div className="space-y-2 rounded bg-slate-50 p-3"><p className="text-sm">Only roles covering {doc.sitting.sitting_date || "the sitting date"} in the selected house are offered. Search by name or constituency.</p><input className={input} aria-label="Member name or constituency" value={memberQuery} onChange={e => setMemberQuery(e.target.value)} /><button className={button} disabled={busy} onClick={() => void run(async () => { const result = await api(`members?${new URLSearchParams({ house: doc.sitting.proceeding_type === "joint-sitting" ? "joint" : doc.sitting.house_type, date: doc.sitting.sitting_date, q: memberQuery })}`); setMembers(result.members); if (!result.members.length) setNotice("No matching role. Check the spelling, house and date, or update the official's role history before linking."); })}>Search eligible members</button><Link className={`${button} inline-block`} href={adminPath("officials")} target="_blank">Manage officials</Link>{members.map(member => <div key={member.leader_role_id} className="rounded border p-2"><p>{member.full_name} · {member.title} · {member.constituency || member.county} · {member.term_start_date}–{member.term_end_date || "present"}</p><button className={button} onClick={() => link(member,false)}>Link this contribution</button> <button className={button} onClick={() => link(member,true)}>Link all with this exact speaker name</button></div>)}</div>}
        <label className="block">Contribution text (HTML supported)<textarea className={`${input} font-mono text-sm`} rows={6} value={c.body_html || c.body_text} onChange={e => patchContribution(c.contribution_key, { body_html: e.target.value, body_text: "" })} /></label>
        <details><summary className="cursor-pointer text-sm">Preview formatted contribution</summary><div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: safeHtml(c.body_html || c.body_text) }} /></details>
        <div className="flex flex-wrap gap-5"><label><input type="checkbox" checked={c.is_chair} onChange={e => patchContribution(c.contribution_key, { is_chair: e.target.checked })} /> Speaking as chair</label><label><input type="checkbox" checked={c.review_status === "reviewed"} onChange={e => patchContribution(c.contribution_key, { review_status: e.target.checked ? "reviewed" : "pending" })} /> Checked against the source PDF</label></div>
      </article>)}
    </section>
    <details className="rounded border p-4"><summary className="cursor-pointer font-semibold">Optional Grok extraction from pasted text</summary><p className="my-2 text-sm">Use only if you need help structuring text. This sends the pasted text to xAI and uses your configured API credits. It creates unreviewed suggestions and replaces the editor content. PDF-to-JSON imports do not need Grok.</p><textarea aria-label="Text for Grok extraction" className={input} rows={8} value={grokText} onChange={e => setGrokText(e.target.value)} /><button className={button} disabled={busy || grokText.trim().length < 50} onClick={() => void extract()}>{busy ? "Processing..." : "Send text to Grok"}</button></details>
    <footer className="sticky bottom-0 flex flex-wrap items-center gap-3 border bg-white p-4 shadow"><span>{dirty ? "Unsaved changes" : "No unsaved changes"} · {doc.sitting.status}</span><button className={button} disabled={busy} onClick={() => void save("draft")}>Save draft / unpublish</button><button className="rounded bg-emerald-800 px-4 py-2 text-white disabled:opacity-50" disabled={busy} onClick={() => void save("published")}>Publish reviewed sitting</button>{doc.sitting.id && <><Link className={button} href={`/government/legislature/hansard/sitting/${doc.sitting.slug}`} target="_blank">Public page</Link><button className={button} disabled={busy} onClick={() => { if (window.confirm("Permanently delete this sitting and its contributions?")) void run(async () => { await api("delete", { documentId: doc.sitting.id }); setDoc(emptyHansardDocument()); setDirty(false); router.refresh(); setNotice("Sitting deleted."); }); }}>Delete sitting</button></>}</footer>
  </main>;
}
