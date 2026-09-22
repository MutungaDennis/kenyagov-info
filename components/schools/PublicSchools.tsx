"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClientAsync } from "@/lib/supabase/client";
import { SCHOOL_LEVELS, schoolLevelLabel, schoolSearchTerm, schoolValue, type SchoolSummary } from "@/lib/schools/types";
import styles from "./schools.module.css";

const PAGE_SIZE = 20;

export default function PublicSchools({ searchTerm = "", viewMode = "accordion", fixedDirectorate, autoOpen = false }: {
  searchTerm?: string; viewMode?: "accordion" | "table"; fixedDirectorate?: string; autoOpen?: boolean;
}) {
  const [open,setOpen] = useState(autoOpen);
  const [query,setQuery] = useState("");
  const [localSearch,setLocalSearch] = useState("");
  const [county,setCounty] = useState("");
  const [level,setLevel] = useState("");
  const [category,setCategory] = useState("");
  const [directorate,setDirectorate] = useState(fixedDirectorate || "");
  const [counties,setCounties] = useState<{code:number;name:string}[]>([]);
  const [schools,setSchools] = useState<SchoolSummary[]>([]);
  const [total,setTotal] = useState<number | null>(null);
  const [matches,setMatches] = useState(0);
  const [page,setPage] = useState(1);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [retry,setRetry] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => { setQuery(schoolSearchTerm(fixedDirectorate ? localSearch : searchTerm)); setPage(1); },300);
    return () => window.clearTimeout(timer);
  },[searchTerm,localSearch,fixedDirectorate]);

  useEffect(() => {
    let cancelled=false;
    (async () => {
      try {
        const db=await createBrowserClientAsync();
        let countRequest = db.from("education_schools").select("id",{count:"exact",head:true}).eq("ownership", "public").eq("is_published", true);
        if (fixedDirectorate === "directorate-primary-education") countRequest = countRequest.in("main_tier",["primary","junior"]);
        if (fixedDirectorate === "directorate-secondary-education") countRequest = countRequest.eq("main_tier","senior_secondary");
        const [countResult,countyResult] = await Promise.all([
          countRequest,
          db.from("education_counties").select("code,name").order("name"),
        ]);
        if (countResult.error || countyResult.error) throw new Error("School directory unavailable");
        if (!cancelled) { setTotal(countResult.count ?? 0); setCounties(countyResult.data ?? []); }
      } catch { if (!cancelled) setError("Public schools could not be loaded. Please try again."); }
    })();
    return () => {cancelled=true;};
  },[retry,fixedDirectorate]);

  const expanded = open;
  useEffect(() => {
    if (!expanded) return;
    let cancelled=false;
    (async () => {
      try {
        const db=await createBrowserClientAsync();
        if (cancelled) return;
        setLoading(true); setError("");
        const result = await db.rpc("search_public_schools", {
          q: query, directorate: directorate || null, county_filter: county ? Number(county) : null,
          level_filter: level || null, category_filter: category || null, page_number: page, page_size: PAGE_SIZE,
        });
        if (result.error) throw result.error;
        const payload = result.data as { schools: SchoolSummary[]; total: number };
        if (!cancelled) { setSchools(payload.schools || []); setMatches(payload.total || 0); }

      } catch { if (!cancelled) { setSchools([]); setError("Public schools could not be loaded. Please try again."); } }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => {cancelled=true;};
  },[expanded,query,county,level,category,directorate,page,retry]);

  const pages=Math.max(1,Math.ceil(matches/PAGE_SIZE));
  function filter(setter:(v:string)=>void,value:string) {setter(value);setPage(1);}
  return <section className={styles.directory} id="public-schools" aria-labelledby="public-schools-heading">
    <div className={styles.heading}>
      <div><span className={styles.eyebrow}>Publicly funded education</span>
        <h2 className="govuk-heading-m govuk-!-margin-bottom-2" id="public-schools-heading">Public schools</h2>
        <p className="govuk-body-s govuk-!-margin-bottom-0">{total == null ? "Loading school count…" : `${total.toLocaleString("en-KE")} public schools${fixedDirectorate ? " under this directorate" : " across Kenya"}`}</p>
      </div>
    </div>
      <button type="button" className="govuk-button govuk-!-margin-top-3" aria-expanded={expanded} aria-controls="school-results" onClick={()=>setOpen(!open)}>{open ? "Close school browser" : "Browse public schools under this directorate"}</button>
      {open && <div id="school-results">
        {fixedDirectorate && <div className="govuk-form-group"><label className="govuk-label govuk-label--s" htmlFor="directorate-school-search">Search schools by name or location</label><input id="directorate-school-search" className="govuk-input" type="search" value={localSearch} onChange={e=>setLocalSearch(e.target.value)} /></div>}
        {directorate && <p className="govuk-body-s">Under the <Link className="govuk-link" href={`/government/institutions/${directorate}`}>{directorate === "directorate-primary-education" ? "Directorate of Primary Education" : "Directorate of Secondary Education"}</Link>.</p>}
        <div className={styles.filters}>
          <div className="govuk-form-group"><label className="govuk-label govuk-label--s" htmlFor="school-county">County</label>
            <select className="govuk-select" id="school-county" value={county} onChange={e=>filter(setCounty,e.target.value)}><option value="">All counties</option>{counties.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select></div>
          <div className="govuk-form-group"><label className="govuk-label govuk-label--s" htmlFor="school-level">Education level</label>
            <select className="govuk-select" id="school-level" value={level} onChange={e=>filter(setLevel,e.target.value)}><option value="">All levels</option>{Object.entries(SCHOOL_LEVELS).filter(([key])=>!directorate || (directorate === "directorate-primary-education" ? ["primary","junior"].includes(key) : key === "senior_secondary")).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div>
          <div className="govuk-form-group"><label className="govuk-label govuk-label--s" htmlFor="school-category">Secondary category</label>
            <select className="govuk-select" id="school-category" value={category} onChange={e=>filter(setCategory,e.target.value)}><option value="">All recorded categories</option><option value="national">National</option><option value="extra_county">Extra-county</option><option value="county">County</option><option value="sub_county">Sub-county</option></select></div>
        </div>
        <p className="govuk-hint">Categories and junior-school classifications appear only where recorded in the source data.</p>
        {(county || level || category || (!fixedDirectorate && directorate)) && <button className="govuk-button govuk-button--secondary" type="button" onClick={()=>{setCounty("");setLevel("");setCategory("");setDirectorate(fixedDirectorate || "");setPage(1);}}>Clear school filters</button>}
        <div aria-live="polite" role="status"><p className="govuk-body-s">{loading ? "Loading public schools…" : error ? "" : `${matches.toLocaleString("en-KE")} schools${query ? ` matching “${query}”` : ""}`}</p></div>
        {error ? <p className="govuk-body" role="alert">{error} <button type="button" onClick={()=>setRetry(v=>v+1)}>Try again</button></p>
          : !loading && matches === 0 ? <p className="govuk-body">No public schools match these filters. Try another name, county or education level.</p>
          : !loading && viewMode === "table" ? <div className={styles.tableScroll}><table className="govuk-table"><caption className="govuk-visually-hidden">Public school results</caption>
            <thead><tr><th className="govuk-table__header" scope="col">School</th><th className="govuk-table__header" scope="col">Level</th><th className="govuk-table__header" scope="col">County</th></tr></thead>
            <tbody>{schools.map(s=><tr key={s.id}><td className="govuk-table__cell"><Link className="govuk-link" href={`/government/institutions/${s.slug}`}>{s.official_name}</Link></td><td className="govuk-table__cell">{schoolLevelLabel(s.main_tier)}</td><td className="govuk-table__cell">{schoolValue(s.county)}</td></tr>)}</tbody>
          </table></div> : !loading && <ul className={`govuk-list ${styles.results}`}>{schools.map(s=><li key={s.id}>
            <h3 className="govuk-heading-s govuk-!-margin-bottom-1"><Link className="govuk-link govuk-link--no-visited-state" href={`/government/institutions/${s.slug}`}>{s.official_name}</Link></h3>
            <p className="govuk-body-s govuk-!-margin-bottom-1">{schoolLevelLabel(s.main_tier)} · {[s.sub_county,s.county].filter(Boolean).join(", ") || "Location not recorded"}</p>
            {s.moe_category && <span className="govuk-tag govuk-tag--grey">{schoolValue(s.moe_category)}</span>}
          </li>)}</ul>}
        {!loading && !error && matches>0 && <nav className={styles.pagination} aria-label="School results pages">
          <button className="govuk-button govuk-button--secondary" type="button" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous schools</button>
          <span className="govuk-body-s">Page {page.toLocaleString("en-KE")} of {pages.toLocaleString("en-KE")}</span>
          <button className="govuk-button govuk-button--secondary" type="button" disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Next schools</button>
        </nav>}
      </div>}
  </section>;
}
