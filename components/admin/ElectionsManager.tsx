"use client";

import { useEffect, useMemo, useState } from "react";

type Coalition = {
  id: string;
  name: string;
  abbreviation?: string | null;
  slogan?: string | null;
  colors?: string | null;
  symbol?: string | null;
  coalition_type?: string | null;
};
type Party = {
  id: string;
  name: string;
  slug: string;
  abbreviation?: string | null;
  slogan?: string | null;
  colors?: string | null;
  symbol?: string | null;
  status?: string | null;
  coalition_id?: string | null;
  certificate_serial_no?: string | null;
  certificate_issue_date?: string | null;
  certificate_date?: string | null;
  postal_address?: string | null;
  head_office_location?: string | null;
  previous_names?: string | null;
  changes?: string | null;
};
type PartyForm = {
  name: string;
  slug: string;
  abbreviation: string;
  slogan: string;
  colors: string;
  symbol: string;
  status: string;
  coalition_id: string;
  certificate_serial_no: string;
  certificate_issue_date: string;
  certificate_date: string;
  postal_address: string;
  head_office_location: string;
  previous_names: string;
  changes: string;
};
type CoalitionForm = { name: string; abbreviation: string; slogan: string; colors: string; symbol: string; coalition_type: string };
type Filter = "all" | "active" | "inactive";

const emptyParty: PartyForm = { name: "", slug: "", abbreviation: "", slogan: "", colors: "", symbol: "", status: "active", coalition_id: "", certificate_serial_no: "", certificate_issue_date: "", certificate_date: "", postal_address: "", head_office_location: "", previous_names: "", changes: "" };
const emptyCoalition: CoalitionForm = { name: "", abbreviation: "", slogan: "", colors: "", symbol: "", coalition_type: "pre_election" };

export default function ElectionsManager({ section }: { section: "parties" | "coalitions" | "all" }) {
  const [parties, setParties] = useState<Party[]>([]);
  const [coalitions, setCoalitions] = useState<Coalition[]>([]);
  const [party, setParty] = useState<PartyForm>(emptyParty);
  const [coalition, setCoalition] = useState<CoalitionForm>(emptyCoalition);
  const [editingParty, setEditingParty] = useState<string | null>(null);
  const [editingCoalition, setEditingCoalition] = useState<string | null>(null);
  const [partySearch, setPartySearch] = useState("");
  const [coalitionSearch, setCoalitionSearch] = useState("");
  const [partyFilter, setPartyFilter] = useState<Filter>("all");
  const [coalitionFilter, setCoalitionFilter] = useState<"all" | "pre_election" | "post_election">("all");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [partyResponse, coalitionResponse] = await Promise.all([fetch("/api/admin/parties", { cache: "no-store" }), fetch("/api/admin/coalitions", { cache: "no-store" })]);
    const partyJson = await partyResponse.json();
    const coalitionJson = await coalitionResponse.json();
    if (!partyResponse.ok || !coalitionResponse.ok) throw new Error(partyJson.error || coalitionJson.error || "Could not load elections data");
    setParties(partyJson.data || []);
    setCoalitions(coalitionJson.data || []);
  }

  useEffect(() => { load().catch((e) => setError(e.message)); }, []);

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
  const filteredParties = useMemo(() => parties.filter((item) => {
    const query = partySearch.toLowerCase().trim();
    const matchesSearch = !query || [item.name, item.slug, item.abbreviation, item.status, coalitionName.get(item.coalition_id || "")].some((value) => value?.toLowerCase().includes(query));
    return matchesSearch && (partyFilter === "all" || (item.status || "active") === partyFilter);
  }), [parties, partySearch, partyFilter, coalitionName]);
  const filteredCoalitions = useMemo(() => coalitions.filter((item) => {
    const query = coalitionSearch.toLowerCase().trim();
    const matchesSearch = !query || [item.name, item.abbreviation, item.slogan].some((value) => value?.toLowerCase().includes(query));
    return matchesSearch && (coalitionFilter === "all" || (item.coalition_type || "pre_election") === coalitionFilter);
  }), [coalitions, coalitionSearch, coalitionFilter]);

  const field = (id: string, label: string, value: string, onChange: (value: string) => void, required = false) => <div className="govuk-form-group"><label className="govuk-label" htmlFor={id}>{label}{required ? " *" : ""}</label><input id={id} className="govuk-input" value={value} required={required} onChange={(event) => onChange(event.target.value)} /></div>;
  const resetParty = () => { setEditingParty(null); setParty(emptyParty); };
  const resetCoalition = () => { setEditingCoalition(null); setCoalition(emptyCoalition); };
  const partyEditor = section !== "coalitions" && <div className="app-admin-editor"><div className="app-admin-editor__heading"><div><span className="govuk-caption-m">{editingParty ? "Editing record" : "New record"}</span><h2 className="govuk-heading-l govuk-!-margin-bottom-1">{editingParty ? "Edit political party" : "Add political party"}</h2></div>{editingParty && <button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" onClick={resetParty}>Cancel</button>}</div><form onSubmit={async (event) => { event.preventDefault(); if (await save("/api/admin/parties", party, editingParty)) resetParty(); }}>
    <div className="app-admin-form-grid">{field("party-name", "Party name", party.name, (value) => setParty({ ...party, name: value }), true)}{field("party-slug", "URL slug", party.slug, (value) => setParty({ ...party, slug: value }), true)}{field("party-abbreviation", "Abbreviation", party.abbreviation, (value) => setParty({ ...party, abbreviation: value }))}{field("party-slogan", "Slogan", party.slogan, (value) => setParty({ ...party, slogan: value }))}{field("party-colors", "Colours", party.colors, (value) => setParty({ ...party, colors: value }))}{field("party-symbol", "Symbol or image URL", party.symbol, (value) => setParty({ ...party, symbol: value }))}{field("party-certificate", "Certificate serial number", party.certificate_serial_no, (value) => setParty({ ...party, certificate_serial_no: value }))}{field("party-issue-date", "Certificate issue date", party.certificate_issue_date, (value) => setParty({ ...party, certificate_issue_date: value }))}{field("party-certificate-date", "Certificate date", party.certificate_date, (value) => setParty({ ...party, certificate_date: value }))}{field("party-head-office", "Head office location", party.head_office_location, (value) => setParty({ ...party, head_office_location: value }))}{field("party-postal-address", "Postal address", party.postal_address, (value) => setParty({ ...party, postal_address: value }))}{field("party-previous-names", "Previous names", party.previous_names, (value) => setParty({ ...party, previous_names: value }))}</div>
    <div className="govuk-form-group"><label className="govuk-label" htmlFor="party-changes">Changes and history</label><textarea id="party-changes" className="govuk-textarea" rows={4} value={party.changes} onChange={(event) => setParty({ ...party, changes: event.target.value })} /></div><div className="app-admin-form-grid"><div className="govuk-form-group"><label className="govuk-label" htmlFor="party-status">Public visibility</label><select id="party-status" className="govuk-select" value={party.status} onChange={(event) => setParty({ ...party, status: event.target.value })}><option value="active">Active — show publicly</option><option value="inactive">Inactive — hide publicly</option></select></div><div className="govuk-form-group"><label className="govuk-label" htmlFor="party-coalition">Coalition membership</label><select id="party-coalition" className="govuk-select" value={party.coalition_id} onChange={(event) => setParty({ ...party, coalition_id: event.target.value })}><option value="">Independent / no coalition</option>{coalitions.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.coalition_type === "post_election" ? "Post-election" : "Pre-election"})</option>)}</select></div></div><button className="govuk-button" disabled={saving}>{editingParty ? "Save party changes" : "Create party"}</button>
  </form></div>;
  const coalitionEditor = section !== "parties" && <div className="app-admin-editor"><div className="app-admin-editor__heading"><div><span className="govuk-caption-m">{editingCoalition ? "Editing record" : "New record"}</span><h2 className="govuk-heading-l govuk-!-margin-bottom-1">{editingCoalition ? "Edit coalition" : "Add coalition"}</h2></div>{editingCoalition && <button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" onClick={resetCoalition}>Cancel</button>}</div><form onSubmit={async (event) => { event.preventDefault(); if (await save("/api/admin/coalitions", coalition, editingCoalition)) resetCoalition(); }}><div className="app-admin-form-grid">{field("coalition-name", "Coalition name", coalition.name, (value) => setCoalition({ ...coalition, name: value }), true)}{field("coalition-abbreviation", "Abbreviation", coalition.abbreviation, (value) => setCoalition({ ...coalition, abbreviation: value }))}{field("coalition-slogan", "Slogan", coalition.slogan, (value) => setCoalition({ ...coalition, slogan: value }))}{field("coalition-colors", "Colours", coalition.colors, (value) => setCoalition({ ...coalition, colors: value }))}{field("coalition-symbol", "Symbol or image URL", coalition.symbol, (value) => setCoalition({ ...coalition, symbol: value }))}<div className="govuk-form-group"><label className="govuk-label" htmlFor="coalition-type">Coalition type</label><select id="coalition-type" className="govuk-select" value={coalition.coalition_type} onChange={(event) => setCoalition({ ...coalition, coalition_type: event.target.value })}><option value="pre_election">Pre-election coalition</option><option value="post_election">Post-election coalition</option></select></div></div><button className="govuk-button" disabled={saving}>{editingCoalition ? "Save coalition changes" : "Create coalition"}</button></form></div>;

  return <div className="govuk-width-container app-admin-elections"><h1 className="govuk-heading-xl">{section === "parties" ? "Political parties" : section === "coalitions" ? "Coalitions" : "Political parties and coalitions"}</h1><p className="govuk-body-l">Search, review and update election records without leaving the admin workspace.</p>{error && <div className="govuk-error-summary" role="alert"><h2 className="govuk-error-summary__title">There is a problem</h2><p className="govuk-body">{error}</p></div>}
    {partyEditor}{coalitionEditor}
    {section !== "coalitions" && <section className="app-admin-list"><div className="app-admin-list__header"><div><span className="govuk-caption-m">{filteredParties.length} of {parties.length} records</span><h2 className="govuk-heading-l govuk-!-margin-bottom-1">Political parties</h2></div><input className="govuk-input app-search" aria-label="Search political parties" placeholder="Search name, slug or coalition" value={partySearch} onChange={(event) => setPartySearch(event.target.value)} /></div><div className="app-filter-row"><label className="govuk-label" htmlFor="party-filter">Show</label><select id="party-filter" className="govuk-select" value={partyFilter} onChange={(event) => setPartyFilter(event.target.value as Filter)}><option value="all">All parties</option><option value="active">Public only</option><option value="inactive">Hidden only</option></select></div><div className="app-admin-table-wrap"><table className="govuk-table app-admin-table"><thead><tr><th>Party</th><th>URL slug</th><th>Visibility</th><th>Coalition</th><th><span className="govuk-visually-hidden">Actions</span></th></tr></thead><tbody>{filteredParties.map((item) => <tr key={item.id}><td><strong>{item.name}</strong>{item.abbreviation && <span className="govuk-body-s"> ({item.abbreviation})</span>}</td><td><code>/{item.slug}</code></td><td><span className={`app-status app-status--${item.status === "active" ? "public" : "hidden"}`}>{item.status === "active" ? "Public" : "Hidden"}</span></td><td>{coalitionName.get(item.coalition_id || "") || "Independent"}</td><td className="app-actions"><button type="button" className="govuk-link app-button-link" onClick={() => { setEditingParty(item.id); setParty({ name: item.name, slug: item.slug, abbreviation: item.abbreviation || "", slogan: item.slogan || "", colors: item.colors || "", symbol: item.symbol || "", status: item.status || "active", coalition_id: item.coalition_id || "", certificate_serial_no: item.certificate_serial_no || "", certificate_issue_date: item.certificate_issue_date || "", certificate_date: item.certificate_date || "", postal_address: item.postal_address || "", head_office_location: item.head_office_location || "", previous_names: item.previous_names || "", changes: item.changes || "" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button><button type="button" className="govuk-link app-button-link" onClick={() => remove("/api/admin/parties", item.id)}>Delete</button></td></tr>)}</tbody></table>{filteredParties.length === 0 && <p className="govuk-hint">No parties match the current search or filter.</p>}</div></section>}
    {section !== "parties" && <section className="app-admin-list"><div className="app-admin-list__header"><div><span className="govuk-caption-m">{filteredCoalitions.length} of {coalitions.length} records</span><h2 className="govuk-heading-l govuk-!-margin-bottom-1">Coalitions</h2></div><input className="govuk-input app-search" aria-label="Search coalitions" placeholder="Search coalition name or abbreviation" value={coalitionSearch} onChange={(event) => setCoalitionSearch(event.target.value)} /></div><div className="app-filter-row"><label className="govuk-label" htmlFor="coalition-filter">Show</label><select id="coalition-filter" className="govuk-select" value={coalitionFilter} onChange={(event) => setCoalitionFilter(event.target.value as typeof coalitionFilter)}><option value="all">All coalitions</option><option value="pre_election">Pre-election</option><option value="post_election">Post-election</option></select></div><div className="app-admin-table-wrap"><table className="govuk-table app-admin-table"><thead><tr><th>Coalition</th><th>Type</th><th>Members</th><th><span className="govuk-visually-hidden">Actions</span></th></tr></thead><tbody>{filteredCoalitions.map((item) => <tr key={item.id}><td><strong>{item.name}</strong>{item.abbreviation && <span className="govuk-body-s"> ({item.abbreviation})</span>}</td><td>{item.coalition_type === "post_election" ? "Post-election" : "Pre-election"}</td><td>{parties.filter((partyItem) => partyItem.coalition_id === item.id).length}</td><td className="app-actions"><button type="button" className="govuk-link app-button-link" onClick={() => { setEditingCoalition(item.id); setCoalition({ name: item.name, abbreviation: item.abbreviation || "", slogan: item.slogan || "", colors: item.colors || "", symbol: item.symbol || "", coalition_type: item.coalition_type || "pre_election" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button><button type="button" className="govuk-link app-button-link" onClick={() => remove("/api/admin/coalitions", item.id)}>Delete</button></td></tr>)}</tbody></table>{filteredCoalitions.length === 0 && <p className="govuk-hint">No coalitions match the current search or filter.</p>}</div></section>}
    <style>{`.app-admin-elections{padding-bottom:4rem}.app-admin-editor{background:#f3f2f1;border-left:5px solid #1d70b8;padding:1.5rem;margin:1.5rem 0 2rem}.app-admin-editor__heading,.app-admin-list__header{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem}.app-admin-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 1.5rem}.app-admin-list{border-top:1px solid #b1b4b6;padding-top:1.5rem;margin-top:2.5rem}.app-search{max-width:25rem}.app-filter-row{display:flex;align-items:center;gap:.75rem;margin:1rem 0}.app-filter-row .govuk-label{margin-bottom:0}.app-admin-table-wrap{overflow-x:auto;overscroll-behavior-x:contain;border:1px solid #b1b4b6;background:#fff}.app-admin-table{min-width:1120px;margin-bottom:0}.app-admin-table td,.app-admin-table th{vertical-align:top;padding:1rem 1.25rem;white-space:nowrap}.app-admin-table tbody tr:nth-child(even){background:#f8f8f8}.app-admin-table tbody tr:hover{background:#e8f1f8}.app-admin-table td:first-child,.app-admin-table th:first-child{padding-left:1.5rem}.app-admin-table td:last-child,.app-admin-table th:last-child{padding-right:1.5rem}.app-actions{white-space:nowrap;text-align:right;position:sticky;right:0;background:inherit}.app-admin-table thead th{background:#f3f2f1;border-bottom:2px solid #505a5f}.app-actions .app-button-link+ .app-button-link{margin-left:1rem}.app-button-link{background:none;border:0;padding:0;cursor:pointer;text-decoration:underline;font:inherit;color:#1d70b8}.app-status{display:inline-block;padding:.2rem .5rem;font-size:.875rem;font-weight:700}.app-status--public{background:#cce2d8;color:#005a30}.app-status--hidden{background:#f3f2f1;color:#505a5f}@media(max-width:700px){.app-admin-form-grid{grid-template-columns:1fr}.app-admin-editor__heading,.app-admin-list__header{display:block}.app-search{max-width:none;margin-top:1rem;width:100%}}`}</style>
  </div>;
}
