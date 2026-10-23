"use client";

import { useEffect, useMemo, useState } from "react";

type Coalition = { id: string; name: string; abbreviation?: string | null; slogan?: string | null; colors?: string | null; symbol?: string | null };
type Party = { id: string; name: string; slug: string; abbreviation?: string | null; slogan?: string | null; colors?: string | null; symbol?: string | null; status?: string | null; coalition_id?: string | null };
type PartyForm = { name: string; slug: string; abbreviation: string; slogan: string; colors: string; symbol: string; status: string; coalition_id: string };
type CoalitionForm = { name: string; abbreviation: string; slogan: string; colors: string; symbol: string };

const emptyParty: PartyForm = { name: "", slug: "", abbreviation: "", slogan: "", colors: "", symbol: "", status: "active", coalition_id: "" };
const emptyCoalition: CoalitionForm = { name: "", abbreviation: "", slogan: "", colors: "", symbol: "" };

export default function ElectionsManager({ section }: { section: "parties" | "coalitions" | "all" }) {
  const [parties, setParties] = useState<Party[]>([]);
  const [coalitions, setCoalitions] = useState<Coalition[]>([]);
  const [party, setParty] = useState<PartyForm>(emptyParty);
  const [coalition, setCoalition] = useState<CoalitionForm>(emptyCoalition);
  const [editingParty, setEditingParty] = useState<string | null>(null);
  const [editingCoalition, setEditingCoalition] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const requests: Promise<Response>[] = [
      fetch("/api/admin/parties", { cache: "no-store" }),
      fetch("/api/admin/coalitions", { cache: "no-store" }),
    ];
    const results = await Promise.all(requests);
    for (const response of results) {
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Could not load elections data");
      if (Array.isArray(json.data) && json.data.some((row: Party | Coalition) => "slug" in row)) setParties(json.data);
      if (Array.isArray(json.data) && json.data.some((row: Party | Coalition) => !("slug" in row))) setCoalitions(json.data);
    }
  }

  useEffect(() => { load().catch((e) => setError(e.message)); }, [section]);

  async function save(path: string, payload: PartyForm | CoalitionForm, id?: string | null) {
    setSaving(true); setError(null);
    try {
      const response = await fetch(path, { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(id ? { ...payload, id } : payload) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Save failed");
      await load();
      return true;
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed"); return false; } finally { setSaving(false); }
  }

  async function remove(path: string, id: string) {
    if (!window.confirm("Delete this record? This cannot be undone.")) return;
    const response = await fetch(`${path}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) { const json = await response.json(); setError(json.error || "Delete failed"); return; }
    await load();
  }

  const coalitionName = useMemo(() => new Map(coalitions.map((item) => [item.id, item.name])), [coalitions]);
  const field = (id: string, label: string, value: string, onChange: (value: string) => void, required = false) => <div className="govuk-form-group"><label className="govuk-label" htmlFor={id}>{label}{required ? " *" : ""}</label><input id={id} className="govuk-input" value={value} required={required} onChange={(event) => onChange(event.target.value)} /></div>;

  const coalitionSection = section !== "parties" && <section className="govuk-grid-column-one-half"><h2 className="govuk-heading-l">Coalitions</h2><p className="govuk-hint">Every coalition is published on the public elections directory. Delete a coalition to remove it from the public side.</p><form onSubmit={async (event) => { event.preventDefault(); if (await save("/api/admin/coalitions", coalition, editingCoalition)) { setCoalition(emptyCoalition); setEditingCoalition(null); } }}>
    {field("coalition-name", "Coalition name", coalition.name, (value) => setCoalition({ ...coalition, name: value }), true)}
    {field("coalition-abbreviation", "Abbreviation", coalition.abbreviation, (value) => setCoalition({ ...coalition, abbreviation: value }))}
    {field("coalition-slogan", "Slogan", coalition.slogan, (value) => setCoalition({ ...coalition, slogan: value }))}
    {field("coalition-colors", "Colours", coalition.colors, (value) => setCoalition({ ...coalition, colors: value }))}
    {field("coalition-symbol", "Symbol or image URL", coalition.symbol, (value) => setCoalition({ ...coalition, symbol: value }))}
    <button className="govuk-button" disabled={saving}>{editingCoalition ? "Update coalition" : "Create coalition"}</button>{editingCoalition && <button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-left-2" onClick={() => { setEditingCoalition(null); setCoalition(emptyCoalition); }}>Cancel</button>}
  </form><ul className="govuk-list govuk-list--border">{coalitions.map((item) => <li key={item.id} className="govuk-!-padding-top-3 govuk-!-padding-bottom-3"><strong>{item.name}</strong>{item.abbreviation && <span> ({item.abbreviation})</span>}<br /><button type="button" className="govuk-link app-button-link" onClick={() => { setEditingCoalition(item.id); setCoalition({ name: item.name, abbreviation: item.abbreviation || "", slogan: item.slogan || "", colors: item.colors || "", symbol: item.symbol || "" }); }}>Edit</button><button type="button" className="govuk-link app-button-link govuk-!-margin-left-3" onClick={() => remove("/api/admin/coalitions", item.id)}>Delete</button></li>)}</ul></section>;

  const partySection = section !== "coalitions" && <section className="govuk-grid-column-one-half"><h2 className="govuk-heading-l">Political parties</h2><p className="govuk-hint">Set a party to <strong>active</strong> to show it on the public political parties directory. Inactive parties remain available here for record keeping.</p><form onSubmit={async (event) => { event.preventDefault(); if (await save("/api/admin/parties", party, editingParty)) { setParty(emptyParty); setEditingParty(null); } }}>
    {field("party-name", "Party name", party.name, (value) => setParty({ ...party, name: value }), true)}
    {field("party-slug", "Slug", party.slug, (value) => setParty({ ...party, slug: value }))}
    {field("party-abbreviation", "Abbreviation", party.abbreviation, (value) => setParty({ ...party, abbreviation: value }))}
    {field("party-slogan", "Slogan", party.slogan, (value) => setParty({ ...party, slogan: value }))}
    {field("party-colors", "Colours", party.colors, (value) => setParty({ ...party, colors: value }))}
    {field("party-symbol", "Symbol or image URL", party.symbol, (value) => setParty({ ...party, symbol: value }))}
    <div className="govuk-form-group"><label className="govuk-label" htmlFor="party-status">Public visibility</label><select id="party-status" className="govuk-select" value={party.status} onChange={(event) => setParty({ ...party, status: event.target.value })}><option value="active">Active — show publicly</option><option value="inactive">Inactive — hide publicly</option></select></div>
    <div className="govuk-form-group"><label className="govuk-label" htmlFor="party-coalition">Current coalition</label><select id="party-coalition" className="govuk-select" value={party.coalition_id} onChange={(event) => setParty({ ...party, coalition_id: event.target.value })}><option value="">Independent / no coalition</option>{coalitions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
    <button className="govuk-button" disabled={saving}>{editingParty ? "Update party" : "Create party"}</button>{editingParty && <button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-left-2" onClick={() => { setEditingParty(null); setParty(emptyParty); }}>Cancel</button>}
  </form><ul className="govuk-list govuk-list--border">{parties.map((item) => <li key={item.id} className="govuk-!-padding-top-3 govuk-!-padding-bottom-3"><strong>{item.name}</strong>{item.abbreviation && <span> ({item.abbreviation})</span>}<br /><span className="govuk-body-s">{item.status === "active" ? "Public" : "Hidden"} · {coalitionName.get(item.coalition_id || "") || "Independent / no coalition"}</span><br /><button type="button" className="govuk-link app-button-link" onClick={() => { setEditingParty(item.id); setParty({ name: item.name, slug: item.slug, abbreviation: item.abbreviation || "", slogan: item.slogan || "", colors: item.colors || "", symbol: item.symbol || "", status: item.status || "active", coalition_id: item.coalition_id || "" }); }}>Edit</button><button type="button" className="govuk-link app-button-link govuk-!-margin-left-3" onClick={() => remove("/api/admin/parties", item.id)}>Delete</button></li>)}</ul></section>;

  return <div className="govuk-width-container"><h1 className="govuk-heading-xl">{section === "parties" ? "Political parties" : section === "coalitions" ? "Coalitions" : "Political parties and coalitions"}</h1><p className="govuk-body-l">Manage election records and their public visibility.</p>{error && <div className="govuk-error-summary" role="alert"><h2 className="govuk-error-summary__title">There is a problem</h2><p className="govuk-body">{error}</p></div>}<div className="govuk-grid-row">{coalitionSection}{partySection}</div><style>{`.app-button-link{background:none;border:0;padding:0;cursor:pointer;text-decoration:underline;font:inherit}`}</style></div>;
}
