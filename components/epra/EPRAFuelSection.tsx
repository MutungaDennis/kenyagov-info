"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserClientAsync } from "@/lib/supabase/client";

type Cycle = { id: string; start_date: string; end_date: string | null; is_active: boolean; created_at: string; usd_kes_exchange_rate?: number | null };
type TownPrice = { id: string; cycle_id?: string; town_name: string; price_pms: number | null; price_ago: number | null; price_ik: number | null; is_major_city: boolean };
type HistoryPoint = { cycle: Cycle; price: TownPrice };
type LpgPrice = { id: string; town_name: string; refill_price_6kg: number | null; refill_price_13kg: number | null };

const money = (value: number | null | undefined) => value == null ? "Not available" : `KSh ${Number(value).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value: string | null | undefined) => value ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value)) : "Not available";

type Props = { compact?: boolean };

export default function EPRAFuelSection({ compact = false }: Props) {
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [towns, setTowns] = useState<TownPrice[]>([]);
  const [lpg, setLpg] = useState<LpgPrice[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [town, setTown] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const supabase = await createBrowserClientAsync();
      const { data: cycleData, error: cycleError } = await supabase.from("epra_price_cycles").select("id,start_date,end_date,is_active,created_at,usd_kes_exchange_rate").eq("is_active", true).order("start_date", { ascending: false }).limit(1).maybeSingle();
      if (!mounted) return;
      if (cycleError) { setError(true); return; }
      setCycle(cycleData);
      if (!cycleData) return;
      const [townResult, lpgResult, cyclesResult, historyResult] = await Promise.all([
        supabase.from("epra_town_prices").select("id,cycle_id,town_name,price_pms,price_ago,price_ik,is_major_city").eq("cycle_id", cycleData.id).order("is_major_city", { ascending: false }).order("town_name"),
        supabase.from("epra_lpg_prices").select("id,town_name,refill_price_6kg,refill_price_13kg").eq("cycle_id", cycleData.id).order("town_name").limit(12),
        supabase.from("epra_price_cycles").select("id,start_date,end_date,is_active,created_at,usd_kes_exchange_rate").order("start_date", { ascending: false }).limit(24),
        supabase.from("epra_town_prices").select("id,cycle_id,town_name,price_pms,price_ago,price_ik,is_major_city").eq("town_name", "Nairobi").order("cycle_id")
      ]);
      if (!mounted) return;
      if (townResult.error || lpgResult.error) setError(true);
      setTowns((townResult.data || []) as TownPrice[]);
      setLpg(lpgResult.data || []);
      const historyCycles = (cyclesResult.data || []) as Cycle[];
      const historyPrices = (historyResult.data || []) as TownPrice[];
      setHistory(historyCycles.map((item) => ({ cycle: item, price: historyPrices.find((price) => price.cycle_id === item.id) })).filter((item): item is HistoryPoint => Boolean(item.price)));
    })();
    return () => { mounted = false; };
  }, []);

  const visibleTowns = useMemo(() => towns.filter((item) => !town || item.town_name.toLowerCase().includes(town.toLowerCase())), [towns, town]);
  const priorityTowns = ["Nairobi", "Mombasa", "Eldoret", "Nakuru", "Kisumu"];
  const nairobi = towns.find((item) => item.town_name.toLowerCase() === "nairobi");

  return (
    <section className={`epra-fuel-panel ${compact ? "epra-fuel-panel--compact" : ""}`} aria-labelledby="epra-fuel-heading">
      <p className="govuk-caption-l">For motorists, households and businesses</p>
      <h2 id="epra-fuel-heading" className="govuk-heading-l">14th of the month pump prices</h2>
      <p className="govuk-body">EPRA publishes maximum retail prices for the current 30-day pricing cycle. Nairobi is shown first because it is the reference price most often used by consumers.</p>
      {error && <p className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> Some EPRA data could not be loaded.</p>}
      {!cycle ? <p className="govuk-inset-text">There is no current fuel pricing cycle available.</p> : (
        <>
          <div className="epra-cycle-summary">
            <div><span className="govuk-caption-m">Current pricing cycle</span><strong>{date(cycle.start_date)}{cycle.end_date ? ` to ${date(cycle.end_date)}` : ""}</strong></div>
            <div><span className="govuk-caption-m">Published</span><strong>{date(cycle.created_at)}</strong></div>
          </div>
          {compact ? (
            <>
              <div className="epra-nairobi-card">
                <p className="govuk-caption-m">Nairobi · effective {date(cycle.start_date)}</p>
                {nairobi ? <div className="epra-nairobi-prices"><div><span>Super petrol</span><strong>{money(nairobi.price_pms)}</strong></div><div><span>Diesel</span><strong>{money(nairobi.price_ago)}</strong></div><div><span>Kerosene</span><strong>{money(nairobi.price_ik)}</strong></div></div> : <p className="govuk-body">Nairobi prices are not available for this cycle.</p>}
              </div>
              <p className="govuk-body"><Link href="/government/institutions/energy-petroleum-regulatory-authority/about" className="govuk-link">See prices for Mombasa, Eldoret, Nakuru and Kisumu, the full table and price history</Link></p>
            </>
          ) : <>
          <div className="govuk-form-group"><label className="govuk-label" htmlFor="epra-town">Find prices by town</label><input className="govuk-input govuk-input--width-20" id="epra-town" value={town} onChange={(event) => setTown(event.target.value)} placeholder="e.g. Nairobi or Mombasa" /></div>
          <div className="govuk-table-wrapper"><table className="govuk-table"><caption className="govuk-table__caption govuk-heading-m">Maximum retail prices</caption><thead><tr><th>Town</th><th>Petrol (PMS)</th><th>Diesel (AGO)</th><th>Kerosene (IK)</th></tr></thead><tbody>{visibleTowns.map((item) => <tr key={item.id}><th scope="row">{item.town_name}{item.is_major_city ? "*" : ""}</th><td>{money(item.price_pms)}</td><td>{money(item.price_ago)}</td><td>{money(item.price_ik)}</td></tr>)}</tbody></table></div>
          {!visibleTowns.length && <p className="govuk-inset-text">No town prices match your search.</p>}
          <p className="govuk-hint">* Major city. These are maximum prices, not necessarily the price charged at every station.</p>
          {priorityTowns.some((name) => towns.some((item) => item.town_name.toLowerCase() === name.toLowerCase())) && <p className="govuk-body-s">Priority consumer cities: Nairobi, Mombasa, Eldoret, Nakuru and Kisumu.</p>}
          {lpg.length > 0 && <details className="govuk-details"><summary className="govuk-details__summary"><span className="govuk-details__summary-text">LPG refill prices</span></summary><div className="govuk-details__text"><p className="govuk-body">Indicative refill prices for 6 kg and 13 kg cylinders in selected towns.</p><div className="govuk-table-wrapper"><table className="govuk-table"><thead><tr><th>Town</th><th>6 kg refill</th><th>13 kg refill</th></tr></thead><tbody>{lpg.map((item) => <tr key={item.id}><th scope="row">{item.town_name}</th><td>{money(item.refill_price_6kg)}</td><td>{money(item.refill_price_13kg)}</td></tr>)}</tbody></table></div></div></details>}
          {history.length > 1 && <details className="govuk-details"><summary className="govuk-details__summary"><span className="govuk-details__summary-text">Nairobi price history</span></summary><div className="govuk-details__text"><p className="govuk-body">A view of how Nairobi maximum retail prices have changed across the available pricing cycles.</p><div className="epra-history-chart" role="img" aria-label="Nairobi petrol price trend"><div className="epra-history-bars">{[...history].reverse().map((point) => <div className="epra-history-bar" key={point.cycle.id}><span style={{ height: `${Math.max(12, Math.min(100, Number(point.price.price_pms || 0) / 2.5))}%` }} title={`${date(point.cycle.start_date)}: ${money(point.price.price_pms)}`} /><small>{new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit" }).format(new Date(point.cycle.start_date))}</small></div>)}</div><p className="govuk-hint">Bars show Nairobi Super Petrol maximum retail prices; exact values remain in the table above.</p></div></div></details>}
          </>}
        </>
      )}
      <details className="govuk-details"><summary className="govuk-details__summary"><span className="govuk-details__summary-text">Fuel terms explained</span></summary><div className="govuk-details__text"><dl className="govuk-summary-list"><div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">PMS</dt><dd className="govuk-summary-list__value">Premium Motor Spirit, commonly called petrol.</dd></div><div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">AGO</dt><dd className="govuk-summary-list__value">Automotive Gas Oil, commonly called diesel.</dd></div><div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">IK</dt><dd className="govuk-summary-list__value">Illuminating kerosene.</dd></div></dl></div></details>
      <p className="govuk-body-s">Source: Energy and Petroleum Regulatory Authority. CitizenGuide.KE presents this information for reference and is not EPRA.</p>
      <style>{`.epra-fuel-panel{border-top:4px solid #1d70b8;margin:2.5rem 0;padding-top:1.5rem}.epra-cycle-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin:1.5rem 0;padding:1rem;background:#f3f2f1}.epra-cycle-summary div{display:flex;flex-direction:column;gap:.25rem}.epra-nairobi-card{margin:1.5rem 0;padding:1.25rem;background:#d8f0df;border-left:5px solid #006b3f;box-shadow:0 2px 0 rgba(0,0,0,.08)}.epra-nairobi-prices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem}.epra-nairobi-prices div{display:flex;flex-direction:column;gap:.25rem}.epra-nairobi-prices strong{font-size:1.35rem}.epra-history-bars{height:180px;display:flex;align-items:flex-end;gap:.5rem;border-bottom:1px solid #505a5f;padding:1rem 0 0}.epra-history-bar{height:100%;flex:1;min-width:18px;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:.35rem}.epra-history-bar span{display:block;width:100%;max-width:34px;background:#006b3f}.epra-history-bar small{font-size:.75rem;white-space:nowrap;transform:rotate(-35deg);transform-origin:top center}@media(max-width:640px){.epra-cycle-summary{grid-template-columns:1fr}.epra-nairobi-prices{grid-template-columns:1fr}.epra-fuel-panel .govuk-table{min-width:620px}}`}</style>
    </section>
  );
}
