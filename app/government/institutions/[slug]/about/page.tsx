'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createBrowserClientAsync } from "@/lib/supabase/client";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

function formatGovUKDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getUTCDate();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${day} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "";
  return new Intl.NumberFormat('en-KE').format(num);
}

type Institution = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  institution_type?: string | null;
  institution_category?: string | null;
  status?: string | null;
  description?: string | null;
  vision?: string | null;
  mission?: string | null;
  functions?: string[] | null;
  legal_basis_name?: string | null;
  legal_basis_reference?: string | null;
  established_date?: string | null;
  operational_model?: string | null;
  constitutional_status?: string | null;
  jurisdiction_scope?: string | null;
  funding_model?: string | null;
  appointing_authority?: string | null;
  cofog_division?: string | null;
  cofog_group?: string | null;
  mtef_sector?: string | null;
  parent_institution_id?: string | null;
  supervising_ministry_id?: string | null;
  predecessor_institution_id?: string | null;
  citizen_charter_url?: string | null;
  complaints_mechanism_url?: string | null;
  procurement_portal_url?: string | null;
  lifecycle_change_reason?: string | null;
};

type LinkedInstitution = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
};

type ChildInstitution = {
  id: string;
  slug: string;
  name: string;
};

type CountyDetails = {
  code?: number | null;
  headquarters?: string | null;
  region?: string | null;
  former_province?: string | null;
  area_km2?: number | null;
  population?: number | null;
  population_density?: number | null;
  urban_population_percentage?: number | null;
  rural_population_percentage?: number | null;
  youth_population_percentage?: number | null;
  gross_county_product?: number | null;
  dominant_sector?: string | null;
  poverty_rate?: number | null;
  equitable_share?: number | null;
  own_source_revenue?: number | null;
  electricity_access_percentage?: number | null;
  safe_water_access_percentage?: number | null;
  health_facilities_count?: number | null;
  schools_count?: number | null;
  literacy_rate?: number | null;
  arable_land_percentage?: number | null;
  major_crops?: string[] | null;
  livestock_population?: number | null;
  website_url?: string | null;
  economic_bloc?: string | null;
  sub_counties?: number | null;
  constituencies?: number | null;
  wards?: number | null;
  main_economic_activities?: string[] | null;
};

type Leader = {
  id: string;
  slug: string;
  title: string;
  full_name: string;
  is_active: boolean;
};

export default function InstitutionAboutPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [parentChain, setParentChain] = useState<LinkedInstitution[]>([]);
  const [directParent, setDirectParent] = useState<LinkedInstitution | null>(null);
  const [supervisingMinistry, setSupervisingMinistry] = useState<LinkedInstitution | null>(null);
  const [predecessor, setPredecessor] = useState<LinkedInstitution | null>(null);
  const [successors, setSuccessors] = useState<LinkedInstitution[]>([]);
  const [childInstitutions, setChildInstitutions] = useState<ChildInstitution[]>([]);
  
  // County specific state
  const [countyDetails, setCountyDetails] = useState<CountyDetails | null>(null);
  const [activeLeaders, setActiveLeaders] = useState<Leader[]>([]);
  const [formerLeaders, setFormerLeaders] = useState<Leader[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        const supabase = await createBrowserClientAsync();
        const { data } = await supabase
          .from("institutions")
          .select(`
            id, slug, name, short_name, institution_type, institution_category, status, description, vision, mission, functions,
            legal_basis_name, legal_basis_reference, established_date, operational_model, constitutional_status,
            jurisdiction_scope, funding_model, appointing_authority, cofog_division, cofog_group, mtef_sector,
            parent_institution_id, supervising_ministry_id, predecessor_institution_id,
            citizen_charter_url, complaints_mechanism_url, procurement_portal_url, lifecycle_change_reason
          `)
          .eq("slug", slug)
          .maybeSingle();

        if (!data) return;
        setInstitution(data as Institution);

        // Build parent chain
        const chain: LinkedInstitution[] = [];
        let parentId = data.parent_institution_id;
        const seen = new Set<string>([data.id]);
        for (let i = 0; i < 8 && parentId; i++) {
          if (seen.has(parentId)) break;
          seen.add(parentId);
          const { data: parentData } = await supabase.from("institutions").select("id, slug, name, short_name").eq("id", parentId).maybeSingle();
          if (!parentData) break;
          chain.unshift(parentData as LinkedInstitution);
          if (chain.length === 1) setDirectParent(parentData as LinkedInstitution);
          parentId = (parentData as any).parent_institution_id;
        }
        setParentChain(chain);

        if (data.supervising_ministry_id) {
          const { data: sup } = await supabase.from("institutions").select("id, slug, name, short_name").eq("id", data.supervising_ministry_id).maybeSingle();
          if (sup) setSupervisingMinistry(sup as LinkedInstitution);
        }
        
        if (data.predecessor_institution_id) {
          const { data: pred } = await supabase.from("institutions").select("id, slug, name, short_name").eq("id", data.predecessor_institution_id).maybeSingle();
          if (pred) setPredecessor(pred as LinkedInstitution);
        }

        const { data: succs } = await supabase
          .from("institutions")
          .select("id, slug, name, short_name")
          .eq("predecessor_institution_id", data.id)
          .order("name");
        if (succs?.length) setSuccessors(succs as LinkedInstitution[]);

        const { data: children } = await supabase
          .from("institutions")
          .select("id, slug, name")
          .eq("parent_institution_id", data.id)
          .eq("is_active", true)
          .order("name");
        if (children) setChildInstitutions(children as ChildInstitution[]);

        // ✅ COUNTY SPECIFIC FETCH
        const isCounty = data.institution_category === 'County Government' || data.name.toLowerCase().includes('county');
        if (isCounty) {
          const { data: countyData } = await supabase
            .from("counties")
            .select("*")
            .eq("name", data.name) // Matching by name as per your schema example
            .maybeSingle();

          if (countyData) {
            setCountyDetails(countyData as CountyDetails);

            // Fetch leaders associated with this county
            const { data: leadersData } = await supabase
              .from("leaders")
              .select("id, slug, title, full_name, is_active")
              .eq("current_county", countyData.name)
              .order("is_active", { ascending: false }) // Active leaders first
              .order("updated_at", { ascending: false }); // Most recently updated first

            if (leadersData) {
              setActiveLeaders(leadersData.filter((l: Leader) => l.is_active));
              setFormerLeaders(leadersData.filter((l: Leader) => !l.is_active));
            }
          }
        }

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (isLoading) return <div className="govuk-width-container"><main className="govuk-main-wrapper"><p className="govuk-body">Loading...</p></main></div>;
  if (!institution) return <div className="govuk-width-container"><main className="govuk-main-wrapper"><h1 className="govuk-heading-xl">Page not found</h1></main></div>;

  // Helper to group leaders by title for clean display
  const groupLeadersByTitle = (leaders: Leader[]) => {
    const grouped: Record<string, Leader[]> = {};
    leaders.forEach(leader => {
      if (!grouped[leader.title]) grouped[leader.title] = [];
      grouped[leader.title].push(leader);
    });
    return grouped;
  };

  const activeLeadersGrouped = groupLeadersByTitle(activeLeaders);
  const formerLeadersGrouped = groupLeadersByTitle(formerLeaders);

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={[
        { text: "Home", href: "/" },
        { text: "Government", href: "/government" },
        { text: "Institutions", href: "/government/institutions" },
        ...parentChain.map((p) => ({ text: p.short_name || p.name, href: `/government/institutions/${p.slug}` })),
        { text: institution.name, href: `/government/institutions/${slug}` },
        { text: "About" },
      ]} />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <span className="govuk-caption-l">{institution.institution_type || "Public body"}</span>
            <h1 className="govuk-heading-xl">{institution.name}</h1>

            <h2 className="govuk-heading-l">Overview</h2>
            {institution.description && <p className="govuk-body">{institution.description}</p>}
            {institution.vision && <p className="govuk-body"><strong>Vision:</strong> {institution.vision}</p>}
            {institution.mission && <p className="govuk-body"><strong>Mission:</strong> {institution.mission}</p>}

            {institution.functions && institution.functions.length > 0 && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Responsibilities</h2>
                <ul className="govuk-list govuk-list--bullet">
                  {institution.functions.map((func, i) => <li key={i}>{func}</li>)}
                </ul>
              </>
            )}

            {/* ✅ COUNTY SPECIFIC: Jurisdiction and Demographics */}
            {countyDetails && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">County Profile and Jurisdiction</h2>
                <dl className="govuk-summary-list">
                  {countyDetails.code && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">County Code</dt>
                      <dd className="govuk-summary-list__value">{countyDetails.code}</dd>
                    </div>
                  )}
                  {countyDetails.headquarters && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Headquarters</dt>
                      <dd className="govuk-summary-list__value">{countyDetails.headquarters}</dd>
                    </div>
                  )}
                  {countyDetails.region && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Region</dt>
                      <dd className="govuk-summary-list__value">{countyDetails.region}{countyDetails.former_province ? ` (Formerly ${countyDetails.former_province} Province)` : ''}</dd>
                    </div>
                  )}
                  {countyDetails.area_km2 && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Land Area</dt>
                      <dd className="govuk-summary-list__value">{formatNumber(countyDetails.area_km2)} km²</dd>
                    </div>
                  )}
                  {countyDetails.population && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Population</dt>
                      <dd className="govuk-summary-list__value">
                        {formatNumber(countyDetails.population)}
                        {countyDetails.population_density && ` (${formatNumber(countyDetails.population_density)} per km²)`}
                      </dd>
                    </div>
                  )}
                  {(countyDetails.urban_population_percentage || countyDetails.rural_population_percentage || countyDetails.youth_population_percentage) && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Demographics</dt>
                      <dd className="govuk-summary-list__value">
                        {countyDetails.urban_population_percentage && <span className="govuk-!-margin-right-2">Urban: {countyDetails.urban_population_percentage}%</span>}
                        {countyDetails.rural_population_percentage && <span className="govuk-!-margin-right-2">Rural: {countyDetails.rural_population_percentage}%</span>}
                        {countyDetails.youth_population_percentage && <span>Youth: {countyDetails.youth_population_percentage}%</span>}
                      </dd>
                    </div>
                  )}
                  {countyDetails.main_economic_activities && countyDetails.main_economic_activities.length > 0 && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Main Economic Activities</dt>
                      <dd className="govuk-summary-list__value">{countyDetails.main_economic_activities.join(", ")}</dd>
                    </div>
                  )}
                  {countyDetails.dominant_sector && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Dominant Sector</dt>
                      <dd className="govuk-summary-list__value">{countyDetails.dominant_sector}</dd>
                    </div>
                  )}
                  {countyDetails.gross_county_product && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Gross County Product (GCP)</dt>
                      <dd className="govuk-summary-list__value">KES {formatNumber(countyDetails.gross_county_product)}</dd>
                    </div>
                  )}
                  {countyDetails.economic_bloc && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Economic Bloc</dt>
                      <dd className="govuk-summary-list__value">{countyDetails.economic_bloc}</dd>
                    </div>
                  )}
                  {(countyDetails.sub_counties || countyDetails.constituencies || countyDetails.wards) && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Administrative Units</dt>
                      <dd className="govuk-summary-list__value">
                        {countyDetails.sub_counties && <span className="govuk-!-margin-right-2">{countyDetails.sub_counties} Sub-counties</span>}
                        {countyDetails.constituencies && <span className="govuk-!-margin-right-2">{countyDetails.constituencies} Constituencies</span>}
                        {countyDetails.wards && <span>{countyDetails.wards} Wards</span>}
                      </dd>
                    </div>
                  )}
                </dl>

                {/* Development Indicators */}
                {(countyDetails.poverty_rate || countyDetails.electricity_access_percentage || countyDetails.safe_water_access_percentage || countyDetails.literacy_rate || countyDetails.health_facilities_count || countyDetails.schools_count) && (
                  <>
                    <h3 className="govuk-heading-m govuk-!-margin-top-6">Development Indicators</h3>
                    <dl className="govuk-summary-list">
                      {countyDetails.poverty_rate && (
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">Poverty Rate</dt>
                          <dd className="govuk-summary-list__value">{countyDetails.poverty_rate}%</dd>
                        </div>
                      )}
                      {countyDetails.electricity_access_percentage && (
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">Electricity Access</dt>
                          <dd className="govuk-summary-list__value">{countyDetails.electricity_access_percentage}%</dd>
                        </div>
                      )}
                      {countyDetails.safe_water_access_percentage && (
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">Safe Water Access</dt>
                          <dd className="govuk-summary-list__value">{countyDetails.safe_water_access_percentage}%</dd>
                        </div>
                      )}
                      {countyDetails.literacy_rate && (
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">Literacy Rate</dt>
                          <dd className="govuk-summary-list__value">{countyDetails.literacy_rate}%</dd>
                        </div>
                      )}
                      {countyDetails.health_facilities_count && (
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">Health Facilities</dt>
                          <dd className="govuk-summary-list__value">{formatNumber(countyDetails.health_facilities_count)}</dd>
                        </div>
                      )}
                      {countyDetails.schools_count && (
                        <div className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">Schools</dt>
                          <dd className="govuk-summary-list__value">{formatNumber(countyDetails.schools_count)}</dd>
                        </div>
                      )}
                    </dl>
                  </>
                )}
              </>
            )}

            {/* ✅ COUNTY SPECIFIC: Leadership (Active and Former) */}
            {(Object.keys(activeLeadersGrouped).length > 0 || Object.keys(formerLeadersGrouped).length > 0) && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Leadership</h2>
                
                {Object.keys(activeLeadersGrouped).length > 0 && (
                  <>
                    <h3 className="govuk-heading-m">Current Leaders</h3>
                    <dl className="govuk-summary-list">
                      {Object.entries(activeLeadersGrouped).map(([title, leaders]) => (
                        <div key={title} className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">{title}</dt>
                          <dd className="govuk-summary-list__value">
                            {leaders.map((leader, idx) => (
                              <span key={leader.id}>
                                <Link href={`/government/people/${leader.slug}`} className="govuk-link">{leader.full_name}</Link>
                                {idx < leaders.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}

                {Object.keys(formerLeadersGrouped).length > 0 && (
                  <>
                    <h3 className="govuk-heading-m govuk-!-margin-top-6">Former Leaders</h3>
                    <dl className="govuk-summary-list">
                      {Object.entries(formerLeadersGrouped).map(([title, leaders]) => (
                        <div key={title} className="govuk-summary-list__row">
                          <dt className="govuk-summary-list__key">{title}</dt>
                          <dd className="govuk-summary-list__value">
                            {leaders.map((leader, idx) => (
                              <span key={leader.id}>
                                <Link href={`/government/people/${leader.slug}`} className="govuk-link">{leader.full_name}</Link>
                                {idx < leaders.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}
              </>
            )}

            {(institution.legal_basis_name || institution.established_date || institution.cofog_division || institution.mtef_sector || institution.operational_model || institution.jurisdiction_scope || institution.constitutional_status || institution.funding_model || institution.appointing_authority) && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Corporate information</h2>
                <dl className="govuk-summary-list">
                  {institution.established_date && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Established</dt>
                      <dd className="govuk-summary-list__value">{formatGovUKDate(institution.established_date)}</dd>
                    </div>
                  )}
                  {institution.legal_basis_name && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Legal basis</dt>
                      <dd className="govuk-summary-list__value">
                        {institution.legal_basis_name}
                        {institution.legal_basis_reference ? <span className="govuk-hint govuk-!-margin-bottom-0"> ({institution.legal_basis_reference})</span> : null}
                      </dd>
                    </div>
                  )}
                  {institution.operational_model && <div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">Operational model</dt><dd className="govuk-summary-list__value">{institution.operational_model}</dd></div>}
                  {institution.constitutional_status && <div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">Constitutional status</dt><dd className="govuk-summary-list__value">{institution.constitutional_status}</dd></div>}
                  {institution.jurisdiction_scope && <div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">Jurisdiction</dt><dd className="govuk-summary-list__value">{institution.jurisdiction_scope}</dd></div>}
                  {institution.funding_model && <div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">Funding model</dt><dd className="govuk-summary-list__value">{institution.funding_model}</dd></div>}
                  {institution.appointing_authority && <div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">Appointing authority</dt><dd className="govuk-summary-list__value">{institution.appointing_authority}</dd></div>}
                  {institution.cofog_division && <div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">COFOG Classification</dt><dd className="govuk-summary-list__value">{institution.cofog_division}{institution.cofog_group ? ` / ${institution.cofog_group}` : ''}</dd></div>}
                  {institution.mtef_sector && <div className="govuk-summary-list__row"><dt className="govuk-summary-list__key">MTEF Sector</dt><dd className="govuk-summary-list__value">{institution.mtef_sector}</dd></div>}
                </dl>
              </>
            )}

            {(directParent || supervisingMinistry || predecessor || successors.length > 0 || childInstitutions.length > 0) && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Structure and relationships</h2>
                <dl className="govuk-summary-list">
                  {directParent && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Parent organisation</dt>
                      <dd className="govuk-summary-list__value"><Link href={`/government/institutions/${directParent.slug}`} className="govuk-link">{directParent.name}</Link></dd>
                    </div>
                  )}
                  {supervisingMinistry && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Sponsored by</dt>
                      <dd className="govuk-summary-list__value"><Link href={`/government/institutions/${supervisingMinistry.slug}`} className="govuk-link">{supervisingMinistry.name}</Link></dd>
                    </div>
                  )}
                  {predecessor && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Preceded by</dt>
                      <dd className="govuk-summary-list__value"><Link href={`/government/institutions/${predecessor.slug}`} className="govuk-link">{predecessor.name}</Link></dd>
                    </div>
                  )}
                  {successors.length > 0 && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Succeeded by</dt>
                      <dd className="govuk-summary-list__value">
                        {successors.map((s, i) => (
                          <span key={s.id}>
                            <Link href={`/government/institutions/${s.slug}`} className="govuk-link">{s.name}</Link>
                            {i < successors.length - 1 ? " and " : ""}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
                
                {institution.lifecycle_change_reason && (
                  <div className="govuk-inset-text govuk-!-margin-top-6">
                    <p className="govuk-body">{institution.lifecycle_change_reason}</p>
                  </div>
                )}
                
                {childInstitutions.length > 0 && (
                  <>
                    <h3 className="govuk-heading-m govuk-!-margin-top-6">Executive agencies and public bodies</h3>
                    <ul className="govuk-list govuk-list--bullet">
                      {childInstitutions.map((child) => (
                        <li key={child.id}>
                          <Link href={`/government/institutions/${child.slug}`} className="govuk-link">{child.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}

            {(institution.citizen_charter_url || institution.complaints_mechanism_url || institution.procurement_portal_url) && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Transparency and freedom of information releases</h2>
                <ul className="govuk-list govuk-list--bullet">
                  {institution.citizen_charter_url && <li><a href={institution.citizen_charter_url} className="govuk-link">Citizen charter</a></li>}
                  {institution.complaints_mechanism_url && <li><a href={institution.complaints_mechanism_url} className="govuk-link">Complaints procedure</a></li>}
                  {institution.procurement_portal_url && <li><a href={institution.procurement_portal_url} className="govuk-link">Procurement information</a></li>}
                </ul>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}