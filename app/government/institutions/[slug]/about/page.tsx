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
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${day} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
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

type CountyFact = {
  statistic: string | null;
  tip: string | null;
};

// GOV.UK Style Topic Link Component
function TopicLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <li className="govuk-!-margin-bottom-4">
      <Link href={href} className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold govuk-!-font-size-24">
        {title}
      </Link>
      <p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">
        {description}
      </p>
    </li>
  );
}

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
  const [countyFact, setCountyFact] = useState<CountyFact>({ statistic: null, tip: null });
  
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

        const nameLower = (data.name || "").toLowerCase();
        const isCountyAssembly =
          nameLower.includes("county assembly") ||
          (data.institution_type || "").toLowerCase().includes("county assembly");
        const isCounty =
          !isCountyAssembly &&
          (data.institution_type === "County Government" ||
            data.institution_category?.toLowerCase().includes("county") ||
            (nameLower.includes("county") && !nameLower.includes("assembly")));

        // Fetch county fact dynamically if it's a county
        if (isCounty) {
          const { data: countyData } = await supabase
            .from("counties")
            .select("statistic, tip")
            .eq("name", data.name)
            .maybeSingle();
          
          if (countyData) {
            setCountyFact({
              statistic: countyData.statistic,
              tip: countyData.tip
            });
          }
        }

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

      } catch (err) {
        console.error("Error fetching institution data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (isLoading) return <div className="govuk-width-container"><main className="govuk-main-wrapper"><p className="govuk-body">Loading...</p></main></div>;
  if (!institution) return <div className="govuk-width-container"><main className="govuk-main-wrapper"><h1 className="govuk-heading-xl">Page not found</h1></main></div>;

  const nameLower = (institution.name || "").toLowerCase();
  const isCountyAssembly =
    nameLower.includes("county assembly") ||
    (institution.institution_type || "").toLowerCase().includes("county assembly");
  const isCounty =
    !isCountyAssembly &&
    (institution.institution_type === "County Government" ||
      institution.institution_category?.toLowerCase().includes("county") ||
      (nameLower.includes("county") && !nameLower.includes("assembly")));

  const defaultStatistic = `${institution.name} is one of Kenya's devolved units, established under the Constitution of Kenya 2010 to bring services closer to the people and drive localized socio-economic development.`;
  const defaultTip = "Explore the county's unique cultural heritage, natural resources, and economic opportunities.";

  const displayStatistic = countyFact.statistic || defaultStatistic;
  const displayTip = countyFact.tip || defaultTip;

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

            {/* ========================================== */}
            {/* COUNTY GATEWAY VIEW */}
            {/* ========================================== */}
            {isCounty ? (
              <>
                <p className="govuk-body-l govuk-!-margin-bottom-6">
                  {institution.description || `Welcome to the official information portal for ${institution.name}. Explore detailed data on demographics, economy, health, education, and infrastructure.`}
                </p>

                <div className="govuk-inset-text govuk-!-margin-bottom-8">
                  <p className="govuk-body govuk-!-margin-bottom-2">
                    <strong>Statistic:</strong> {displayStatistic}
                  </p>
                  <p className="govuk-body govuk-!-margin-bottom-0">
                    <strong>Tip:</strong> {displayTip}
                  </p>
                </div>

                <h2 className="govuk-heading-m govuk-!-margin-bottom-4">
                  Explore {institution.name} Information
                </h2>
                
                <ul className="govuk-list">
                  <TopicLink 
                    href={`/government/institutions/${slug}/about/overview`}
                    title="Overview & Leadership"
                    description="County vision, mission, executive leadership, county assembly, and organizational structure."
                  />
                  <TopicLink 
                    href={`/government/institutions/${slug}/about/demographics`}
                    title="Demographics & Population"
                    description="Population size, density, age distribution, households, poverty indicators, and persons with disabilities (PWDs)."
                  />
                  <TopicLink 
                    href={`/government/institutions/${slug}/about/health`}
                    title="Health & Social Services"
                    description="Health facilities, mortality rates, common diseases, immunization coverage, and social protection programs."
                  />
                  <TopicLink 
                    href={`/government/institutions/${slug}/about/education`}
                    title="Education & Skills Development"
                    description="ECD centers, primary and secondary schools, TVETs, universities, and adult literacy rates."
                  />
                  <TopicLink 
                    href={`/government/institutions/${slug}/about/economy`}
                    title="Economy, Agriculture & Blue Economy"
                    description="Crop production, livestock, fisheries, trade, employment opportunities, and cooperative societies."
                  />
                  <TopicLink 
                    href={`/government/institutions/${slug}/about/infrastructure`}
                    title="Infrastructure, Water & Housing"
                    description="Road networks, water access, sanitation, energy usage, and housing developments."
                  />
                  <TopicLink 
                    href={`/government/institutions/${slug}/about/tourism-culture`}
                    title="Tourism, Culture & Environment"
                    description="Tourism facilities, wildlife conservation areas, heritage sites, and environmental management."
                  />
                </ul>
              </>
            ) : (
              <>
                {/* ========================================== */}
                {/* STANDARD INSTITUTION DETAILED VIEW */}
                {/* ========================================== */}
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

                {/* Corporate Information */}
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

                {/* Structure and relationships */}
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

                {/* Transparency and freedom of information releases */}
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

                <div className="govuk-!-margin-top-8">
                  <Link href={`/government/institutions/${slug}`} className="govuk-link govuk-link--no-visited-state">
                    ← Back to {institution.name} main page
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}