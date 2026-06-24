import { notFound } from "next/navigation";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { counties } from "@/data/counties"; 
import GovUKFeedback from "@/components/govuk/Feedback";

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

export default async function CountyProfilePage({ params }: CountyProfileProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const staticCounty = counties.find((c) => c.slug === slug);
  if (!staticCounty) notFound();

  // 1. Fetch complete metadata metrics matching your counties table schema
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
    // 2. Count active constitutional wards linked to this county record
    const { count: fetchedWardCount } = await supabase
      .from("wards")
      .select("*", { count: "exact", head: true })
      .eq("county_id", county.id);
    
    wardCount = fetchedWardCount || 0;

    // 3. Count exact physical polling stations from polling_stations_2022 table
    const { count: fetchedPollingStationsCount } = await supabase
      .from("polling_stations_2022")
      .select("*", { count: "exact", head: true })
      .eq("county_id", county.id);

    pollingStationsCount = fetchedPollingStationsCount || 0;

    // 4. Fetch constituencies registered for this specific sub-county layout
    const { data: fetchedConstituencies } = await supabase
      .from("constituencies")
      .select("id, name, constituency_code, number_of_wards, registered_voters_2022")
      .eq("county_id", county.id)
      .eq("is_active", true)
      .order("name", { ascending: true });
    
    if (fetchedConstituencies) constituencyList = fetchedConstituencies;

    // 5. Fetch matching local wards registry lists
    const { data: fetchedWards } = await supabase
      .from("wards")
      .select("id, name, ward_code, constituency_name, registered_voters_2022")
      .eq("county_id", county.id)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (fetchedWards) wardList = fetchedWards;

    // 6. Extract active county assembly seats and process political party matrices via foreign relations
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
    political_parties!inner (
      name, 
      abbreviation,
      slug
    ),
    wards!inner (
      name, 
      ward_code
    )
  `)
  .eq("county_id", county.id)
  .in("status", ["active", "Active", "ACTIVE"])   // Handle enum variations
  .order("surname");

    if (mcaRecords && mcaRecords.length > 0) {
      mcaList = mcaRecords as unknown as McaRowItem[];
      totalMcaSeats = mcaList.length;
      magicNumberThreshold = Math.floor(totalMcaSeats / 2) + 1;
      
      activeElectedCount = mcaList.filter(m => m.seat_type === "Elected").length;
      activeNominatedCount = mcaList.filter(m => m.seat_type === "Nominated").length;

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
            nominated: 0 
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
  
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Counties", href: "/counties" },
          { text: staticCounty.name, href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        {/* County Core Identity Header Layout */}
        <div className="govuk-grid-row border-b-4 border-blue-800 pb-4 mb-6">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l font-bold text-blue-800 tracking-wide uppercase">
              Republic of Kenya • Code {staticCounty.code.toString().padStart(2, '0')}
            </span>
            <h1 className="govuk-heading-xl mb-2">{profileHeading} Profile</h1>
            <p className="govuk-body-l text-gray-600 mb-0 font-medium">
              Administrative and open information directory for the devolved county government of {staticCounty.name}.
            </p>
          </div>
        </div>

        {/* High Density Geographic & Demographic KPI Grid Panel */}
        <div className="govuk-grid-row govuk-!-margin-bottom-6 gap-y-4">
          <div className="govuk-grid-column-one-quarter">
            <div className="p-4 bg-gray-50 border-t-4 border-blue-800 shadow-sm text-center h-full">
              <span className="block govuk-heading-m mb-1 text-blue-800">
                {county?.population 
                  ? Number(county.population).toLocaleString('en-KE') 
                  : (staticCounty as any).population?.toLocaleString('en-KE') || "Pending"}
              </span>
              <span className="govuk-body-s font-semibold uppercase tracking-wider text-gray-500 text-xs block">
                Total Population
              </span>
            </div>
          </div>
          <div className="govuk-grid-column-one-quarter">
            <div className="p-4 bg-gray-50 border-t-4 border-blue-800 shadow-sm text-center h-full">
              <span className="block govuk-heading-m mb-1 text-blue-800">
                {wardCount > 0 ? wardCount : county?.wards || "Pending"}
              </span>
              <span className="govuk-body-s font-semibold uppercase tracking-wider text-gray-500 text-xs block">
                Constitutional Wards
              </span>
            </div>
          </div>
          <div className="govuk-grid-column-one-quarter">
            <div className="p-4 bg-gray-50 border-t-4 border-blue-800 shadow-sm text-center h-full">
              <span className="block govuk-heading-m mb-1 text-blue-800">
                {pollingStationsCount > 0 ? pollingStationsCount.toLocaleString('en-KE') : "Pending"}
              </span>
              <span className="govuk-body-s font-semibold uppercase tracking-wider text-gray-500 text-xs block">
                Polling Stations
              </span>
            </div>
          </div>
          <div className="govuk-grid-column-one-quarter">
            <div className="p-4 bg-gray-50 border-t-4 border-blue-800 shadow-sm text-center h-full">
              <span className="block govuk-heading-m mb-1 text-blue-800">
                {totalMcaSeats > 0 ? totalMcaSeats : "Pending"}
              </span>
              <span className="govuk-body-s font-semibold uppercase tracking-wider text-gray-500 text-xs block">
                Assembly Seats Map
              </span>
            </div>
          </div>
        </div>

        <div className="govuk-grid-row">
          {/* Left Column: Executive Leadership & Administration Details */}
          <div className="govuk-grid-column-one-third">
            <h2 className="govuk-heading-m border-b-2 border-black pb-2 mb-4">Executive Leadership</h2>
            
            <dl className="govuk-summary-list govuk-!-margin-bottom-6">
              <div className="govuk-summary-list__row flex flex-col pb-3 mb-3 border-b border-gray-200">
                <dt className="govuk-body-s font-semibold text-gray-500 uppercase tracking-wider mb-1">Governor</dt>
                <dd className="govuk-heading-s font-bold text-gray-900 mb-0">
                  {county?.governor_name || staticCounty.governor}
                </dd>
              </div>

              <div className="govuk-summary-list__row flex flex-col pb-3 mb-3 border-b border-gray-200">
                <dt className="govuk-body-s font-semibold text-gray-500 uppercase tracking-wider mb-1">Deputy Governor</dt>
                <dd className="govuk-heading-s font-bold text-gray-900 mb-0">
                  {county?.deputy_governor_name || staticCounty.deputyGovernor || "Office of the Deputy Governor"}
                </dd>
              </div>

              <div className="govuk-summary-list__row flex flex-col pb-3 mb-3 border-b border-gray-200">
                <dt className="govuk-body-s font-semibold text-gray-500 uppercase tracking-wider mb-1">County Senator</dt>
                <dd className="govuk-heading-s font-bold text-gray-900 mb-0">
                  {county?.senator_name || "Data pending"}
                </dd>
              </div>

              <div className="govuk-summary-list__row flex flex-col pb-3 mb-3 border-b border-gray-200">
                <dt className="govuk-body-s font-semibold text-gray-500 uppercase tracking-wider mb-1">Women Representative</dt>
                <dd className="govuk-heading-s font-bold text-gray-900 mb-0">
                  {county?.women_representative_name || "Data pending"}
                </dd>
              </div>
            </dl>

            <div className="bg-gray-100 p-4 border-l-4 border-blue-800 mb-6">
              <h3 className="govuk-heading-s mb-2">Quick Navigation</h3>
              <ul className="govuk-list govuk-!-font-size-16 mb-0 space-y-1">
                <li>
                  <Link href={`/leaders/county-assembly`} className="govuk-link font-bold">
                    View Complete MCA Directory →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          {/* Right Column: Legislative Assembly Balance of Power Analytics */}
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-m border-b-2 border-black pb-2 mb-4">County Assembly Balance of Power</h2>

            {totalMcaSeats > 0 ? (
              <>
                {/* House Dominance Summary Callout Box */}
                <div className="bg-blue-50 p-4 border-l-4 border-blue-800 mb-6">
                  <h3 className="govuk-heading-s font-bold text-blue-900 mb-1">Legislative Control Summary</h3>
                  <p className="govuk-body-m mb-2 text-gray-800 font-medium">
                    {majorityPartyString}.
                  </p>
                  <p className="govuk-body-s mb-0 text-gray-600">
                    Absolute working majority requires a minimum threshold of <strong>{magicNumberThreshold}</strong> seats in the floor plenary.
                  </p>
                </div>

                {/* Proportional Representation Table */}
                <div className="w-full overflow-x-auto scrolling-touch mb-6">
                  <table className="govuk-table w-full mb-0">
                    <thead className="govuk-table__head bg-gray-50 border-b border-gray-300">
                      <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-left">Political Affiliation</th>
                        <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-center w-[80px]">Elected</th>
                        <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-center w-[90px]">Nominated</th>
                        <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-right w-[80px]">Total</th>
                        <th scope="col" className="govuk-table__header govuk-body-s py-2 px-2 text-right w-[90px]">Strength</th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body divide-y divide-gray-200">
                      {partyBreakdown.map((party) => {
                        const strengthPct = ((party.total / totalMcaSeats) * 100).toFixed(1);
                        return (
                          <tr key={party.abbrev} className="govuk-table__row hover:bg-gray-50">
                            <th scope="row" className="govuk-table__header govuk-body-s py-2 px-2 text-left font-normal text-gray-800">
                              <span className="font-bold text-gray-900">{party.abbrev}</span> — <span className="text-gray-600 text-xs">{party.party_name}</span>
                            </th>
                            <td className="govuk-table__cell govuk-body-s py-2 px-2 text-center font-medium text-gray-700">{party.elected}</td>
                            <td className="govuk-table__cell govuk-body-s py-2 px-2 text-center font-medium text-gray-700">{party.nominated}</td>
                            <td className="govuk-table__cell govuk-body-s py-2 px-2 text-right font-bold text-gray-900">{party.total}</td>
                            <td className="govuk-table__cell govuk-body-s py-2 px-2 text-right font-semibold text-blue-800 font-mono text-xs">{strengthPct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="govuk-grid-row gap-y-4 mb-6">
                  <div className="govuk-grid-column-one-half">
                    <div className="p-3 border border-gray-200 bg-gray-50 flex justify-between items-center">
                      <span className="govuk-body-s font-medium text-gray-600 mb-0">Elected Ward MCAs</span>
                      <strong className="govuk-body-m font-bold text-gray-900 mb-0">{activeElectedCount} Seats</strong>
                    </div>
                  </div>
                  <div className="govuk-grid-column-one-half">
                    <div className="p-3 border border-gray-200 bg-gray-50 flex justify-between items-center">
                      <span className="govuk-body-s font-medium text-gray-600 mb-0">Nominated Top-up MCAs</span>
                      <strong className="govuk-body-m font-bold text-gray-900 mb-0">{activeNominatedCount} Seats</strong>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Graceful Missing Data Handling Placeholder Layout */
              <div className="govuk-inset-text govuk-!-margin-top-0 mb-6 bg-gray-50 border-gray-300">
                <h3 className="govuk-heading-s text-gray-700 font-bold mb-1">Assembly Registry Pending</h3>
                <p className="govuk-body-s text-gray-600 mb-0 italic leading-relaxed">
                  Legislative roster metrics for this assembly are currently unpopulated in the dataset mapping pipeline. 
                  Live analytics, political party balance, and threshold controls will render once the independent data blocks are updated.
                </p>
              </div>
            )}
            {/* Live County Assembly Members Roster Section */}
            <div className="govuk-!-margin-top-8">
              <h2 className="govuk-heading-m border-b-2 border-black pb-2 mb-4">County Assembly Members Roster</h2>
              
              {mcaList.length > 0 ? (
                <div className="space-y-6">
                  {/* Subsection A: Elected Ward MCAs */}
                  {activeElectedCount > 0 && (
                    <div>
                      <h3 className="govuk-heading-s mb-2 text-gray-700">Elected Ward Representatives</h3>
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

                  {/* Subsection B: Nominated MCAs */}
                  {activeNominatedCount > 0 && (
                    <div className="govuk-!-margin-top-6">
                      <h3 className="govuk-heading-s mb-2 text-gray-700">Nominated Special Interest Group Representatives</h3>
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
                                    <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
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
                  Legislative roster metrics for this assembly are currently unpopulated in the dataset mapping pipeline. Live analytics, political party balance, and threshold controls will render once the independent data blocks are updated.
                </div>
              )}
            </div>

            {/* Constituencies Table Integration from database layer */}
            <div className="govuk-!-margin-top-8">
              <h2 className="govuk-heading-m border-b-2 border-black pb-2 mb-4">Constituencies & Electoral Map</h2>
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
                            {constituency.registered_voters_2022 ? constituency.registered_voters_2022.toLocaleString('en-KE') : "Pending"}
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
            {/* Wards Table Integration from database layer */}
            <div className="govuk-!-margin-top-8">
              <h2 className="govuk-heading-m border-b-2 border-black pb-2 mb-4">Constitutional Wards Registry</h2>
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
                            {ward.registered_voters_2022 ? ward.registered_voters_2022.toLocaleString('en-KE') : "Pending"}
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
              <h2 className="govuk-heading-m border-b-2 border-black pb-2 mb-4">Regional Geography and Framework</h2>
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

// // ============================================================================
// // SEO OPTIMIZATION HOOK (Static Metadata Generation Pattern for Next.js App Router)
// // ============================================================================
// export async function generateMetadata({ params }: CountyProfileProps) {
//   const { slug } = await params;
  
//   // Defensively match layout tracking info from local dictionary to bypass 404 blockades
//   const countyData = counties.find((c) => c.slug === slug);

//   if (!countyData) {
//     return {
//       title: "County Profile Not Found",
//     };
//   }

//   const cleanedName = countyData.name;
//   return {
//     title: `${cleanedName} County Profile • Power Balance & Assembly Statistics`,
//     description: `Comprehensive database record for ${cleanedName} County. Review active executive leaders, political party seat distributions, ward metrics, and Members of the County Assembly (MCAs).`,
//     keywords: [`${cleanedName} County`, "County Assembly", "Kenyan MCAs", "Balance of Power", "Devolution Kenya", "IEBC 2022 Results"],
//     openGraph: {
//       title: `${cleanedName} County Government Data Dashboard`,
//       description: `Live political party strengths, majority thresholds, and local leadership registers for ${cleanedName} County.`,
//       type: "website",
//     },
//     twitter: {
//       card: "summary",
//       title: `${cleanedName} County Devolved Unit Metadata`,
//       description: `Official administration metrics and legislative balance maps for ${cleanedName} County Assembly.`,
//     },
//   };
// }
