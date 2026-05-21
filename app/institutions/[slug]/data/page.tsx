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

  // 1. Fetch active cycle timeline parameters
  const { data: activeCycle } = await (await supabase)
    .from("epra_price_cycles")
    .select("id, start_date, end_date, usd_kes_exchange_rate")
    .eq("is_active", true)
    .maybeSingle();

  let allTowns: any[] = [];

  if (activeCycle) {
    const { data: remaining } = await (await supabase)
      .from("epra_town_prices")
      .select("town_name, price_pms, price_ago, price_ik")
      .eq("cycle_id", activeCycle.id)
      .order("town_name", { ascending: true });

    allTowns = remaining || [];
  }

  const isDataEmpty = !activeCycle || allTowns.length === 0;

  // 2. Mock historical trend matrices to feed our SVG Chart component safely without db pollution
  const historicalCyclesMock = [
    { label: 'Jan 26', pms: 209.10, ago: 235.40 },
    { label: 'Feb 26', pms: 211.50, ago: 238.20 },
    { label: 'Mar 26', pms: 199.30, ago: 212.40 },
    { label: 'Apr 26', pms: 197.60, ago: 196.63 },
    { label: 'May 26', pms: 214.25, ago: 242.92 }, // Current Period
  ];

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

          {isDataEmpty ? (
            <div className="govuk-notification-banner" role="region" aria-labelledby="govuk-notification-banner-title">
              <div className="govuk-notification-banner__header">
                <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">Service Status</h2>
              </div>
              <div className="govuk-notification-banner__content">
                <h3 className="govuk-notification-banner__heading">Metrics Log Empty</h3>
                <p className="govuk-body">
                  No active petroleum pricing logs or regional currency records were located in the system database for the current tracking month.
                </p>
              </div>
            </div>
          ) : (
            /* Pass the raw state down to our beautiful interactive client engine */
            <EpraDataViewerClient 
              allTowns={allTowns} 
              activeCycle={activeCycle} 
              historicalData={historicalCyclesMock} 
            />
          )}

        </div>
      </main>
    </div>
  );
}
