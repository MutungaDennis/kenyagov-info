// app/government/institutions/[slug]/about/economy/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

type Props = {
  params: Promise<{ slug: string }>;
};

type CountyEconomy = {
  name: string;
  slug: string;
  
  // Economic Overview
  gross_county_product: number | null;
  dominant_sector: string | null;
  main_economic_activities: string[] | null;
  
  // Agriculture - Crops
  average_farm_size_small: number | null;
  main_food_crops: string[] | null;
  main_cash_crops: string[] | null;
  total_acreage_food_crops: number | null;
  total_acreage_cash_crops: number | null;
  
  // Agriculture - Livestock
  dairy_cattle_count: number | null;
  beef_cattle_count: number | null;
  goats_count: number | null;
  sheep_count: number | null;
  poultry_count: number | null;
  pigs_count: number | null;
  rabbits_count: number | null;
  beehives_count: number | null;
  
  // Fisheries & Blue Economy
  fish_traders_count: number | null;
  fish_farm_families_count: number | null;
  fish_ponds_count: number | null;
  fish_tanks_count: number | null;
  fish_ponds_area_m2: number | null;
  fish_landing_sites_count: number | null;
  beach_management_units_count: number | null;
  fish_production_tonnes: number | null;
  
  // Trade & Industry
  trading_centers_count: number | null;
  registered_retail_traders: number | null;
  registered_wholesale_traders: number | null;
  jua_kali_associations_count: number | null;
  msme_count: number | null;
  
  // Financial Services
  active_cooperatives_count: number | null;
  dormant_cooperatives_count: number | null;
  collapsed_cooperatives_count: number | null;
  cooperative_membership_count: number | null;
  commercial_banks_count: number | null;
  microfinance_count: number | null;
};

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A";
  return new Intl.NumberFormat("en-KE").format(num);
}

function formatCurrency(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A";
  if (num >= 1000000000) {
    return `Ksh ${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `Ksh ${(num / 1000000).toFixed(1)}M`;
  }
  return `Ksh ${formatNumber(num)}`;
}

export default async function CountyEconomyPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: county } = await supabase
    .from("counties")
    .select(`
      name,
      slug,
      gross_county_product,
      dominant_sector,
      main_economic_activities,
      average_farm_size_small,
      main_food_crops,
      main_cash_crops,
      total_acreage_food_crops,
      total_acreage_cash_crops,
      dairy_cattle_count,
      beef_cattle_count,
      goats_count,
      sheep_count,
      poultry_count,
      pigs_count,
      rabbits_count,
      beehives_count,
      fish_traders_count,
      fish_farm_families_count,
      fish_ponds_count,
      fish_tanks_count,
      fish_ponds_area_m2,
      fish_landing_sites_count,
      beach_management_units_count,
      fish_production_tonnes,
      trading_centers_count,
      registered_retail_traders,
      registered_wholesale_traders,
      jua_kali_associations_count,
      msme_count,
      active_cooperatives_count,
      dormant_cooperatives_count,
      collapsed_cooperatives_count,
      cooperative_membership_count,
      commercial_banks_count,
      microfinance_count
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (!county) {
    notFound();
  }

  const totalLivestock = 
    (county.dairy_cattle_count || 0) +
    (county.beef_cattle_count || 0) +
    (county.goats_count || 0) +
    (county.sheep_count || 0) +
    (county.poultry_count || 0) +
    (county.pigs_count || 0) +
    (county.rabbits_count || 0);

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Institutions", href: "/government/institutions" },
          { text: county.name, href: `/government/institutions/${slug}` },
          { text: "About", href: `/government/institutions/${slug}/about` },
          { text: "Economy" },
        ]}
      />

      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <span className="govuk-caption-l">{county.name}</span>
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
                Economy, Agriculture & Blue Economy
              </h1>
              <p className="govuk-body-l govuk-!-margin-bottom-6">
                Comprehensive overview of {county.name}&apos;s economic activities, agricultural production, 
                blue economy initiatives, trade, and financial services.
              </p>
            </div>
          </div>

          {/* Hero Statistics */}
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-one-third">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                <span className="govuk-heading-m govuk-!-margin-bottom-1">
                  {formatCurrency(county.gross_county_product)}
                </span>
                <span className="govuk-body-s">Gross County Product</span>
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                <span className="govuk-heading-m govuk-!-margin-bottom-1">
                  {formatNumber(county.msme_count)}
                </span>
                <span className="govuk-body-s">MSMEs</span>
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                <span className="govuk-heading-m govuk-!-margin-bottom-1">
                  {formatNumber(county.fish_production_tonnes)} tonnes
                </span>
                <span className="govuk-body-s">Fish Production</span>
              </div>
            </div>
          </div>

          {/* Economic Overview */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="economic-overview-heading">
            <h2 id="economic-overview-heading" className="govuk-heading-l">
              Economic Overview
            </h2>
            
            <dl className="govuk-summary-list">
              {county.dominant_sector && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Dominant Sector</dt>
                  <dd className="govuk-summary-list__value">{county.dominant_sector}</dd>
                </div>
              )}
              {county.main_economic_activities && county.main_economic_activities.length > 0 && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Main Economic Activities</dt>
                  <dd className="govuk-summary-list__value">
                    <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-0">
                      {county.main_economic_activities.map((activity: string, index: number) => (
                        <li key={index}>{activity}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Agriculture - Crop Production */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="crop-production-heading">
            <h2 id="crop-production-heading" className="govuk-heading-l">
              Agriculture: Crop Production
            </h2>
            
            <dl className="govuk-summary-list">
              {county.average_farm_size_small && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Average Farm Size (Small Scale)</dt>
                  <dd className="govuk-summary-list__value">{county.average_farm_size_small} acres</dd>
                </div>
              )}
              {county.total_acreage_food_crops && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Total Acreage Under Food Crops</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.total_acreage_food_crops)} acres</dd>
                </div>
              )}
              {county.total_acreage_cash_crops && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Total Acreage Under Cash Crops</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.total_acreage_cash_crops)} acres</dd>
                </div>
              )}
              {county.main_food_crops && county.main_food_crops.length > 0 && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Main Food Crops</dt>
                  <dd className="govuk-summary-list__value">
                    <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-0">
                      {county.main_food_crops.map((crop: string, index: number) => (
                        <li key={index}>{crop}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              {county.main_cash_crops && county.main_cash_crops.length > 0 && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Main Cash Crops</dt>
                  <dd className="govuk-summary-list__value">
                    <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-0">
                      {county.main_cash_crops.map((crop: string, index: number) => (
                        <li key={index}>{crop}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Agriculture - Livestock */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="livestock-heading">
            <h2 id="livestock-heading" className="govuk-heading-l">
              Agriculture: Livestock Production
            </h2>
            
            {totalLivestock > 0 && (
              <div className="govuk-inset-text govuk-!-margin-bottom-6">
                <p className="govuk-body govuk-!-margin-bottom-0">
                  <strong>Total Livestock Population:</strong> {formatNumber(totalLivestock)}
                </p>
              </div>
            )}

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-half">
                <h3 className="govuk-heading-m">Cattle</h3>
                <dl className="govuk-summary-list">
                  {county.dairy_cattle_count && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Dairy Cattle</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(county.dairy_cattle_count)}</dd>
                    </div>
                  )}
                  {county.beef_cattle_count && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Beef Cattle</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(county.beef_cattle_count)}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="govuk-grid-column-one-half">
                <h3 className="govuk-heading-m">Small Stock</h3>
                <dl className="govuk-summary-list">
                  {county.goats_count && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Goats</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(county.goats_count)}</dd>
                    </div>
                  )}
                  {county.sheep_count && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Sheep</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(county.sheep_count)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            <div className="govuk-grid-row govuk-!-margin-top-6">
              <div className="govuk-grid-column-one-half">
                <h3 className="govuk-heading-m">Poultry & Others</h3>
                <dl className="govuk-summary-list">
                  {county.poultry_count && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Poultry</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(county.poultry_count)}</dd>
                    </div>
                  )}
                  {county.pigs_count && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Pigs</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(county.pigs_count)}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="govuk-grid-column-one-half">
                <h3 className="govuk-heading-m">Other Livestock</h3>
                <dl className="govuk-summary-list">
                  {county.rabbits_count && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Rabbits</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(county.rabbits_count)}</dd>
                    </div>
                  )}
                  {county.beehives_count && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Beehives</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(county.beehives_count)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </section>

          {/* Blue Economy - Fisheries */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="fisheries-heading">
            <h2 id="fisheries-heading" className="govuk-heading-l">
              Blue Economy: Fisheries
            </h2>
            
            {county.fish_production_tonnes && (
              <div className="govuk-inset-text govuk-!-margin-bottom-6">
                <p className="govuk-body govuk-!-margin-bottom-0">
                  <strong>Total Fish Production:</strong> {formatNumber(county.fish_production_tonnes)} tonnes annually
                </p>
              </div>
            )}

            <dl className="govuk-summary-list">
              {county.fish_landing_sites_count && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Fish Landing Sites</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.fish_landing_sites_count)}</dd>
                </div>
              )}
              {county.beach_management_units_count && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Beach Management Units (BMUs)</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.beach_management_units_count)}</dd>
                </div>
              )}
              {county.fish_traders_count && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Fish Traders</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.fish_traders_count)}</dd>
                </div>
              )}
              {county.fish_farm_families_count && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Fish Farm Families</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.fish_farm_families_count)}</dd>
                </div>
              )}
              {county.fish_ponds_count && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Fish Ponds</dt>
                  <dd className="govuk-summary-list__value">
                    {formatNumber(county.fish_ponds_count)}
                    {county.fish_ponds_area_m2 && ` (${formatNumber(county.fish_ponds_area_m2)} m²)`}
                  </dd>
                </div>
              )}
              {county.fish_tanks_count && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Fish Tanks</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.fish_tanks_count)}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Trade & Industry */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="trade-heading">
            <h2 id="trade-heading" className="govuk-heading-l">
              Trade & Industry
            </h2>
            
            <dl className="govuk-summary-list">
              {county.trading_centers_count && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Trading Centers</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.trading_centers_count)}</dd>
                </div>
              )}
              {county.registered_retail_traders && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Registered Retail Traders</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.registered_retail_traders)}</dd>
                </div>
              )}
              {county.registered_wholesale_traders && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Registered Wholesale Traders</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.registered_wholesale_traders)}</dd>
                </div>
              )}
              {county.jua_kali_associations_count && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Jua Kali Associations</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.jua_kali_associations_count)}</dd>
                </div>
              )}
              {county.msme_count && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Micro, Small & Medium Enterprises (MSMEs)</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.msme_count)}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Financial Services */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="financial-heading">
            <h2 id="financial-heading" className="govuk-heading-l">
              Financial Services
            </h2>
            
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-half">
                <h3 className="govuk-heading-m">Banking & Microfinance</h3>
                <dl className="govuk-summary-list">
                  {county.commercial_banks_count && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Commercial Banks</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(county.commercial_banks_count)}</dd>
                    </div>
                  )}
                  {county.microfinance_count && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Microfinance Institutions</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(county.microfinance_count)}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="govuk-grid-column-one-half">
                <h3 className="govuk-heading-m">Cooperative Societies</h3>
                <dl className="govuk-summary-list">
                  {county.active_cooperatives_count && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Active Cooperatives</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(county.active_cooperatives_count)}</dd>
                    </div>
                  )}
                  {county.dormant_cooperatives_count && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Dormant Cooperatives</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(county.dormant_cooperatives_count)}</dd>
                    </div>
                  )}
                  {county.collapsed_cooperatives_count && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Collapsed Cooperatives</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(county.collapsed_cooperatives_count)}</dd>
                    </div>
                  )}
                  {county.cooperative_membership_count && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Total Membership</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(county.cooperative_membership_count)} members</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </section>

          {/* Navigation to Other Sections */}
          <nav className="govuk-!-margin-top-8" aria-label="Explore more about the county">
            <h2 className="govuk-heading-m">Explore more about {county.name}</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href={`/government/institutions/${slug}/about/overview`} className="govuk-link">
                  Overview & Leadership
                </Link>
              </li>
              <li>
                <Link href={`/government/institutions/${slug}/about/demographics`} className="govuk-link">
                  Demographics & Population
                </Link>
              </li>
              <li>
                <Link href={`/government/institutions/${slug}/about/health`} className="govuk-link">
                  Health & Social Services
                </Link>
              </li>
              <li>
                <Link href={`/government/institutions/${slug}/about/education`} className="govuk-link">
                  Education & Skills Development
                </Link>
              </li>
              <li>
                <Link href={`/government/institutions/${slug}/about/infrastructure`} className="govuk-link">
                  Infrastructure, Water & Housing
                </Link>
              </li>
              <li>
                <Link href={`/government/institutions/${slug}/about/tourism-culture`} className="govuk-link">
                  Tourism, Culture & Environment
                </Link>
              </li>
            </ul>
          </nav>
        </main>
      </div>
    </>
  );
}