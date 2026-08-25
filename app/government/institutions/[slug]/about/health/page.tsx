// app/government/institutions/[slug]/about/health/page.tsx
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import CountyAboutNav from "@/components/government/CountyAboutNav";

type Props = {
  params: Promise<{ slug: string }>;
};

type County = {
  id: string;
  slug: string;
  name: string;
  population: number | null;
  health_facilities_count: number | null;
  infant_mortality_rate: number | null;
  neonatal_mortality_rate: number | null;
  maternal_mortality_rate: number | null;
  life_expectancy_male: number | null;
  life_expectancy_female: number | null;
  hiv_prevalence_percentage: number | null;
  immunization_coverage_percentage: number | null;
  antenatal_care_percentage: number | null;
  health_facility_deliveries_percentage: number | null;
  contraceptive_use_percentage: number | null;
  stunting_prevalence_percentage: number | null;
  underweight_prevalence_percentage: number | null;
  chvs_count: number | null;
  level_4_hospitals_count: number | null;
  level_5_hospitals_count: number | null;
  private_clinics_count: number | null;
};

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A";
  return new Intl.NumberFormat("en-KE").format(num);
}

export default async function CountyHealthPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: county } = await supabase
    .from("counties")
    .select(`
      id,
      slug,
      name,
      population,
      health_facilities_count,
      infant_mortality_rate,
      neonatal_mortality_rate,
      maternal_mortality_rate,
      life_expectancy_male,
      life_expectancy_female,
      hiv_prevalence_percentage,
      immunization_coverage_percentage,
      antenatal_care_percentage,
      health_facility_deliveries_percentage,
      contraceptive_use_percentage,
      stunting_prevalence_percentage,
      underweight_prevalence_percentage,
      chvs_count,
      level_4_hospitals_count,
      level_5_hospitals_count,
      private_clinics_count
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (!county) {
    notFound();
  }

  // Only use real stored totals — never invent placeholder facility counts
  const derivedFacilities =
    (county.level_5_hospitals_count || 0) +
    (county.level_4_hospitals_count || 0) +
    (county.private_clinics_count || 0);
  const totalFacilities =
    county.health_facilities_count ??
    (derivedFacilities > 0 ? derivedFacilities : null);

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Institutions", href: "/government/institutions" },
          { text: county.name, href: `/government/institutions/${slug}` },
          { text: "About", href: `/government/institutions/${slug}/about` },
          { text: "Health" },
        ]}
      />

      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <span className="govuk-caption-l">{county.name} County</span>
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
                Health and social services
              </h1>
              <p className="govuk-body-l govuk-!-margin-bottom-6">
                Health facilities, maternal and child health indicators, and key
                outcomes for {county.name} County. Figures show published data
                only — where a figure is not yet available we show N/A.
              </p>
            </div>
          </div>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">

          {/* Hero Statistics — real data only */}
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-one-half">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-4">
                <span className="govuk-heading-m govuk-!-margin-bottom-1 govuk-!-display-block">
                  {formatNumber(totalFacilities)}
                </span>
                <span className="govuk-body-s">Total health facilities</span>
              </div>
            </div>
            <div className="govuk-grid-column-one-half">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-4">
                <span className="govuk-heading-m govuk-!-margin-bottom-1 govuk-!-display-block">
                  {county.chvs_count != null
                    ? formatNumber(county.chvs_count)
                    : "N/A"}
                </span>
                <span className="govuk-body-s">Community health volunteers</span>
              </div>
            </div>
            <div className="govuk-grid-column-one-half">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-4">
                <span className="govuk-heading-m govuk-!-margin-bottom-1 govuk-!-display-block">
                  {county.immunization_coverage_percentage != null
                    ? `${county.immunization_coverage_percentage}%`
                    : "N/A"}
                </span>
                <span className="govuk-body-s">Immunisation coverage</span>
              </div>
            </div>
            <div className="govuk-grid-column-one-half">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-4">
                <span className="govuk-heading-m govuk-!-margin-bottom-1 govuk-!-display-block">
                  {county.life_expectancy_female != null
                    ? `${county.life_expectancy_female} yrs`
                    : "N/A"}
                </span>
                <span className="govuk-body-s">Female life expectancy</span>
              </div>
            </div>
          </div>

          <section
            className="govuk-!-margin-bottom-8"
            aria-labelledby="facilities-heading"
          >
            <h2 id="facilities-heading" className="govuk-heading-l">
              Health facilities by level
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Published facility counts for {county.name} County. Missing levels
              show as N/A until data is added.
            </p>

            <table className="govuk-table govuk-!-margin-bottom-6">
              <caption className="govuk-table__caption govuk-visually-hidden">
                Health facilities breakdown by level of care
              </caption>
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">
                    Facility level
                  </th>
                  <th
                    scope="col"
                    className="govuk-table__header govuk-table__header--numeric"
                  >
                    Number
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Level 5 — County referral hospitals
                  </th>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    <strong>
                      {formatNumber(county.level_5_hospitals_count)}
                    </strong>
                  </td>
                  <td className="govuk-table__cell">
                    County referral and specialised care
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Level 4 — Sub-county hospitals
                  </th>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    <strong>
                      {formatNumber(county.level_4_hospitals_count)}
                    </strong>
                  </td>
                  <td className="govuk-table__cell">
                    Sub-county level hospitals
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Private clinics
                  </th>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    <strong>{formatNumber(county.private_clinics_count)}</strong>
                  </td>
                  <td className="govuk-table__cell">
                    Private healthcare providers
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th
                    scope="row"
                    className="govuk-table__header govuk-!-font-weight-bold"
                  >
                    Total (recorded)
                  </th>
                  <td className="govuk-table__cell govuk-table__cell--numeric govuk-!-font-weight-bold">
                    <strong>{formatNumber(totalFacilities)}</strong>
                  </td>
                  <td className="govuk-table__cell"></td>
                </tr>
              </tbody>
            </table>
          </section>

          {county.chvs_count != null && (
            <section
              className="govuk-!-margin-bottom-8"
              aria-labelledby="workforce-heading"
            >
              <h2 id="workforce-heading" className="govuk-heading-l">
                Health workforce
              </h2>
              <dl className="govuk-summary-list">
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Community health volunteers (CHVs)
                  </dt>
                  <dd className="govuk-summary-list__value">
                    {formatNumber(county.chvs_count)}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          {/* Maternal and Child Health */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="maternal-heading">
            <h2 id="maternal-heading" className="govuk-heading-l">
              Maternal and Child Health
            </h2>

            <div className="govuk-grid-row govuk-!-margin-bottom-6">
              <div className="govuk-grid-column-one-half">
                <div className="govuk-inset-text govuk-!-margin-top-0">
                  <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Mortality Rates</h3>
                  <dl className="govuk-!-margin-bottom-0">
                    <dt className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                      Infant Mortality Rate
                    </dt>
                    <dd className="govuk-body govuk-!-margin-bottom-3">
                      {county.infant_mortality_rate ? `${county.infant_mortality_rate} per 1,000 live births` : "N/A"}
                    </dd>
                    <dt className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                      Neonatal Mortality Rate
                    </dt>
                    <dd className="govuk-body govuk-!-margin-bottom-3">
                      {county.neonatal_mortality_rate ? `${county.neonatal_mortality_rate} per 1,000 live births` : "N/A"}
                    </dd>
                    <dt className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                      Maternal Mortality Rate
                    </dt>
                    <dd className="govuk-body govuk-!-margin-bottom-0">
                      {county.maternal_mortality_rate ? `${county.maternal_mortality_rate} per 100,000 live births` : "N/A"}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="govuk-grid-column-one-half">
                <div className="govuk-inset-text govuk-!-margin-top-0">
                  <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Service Coverage</h3>
                  <dl className="govuk-!-margin-bottom-0">
                    <dt className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                      Antenatal Care Coverage
                    </dt>
                    <dd className="govuk-body govuk-!-margin-bottom-3">
                      {county.antenatal_care_percentage ? `${county.antenatal_care_percentage}%` : "N/A"}
                      <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                        At least 4 ANC visits
                      </span>
                    </dd>
                    <dt className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                      Health Facility Deliveries
                    </dt>
                    <dd className="govuk-body govuk-!-margin-bottom-3">
                      {county.health_facility_deliveries_percentage ? `${county.health_facility_deliveries_percentage}%` : "N/A"}
                    </dd>
                    <dt className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                      Immunization Coverage
                    </dt>
                    <dd className="govuk-body govuk-!-margin-bottom-0">
                      {county.immunization_coverage_percentage ? `${county.immunization_coverage_percentage}%` : "N/A"}
                      <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                        Children under 1 year fully immunized
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </section>

          {(county.hiv_prevalence_percentage != null ||
            county.immunization_coverage_percentage != null) && (
            <section
              className="govuk-!-margin-bottom-8"
              aria-labelledby="hiv-heading"
            >
              <h2 id="hiv-heading" className="govuk-heading-l">
                HIV and immunisation
              </h2>
              <dl className="govuk-summary-list">
                {county.hiv_prevalence_percentage != null && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">HIV prevalence</dt>
                    <dd className="govuk-summary-list__value">
                      {county.hiv_prevalence_percentage}%
                    </dd>
                  </div>
                )}
                {county.immunization_coverage_percentage != null && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      Immunisation coverage
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {county.immunization_coverage_percentage}%
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* Family Planning and Nutrition */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="nutrition-heading">
            <h2 id="nutrition-heading" className="govuk-heading-l">
              Family Planning and Child Nutrition
            </h2>

            <dl className="govuk-summary-list">
              {county.contraceptive_use_percentage && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Contraceptive Use</dt>
                  <dd className="govuk-summary-list__value">
                    {county.contraceptive_use_percentage}%
                    <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                      Women of reproductive age (15-49 years)
                    </span>
                  </dd>
                </div>
              )}
              {county.stunting_prevalence_percentage && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Stunting Prevalence</dt>
                  <dd className="govuk-summary-list__value">
                    {county.stunting_prevalence_percentage}%
                    <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                      Height for age (under 5 years)
                    </span>
                  </dd>
                </div>
              )}
              {county.underweight_prevalence_percentage && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Underweight Prevalence</dt>
                  <dd className="govuk-summary-list__value">
                    {county.underweight_prevalence_percentage}%
                    <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                      Weight for age (under 5 years)
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Life Expectancy */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="life-expectancy-heading">
            <h2 id="life-expectancy-heading" className="govuk-heading-l">
              Life Expectancy
            </h2>

            <div className="govuk-grid-row">
              <div className="govuk-grid-column-one-half">
                <div className="govuk-inset-text govuk-!-margin-top-0">
                  <span className="govuk-heading-m govuk-!-margin-bottom-1">
                    {county.life_expectancy_male ? `${county.life_expectancy_male} years` : "N/A"}
                  </span>
                  <span className="govuk-body-s">Male</span>
                </div>
              </div>
              <div className="govuk-grid-column-one-half">
                <div className="govuk-inset-text govuk-!-margin-top-0">
                  <span className="govuk-heading-m govuk-!-margin-bottom-1">
                    {county.life_expectancy_female ? `${county.life_expectancy_female} years` : "N/A"}
                  </span>
                  <span className="govuk-body-s">Female</span>
                </div>
              </div>
            </div>
          </section>

            </div>

            <div className="govuk-grid-column-one-third">
              <CountyAboutNav
                countySlug={slug}
                countyName={county.name}
                current="health"
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}