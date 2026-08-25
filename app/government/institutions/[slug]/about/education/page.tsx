import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import CountyAboutNav from "@/components/government/CountyAboutNav";

type Props = {
  params: Promise<{ slug: string }>;
};

type CountyEducation = {
  name: string;
  slug: string;

  // ECDE
  ecd_centers_count: number | null;
  ecd_teachers_count: number | null;
  ecd_enrolment_boys: number | null;
  ecd_enrolment_girls: number | null;

  // Primary
  primary_schools_count: number | null;
  primary_teachers_count: number | null;
  primary_enrolment_boys: number | null;
  primary_enrolment_girls: number | null;
  primary_dropout_rate: number | null;
  primary_retention_rate: number | null;
  primary_enrolment_rate: number | null;

  // Secondary
  secondary_schools_count: number | null;
  secondary_teachers_count: number | null;
  secondary_enrolment_boys: number | null;
  secondary_enrolment_girls: number | null;
  secondary_dropout_rate: number | null;
  secondary_retention_rate: number | null;
  secondary_enrolment_rate: number | null;

  // Special Needs
  special_needs_schools_count: number | null;
  integrated_schools_count: number | null;
  special_needs_teachers_count: number | null;
  special_needs_enrolment_boys: number | null;
  special_needs_enrolment_girls: number | null;

  // Vocational & Tertiary
  vtcs_count: number | null;
  vtc_enrolment: number | null;
  tvets_count: number | null;
  universities_count: number | null;
  tertiary_enrolment_male: number | null;
  tertiary_enrolment_female: number | null;

  // Adult Literacy
  adult_literacy_centers_count: number | null;
  adult_literacy_enrolment: number | null;
  adult_literacy_attendance: number | null;
  literacy_rate: number | null;
  literacy_rate_male: number | null;
  literacy_rate_female: number | null;

  // School-Going Population
  pre_primary_population: number | null;
  primary_school_age_population: number | null;
  secondary_school_age_population: number | null;
};

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A";
  return new Intl.NumberFormat("en-KE").format(num);
}

function formatPercentage(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A";
  return `${num.toFixed(1)}%`;
}

export default async function CountyEducationPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: county } = await supabase
    .from("counties")
    .select(`
      name, slug,
      ecd_centers_count, ecd_teachers_count, ecd_enrolment_boys, ecd_enrolment_girls,
      primary_schools_count, primary_teachers_count, primary_enrolment_boys, primary_enrolment_girls,
      primary_dropout_rate, primary_retention_rate, primary_enrolment_rate,
      secondary_schools_count, secondary_teachers_count, secondary_enrolment_boys, secondary_enrolment_girls,
      secondary_dropout_rate, secondary_retention_rate, secondary_enrolment_rate,
      special_needs_schools_count, integrated_schools_count, special_needs_teachers_count,
      special_needs_enrolment_boys, special_needs_enrolment_girls,
      vtcs_count, vtc_enrolment, tvets_count, universities_count,
      tertiary_enrolment_male, tertiary_enrolment_female,
      adult_literacy_centers_count, adult_literacy_enrolment, adult_literacy_attendance,
      literacy_rate, literacy_rate_male, literacy_rate_female,
      pre_primary_population, primary_school_age_population, secondary_school_age_population
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (!county) {
    notFound();
  }

  // Derived statistics
  const totalSchools =
    (county.primary_schools_count || 0) +
    (county.secondary_schools_count || 0) +
    (county.special_needs_schools_count || 0);

  const totalPrimaryEnrolment =
    (county.primary_enrolment_boys || 0) + (county.primary_enrolment_girls || 0);
  const totalSecondaryEnrolment =
    (county.secondary_enrolment_boys || 0) + (county.secondary_enrolment_girls || 0);
  const totalTertiaryEnrolment =
    (county.tertiary_enrolment_male || 0) + (county.tertiary_enrolment_female || 0);
  const totalTertiaryInstitutions =
    (county.tvets_count || 0) + (county.universities_count || 0);

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Institutions", href: "/government/institutions" },
          { text: county.name, href: `/government/institutions/${slug}` },
          { text: "About", href: `/government/institutions/${slug}/about` },
          { text: "Education" },
        ]}
      />

      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <span className="govuk-caption-l">{county.name}</span>
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
                Education & Skills Development
              </h1>
              <p className="govuk-body-l govuk-!-margin-bottom-6">
                Comprehensive overview of educational institutions, enrolment statistics,
                teacher-pupil ratios, and skills development infrastructure in {county.name}.
              </p>
            </div>
          </div>

          {/* ========================================== */}
          {/* HERO STATISTICS */}
          {/* ========================================== */}
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                <span className="govuk-heading-m govuk-!-margin-bottom-1">
                  {formatNumber(totalSchools)}
                </span>
                <span className="govuk-body-s">Total Schools</span>
              </div>
            </div>
            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                <span className="govuk-heading-m govuk-!-margin-bottom-1">
                  {formatPercentage(county.literacy_rate)}
                </span>
                <span className="govuk-body-s">Literacy Rate</span>
              </div>
            </div>
            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                <span className="govuk-heading-m govuk-!-margin-bottom-1">
                  {formatNumber(totalTertiaryInstitutions)}
                </span>
                <span className="govuk-body-s">TVETs & Universities</span>
              </div>
            </div>
            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                <span className="govuk-heading-m govuk-!-margin-bottom-1">
                  {formatNumber(county.adult_literacy_centers_count)}
                </span>
                <span className="govuk-body-s">Adult Literacy Centres</span>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* SCHOOL-GOING POPULATION ANALYSIS */}
          {/* ========================================== */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="school-pop-heading">
            <h2 id="school-pop-heading" className="govuk-heading-l">
              School-Going Population Analysis
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Population eligible for education by age group, based on demographic projections.
            </p>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Pre-Primary (3–5 years)</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.pre_primary_population)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Primary School Age (6–13 years)</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.primary_school_age_population)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Secondary School Age (14–17 years)</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.secondary_school_age_population)}
                </dd>
              </div>
            </dl>
          </section>

          {/* ========================================== */}
          {/* EARLY CHILDHOOD DEVELOPMENT EDUCATION */}
          {/* ========================================== */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="ecde-heading">
            <h2 id="ecde-heading" className="govuk-heading-l">
              Early Childhood Development Education (ECDE)
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              ECDE centres provide foundational learning for children aged 3 to 5 years,
              preparing them for primary education through play-based and structured activities.
            </p>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">ECDE Centres</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.ecd_centers_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">ECDE Teachers</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.ecd_teachers_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Total Enrolment</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(
                    (county.ecd_enrolment_boys || 0) + (county.ecd_enrolment_girls || 0)
                  )}
                  {(county.ecd_enrolment_boys || county.ecd_enrolment_girls) && (
                    <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                      Boys: {formatNumber(county.ecd_enrolment_boys)} · Girls: {formatNumber(county.ecd_enrolment_girls)}
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          {/* ========================================== */}
          {/* PRIMARY EDUCATION */}
          {/* ========================================== */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="primary-heading">
            <h2 id="primary-heading" className="govuk-heading-l">
              Primary Education
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Primary education covers grades 1 to 6 under the Competency-Based Curriculum (CBC),
              providing foundational literacy, numeracy, and life skills.
            </p>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Primary Schools</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.primary_schools_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Primary Teachers</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.primary_teachers_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Total Enrolment</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(totalPrimaryEnrolment)}
                  {(county.primary_enrolment_boys || county.primary_enrolment_girls) && (
                    <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                      Boys: {formatNumber(county.primary_enrolment_boys)} · Girls: {formatNumber(county.primary_enrolment_girls)}
                    </span>
                  )}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Enrolment Rate</dt>
                <dd className="govuk-summary-list__value">
                  {formatPercentage(county.primary_enrolment_rate)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Retention Rate</dt>
                <dd className="govuk-summary-list__value">
                  {formatPercentage(county.primary_retention_rate)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Dropout Rate</dt>
                <dd className="govuk-summary-list__value">
                  {formatPercentage(county.primary_dropout_rate)}
                </dd>
              </div>
            </dl>
          </section>

          {/* ========================================== */}
          {/* SECONDARY EDUCATION */}
          {/* ========================================== */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="secondary-heading">
            <h2 id="secondary-heading" className="govuk-heading-l">
              Secondary Education
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Secondary education covers Junior Secondary (grades 7–9) and Senior Secondary (grades 10–12),
              preparing learners for tertiary education, vocational training, or employment.
            </p>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Secondary Schools</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.secondary_schools_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Secondary Teachers</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.secondary_teachers_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Total Enrolment</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(totalSecondaryEnrolment)}
                  {(county.secondary_enrolment_boys || county.secondary_enrolment_girls) && (
                    <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                      Boys: {formatNumber(county.secondary_enrolment_boys)} · Girls: {formatNumber(county.secondary_enrolment_girls)}
                    </span>
                  )}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Enrolment Rate</dt>
                <dd className="govuk-summary-list__value">
                  {formatPercentage(county.secondary_enrolment_rate)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Retention Rate</dt>
                <dd className="govuk-summary-list__value">
                  {formatPercentage(county.secondary_retention_rate)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Dropout Rate</dt>
                <dd className="govuk-summary-list__value">
                  {formatPercentage(county.secondary_dropout_rate)}
                </dd>
              </div>
            </dl>
          </section>

          {/* ========================================== */}
          {/* SPECIAL NEEDS EDUCATION */}
          {/* ========================================== */}
          {(county.special_needs_schools_count || county.integrated_schools_count) && (
            <section className="govuk-!-margin-bottom-8" aria-labelledby="special-heading">
              <h2 id="special-heading" className="govuk-heading-l">
                Special Needs Education
              </h2>
              <p className="govuk-body govuk-!-margin-bottom-4">
                Inclusive education facilities catering to learners with diverse abilities,
                ensuring equitable access to quality education for all children.
              </p>
              <dl className="govuk-summary-list">
                {county.special_needs_schools_count && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Special Needs Schools</dt>
                    <dd className="govuk-summary-list__value">
                      {formatNumber(county.special_needs_schools_count)}
                    </dd>
                  </div>
                )}
                {county.integrated_schools_count && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Integrated Schools</dt>
                    <dd className="govuk-summary-list__value">
                      {formatNumber(county.integrated_schools_count)}
                    </dd>
                  </div>
                )}
                {county.special_needs_teachers_count && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Special Needs Teachers</dt>
                    <dd className="govuk-summary-list__value">
                      {formatNumber(county.special_needs_teachers_count)}
                    </dd>
                  </div>
                )}
                {(county.special_needs_enrolment_boys || county.special_needs_enrolment_girls) && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Total Enrolment</dt>
                    <dd className="govuk-summary-list__value">
                      {formatNumber(
                        (county.special_needs_enrolment_boys || 0) +
                        (county.special_needs_enrolment_girls || 0)
                      )}
                      <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                        Boys: {formatNumber(county.special_needs_enrolment_boys)} · Girls: {formatNumber(county.special_needs_enrolment_girls)}
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* ========================================== */}
          {/* VOCATIONAL & TERTIARY EDUCATION */}
          {/* ========================================== */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="tertiary-heading">
            <h2 id="tertiary-heading" className="govuk-heading-l">
              Vocational & Tertiary Education
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Technical and Vocational Education and Training (TVET) institutions equip learners
              with practical skills for employment and entrepreneurship.
            </p>
            <dl className="govuk-summary-list">
              {county.vtcs_count && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Vocational Training Centres (VTCs)</dt>
                  <dd className="govuk-summary-list__value">
                    {formatNumber(county.vtcs_count)}
                    {county.vtc_enrolment && (
                      <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                        Enrolment: {formatNumber(county.vtc_enrolment)}
                      </span>
                    )}
                  </dd>
                </div>
              )}
              {county.tvets_count && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">TVET Institutions</dt>
                  <dd className="govuk-summary-list__value">
                    {formatNumber(county.tvets_count)}
                  </dd>
                </div>
              )}
              {county.universities_count && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Universities</dt>
                  <dd className="govuk-summary-list__value">
                    {formatNumber(county.universities_count)}
                  </dd>
                </div>
              )}
              {totalTertiaryEnrolment > 0 && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Tertiary Enrolment</dt>
                  <dd className="govuk-summary-list__value">
                    {formatNumber(totalTertiaryEnrolment)}
                    <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                      Male: {formatNumber(county.tertiary_enrolment_male)} · Female: {formatNumber(county.tertiary_enrolment_female)}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* ========================================== */}
          {/* ADULT LITERACY */}
          {/* ========================================== */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="literacy-heading">
            <h2 id="literacy-heading" className="govuk-heading-l">
              Adult Literacy
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Adult education centres provide literacy and numeracy skills to adults,
              contributing to the county&apos;s overall literacy rate and lifelong learning goals.
            </p>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Adult Literacy Centres</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.adult_literacy_centers_count)}
                </dd>
              </div>
              {county.adult_literacy_enrolment && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Enrolment</dt>
                  <dd className="govuk-summary-list__value">
                    {formatNumber(county.adult_literacy_enrolment)}
                  </dd>
                </div>
              )}
              {county.adult_literacy_attendance && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Regular Attendance</dt>
                  <dd className="govuk-summary-list__value">
                    {formatNumber(county.adult_literacy_attendance)}
                  </dd>
                </div>
              )}
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Overall Literacy Rate</dt>
                <dd className="govuk-summary-list__value">
                  {formatPercentage(county.literacy_rate)}
                  {(county.literacy_rate_male || county.literacy_rate_female) && (
                    <span className="govuk-hint govuk-!-margin-bottom-0 govuk-!-display-block">
                      Male: {formatPercentage(county.literacy_rate_male)} · Female: {formatPercentage(county.literacy_rate_female)}
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <div className="govuk-!-margin-top-8">
            <CountyAboutNav
              countySlug={slug}
              countyName={county.name}
              current="education"
            />
          </div>
        </main>
      </div>
    </>
  );
}