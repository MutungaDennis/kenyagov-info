import { notFound } from "next/navigation";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

type Props = {
  params: Promise<{ slug: string }>;
};

type CountyInfrastructure = {
  name: string;
  slug: string;
  population: number | null;
  households_count: number | null;
  
  // Roads & Transport
  bitumen_roads_km: number | null;
  gravel_roads_km: number | null;
  earth_roads_km: number | null;
  railway_km: number | null;
  airports_count: number | null;
  street_lights_count: number | null;
  
  // Water & Sanitation
  boreholes_count: number | null;
  water_schemes_count: number | null;
  households_piped_water: number | null;
  households_flush_toilet: number | null;
  
  // Energy & Housing
  electricity_access_percentage: number | null;
  lpg_cooking_percentage: number | null;
  permanent_housing_percentage: number | null;
};

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A";
  return new Intl.NumberFormat("en-KE").format(num);
}

function formatDecimal(num: number | null | undefined, decimals: number = 1): string {
  if (num === null || num === undefined) return "N/A";
  return num.toFixed(decimals);
}

export default async function CountyInfrastructurePage({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: county } = await supabase
    .from("counties")
    .select(`
      name, slug, population, households_count,
      bitumen_roads_km, gravel_roads_km, earth_roads_km,
      railway_km, airports_count, street_lights_count,
      boreholes_count, water_schemes_count,
      households_piped_water, households_flush_toilet,
      electricity_access_percentage, lpg_cooking_percentage,
      permanent_housing_percentage
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (!county) {
    notFound();
  }

  // Calculate derived stats
  const totalRoads = (county.bitumen_roads_km || 0) + 
                     (county.gravel_roads_km || 0) + 
                     (county.earth_roads_km || 0);
  
  const bitumenPercentage = totalRoads > 0 
    ? ((county.bitumen_roads_km || 0) / totalRoads * 100).toFixed(1)
    : "0";

  const pipedWaterPercentage = county.households_count && county.households_piped_water
    ? ((county.households_piped_water / county.households_count) * 100).toFixed(1)
    : "N/A";

  const flushToiletPercentage = county.households_count && county.households_flush_toilet
    ? ((county.households_flush_toilet / county.households_count) * 100).toFixed(1)
    : "N/A";

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Institutions", href: "/government/institutions" },
          { text: county.name, href: `/government/institutions/${slug}` },
          { text: "About", href: `/government/institutions/${slug}/about` },
          { text: "Infrastructure" },
        ]}
      />

      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <span className="govuk-caption-l">{county.name}</span>
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
                Infrastructure, Water & Housing
              </h1>
              <p className="govuk-body-l govuk-!-margin-bottom-6">
                Overview of transport networks, water and sanitation infrastructure, 
                energy access, and housing conditions in {county.name}.
              </p>
            </div>
          </div>

          {/* Hero Statistics */}
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                <span className="govuk-heading-m govuk-!-margin-bottom-1">
                  {formatDecimal(totalRoads)} km
                </span>
                <span className="govuk-body-s">Total Road Network</span>
              </div>
            </div>
            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                <span className="govuk-heading-m govuk-!-margin-bottom-1">
                  {formatNumber(county.street_lights_count)}
                </span>
                <span className="govuk-body-s">Street Lights</span>
              </div>
            </div>
            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                <span className="govuk-heading-m govuk-!-margin-bottom-1">
                  {county.electricity_access_percentage ? `${county.electricity_access_percentage}%` : "N/A"}
                </span>
                <span className="govuk-body-s">Electricity Access</span>
              </div>
            </div>
            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                <span className="govuk-heading-m govuk-!-margin-bottom-1">
                  {formatNumber(county.boreholes_count)}
                </span>
                <span className="govuk-body-s">Boreholes</span>
              </div>
            </div>
          </div>

          {/* Roads & Transport Network */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="roads-heading">
            <h2 id="roads-heading" className="govuk-heading-l">
              Roads & Transport Network
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              The county&apos;s road network forms the backbone of its transport infrastructure, 
              connecting communities, markets, and economic hubs.
            </p>

            <h3 className="govuk-heading-m">Road Network by Surface Type</h3>
            <div className="govuk-table-wrapper">
              <table className="govuk-table">
                <caption className="govuk-table__caption govuk-visually-hidden">
                  Road network distribution by surface type
                </caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">Surface Type</th>
                    <th scope="col" className="govuk-table__header govuk-table__header--numeric">Length (km)</th>
                    <th scope="col" className="govuk-table__header govuk-table__header--numeric">Percentage</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Bitumen</th>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {formatDecimal(county.bitumen_roads_km)}
                    </td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {bitumenPercentage}%
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Gravel</th>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {formatDecimal(county.gravel_roads_km)}
                    </td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {totalRoads > 0 ? ((county.gravel_roads_km || 0) / totalRoads * 100).toFixed(1) : "0"}%
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Earth</th>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {formatDecimal(county.earth_roads_km)}
                    </td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {totalRoads > 0 ? ((county.earth_roads_km || 0) / totalRoads * 100).toFixed(1) : "0"}%
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header govuk-!-font-weight-bold">Total</th>
                    <td className="govuk-table__cell govuk-table__cell--numeric govuk-!-font-weight-bold">
                      {formatDecimal(totalRoads)}
                    </td>
                    <td className="govuk-table__cell govuk-table__cell--numeric govuk-!-font-weight-bold">
                      100%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="govuk-heading-m govuk-!-margin-top-6">Other Transport Infrastructure</h3>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Railway Network</dt>
                <dd className="govuk-summary-list__value">
                  {county.railway_km ? `${formatDecimal(county.railway_km)} km` : "N/A"}
                  <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                    Includes both metre gauge and standard gauge railway
                  </span>
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Operational Airports</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.airports_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Street Lights Installed</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.street_lights_count)}
                  <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                    Enhancing security and enabling 24-hour economic activities
                  </span>
                </dd>
              </div>
            </dl>
          </section>

          {/* Water Supply & Sanitation */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="water-heading">
            <h2 id="water-heading" className="govuk-heading-l">
              Water Supply & Sanitation
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Access to clean water and adequate sanitation is fundamental to public health 
              and quality of life in the county.
            </p>

            <h3 className="govuk-heading-m">Water Infrastructure</h3>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Boreholes</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.boreholes_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Water Supply Schemes</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.water_schemes_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Households with Piped Water</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.households_piped_water)}
                  {pipedWaterPercentage !== "N/A" && (
                    <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                      {pipedWaterPercentage}% of all households
                    </span>
                  )}
                </dd>
              </div>
            </dl>

            <h3 className="govuk-heading-m govuk-!-margin-top-6">Sanitation Facilities</h3>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Households with Flush Toilets</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.households_flush_toilet)}
                  {flushToiletPercentage !== "N/A" && (
                    <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                      {flushToiletPercentage}% of all households
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          {/* Energy & Housing */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="energy-heading">
            <h2 id="energy-heading" className="govuk-heading-l">
              Energy Access & Housing
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Energy access and housing quality are key indicators of living standards 
              and economic development in the county.
            </p>

            <h3 className="govuk-heading-m">Energy Access</h3>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Electricity Access</dt>
                <dd className="govuk-summary-list__value">
                  {county.electricity_access_percentage ? `${county.electricity_access_percentage}%` : "N/A"}
                  <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                    Of households using electricity for lighting
                  </span>
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">LPG for Cooking</dt>
                <dd className="govuk-summary-list__value">
                  {county.lpg_cooking_percentage ? `${county.lpg_cooking_percentage}%` : "N/A"}
                  <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                    Of households using Liquefied Petroleum Gas for cooking
                  </span>
                </dd>
              </div>
            </dl>

            <h3 className="govuk-heading-m govuk-!-margin-top-6">Housing Conditions</h3>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Permanent Housing</dt>
                <dd className="govuk-summary-list__value">
                  {county.permanent_housing_percentage ? `${county.permanent_housing_percentage}%` : "N/A"}
                  <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                    Of households living in permanent structures
                  </span>
                </dd>
              </div>
            </dl>
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
                <Link href={`/government/institutions/${slug}/about/economy`} className="govuk-link">
                  Economy, Agriculture & Blue Economy
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