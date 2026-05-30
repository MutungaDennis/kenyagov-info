import { notFound } from "next/navigation";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";

type GenericLeader = {
  id: string;
  name: string;
  title: string;
  category: string;
  county?: string;
  constituency?: string;
  description: string;
};

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    q?: string;
    county?: string;
    seat_type?: string;
    role?: string;
    party?: string;
  }>;
}

export default async function LeadersByCategory({ params, searchParams }: PageProps) {
  const { category } = await params;
  const urlFilters = await searchParams;
  const supabase = await createClient();
  const isCountyAssembly = category.toLowerCase() === "county-assembly";

  let leadersData: GenericLeader[] = [];
  let countiesList: any[] = [];
  let partiesList: any[] = [];

  if (isCountyAssembly) {
    // 1. Fetch filter layout lookups dynamically
    const { data: counties } = await supabase.from("counties").select("id, name").order("name");
    const { data: parties } = await supabase.from("political_parties").select("id, abbreviation, name").order("name");
    countiesList = counties || [];
    partiesList = parties || [];

    // 2. Formulate advanced filtering query on the new table
    let query = supabase
      .from('mcas')
      .select(`
        id, slug, first_name, surname, assembly_role, seat_type, nomination_category,
        counties ( name, id ),
        wards ( name, constituency_name ),
        political_parties ( id )
      `)
      .eq('status', 'Active');

    // Apply strict text and relationship filters if users declare them
    if (urlFilters.county) query = query.eq('county_id', urlFilters.county);
    if (urlFilters.seat_type) query = query.eq('seat_type', urlFilters.seat_type);
    if (urlFilters.role) query = query.eq('assembly_role', urlFilters.role);
    if (urlFilters.party) query = query.eq('party_id', urlFilters.party);

    // Apply Text-Search processing criteria across Names
    if (urlFilters.q) {
      query = query.or(`first_name.ilike.%${urlFilters.q}%,surname.ilike.%${urlFilters.q}%`);
    }

    const { data: mcaRows, error } = await query.order('surname', { ascending: true });
    if (error || !mcaRows) notFound();

    leadersData = mcaRows.map((mca: any) => ({
      id: mca.slug,
      name: `Hon. ${mca.first_name} ${mca.surname}`,
      title: mca.assembly_role,
      category: "County Assembly",
      county: mca.counties?.name,
      constituency: mca.seat_type === "Elected" ? mca.wards?.constituency_name : `Nominated (${mca.nomination_category})`,
      description: mca.seat_type === "Elected" 
        ? `Elected Member of County Assembly representing ${mca.wards?.name || "the region"} Ward.` 
        : `Nominated Member of County Assembly allocated via the ${mca.nomination_category} framework.`
    }));
  } else {
    // Standard processing rule fallback for traditional tables
    let query = supabase
      .from('leaders')
      .select('*')
      .ilike('category', `%${category.replace(/-/g, ' ')}%`);

    if (urlFilters.q) query = query.ilike('name', `%${urlFilters.q}%`);

    const { data, error } = await query.order('name', { ascending: true });
    if (error || !data || data.length === 0) notFound();
    leadersData = data;
  }

  const displayName = isCountyAssembly ? "County Assembly" : category
    .replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Current Leaders", href: "/leaders" },
          { text: displayName, href: "#" },
        ]}
      />

      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">{displayName} Leaders</h1>

        {/* Global Text Search Panel */}
        <div className="bg-gray-100 p-4 mb-6 border-l-4 border-blue-800">
          <form method="GET" action={`/leaders/${category}`}>
            {/* Preserving existing filters during search execution */}
            {urlFilters.county && <input type="hidden" name="county" value={urlFilters.county} />}
            {urlFilters.seat_type && <input type="hidden" name="seat_type" value={urlFilters.seat_type} />}
            {urlFilters.role && <input type="hidden" name="role" value={urlFilters.role} />}
            {urlFilters.party && <input type="hidden" name="party" value={urlFilters.party} />}
            
            <div className="govuk-form-group mb-2">
              <label className="govuk-label font-bold" htmlFor="search-q">Search Representative Name</label>
              <div className="flex gap-2">
                <input 
                  className="govuk-input" 
                  id="search-q" 
                  name="q" 
                  type="text" 
                  defaultValue={urlFilters.q || ""} 
                  placeholder="e.g. Fadhili, Nyache, Mohamed..."
                />
                <button type="submit" className="govuk-button mb-0 whitespace-nowrap">Search</button>
              </div>
            </div>
          </form>
        </div>

        {/* Columnar Grid Implementation */}
        <div className="govuk-grid-row">
          {isCountyAssembly && (
            <div className="govuk-grid-column-one-third">
              <div className="p-4 border-4 border-gray-200 bg-gray-50 mb-6">
                <h2 className="govuk-heading-m">Refine Listing</h2>
                <form method="GET" action={`/leaders/${category}`}>
                  {urlFilters.q && <input type="hidden" name="q" value={urlFilters.q} />}
                  
                  <div className="govuk-form-group">
                    <label className="govuk-label font-bold text-xs" htmlFor="filter-county">County</label>
                    <select className="govuk-select w-full text-sm" id="filter-county" name="county" defaultValue={urlFilters.county || ""}>
                      <option value="">All Counties</option>
                      {countiesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="govuk-form-group">
                    <label className="govuk-label font-bold text-xs" htmlFor="filter-type">Seat Type</label>
                    <select className="govuk-select w-full text-sm" id="filter-type" name="seat_type" defaultValue={urlFilters.seat_type || ""}>
                      <option value="">All Types</option>
                      <option value="Elected">Elected</option>
                      <option value="Nominated">Nominated</option>
                    </select>
                  </div>

                  <div className="govuk-form-group">
                    <label className="govuk-label font-bold text-xs" htmlFor="filter-role">Assembly Assignment</label>
                    <select className="govuk-select w-full text-sm" id="filter-role" name="role" defaultValue={urlFilters.role || ""}>
                      <option value="">All Roles</option>
                      <option value="Speaker">Speaker</option>
                      <option value="Deputy Speaker">Deputy Speaker</option>
                      <option value="Speakers Panel">Speakers Panel</option>
                      <option value="Majority Leader">Majority Leader</option>
                      <option value="Minority Leader">Minority Leader</option>
                      <option value="Member of the County Assembly">Member of the County Assembly</option>
                    </select>
                  </div>

                  <div className="govuk-form-group">
                    <label className="govuk-label font-bold text-xs" htmlFor="filter-party">Party</label>
                    <select className="govuk-select w-full text-sm" id="filter-party" name="party" defaultValue={urlFilters.party || ""}>
                      <option value="">All Parties</option>
                      {partiesList.map(p => <option key={p.id} value={p.id}>{p.abbreviation}</option>)}
                    </select>
                  </div>

                  <button type="submit" className="govuk-button w-full mb-0">Apply Filters</button>
                  <Link href={`/leaders/${category}`} className="block text-center govuk-link govuk-!-margin-top-2 text-xs">Reset All Filters</Link>
                </form>
              </div>
            </div>
          )}
          {/* Right Hand / Main Content Column */}
          <div className={isCountyAssembly ? "govuk-grid-column-two-thirds" : "govuk-grid-column-full"}>
            <p className="govuk-body-l border-b-2 border-black pb-2 mb-6">
              Showing <strong>{leadersData.length}</strong> representatives based on your active search criteria.
            </p>

            {leadersData.length === 0 ? (
              <div className="govuk-inset-text">
                No active leaders matched your search parameters. Try widening your filters or clearing your search term.
              </div>
            ) : (
              <ul className="govuk-list">
                {leadersData.map((leader: GenericLeader) => (
                  <li key={leader.id} className="govuk-!-margin-bottom-6 pb-6 border-b border-gray-200 last:border-b-0">
                    <h3 className="govuk-heading-m govuk-!-margin-bottom-1">
                      <Link href={`/leaders/${category}/${leader.id}`} className="govuk-link">
                        {leader.name}
                      </Link>
                    </h3>
                    
                    <p className="govuk-body font-medium mb-1">{leader.title}</p>
                    
                    {(leader.county || leader.constituency) && (
                      <p className="govuk-body-s text-gray-600 mb-2">
                        {leader.county && `County Assembly: ${leader.county}`}
                        {leader.constituency && ` • ${leader.constituency}`}
                      </p>
                    )}
                    
                    <p className="govuk-body-s text-gray-700">{leader.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
