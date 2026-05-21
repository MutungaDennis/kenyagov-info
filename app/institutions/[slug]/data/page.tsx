import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import EpraDataViewerClient from "./EpraDataViewerClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function InstitutionDataPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug.toLowerCase() !== "epra") {
    return (
      <div className="govuk-width-container govuk-!-padding-top-6">
        <main className="govuk-main-wrapper">
          <h1 className="govuk-heading-xl">{slug.toUpperCase()} Analytics</h1>
          <p className="govuk-body">No structured data visualization streams are configured for this entity.</p>
        </main>
      </div>
    );
  }

  const supabase = createClient();

  // 1. Fetch ALL available price cycles from Supabase to feed our dynamic history engine switcher
  const { data: allCycles } = await (await supabase)
    .from("epra_price_cycles")
    .select("id, start_date, end_date, usd_kes_exchange_rate, is_active")
    .order("start_date", { ascending: false });

  if (!allCycles || allCycles.length === 0) {
    return (
      <div className="govuk-width-container govuk-!-padding-top-6">
        <div className="govuk-notification-banner" role="region">
          <div className="govuk-notification-banner__header">
            <h2 className="govuk-notification-banner__title">System Notice</h2>
          </div>
          <div className="govuk-notification-banner__content">
            <h3 className="govuk-notification-banner__heading">Database Offline</h3>
            <p className="govuk-body">No historical price scheduling cycles have been seeded in the repository tables yet.</p>
          </div>
        </div>
      </div>
    );
  }

  // Find the primary baseline cycle (fall back to the newest row if none are actively flagged as true)
  const defaultCycle = allCycles.find(c => c.is_active) || allCycles[0];

  // 2. Fetch ALL town price entries across ALL loaded timelines at once to avoid sluggish client refetching
  const { data: globalTownPrices } = await (await supabase)
    .from("epra_town_prices")
    .select("cycle_id, town_name, price_pms, price_ago, price_ik")
    .order("town_name", { ascending: true });

  // 3. Fetch itemized macro breakdown parameters to power information tags
  const { data: globalFormulaMatrix } = await (await supabase)
    .from("epra_nairobi_breakdown")
    .select("*");

  // 4. Fetch dynamic international trends logs to map our custom pure SVG line charts coordinates
  const { data: dbTrendsLog } = await (await supabase)
    .from("epra_international_trends")
    .select("cycle_id, trend_month_label, super_petrol_usd_mt, diesel_usd_mt, kerosene_usd_mt, murban_crude_usd_bbl, usd_kes_historic_rate")
    .order("created_at", { ascending: true });

  return (
    <div className="govuk-width-container govuk-!-padding-top-6 govuk-!-padding-bottom-6">
      
      <div className="govuk-breadcrumbs govuk-!-margin-bottom-6">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item"><Link href="/" className="govuk-breadcrumbs__link">Home</Link></li>
          <li className="govuk-breadcrumbs__list-item"><Link href="/institutions" className="govuk-breadcrumbs__link">Institutions</Link></li>
          <li className="govuk-breadcrumbs__list-item"><Link href="/institutions/epra" className="govuk-breadcrumbs__link">EPRA</Link></li>
          <li className="govuk-breadcrumbs__list-item"><Link href="#" className="govuk-breadcrumbs__link">Data &amp; Metrics</Link></li>
        </ol>
      </div>

      <main className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <span className="govuk-caption-xl">Public Registries</span>
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">Petroleum Pricing Datasets</h1>
          
          <p className="govuk-body-l">
            Review live maximum retail pump price thresholds, historical pricing cycles, and macro-economic exchange benchmarks published by EPRA.
          </p>

          <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />

          {/* Mount the high-performance client interface controller block */}
          <EpraDataViewerClient 
            allCycles={allCycles}
            defaultCycleId={defaultCycle.id}
            globalTownPrices={globalTownPrices || []}
            globalFormulaMatrix={globalFormulaMatrix || []}
            trendsLog={dbTrendsLog || []}
          />

        </div>
      </main>
    </div>
  );
}
