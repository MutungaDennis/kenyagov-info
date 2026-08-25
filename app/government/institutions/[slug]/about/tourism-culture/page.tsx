import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

type Props = {
  params: Promise<{ slug: string }>;
};

type CountyTourism = {
  name: string;
  slug: string;
  
  // Hotels
  hotels_five_star: number | null;
  hotels_four_star: number | null;
  hotels_three_star: number | null;
  hotels_two_star: number | null;
  hotels_one_star: number | null;
  hotels_unclassified: number | null;
  hotel_bed_capacity_five_star: number | null;
  hotel_bed_capacity_four_star: number | null;
  hotel_bed_capacity_three_star: number | null;
  hotel_bed_capacity_two_star: number | null;
  hotel_bed_capacity_one_star: number | null;
  hotel_bed_capacity_unclassified: number | null;
  
  // Wildlife
  game_parks_count: number | null;
  game_reserves_count: number | null;
  conservancies_count: number | null;
  game_ranches_count: number | null;
  heritage_sites_count: number | null;
  museums_count: number | null;
  
  // Social Amenities
  talent_academies_count: number | null;
  sports_stadia_count: number | null;
  libraries_count: number | null;
  social_halls_count: number | null;
  public_parks_count: number | null;
  
  // Environment
  solid_waste_generated_tonnes_daily: number | null;
  solid_waste_collected_tonnes_daily: number | null;
  waste_recycled_percentage: number | null;
  material_recovery_facilities_count: number | null;
  waste_management_facilities_count: number | null;
  dumpsites_count: number | null;
};

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A";
  return new Intl.NumberFormat("en-KE").format(num);
}

export default async function CountyTourismPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: county } = await supabase
    .from("counties")
    .select(`
      name, slug,
      hotels_five_star, hotels_four_star, hotels_three_star, hotels_two_star,
      hotels_one_star, hotels_unclassified,
      hotel_bed_capacity_five_star, hotel_bed_capacity_four_star,
      hotel_bed_capacity_three_star, hotel_bed_capacity_two_star,
      hotel_bed_capacity_one_star, hotel_bed_capacity_unclassified,
      game_parks_count, game_reserves_count, conservancies_count, game_ranches_count,
      heritage_sites_count, museums_count,
      talent_academies_count, sports_stadia_count, libraries_count,
      social_halls_count, public_parks_count,
      solid_waste_generated_tonnes_daily, solid_waste_collected_tonnes_daily,
      waste_recycled_percentage, material_recovery_facilities_count,
      waste_management_facilities_count, dumpsites_count
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (!county) {
    notFound();
  }

  const totalHotels = 
    (county.hotels_five_star || 0) +
    (county.hotels_four_star || 0) +
    (county.hotels_three_star || 0) +
    (county.hotels_two_star || 0) +
    (county.hotels_one_star || 0) +
    (county.hotels_unclassified || 0);

  const totalBedCapacity = 
    (county.hotel_bed_capacity_five_star || 0) +
    (county.hotel_bed_capacity_four_star || 0) +
    (county.hotel_bed_capacity_three_star || 0) +
    (county.hotel_bed_capacity_two_star || 0) +
    (county.hotel_bed_capacity_one_star || 0) +
    (county.hotel_bed_capacity_unclassified || 0);

  const totalWildlifeAreas = 
    (county.game_parks_count || 0) +
    (county.game_reserves_count || 0) +
    (county.conservancies_count || 0) +
    (county.game_ranches_count || 0);

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "Institutions", href: "/government/institutions" },
          { text: county.name, href: `/government/institutions/${slug}` },
          { text: "About", href: `/government/institutions/${slug}/about` },
          { text: "Tourism, Culture & Environment" },
        ]}
      />

      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" id="main-content" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <span className="govuk-caption-l">{county.name}</span>
              <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
                Tourism, Culture & Environment
              </h1>
              <p className="govuk-body-l govuk-!-margin-bottom-6">
                Overview of {county.name}&apos;s tourism infrastructure, cultural heritage sites, 
                wildlife conservation areas, and environmental management systems.
              </p>
            </div>
          </div>

          {/* Hero Statistics */}
          <div className="govuk-grid-row govuk-!-margin-bottom-8">
            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                <span className="govuk-heading-m govuk-!-margin-bottom-1">
                  {formatNumber(totalHotels)}
                </span>
                <span className="govuk-body-s">Hotels & Lodges</span>
              </div>
            </div>
            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                <span className="govuk-heading-m govuk-!-margin-bottom-1">
                  {formatNumber(totalBedCapacity)}
                </span>
                <span className="govuk-body-s">Total Bed Capacity</span>
              </div>
            </div>
            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                <span className="govuk-heading-m govuk-!-margin-bottom-1">
                  {formatNumber(county.heritage_sites_count)}
                </span>
                <span className="govuk-body-s">Heritage Sites</span>
              </div>
            </div>
            <div className="govuk-grid-column-one-quarter">
              <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                <span className="govuk-heading-m govuk-!-margin-bottom-1">
                  {formatNumber(totalWildlifeAreas)}
                </span>
                <span className="govuk-body-s">Wildlife Areas</span>
              </div>
            </div>
          </div>

          {/* Hotels & Accommodation */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="hotels-heading">
            <h2 id="hotels-heading" className="govuk-heading-l">
              Hotels & Accommodation
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              {county.name} offers a diverse range of accommodation options catering to different 
              market segments, from luxury five-star hotels to budget-friendly establishments.
            </p>

            <h3 className="govuk-heading-m">Hotels by Category</h3>
            <div className="govuk-table-wrapper">
              <table className="govuk-table">
                <caption className="govuk-table__caption govuk-visually-hidden">
                  Hotels and bed capacity by star rating
                </caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">Hotel Category</th>
                    <th scope="col" className="govuk-table__header govuk-table__header--numeric">
                      Number of Hotels
                    </th>
                    <th scope="col" className="govuk-table__header govuk-table__header--numeric">
                      Bed Capacity
                    </th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Five Star</th>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {formatNumber(county.hotels_five_star)}
                    </td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {formatNumber(county.hotel_bed_capacity_five_star)}
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Four Star</th>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {formatNumber(county.hotels_four_star)}
                    </td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {formatNumber(county.hotel_bed_capacity_four_star)}
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Three Star</th>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {formatNumber(county.hotels_three_star)}
                    </td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {formatNumber(county.hotel_bed_capacity_three_star)}
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Two Star</th>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {formatNumber(county.hotels_two_star)}
                    </td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {formatNumber(county.hotel_bed_capacity_two_star)}
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">One Star</th>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {formatNumber(county.hotels_one_star)}
                    </td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {formatNumber(county.hotel_bed_capacity_one_star)}
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">Unclassified</th>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {formatNumber(county.hotels_unclassified)}
                    </td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {formatNumber(county.hotel_bed_capacity_unclassified)}
                    </td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header govuk-!-font-weight-bold">
                      Total
                    </th>
                    <td className="govuk-table__cell govuk-table__cell--numeric govuk-!-font-weight-bold">
                      {formatNumber(totalHotels)}
                    </td>
                    <td className="govuk-table__cell govuk-table__cell--numeric govuk-!-font-weight-bold">
                      {formatNumber(totalBedCapacity)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Wildlife & Conservation */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="wildlife-heading">
            <h2 id="wildlife-heading" className="govuk-heading-l">
              Wildlife & Conservation Areas
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              {county.name} is home to diverse wildlife conservation areas that protect biodiversity 
              and offer unique eco-tourism experiences.
            </p>

            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Game Parks</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.game_parks_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Game Reserves</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.game_reserves_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Conservancies</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.conservancies_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Game Ranches</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.game_ranches_count)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Cultural Heritage */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="heritage-heading">
            <h2 id="heritage-heading" className="govuk-heading-l">
              Cultural Heritage & Museums
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              The county preserves its rich cultural heritage through museums, heritage sites, 
              and cultural centers that showcase the region&apos;s history and traditions.
            </p>

            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Heritage & Cultural Sites</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.heritage_sites_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Museums</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.museums_count)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Social Amenities */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="amenities-heading">
            <h2 id="amenities-heading" className="govuk-heading-l">
              Social Amenities & Recreation
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              The county provides various social amenities and recreational facilities that 
              enhance the quality of life for residents and visitors.
            </p>

            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Talent Academies</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.talent_academies_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Sports Stadia</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.sports_stadia_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Libraries</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.libraries_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Social Halls & Recreation Centers</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.social_halls_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Public Parks</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.public_parks_count)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Environmental Management */}
          <section className="govuk-!-margin-bottom-8" aria-labelledby="environment-heading">
            <h2 id="environment-heading" className="govuk-heading-l">
              Environmental Management & Solid Waste
            </h2>
            <p className="govuk-body govuk-!-margin-bottom-4">
              The county implements comprehensive solid waste management systems to maintain 
              environmental cleanliness and promote sustainable practices.
            </p>

            <h3 className="govuk-heading-m">Solid Waste Management</h3>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Solid Waste Generated (Daily)</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.solid_waste_generated_tonnes_daily)} tonnes
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Solid Waste Collected & Disposed (Daily)</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.solid_waste_collected_tonnes_daily)} tonnes
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Proportion of Waste Recycled</dt>
                <dd className="govuk-summary-list__value">
                  {county.waste_recycled_percentage ? `${county.waste_recycled_percentage}%` : "N/A"}
                </dd>
              </div>
            </dl>

            <h3 className="govuk-heading-m govuk-!-margin-top-6">Waste Management Facilities</h3>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Material Recovery Facilities (MRFs)</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.material_recovery_facilities_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Waste Management Facilities</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.waste_management_facilities_count)}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Dumpsites</dt>
                <dd className="govuk-summary-list__value">
                  {formatNumber(county.dumpsites_count)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Navigation to Other Sections */}
          <nav className="govuk-!-margin-top-8" aria-label="Explore more about the county">
            <h2 className="govuk-heading-m">Explore more about {county.name}</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <a href={`/government/institutions/${slug}/about/overview`} className="govuk-link">
                  Overview & Leadership
                </a>
              </li>
              <li>
                <a href={`/government/institutions/${slug}/about/demographics`} className="govuk-link">
                  Demographics & Population
                </a>
              </li>
              <li>
                <a href={`/government/institutions/${slug}/about/health`} className="govuk-link">
                  Health & Social Services
                </a>
              </li>
              <li>
                <a href={`/government/institutions/${slug}/about/education`} className="govuk-link">
                  Education & Skills Development
                </a>
              </li>
              <li>
                <a href={`/government/institutions/${slug}/about/economy`} className="govuk-link">
                  Economy, Agriculture & Blue Economy
                </a>
              </li>
              <li>
                <a href={`/government/institutions/${slug}/about/infrastructure`} className="govuk-link">
                  Infrastructure, Water & Housing
                </a>
              </li>
            </ul>
          </nav>
        </main>
      </div>
    </>
  );
}