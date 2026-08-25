// app/government/institutions/[slug]/about/demographics/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

type Props = {
  params: Promise<{ slug: string }>;
};

type CountyDemographics = {
  id: string;
  slug: string;
  name: string;
  code: number | null;
  population: number | null;
  population_male: number | null;
  population_female: number | null;
  population_intersex: number | null;
  population_projection_2025: number | null;
  population_projection_2027: number | null;
  population_density: number | null;
  area_km2: number | null;
  
  // Age cohorts
  population_0_4: number | null;
  population_5_9: number | null;
  population_10_14: number | null;
  population_15_19: number | null;
  population_20_24: number | null;
  population_25_29: number | null;
  population_30_34: number | null;
  population_35_39: number | null;
  population_40_44: number | null;
  population_45_49: number | null;
  population_50_54: number | null;
  population_55_59: number | null;
  population_60_64: number | null;
  population_65_69: number | null;
  population_70_74: number | null;
  population_75_79: number | null;
  population_80_plus: number | null;
  
  // Key demographic groups
  population_infant: number | null;
  population_under_5: number | null;
  population_preschool: number | null;
  population_primary_age: number | null;
  population_secondary_age: number | null;
  population_youth_15_34: number | null;
  population_women_reproductive: number | null;
  population_labour_force: number | null;
  population_aged_65_plus: number | null;
  population_below_15: number | null;
  
  // Household data
  households_count: number | null;
  average_household_size: number | null;
  female_headed_households_percentage: number | null;
  child_headed_households_percentage: number | null;
  
  // Persons with disabilities
  pwd_visual: number | null;
  pwd_hearing: number | null;
  pwd_speech: number | null;
  pwd_physical: number | null;
  pwd_mental: number | null;
  pwd_mobility: number | null;
  
  // Demographic dividend indicators
  dependency_ratio: number | null;
  fertility_rate: number | null;
  population_below_15_percentage: number | null;
  population_15_64_percentage: number | null;
  population_above_65_percentage: number | null;
  
  // Urban/rural
  urban_population_percentage: number | null;
  rural_population_percentage: number | null;
  youth_population_percentage: number | null;
};

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A";
  return new Intl.NumberFormat("en-KE").format(num);
}

function formatPercentage(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A";
  return `${num.toFixed(1)}%`;
}

export default async function CountyDemographicsPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: county } = await supabase
    .from("counties")
    .select(`
      id, slug, name, code, population, population_male, population_female, population_intersex,
      population_projection_2025, population_projection_2027, population_density, area_km2,
      population_0_4, population_5_9, population_10_14, population_15_19, population_20_24,
      population_25_29, population_30_34, population_35_39, population_40_44, population_45_49,
      population_50_54, population_55_59, population_60_64, population_65_69, population_70_74,
      population_75_79, population_80_plus,
      population_infant, population_under_5, population_preschool, population_primary_age,
      population_secondary_age, population_youth_15_34, population_women_reproductive,
      population_labour_force, population_aged_65_plus, population_below_15,
      households_count, average_household_size, female_headed_households_percentage,
      child_headed_households_percentage,
      pwd_visual, pwd_hearing, pwd_speech, pwd_physical, pwd_mental, pwd_mobility,
      dependency_ratio, fertility_rate, population_below_15_percentage,
      population_15_64_percentage, population_above_65_percentage,
      urban_population_percentage, rural_population_percentage, youth_population_percentage
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (!county) {
    notFound();
  }

  const countyName = county.name;
  const totalPopulation = county.population || 0;

  // Calculate age cohort percentages
  const ageCohorts = [
    { label: "0-4", count: county.population_0_4 || 0 },
    { label: "5-9", count: county.population_5_9 || 0 },
    { label: "10-14", count: county.population_10_14 || 0 },
    { label: "15-19", count: county.population_15_19 || 0 },
    { label: "20-24", count: county.population_20_24 || 0 },
    { label: "25-29", count: county.population_25_29 || 0 },
    { label: "30-34", count: county.population_30_34 || 0 },
    { label: "35-39", count: county.population_35_39 || 0 },
    { label: "40-44", count: county.population_40_44 || 0 },
    { label: "45-49", count: county.population_45_49 || 0 },
    { label: "50-54", count: county.population_50_54 || 0 },
    { label: "55-59", count: county.population_55_59 || 0 },
    { label: "60-64", count: county.population_60_64 || 0 },
    { label: "65-69", count: county.population_65_69 || 0 },
    { label: "70-74", count: county.population_70_74 || 0 },
    { label: "75-79", count: county.population_75_79 || 0 },
    { label: "80+", count: county.population_80_plus || 0 },
  ];

  // Calculate PWD total
  const pwdTotal = (county.pwd_visual || 0) + (county.pwd_hearing || 0) + 
                   (county.pwd_speech || 0) + (county.pwd_physical || 0) + 
                   (county.pwd_mental || 0) + (county.pwd_mobility || 0);

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Institutions", href: "/government/institutions" },
          { text: countyName, href: `/government/institutions/${slug}` },
          { text: "About", href: `/government/institutions/${slug}/about` },
          { text: "Demographics" },
        ]}
      />

      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <span className="govuk-caption-l">
                {countyName} County · Code {county.code || "—"}
              </span>
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
                Demographics & Population
              </h1>
              <p className="govuk-body-l govuk-!-margin-bottom-6">
                Comprehensive demographic profile of {countyName} County, including population 
                composition, age structure, household characteristics, and persons with disabilities.
              </p>
            </div>
          </div>

          {/* Population Overview */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="population-overview-heading">
            <h2 id="population-overview-heading" className="govuk-heading-l govuk-!-margin-bottom-4">
              Population Overview
            </h2>
            
            <div className="govuk-grid-row govuk-!-margin-bottom-6">
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-4">
                <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                  <span className="govuk-heading-m govuk-!-margin-bottom-1">
                    {formatNumber(totalPopulation)}
                  </span>
                  <span className="govuk-body-s">Total Population (2022)</span>
                </div>
              </div>
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-4">
                <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                  <span className="govuk-heading-m govuk-!-margin-bottom-1">
                    {formatNumber(county.population_density)} / km²
                  </span>
                  <span className="govuk-body-s">Population Density</span>
                </div>
              </div>
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-4">
                <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                  <span className="govuk-heading-m govuk-!-margin-bottom-1">
                    {formatNumber(county.area_km2)} km²
                  </span>
                  <span className="govuk-body-s">Land Area</span>
                </div>
              </div>
            </div>

            {/* Gender Distribution */}
            {(county.population_male || county.population_female) && (
              <div className="govuk-grid-row govuk-!-margin-bottom-6">
                <div className="govuk-grid-column-full">
                  <h3 className="govuk-heading-m govuk-!-margin-bottom-3">Gender Distribution</h3>
                  <dl className="govuk-summary-list">
                    {county.population_male && (
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">Male Population</dt>
                        <dd className="govuk-summary-list__value">
                          {formatNumber(county.population_male)}
                          <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                            ({((county.population_male / totalPopulation) * 100).toFixed(1)}%)
                          </span>
                        </dd>
                      </div>
                    )}
                    {county.population_female && (
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">Female Population</dt>
                        <dd className="govuk-summary-list__value">
                          {formatNumber(county.population_female)}
                          <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                            ({((county.population_female / totalPopulation) * 100).toFixed(1)}%)
                          </span>
                        </dd>
                      </div>
                    )}
                    {county.population_intersex && county.population_intersex > 0 && (
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">Intersex Population</dt>
                        <dd className="govuk-summary-list__value">{formatNumber(county.population_intersex)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}

            {/* Population Projections */}
            {(county.population_projection_2025 || county.population_projection_2027) && (
              <div className="govuk-inset-text govuk-!-margin-bottom-6">
                <h3 className="govuk-heading-m govuk-!-margin-bottom-3">Population Projections</h3>
                <dl className="govuk-summary-list govuk-!-margin-bottom-0">
                  {county.population_projection_2025 && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">2025 Projection</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(county.population_projection_2025)}</dd>
                    </div>
                  )}
                  {county.population_projection_2027 && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">2027 Projection</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(county.population_projection_2027)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </section>

          {/* Age Structure */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="age-structure-heading">
            <h2 id="age-structure-heading" className="govuk-heading-l govuk-!-margin-bottom-4">
              Age Structure
            </h2>
            
            <div className="govuk-grid-row govuk-!-margin-bottom-6">
              <div className="govuk-grid-column-full">
                <div className="govuk-table-wrapper">
                  <table className="govuk-table govuk-!-margin-bottom-0">
                    <caption className="govuk-table__caption govuk-visually-hidden">
                      Population by age cohort in {countyName} County
                    </caption>
                    <thead className="govuk-table__head">
                      <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header">Age Group</th>
                        <th scope="col" className="govuk-table__header govuk-table__header--numeric">Population</th>
                        <th scope="col" className="govuk-table__header govuk-table__header--numeric">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body">
                      {ageCohorts.map((cohort) => (
                        <tr key={cohort.label} className="govuk-table__row">
                          <th scope="row" className="govuk-table__header">{cohort.label} years</th>
                          <td className="govuk-table__cell govuk-table__cell--numeric">
                            {formatNumber(cohort.count)}
                          </td>
                          <td className="govuk-table__cell govuk-table__cell--numeric">
                            {totalPopulation > 0 ? ((cohort.count / totalPopulation) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Key Demographic Groups */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="demographic-groups-heading">
            <h2 id="demographic-groups-heading" className="govuk-heading-l govuk-!-margin-bottom-4">
              Key Demographic Groups
            </h2>
            
            <dl className="govuk-summary-list">
              {county.population_infant && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Infants (Under 1 year)</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.population_infant)}</dd>
                </div>
              )}
              {county.population_under_5 && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Children Under 5 Years</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.population_under_5)}</dd>
                </div>
              )}
              {county.population_preschool && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Pre-School Age (3-5 years)</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.population_preschool)}</dd>
                </div>
              )}
              {county.population_primary_age && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Primary School Age (6-13 years)</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.population_primary_age)}</dd>
                </div>
              )}
              {county.population_secondary_age && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Secondary School Age (14-17 years)</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.population_secondary_age)}</dd>
                </div>
              )}
              {county.population_youth_15_34 && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Youth Population (15-34 years)</dt>
                  <dd className="govuk-summary-list__value">
                    {formatNumber(county.population_youth_15_34)}
                    {county.youth_population_percentage && (
                      <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                        ({formatPercentage(county.youth_population_percentage)} of total population)
                      </span>
                    )}
                  </dd>
                </div>
              )}
              {county.population_women_reproductive && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Women of Reproductive Age (15-49 years)</dt>
                  <dd className="govuk-summary-list__value">{formatNumber(county.population_women_reproductive)}</dd>
                </div>
              )}
              {county.population_labour_force && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Labour Force (15-64 years)</dt>
                  <dd className="govuk-summary-list__value">
                    {formatNumber(county.population_labour_force)}
                    {county.population_15_64_percentage && (
                      <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                        ({formatPercentage(county.population_15_64_percentage)} of total population)
                      </span>
                    )}
                  </dd>
                </div>
              )}
              {county.population_aged_65_plus && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Aged Population (65+ years)</dt>
                  <dd className="govuk-summary-list__value">
                    {formatNumber(county.population_aged_65_plus)}
                    {county.population_above_65_percentage && (
                      <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                        ({formatPercentage(county.population_above_65_percentage)} of total population)
                      </span>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Household Characteristics */}
          {(county.households_count || county.average_household_size) && (
            <section className="govuk-!-margin-bottom-8" aria-labelledby="household-heading">
              <h2 id="household-heading" className="govuk-heading-l govuk-!-margin-bottom-4">
                Household Characteristics
              </h2>
              
              <dl className="govuk-summary-list">
                {county.households_count && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Total Households</dt>
                    <dd className="govuk-summary-list__value">{formatNumber(county.households_count)}</dd>
                  </div>
                )}
                {county.average_household_size && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Average Household Size</dt>
                    <dd className="govuk-summary-list__value">{county.average_household_size.toFixed(1)} persons</dd>
                  </div>
                )}
                {county.female_headed_households_percentage && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Female-Headed Households</dt>
                    <dd className="govuk-summary-list__value">{formatPercentage(county.female_headed_households_percentage)}</dd>
                  </div>
                )}
                {county.child_headed_households_percentage && county.child_headed_households_percentage > 0 && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Child-Headed Households</dt>
                    <dd className="govuk-summary-list__value">{formatPercentage(county.child_headed_households_percentage)}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* Urban-Rural Distribution */}
          {(county.urban_population_percentage || county.rural_population_percentage) && (
            <section className="govuk-!-margin-bottom-8" aria-labelledby="urban-rural-heading">
              <h2 id="urban-rural-heading" className="govuk-heading-l govuk-!-margin-bottom-4">
                Urban-Rural Distribution
              </h2>
              
              <dl className="govuk-summary-list">
                {county.urban_population_percentage !== null && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Urban Population</dt>
                    <dd className="govuk-summary-list__value">{formatPercentage(county.urban_population_percentage)}</dd>
                  </div>
                )}
                {county.rural_population_percentage !== null && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Rural Population</dt>
                    <dd className="govuk-summary-list__value">{formatPercentage(county.rural_population_percentage)}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* Persons with Disabilities */}
          {pwdTotal > 0 && (
            <section className="govuk-!-margin-bottom-8" aria-labelledby="pwd-heading">
              <h2 id="pwd-heading" className="govuk-heading-l govuk-!-margin-bottom-4">
                Persons with Disabilities
              </h2>
              
              <div className="govuk-inset-text govuk-!-margin-bottom-4">
                <p className="govuk-body govuk-!-margin-bottom-0">
                  <strong>Total Persons with Disabilities:</strong> {formatNumber(pwdTotal)}
                  <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                    ({((pwdTotal / totalPopulation) * 100).toFixed(1)}% of total population)
                  </span>
                </p>
              </div>

              <dl className="govuk-summary-list">
                {county.pwd_visual && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Visual Impairment</dt>
                    <dd className="govuk-summary-list__value">{formatNumber(county.pwd_visual)}</dd>
                  </div>
                )}
                {county.pwd_hearing && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Hearing Impairment</dt>
                    <dd className="govuk-summary-list__value">{formatNumber(county.pwd_hearing)}</dd>
                  </div>
                )}
                {county.pwd_speech && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Speech Impairment</dt>
                    <dd className="govuk-summary-list__value">{formatNumber(county.pwd_speech)}</dd>
                  </div>
                )}
                {county.pwd_physical && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Physical Disability</dt>
                    <dd className="govuk-summary-list__value">{formatNumber(county.pwd_physical)}</dd>
                  </div>
                )}
                {county.pwd_mental && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Mental Disability</dt>
                    <dd className="govuk-summary-list__value">{formatNumber(county.pwd_mental)}</dd>
                  </div>
                )}
                {county.pwd_mobility && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Mobility Impairment</dt>
                    <dd className="govuk-summary-list__value">{formatNumber(county.pwd_mobility)}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* Demographic Dividend Indicators */}
          {(county.dependency_ratio || county.fertility_rate) && (
            <section className="govuk-!-margin-bottom-8" aria-labelledby="dividend-heading">
              <h2 id="dividend-heading" className="govuk-heading-l govuk-!-margin-bottom-4">
                Demographic Dividend Indicators
              </h2>
              
              <div className="govuk-inset-text govuk-!-margin-bottom-4">
                <p className="govuk-body govuk-!-margin-bottom-2">
                  The demographic dividend refers to the economic growth potential that can result from shifts in a population's age structure.
                </p>
              </div>

              <dl className="govuk-summary-list">
                {county.dependency_ratio && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Dependency Ratio</dt>
                    <dd className="govuk-summary-list__value">{formatPercentage(county.dependency_ratio)}</dd>
                  </div>
                )}
                {county.fertility_rate && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Total Fertility Rate</dt>
                    <dd className="govuk-summary-list__value">{county.fertility_rate.toFixed(1)} children per woman</dd>
                  </div>
                )}
                {county.population_below_15_percentage && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Population Below 15 Years</dt>
                    <dd className="govuk-summary-list__value">{formatPercentage(county.population_below_15_percentage)}</dd>
                  </div>
                )}
                {county.population_15_64_percentage && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Working Age Population (15-64)</dt>
                    <dd className="govuk-summary-list__value">{formatPercentage(county.population_15_64_percentage)}</dd>
                  </div>
                )}
                {county.population_above_65_percentage && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Population Above 65 Years</dt>
                    <dd className="govuk-summary-list__value">{formatPercentage(county.population_above_65_percentage)}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* Navigation to other sections */}
          <nav className="govuk-!-margin-top-8" aria-label="Explore more about the county">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-4">Explore more about {countyName}</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href={`/government/institutions/${slug}/about/overview`} className="govuk-link">
                  Overview & Leadership
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