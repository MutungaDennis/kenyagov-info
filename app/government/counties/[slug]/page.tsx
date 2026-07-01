import { notFound } from "next/navigation";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { counties } from "@/data/counties";
import GovUKFeedback from "@/components/govuk/Feedback";
import { JsonLd } from "@/components/JsonLd";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface CountyProfileProps {
  params: Promise<{ slug: string }>;
}

interface PartyMapItem {
  party_name: string;
  abbrev: string;
  total: number;
  elected: number;
  nominated: number;
}

interface WardListItem {
  id: string;
  name: string;
  ward_code: string;
  constituency_name: string;
  registered_voters_2022: number | null;
}

interface ConstituencyListItem {
  id: string;
  name: string;
  constituency_code: string;
  number_of_wards: number | null;
  registered_voters_2022: number | null;
}

interface McaRowItem {
  id: string;
  slug: string;
  first_name: string;
  surname: string;
  gender: string;
  seat_type: "Elected" | "Nominated";
  nomination_category: string;
  assembly_role: string;
  term_count: number;
  official_email: string | null;
  political_parties: {
    name: string;
    abbreviation: string;
  } | null;
  wards: {
    name: string;
    ward_code: string;
  } | null;
}

// ==========================================
// SEO: Dynamic Metadata
// ==========================================
export async function generateMetadata({ params }: CountyProfileProps) {
  const { slug } = await params;
  const staticCounty = counties.find((c) => c.slug === slug);

  if (!staticCounty) {
    return {
      title: "County Not Found | CitizenGuide.KE",
    };
  }

  return {
    title: `${staticCounty.name} County Profile | CitizenGuide.KE`,
    description: `Comprehensive profile for ${staticCounty.name} County. View executive leadership, county assembly composition, constituencies, wards, and key statistics.`,
    keywords: [
      `${staticCounty.name} County`,
      "Kenya County Government",
      "County Assembly",
      "MCAs",
      "Devolution Kenya",
    ],
  };
}

export default async function CountyProfilePage({ params }: CountyProfileProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const staticCounty = counties.find((c) => c.slug === slug);
  if (!staticCounty) notFound();

  // 1. Fetch complete metadata metrics
  const { data: county } = await supabase
    .from("counties")
    .select(`
      id, slug, name, code, headquarters, region, former_province, area_km2,
      population, population_density, governor_name, deputy_governor_name, 
      senator_name, women_representative_name, equitable_share, own_source_revenue, 
      gross_county_product, constituencies, wards
    `)
    .eq("slug", slug)
    .single();

  let wardList: WardListItem[] = [];
  let constituencyList: ConstituencyListItem[] = [];
  let mcaList: McaRowItem[] = [];
  let totalMcaSeats = 0;
  let activeElectedCount = 0;
  let activeNominatedCount = 0;
  let partyBreakdown: PartyMapItem[] = [];
  let majorityPartyString = "Assembly roster datasets pending";
  let magicNumberThreshold = 0;
  let wardCount = 0;
  let pollingStationsCount = 0;

  if (county) {
    // 2. Count active constitutional wards
    const { count: fetchedWardCount } = await supabase
      .from("wards")
      .select("*", { count: "exact", head: true })
      .eq("county_id", county.id);
    wardCount = fetchedWardCount || 0;

    // 3. Count polling stations
    const { count: fetchedPollingStationsCount } = await supabase
      .from("polling_stations_2022")
      .select("*", { count: "exact", head: true })
      .eq("county_id", county.id);
    pollingStationsCount = fetchedPollingStationsCount || 0;

    // 4. Fetch constituencies
    const { data: fetchedConstituencies } = await supabase
      .from("constituencies")
      .select("id, name, constituency_code, number_of_wards, registered_voters_2022")
      .eq("county_id", county.id)
      .eq("is_active", true)
      .order("name", { ascending: true });
    if (fetchedConstituencies) constituencyList = fetchedConstituencies;

    // 5. Fetch wards
    const { data: fetchedWards } = await supabase
      .from("wards")
      .select("id, name, ward_code, constituency_name, registered_voters_2022")
      .eq("county_id", county.id)
      .eq("is_active", true)
      .order("name", { ascending: true });
    if (fetchedWards) wardList = fetchedWards;

    // 6. Fetch MCAs and process party breakdown
    const { data: mcaRecords } = await supabase
      .from("mcas")
      .select(`
        id, 
        slug, 
        first_name, 
        surname, 
        gender, 
        seat_type, 
        nomination_category,
        assembly_role, 
        term_count, 
        official_email,
        status,
        political_parties!inner (name, abbreviation, slug),
        wards!inner (name, ward_code)
      `)
      .eq("county_id", county.id)
      .in("status", ["active", "Active", "ACTIVE"])
      .order("surname");

    if (mcaRecords && mcaRecords.length > 0) {
      mcaList = mcaRecords as unknown as McaRowItem[];
      totalMcaSeats = mcaList.length;
      magicNumberThreshold = Math.floor(totalMcaSeats / 2) + 1;

      activeElectedCount = mcaList.filter((m) => m.seat_type === "Elected").length;
      activeNominatedCount = mcaList.filter((m) => m.seat_type === "Nominated").length;

      const partyMap: Record<string, PartyMapItem> = {};

      mcaList.forEach((mca) => {
        const partyData = mca.political_parties;
        const partyKey = partyData?.abbreviation || "IND";
        const partyName = partyData?.name || "Independent Candidates";

        if (!partyMap[partyKey]) {
          partyMap[partyKey] = {
            party_name: partyName,
            abbrev: partyKey,
            total: 0,
            elected: 0,
            nominated: 0,
          };
        }

        partyMap[partyKey].total += 1;
        if (mca.seat_type === "Elected") partyMap[partyKey].elected += 1;
        if (mca.seat_type === "Nominated") partyMap[partyKey].nominated += 1;
      });

      partyBreakdown = Object.values(partyMap).sort((a, b) => b.total - a.total);

      if (partyBreakdown.length > 0) {
        const largestParty = partyBreakdown[0];
        if (largestParty.total >= magicNumberThreshold) {
          majorityPartyString = `${largestParty.party_name} (${largestParty.abbrev}) holds an absolute working majority`;
        } else {
          majorityPartyString = `${largestParty.party_name} (${largestParty.abbrev}) maintains a relative plurality`;
        }
      }
    }
  }

  const profileHeading = `${staticCounty.name} County`;

  // ==========================================
  // SCHEMA.ORG STRUCTURED DATA
  // ==========================================
  const countySchema = {
    "@context": "https://schema.org",
    "@type": "AdministrativeArea",
    "name": `${staticCounty.name} County`,
    "description": `Administrative and open information directory for ${staticCounty.name} County Government, Kenya.`,
    "url": `https://www.citizenguide.ke/counties/${slug}`,
    "containedInPlace": {
      "@type": "Country",
      "name": "Kenya",
    },
    "population": county?.population || undefined,
  };

  const governmentOrganizationSchema = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    "name": `${staticCounty.name} County Government`,
    "description": `The devolved county government responsible for local administration and service delivery in ${staticCounty.name} County.`,
    "url": `https://www.citizenguide.ke/counties/${slug}`,
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": `${staticCounty.name} County`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.citizenguide.ke" },
      { "@type": "ListItem", "position": 2, "name": "Counties", "item": "https://www.citizenguide.ke/counties" },
      { "@type": "ListItem", "position": 3, "name": profileHeading, "item": `https://www.citizenguide.ke/counties/${slug}` },
    ],
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Counties", href: "/counties" },
          { text: staticCounty.name, href: "" },
        ]}
      />

      {/* Schema.org Structured Data */}
      <JsonLd data={countySchema} />
      <JsonLd data={governmentOrganizationSchema} />
      <JsonLd data={breadcrumbSchema} />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        
        {/* Page Header - Clean GOV.UK Style */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l">
              Republic of Kenya • Code {staticCounty.code.toString().padStart(2, "0")}
            </span>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{profileHeading} Profile</h1>
            <p className="govuk-body-l">
              Administrative and open information directory for the devolved county government of {staticCounty.name}.
            </p>
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-6" />

        {/* Key Statistics - GOV.UK Inset Text Style */}
        <div className="govuk-grid-row govuk-!-margin-bottom-8">
          <div className="govuk-grid-column-one-quarter">
            <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
              <span className="govuk-heading-m govuk-!-margin-bottom-1">
                {county?.population
                  ? Number(county.population).toLocaleString("en-KE")
                  : (staticCounty as any).population?.toLocaleString("en-KE") || "Pending"}
              </span>
              <span className="govuk-body-s">Total Population</span>
            </div>
          </div>
          <div className="govuk-grid-column-one-quarter">
            <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
              <span className="govuk-heading-m govuk-!-margin-bottom-1">
                {wardCount > 0 ? wardCount : county?.wards || "Pending"}
              </span>
              <span className="govuk-body-s">Constitutional Wards</span>
            </div>
          </div>
          <div className="govuk-grid-column-one-quarter">
            <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
              <span className="govuk-heading-m govuk-!-margin-bottom-1">
                {pollingStationsCount > 0 ? pollingStationsCount.toLocaleString("en-KE") : "Pending"}
              </span>
              <span className="govuk-body-s">Polling Stations</span>
            </div>
          </div>
          <div className="govuk-grid-column-one-quarter">
            <div className="govuk-inset-text govuk-!-margin-top-0 govuk-!-margin-bottom-0">
              <span className="govuk-heading-m govuk-!-margin-bottom-1">
                {totalMcaSeats > 0 ? totalMcaSeats : "Pending"}
              </span>
              <span className="govuk-body-s">County Assembly Seats</span>
            </div>
          </div>
        </div>

        <div className="govuk-grid-row">
          {/* Left Column: Executive Leadership (FIXED) */}
          <div className="govuk-grid-column-one-third">
            <h2 className="govuk-heading-m">Executive Leadership</h2>

            <dl className="govuk-summary-list govuk-!-margin-bottom-6">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Governor</dt>
                <dd className="govuk-summary-list__value govuk-!-font-weight-bold">
                  {county?.governor_name || staticCounty.governor}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Deputy Governor</dt>
                <dd className="govuk-summary-list__value">
                  {county?.deputy_governor_name || staticCounty.deputyGovernor || "Office of the Deputy Governor"}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">County Senator</dt>
                <dd className="govuk-summary-list__value">
                  {county?.senator_name || "Data pending"}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Women Representative</dt>
                <dd className="govuk-summary-list__value">
                  {county?.women_representative_name || "Data pending"}
                </dd>
              </div>
            </dl>

            <div className="govuk-inset-text">
              <h3 className="govuk-heading-s govuk-!-margin-bottom-2">Quick Navigation</h3>
              <Link href={`/leaders/county-assembly`} className="govuk-link govuk-!-font-weight-bold">
                View Complete MCA Directory →
              </Link>
            </div>
          </div>

          {/* Right Column: Legislative Assembly Balance of Power Analytics */}
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m">County Assembly Balance of Power</h2>

            {totalMcaSeats > 0 ? (
              <>
                {/* House Dominance Summary Callout Box */}
                <div className="govuk-inset-text">
                  <p className="govuk-body-m govuk-!-margin-bottom-1">
                    <strong>{majorityPartyString}</strong>.
                  </p>
                  <p className="govuk-body-s">
                    Absolute working majority requires a minimum threshold of <strong>{magicNumberThreshold}</strong> seats in the floor plenary.
                  </p>
                </div>

                {/* Proportional Representation Table */}
                <div className="govuk-!-margin-bottom-6">
                  <table className="govuk-table">
                    <thead className="govuk-table__head">
                      <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header">Political Affiliation</th>
                        <th scope="col" className="govuk-table__header govuk-table__header--numeric">Elected</th>
                        <th scope="col" className="govuk-table__header govuk-table__header--numeric">Nominated</th>
                        <th scope="col" className="govuk-table__header govuk-table__header--numeric">Total</th>
                        <th scope="col" className="govuk-table__header govuk-table__header--numeric">Strength</th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body">
                      {partyBreakdown.map((party) => {
                        const strengthPct = ((party.total / totalMcaSeats) * 100).toFixed(1);
                        return (
                          <tr key={party.abbrev} className="govuk-table__row">
                            <th scope="row" className="govuk-table__header govuk-body-s font-normal">
                              <span className="font-bold">{party.abbrev}</span> — {party.party_name}
                            </th>
                            <td className="govuk-table__cell govuk-table__cell--numeric">{party.elected}</td>
                            <td className="govuk-table__cell govuk-table__cell--numeric">{party.nominated}</td>
                            <td className="govuk-table__cell govuk-table__cell--numeric"><strong>{party.total}</strong></td>
                            <td className="govuk-table__cell govuk-table__cell--numeric">{strengthPct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="govuk-grid-row govuk-!-margin-bottom-6">
                  <div className="govuk-grid-column-one-half">
                    <div className="govuk-inset-text govuk-!-margin-top-0">
                      <span className="govuk-body-s">Elected Ward MCAs</span><br />
                      <strong className="govuk-heading-m govuk-!-margin-bottom-0">{activeElectedCount} Seats</strong>
                    </div>
                  </div>
                  <div className="govuk-grid-column-one-half">
                    <div className="govuk-inset-text govuk-!-margin-top-0">
                      <span className="govuk-body-s">Nominated Top-up MCAs</span><br />
                      <strong className="govuk-heading-m govuk-!-margin-bottom-0">{activeNominatedCount} Seats</strong>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="govuk-inset-text govuk-!-margin-top-0 mb-6">
                <h3 className="govuk-heading-s govuk-!-margin-bottom-1">Assembly Registry Pending</h3>
                <p className="govuk-body-s">
                  Legislative roster metrics for this assembly are currently unpopulated in the dataset mapping pipeline.
                  Live analytics, political party balance, and threshold controls will render once the independent data blocks are updated.
                </p>
              </div>
            )}

            {/* Live County Assembly Members Roster Section */}
            <div className="govuk-!-margin-top-8">
              <h2 className="govuk-heading-m">County Assembly Members Roster</h2>

              {mcaList.length > 0 ? (
                <div className="space-y-6">
                  {/* Elected Ward MCAs */}
                  {activeElectedCount > 0 && (
                    <div>
                      <h3 className="govuk-heading-s mb-2">Elected Ward Representatives</h3>
                      <div className="w-full overflow-x-auto scrolling-touch mb-4">
                        <table className="govuk-table w-full mb-0">
                          <thead className="govuk-table__head bg-gray-50 border-b border-gray-300">
                            <tr className="govuk-table__row">
                              <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-left">Representative Name</th>
                              <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-left">Represented Ward</th>
                              <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-center w-[60px]">Party</th>
                              <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-right">Assembly Assignment</th>
                            </tr>
                          </thead>
                          <tbody className="govuk-table__body divide-y divide-gray-200">
                            {mcaList
                              .filter((m) => m.seat_type === "Elected")
                              .map((mca) => (
                                <tr key={mca.id} className="govuk-table__row hover:bg-gray-50">
                                  <th scope="row" className="govuk-table__header govuk-body-s py-2 px-2 text-left font-bold text-blue-700">
                                    <Link href={`/leaders/county-assembly/${mca.slug}`} className="govuk-link">
                                      Hon. {mca.first_name} {mca.surname}
                                    </Link>
                                  </th>
                                  <td className="govuk-table__cell govuk-body-s py-2 px-2 text-gray-800 font-medium">
                                    {mca.wards?.name ? `${mca.wards.name} (${mca.wards.ward_code})` : "N/A"}
                                  </td>
                                  <td className="govuk-table__cell govuk-body-s py-2 px-2 text-center font-mono font-bold text-gray-600">
                                    {mca.political_parties?.abbreviation || "IND"}
                                  </td>
                                  <td className="govuk-table__cell govuk-body-s py-2 px-2 text-right text-gray-700 text-xs font-semibold">
                                    {mca.assembly_role}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Nominated MCAs */}
                  {activeNominatedCount > 0 && (
                    <div className="govuk-!-margin-top-6">
                      <h3 className="govuk-heading-s mb-2">Nominated Special Interest Group Representatives</h3>
                      <div className="w-full overflow-x-auto scrolling-touch">
                        <table className="govuk-table w-full mb-0">
                          <thead className="govuk-table__head bg-gray-50 border-b border-gray-300">
                            <tr className="govuk-table__row">
                              <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-left">Representative Name</th>
                              <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-left">Nomination Category</th>
                              <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-center w-[60px]">Party</th>
                              <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-right">Assembly Assignment</th>
                            </tr>
                          </thead>
                          <tbody className="govuk-table__body divide-y divide-gray-200">
                            {mcaList
                              .filter((m) => m.seat_type === "Nominated")
                              .map((mca) => (
                                <tr key={mca.id} className="govuk-table__row hover:bg-gray-50">
                                  <th scope="row" className="govuk-table__header govuk-body-s py-2 px-2 text-left font-bold text-blue-700">
                                    <Link href={`/leaders/county-assembly/${mca.slug}`} className="govuk-link">
                                      Hon. {mca.first_name} {mca.surname}
                                    </Link>
                                  </th>
                                  <td className="govuk-table__cell govuk-body-s py-2 px-2 text-gray-800">
                                    <span className="govuk-tag govuk-tag--purple">
                                      {mca.nomination_category}
                                    </span>
                                  </td>
                                  <td className="govuk-table__cell govuk-body-s py-2 px-2 text-center font-mono font-bold text-gray-600">
                                    {mca.political_parties?.abbreviation || "IND"}
                                  </td>
                                  <td className="govuk-table__cell govuk-body-s py-2 px-2 text-right text-gray-700 text-xs font-semibold">
                                    {mca.assembly_role}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="govuk-inset-text mb-6 bg-gray-50 border-gray-300 py-3 italic text-gray-600">
                  Legislative roster metrics for this assembly are currently unpopulated in the dataset mapping pipeline.
                  Live analytics, political party balance, and threshold controls will render once the independent data blocks are updated.
                </div>
              )}
            </div>

            {/* Constituencies Table */}
            <div className="govuk-!-margin-top-8">
              <h2 className="govuk-heading-m">Constituencies & Electoral Map</h2>
              {constituencyList.length > 0 ? (
                <div className="w-full overflow-x-auto scrolling-touch mb-6">
                  <table className="govuk-table w-full mb-0">
                    <thead className="govuk-table__head bg-gray-50 border-b border-gray-300">
                      <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-left">Code</th>
                        <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-left">Constituency Name</th>
                        <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-center w-[120px]">Number of Wards</th>
                        <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-right w-[150px]">Registered Voters (2022)</th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body divide-y divide-gray-200">
                      {constituencyList.map((constituency) => (
                        <tr key={constituency.id} className="govuk-table__row hover:bg-gray-50">
                          <td className="govuk-table__cell govuk-body-s py-2 px-2 text-gray-600 font-mono font-bold">
                            {constituency.constituency_code}
                          </td>
                          <td className="govuk-table__cell govuk-body-s py-2 px-2 font-bold text-blue-700">
                            {constituency.name}
                          </td>
                          <td className="govuk-table__cell govuk-body-s py-2 px-2 text-center text-gray-700 font-medium">
                            {constituency.number_of_wards || "N/A"}
                          </td>
                          <td className="govuk-table__cell govuk-body-s py-2 px-2 text-right font-mono text-gray-800">
                            {constituency.registered_voters_2022 ? constituency.registered_voters_2022.toLocaleString("en-KE") : "Pending"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="govuk-inset-text mb-6 italic text-gray-500">
                  Sub-county constituency distribution layout registers are currently unpopulated for this county region.
                </div>
              )}
            </div>

            {/* Wards Table */}
            <div className="govuk-!-margin-top-8">
              <h2 className="govuk-heading-m">Constitutional Wards Registry</h2>
              {wardList.length > 0 ? (
                <div className="w-full overflow-x-auto scrolling-touch mb-6">
                  <table className="govuk-table w-full mb-0">
                    <thead className="govuk-table__head bg-gray-50 border-b border-gray-300">
                      <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-left">Code</th>
                        <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-left">Ward Name</th>
                        <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-left">Constituency/Sub-County</th>
                        <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-right w-[150px]">Registered Voters (2022)</th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body divide-y divide-gray-200">
                      {wardList.map((ward) => (
                        <tr key={ward.id} className="govuk-table__row hover:bg-gray-50">
                          <td className="govuk-table__cell govuk-body-s py-2 px-2 text-gray-500 font-mono text-xs">
                            {ward.ward_code}
                          </td>
                          <td className="govuk-table__cell govuk-body-s py-2 px-2 font-semibold text-gray-900">
                            {ward.name}
                          </td>
                          <td className="govuk-table__cell govuk-body-s py-2 px-2 text-gray-600">
                            {ward.constituency_name}
                          </td>
                          <td className="govuk-table__cell govuk-body-s py-2 px-2 text-right font-mono text-gray-700">
                            {ward.registered_voters_2022 ? ward.registered_voters_2022.toLocaleString("en-KE") : "Pending"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="govuk-inset-text mb-6 italic text-gray-500">
                  Granular electoral ward registries are currently unpopulated for this county region.
                </div>
              )}
            </div>

            {/* Regional Geo-Demographic Informational Overview */}
            <div className="govuk-!-margin-top-8">
              <h2 className="govuk-heading-m">Regional Geography and Framework</h2>
              <p className="govuk-body leading-relaxed text-gray-700">
                As a fully formalized devolved administrative block, {staticCounty.name} manages localized legislative mandates through its County Executive Committee and House Assembly. This system handles community health channels, municipal infrastructure tracking, and local development operations.
              </p>
              <p className="govuk-body-s text-gray-500 italic">
                Data pipelines map and sync boundaries continuously alongside official records from the Independent Electoral and Boundaries Commission (IEBC) and the Office of the Registrar of Political Parties (ORPP).
              </p>
            </div>
          </div>
        </div>

        {/* Universal GOV.UK Compliant Feedback Segment */}
        <div className="govuk-!-margin-top-8 border-t border-gray-200 pt-6">
          <GovUKFeedback />
        </div>
      </main>
    </div>
  );
}