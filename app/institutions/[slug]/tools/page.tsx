import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import FuelCalculator from "@/components/epra/FuelCalculator";
import PowerBillEstimator from "@/components/epra/PowerBillEstimator";
import LicensedPetroleumOperatorChecker from "@/components/epra/LicensedPetroleumOperatorChecker";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function InstitutionToolsPage({ params }: PageProps) {
  const { slug } = await params;
  
  // Guard validation check to isolate EPRA features securely
  if (slug.toLowerCase() !== "epra") {
    return (
      <div className="govuk-width-container govuk-!-padding-top-6">
        <div className="govuk-breadcrumbs govuk-!-margin-bottom-6">
          <ol className="govuk-breadcrumbs__list">
            <li className="govuk-breadcrumbs__list-item"><Link href="/" className="govuk-breadcrumbs__link">Home</Link></li>
            <li className="govuk-breadcrumbs__list-item"><Link href="/institutions" className="govuk-breadcrumbs__link">Institutions</Link></li>
            <li className="govuk-breadcrumbs__list-item"><Link href={`/institutions/${slug}`} className="govuk-breadcrumbs__link">{slug.toUpperCase()}</Link></li>
          </ol>
        </div>
        <main className="govuk-main-wrapper">
          <h1 className="govuk-heading-xl">{slug.toUpperCase()} Tools</h1>
          <p className="govuk-body">No specialized digital tools are configured for this specific entity layout.</p>
        </main>
      </div>
    );
  }

  const supabase = createClient();

  // 1. Fetch the active processing cycle record
  const { data: activeCycle } = await (await supabase)
    .from("epra_price_cycles")
    .select("id, start_date, end_date")
    .eq("is_active", true)
    .maybeSingle();

  // 2. Safely trigger subsequent relational operations only if an active cycle exists
  let townsData: any[] = [];
  let formulaMatrix: any = null;

  if (activeCycle) {
    const { data: towns } = await (await supabase)
      .from("epra_town_prices")
      .select("town_name, price_pms, price_ago, price_ik")
      .eq("cycle_id", activeCycle.id)
      .order("town_name", { ascending: true });
      
    const { data: breakdown } = await (await supabase)
      .from("epra_nairobi_breakdown")
      .select("*")
      .eq("cycle_id", activeCycle.id)
      .maybeSingle();

    townsData = towns || [];
    formulaMatrix = breakdown;
  }

  // 3. EMPTY DATABASE SAFETY GUARD: Render warning banner if Supabase data has not been seeded yet
  const isDatabaseEmpty = !activeCycle || townsData.length === 0 || !formulaMatrix;

  return (
    <div className="govuk-width-container govuk-!-padding-top-6 govuk-!-padding-bottom-6">
      <div className="govuk-breadcrumbs govuk-!-margin-bottom-6">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item"><Link href="/" className="govuk-breadcrumbs__link">Home</Link></li>
          <li className="govuk-breadcrumbs__list-item"><Link href="/institutions" className="govuk-breadcrumbs__link">Institutions</Link></li>
          <li className="govuk-breadcrumbs__list-item"><Link href="/institutions/epra" className="govuk-breadcrumbs__link">EPRA</Link></li>
          <li className="govuk-breadcrumbs__list-item"><Link href="#" className="govuk-breadcrumbs__link">Tools</Link></li>
        </ol>
      </div>

      <main className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <span className="govuk-caption-xl">Digital Utilities</span>
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">EPRA Regulatory Calculators</h1>
          
          <p className="govuk-body-l">
            Use these official calculators to audit public utility bills, compute fuel tax allocations, and verify vendor compliance frameworks.
          </p>

          <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />

          {isDatabaseEmpty ? (
            <div className="govuk-notification-banner" role="region" aria-labelledby="govuk-notification-banner-title">
              <div className="govuk-notification-banner__header">
                <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">Service Notice</h2>
              </div>
              <div className="govuk-notification-banner__content">
                <h3 className="govuk-notification-banner__heading">Regulatory Data Offline</h3>
                <p className="govuk-body">
                  There are currently no active statutory pricing schedules seeded in the data tables for this cycle. 
                  The fuel breakdown engine will become operational as soon as public registry values are updated.
                </p>
              </div>
            </div>
          ) : (
            /* Layout Grid separating the tools index */
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                
                {/* MODULE 1: FUEL TAX CALCULATOR */}
                <div style={{ borderBottom: '2px solid #bfc1c3', paddingBottom: '30px', marginBottom: '40px' }}>
                  <h2 className="govuk-heading-l govuk-!-margin-bottom-2">1. Fuel Price Tax Decomposition Engine</h2>
                  <p className="govuk-body-s" style={{ color: '#505a5f' }}>
                    Valid for the current cycle: <strong>{new Date(activeCycle.start_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> to <strong>{new Date(activeCycle.end_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
                  </p>
                  <FuelCalculator towns={townsData} breakdown={formulaMatrix} />
                </div>

                {/* MODULE 2: POWER BILL ESTIMATOR */}
                <div style={{ borderBottom: '2px solid #bfc1c3', paddingBottom: '30px', marginBottom: '40px' }}>
                  <h2 className="govuk-heading-l govuk-!-margin-bottom-2">2. KPLC Token &amp; Electricity Tariff Estimator</h2>
                  <p className="govuk-body-s" style={{ color: '#505a5f' }}>
                    Decomposes KPLC base charges, EPRA variable fuel/forex adjustments, and statutory VAT.
                  </p>
                  <PowerBillEstimator />
                </div>

                {/* MODULE 3: ENFORCEMENT OPERATOR CHECKER */}
                <div style={{ paddingBottom: '30px' }}>
                  <h2 className="govuk-heading-l govuk-!-margin-bottom-2">3. Petrol Station Safety &amp; Adulteration Blacklist</h2>
                  <p className="govuk-body-s" style={{ color: '#505a5f' }}>
                    Live registry lookup auditing stations closed or penalized for quality breaches.
                  </p>
                  <LicensedPetroleumOperatorChecker />
                </div>

              </div>

              {/* Sidebar Quick Anchors Layout */}
              <div className="govuk-grid-column-one-third">
                <div style={{ borderTop: '5px solid #002147', padding: '20px', background: '#f3f2f1' }}>
                  <h3 className="govuk-heading-m">Regulatory Functions</h3>
                  <p className="govuk-body-s">These interactive items map mathematical cost structures derived straight from gazetted legal alerts.</p>
                  <hr className="govuk-section-break govuk-section-break--s govuk-section-break--visible" />
                  <p className="govuk-body-s" style={{ color: '#505a5f', margin: 0 }}>
                    Report unlisted pricing deviations or suspected adulteration directly to the primary EPRA consumer desk.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
