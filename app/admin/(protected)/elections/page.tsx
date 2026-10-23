"use client";

import { useEffect, useState } from "react";
type Coalition = { id: string; name: string; abbreviation?: string | null; slogan?: string | null; colors?: string | null; symbol?: string | null };
type Party = { id: string; name: string; slug: string; abbreviation?: string | null; slogan?: string | null; colors?: string | null; symbol?: string | null; status?: string | null; coalition_id?: string | null };
type PartyForm = { name: string; slug: string; abbreviation: string; slogan: string; colors: string; symbol: string; status: string; coalition_id: string };
type CoalitionForm = { name: string; abbreviation: string; slogan: string; colors: string; symbol: string };
const emptyParty: PartyForm = { name: "", slug: "", abbreviation: "", slogan: "", colors: "", symbol: "", status: "active", coalition_id: "" };
const emptyCoalition: CoalitionForm = { name: "", abbreviation: "", slogan: "", colors: "", symbol: "" };

export default function ElectionsAdminPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [coalitions, setCoalitions] = useState<Coalition[]>([]);
  const [party, setParty] = useState<PartyForm>(emptyParty);
  const [coalition, setCoalition] = useState<CoalitionForm>(emptyCoalition);
  const [editingParty, setEditingParty] = useState<string | null>(null);
  const [editingCoalition, setEditingCoalition] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [p, c] = await Promise.all([fetch("/api/admin/parties", { cache: "no-store" }), fetch("/api/admin/coalitions", { cache: "no-store" })]);
    const pj = await p.json(); const cj = await c.json();
    if (!p.ok || !c.ok) throw new Error(pj.error || cj.error || "Could not load elections data");
    setParties(pj.data || []); setCoalitions(cj.data || []);
  }
  // The admin screen synchronizes its local lists with the protected API on mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load().catch((e) => setError(e.message)); }, []);

  async function save(path: string, payload: PartyForm | CoalitionForm | (PartyForm & { id?: string }) | (CoalitionForm & { id?: string })) {
    setSaving(true); setError(null);
    try {
      const res = await fetch(path, { method: payload.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json(); if (!res.ok) throw new Error(json.error || "Save failed");
      await load(); return true;
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed"); return false; } finally { setSaving(false); }
  }
  async function remove(path: string, id: string) {
    if (!window.confirm("Delete this record?")) return;
    const res = await fetch(`${path}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) { const json = await res.json(); setError(json.error || "Delete failed"); return; }
    await load();
  }
  const field = (label: string, value: string, onChange: (value: string) => void, required = false) => <div className="govuk-form-group"><label className="govuk-label" htmlFor={label}>{label}{required ? " *" : ""}</label><input id={label} className="govuk-input" value={value} required={required} onChange={(e) => onChange(e.target.value)} /></div>;

  return <div className="govuk-width-container"><h1 className="govuk-heading-xl">Political parties and coalitions</h1><p className="govuk-body-l">Manage the public election directory, including assigning each party to its current coalition.</p>
    {error && <div className="govuk-error-summary" role="alert"><h2 className="govuk-error-summary__title">There is a problem</h2><p className="govuk-body">{error}</p></div>}
    <div className="govuk-grid-row">
      <section className="govuk-grid-column-one-half"><h2 className="govuk-heading-l">Coalitions</h2><form onSubmit={async (e) => { e.preventDefault(); if (await save("/api/admin/coalitions", { ...coalition, id: editingCoalition })) { setCoalition(emptyCoalition); setEditingCoalition(null); } }}>
        {field("Coalition name", coalition.name, (v) => setCoalition({ ...coalition, name: v }), true)} {field("Abbreviation", coalition.abbreviation, (v) => setCoalition({ ...coalition, abbreviation: v }))} {field("Slogan", coalition.slogan, (v) => setCoalition({ ...coalition, slogan: v }))}
        <button className="govuk-button" disabled={saving}>{editingCoalition ? "Update coalition" : "Create coalition"}</button>{editingCoalition && <button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-left-2" onClick={() => { setEditingCoalition(null); setCoalition(emptyCoalition); }}>Cancel</button>}
      </form><ul className="govuk-list govuk-list--border"><>{coalitions.map((c) => <li key={c.id} className="govuk-!-padding-top-3 govuk-!-padding-bottom-3"><strong>{c.name}</strong>{c.abbreviation && <span> ({c.abbreviation})</span>}<br /><button className="govuk-link app-button-link" onClick={() => { setEditingCoalition(c.id); setCoalition({ name: c.name, abbreviation: c.abbreviation || "", slogan: c.slogan || "", colors: c.colors || "", symbol: c.symbol || "" }); }}>Edit</button><button className="govuk-link app-button-link govuk-!-margin-left-3" onClick={() => remove("/api/admin/coalitions", c.id)}>Delete</button></li>)}</></ul></section>
      <section className="govuk-grid-column-one-half"><h2 className="govuk-heading-l">Political parties</h2><form onSubmit={async (e) => { e.preventDefault(); if (await save("/api/admin/parties", { ...party, id: editingParty })) { setParty(emptyParty); setEditingParty(null); } }}>
        {field("Party name", party.name, (v) => setParty({ ...party, name: v }), true)} {field("Slug", party.slug, (v) => setParty({ ...party, slug: v }))} {field("Abbreviation", party.abbreviation, (v) => setParty({ ...party, abbreviation: v }))} {field("Slogan", party.slogan, (v) => setParty({ ...party, slogan: v }))}<div className="govuk-form-group"><label className="govuk-label" htmlFor="party-coalition">Current coalition</label><select id="party-coalition" className="govuk-select" value={party.coalition_id} onChange={(e) => setParty({ ...party, coalition_id: e.target.value })}><option value="">Independent / no coalition</option>{coalitions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <button className="govuk-button" disabled={saving}>{editingParty ? "Update party" : "Create party"}</button>{editingParty && <button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-left-2" onClick={() => { setEditingParty(null); setParty(emptyParty); }}>Cancel</button>}
      </form><ul className="govuk-list govuk-list--border">{parties.map((p) => <li key={p.id} className="govuk-!-padding-top-3 govuk-!-padding-bottom-3"><strong>{p.name}</strong>{p.abbreviation && <span> ({p.abbreviation})</span>}<br /><span className="govuk-body-s">{coalitions.find((c) => c.id === p.coalition_id)?.name || "Independent / no coalition"}</span><br /><button className="govuk-link app-button-link" onClick={() => { setEditingParty(p.id); setParty({ name: p.name, slug: p.slug, abbreviation: p.abbreviation || "", slogan: p.slogan || "", colors: p.colors || "", symbol: p.symbol || "", status: p.status || "active", coalition_id: p.coalition_id || "" }); }}>Edit</button><button className="govuk-link app-button-link govuk-!-margin-left-3" onClick={() => remove("/api/admin/parties", p.id)}>Delete</button></li>)}</ul></section>
    </div><p className="govuk-hint">Coalition assignment currently uses the existing party relationship. Time-bounded membership history requires the optional history table to be applied separately.</p><style>{`.app-button-link{background:none;border:0;padding:0;cursor:pointer;text-decoration:underline;font:inherit}`}</style>
  </div>;
}
