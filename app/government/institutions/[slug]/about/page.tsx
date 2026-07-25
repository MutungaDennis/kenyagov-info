'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createBrowserClientAsync } from "@/lib/supabase/client";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import {
  predecessorLinkLabel,
  successorLinkLabel,
} from "@/lib/institutions/fields";

function formatGovUKDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getUTCDate();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

type Institution = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  institution_type?: string | null;
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
  successor_institution_id?: string | null;
  citizen_charter_url?: string | null;
  complaints_mechanism_url?: string | null;
  procurement_portal_url?: string | null;
};

type LinkedInstitution = {
  id: string;
  slug: string;
  name: string;
  short_name?: string | null;
  status?: string | null;
};

type ChildInstitution = {
  id: string;
  slug: string;
  name: string;
};

export default function InstitutionAboutPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [parentChain, setParentChain] = useState<LinkedInstitution[]>([]);
  const [directParent, setDirectParent] = useState<LinkedInstitution | null>(null);
  const [supervisingMinistry, setSupervisingMinistry] = useState<LinkedInstitution | null>(null);
  const [successor, setSuccessor] = useState<LinkedInstitution | null>(null);
  const [predecessor, setPredecessor] = useState<LinkedInstitution | null>(null);
  const [precededBy, setPrecededBy] = useState<LinkedInstitution[]>([]);
  const [childInstitutions, setChildInstitutions] = useState<ChildInstitution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        const supabase = await createBrowserClientAsync();
        const { data } = await supabase
          .from("institutions")
          .select(`
            id, slug, name, short_name, institution_type, status, description, vision, mission, functions,
            legal_basis_name, legal_basis_reference, established_date, operational_model, constitutional_status,
            jurisdiction_scope, funding_model, appointing_authority, cofog_division, cofog_group, mtef_sector,
            parent_institution_id, supervising_ministry_id, predecessor_institution_id, successor_institution_id,
            citizen_charter_url, complaints_mechanism_url, procurement_portal_url
          `)
          .eq("slug", slug)
          .maybeSingle();

        if (!data) return;
        setInstitution(data as Institution);

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
          const { data: sup } = await supabase.from("institutions").select("id, slug, name").eq("id", data.supervising_ministry_id).maybeSingle();
          if (sup) setSupervisingMinistry(sup as LinkedInstitution);
        }
        if (data.successor_institution_id) {
          const { data: succ } = await supabase.from("institutions").select("id, slug, name").eq("id", data.successor_institution_id).maybeSingle();
          if (succ) setSuccessor(succ as LinkedInstitution);
        }
        if (data.predecessor_institution_id) {
          const { data: pred } = await supabase.from("institutions").select("id, slug, name").eq("id", data.predecessor_institution_id).maybeSingle();
          if (pred) setPredecessor(pred as LinkedInstitution);
        }
        
        const { data: fromHistory } = await supabase.from("institutions").select("id, slug, name").eq("successor_institution_id", data.id).order("name").limit(50);
        if (fromHistory?.length) setPrecededBy(fromHistory as LinkedInstitution[]);

        const { data: children } = await supabase.from("institutions").select("id, slug, name").eq("parent_institution_id", data.id).eq("is_active", true).order("name");
        if (children) setChildInstitutions(children as ChildInstitution[]);

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

            {/* 1. Overview */}
            <h2 className="govuk-heading-l">Overview</h2>
            {institution.description && <p className="govuk-body">{institution.description}</p>}
            {institution.vision && <p className="govuk-body"><strong>Vision:</strong> {institution.vision}</p>}
            {institution.mission && <p className="govuk-body"><strong>Mission:</strong> {institution.mission}</p>}

            {/* 2. Responsibilities */}
            {institution.functions && institution.functions.length > 0 && (
              <>
                <h2 className="govuk-heading-l govuk-!-margin-top-9">Responsibilities</h2>
                <ul className="govuk-list govuk-list--bullet">
                  {institution.functions.map((func, i) => <li key={i}>{func}</li>)}
                </ul>
              </>
            )}

            {/* 3. Corporate information */}
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
                  {institution.operational_model && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Operational model</dt>
                      <dd className="govuk-summary-list__value">{institution.operational_model}</dd>
                    </div>
                  )}
                  {institution.constitutional_status && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Constitutional status</dt>
                      <dd className="govuk-summary-list__value">{institution.constitutional_status}</dd>
                    </div>
                  )}
                  {institution.jurisdiction_scope && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Jurisdiction</dt>
                      <dd className="govuk-summary-list__value">{institution.jurisdiction_scope}</dd>
                    </div>
                  )}
                  {institution.funding_model && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Funding model</dt>
                      <dd className="govuk-summary-list__value">{institution.funding_model}</dd>
                    </div>
                  )}
                  {institution.appointing_authority && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">Appointing authority</dt>
                      <dd className="govuk-summary-list__value">{institution.appointing_authority}</dd>
                    </div>
                  )}
                  {institution.cofog_division && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">COFOG Classification</dt>
                      <dd className="govuk-summary-list__value">{institution.cofog_division}{institution.cofog_group ? ` / ${institution.cofog_group}` : ''}</dd>
                    </div>
                  )}
                  {institution.mtef_sector && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">MTEF Sector</dt>
                      <dd className="govuk-summary-list__value">{institution.mtef_sector}</dd>
                    </div>
                  )}
                </dl>
              </>
            )}

            {/* 4. Structure and relationships */}
            {(directParent || supervisingMinistry || childInstitutions.length > 0 || predecessor || successor || precededBy.length > 0) && (
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
                      <dt className="govuk-summary-list__key">{predecessorLinkLabel(institution.status)}</dt>
                      <dd className="govuk-summary-list__value"><Link href={`/government/institutions/${predecessor.slug}`} className="govuk-link">{predecessor.name}</Link></dd>
                    </div>
                  )}
                  {successor && (
                    <div className="govuk-summary-list__row">
                      <dt className="govuk-summary-list__key">{successorLinkLabel(institution.status)}</dt>
                      <dd className="govuk-summary-list__value"><Link href={`/government/institutions/${successor.slug}`} className="govuk-link">{successor.name}</Link></dd>
                    </div>
                  )}
                </dl>
                
                {precededBy.length > 0 && (
                  <>
                    <h3 className="govuk-heading-m govuk-!-margin-top-6">Formed from</h3>
                    <ul className="govuk-list govuk-list--bullet">
                      {precededBy.map((p) => <li key={p.id}><Link href={`/government/institutions/${p.slug}`} className="govuk-link">{p.name}</Link></li>)}
                    </ul>
                  </>
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

            {/* 5. Transparency */}
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