import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import { getServices, serviceSlug, type ReferralTemplateData } from "@/lib/healthcare/referral-data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string; serviceSlug: string }> };

export default async function ServiceDetailPage({ params }: Props) {
  const { slug, serviceSlug: requestedSlug } = await params;
  const supabase = createPublicClient();
  const { data: institution, error } = await supabase.from("institutions").select("name,short_name,slug,template_key,template_data").eq("slug", slug).eq("is_active", true).maybeSingle();
  if (error) throw new Error("The institution directory is temporarily unavailable.");
  if (!institution || institution.template_key !== "healthcare-referral-hospital") notFound();
  const service = getServices(institution.template_data as ReferralTemplateData).find((item) => serviceSlug(item) === requestedSlug);
  if (!service) notFound();
  const facts = [["Referral needed?", service.referralRequired], ["Typical clinic days", service.clinicDays], ["Location", service.location], ["Who it is for", service.audience]].filter((fact): fact is [string, string] => Boolean(fact[1]));

  return (
    <div className="govuk-width-container healthcare-page-shell">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb"><ol className="govuk-breadcrumbs__list"><li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href={`/government/institutions/${slug}`}>{institution.short_name || institution.name}</Link></li><li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href={`/government/institutions/${slug}/services`}>Services</Link></li><li className="govuk-breadcrumbs__list-item" aria-current="page">{service.name}</li></ol></nav>
      <main className="govuk-main-wrapper" id="main-content">
        <div className="healthcare-service-detail">
          <span className="govuk-caption-l">{service.category || "Service and clinic"}</span>
          <h1 className="govuk-heading-xl">{service.name}</h1>
          <p className="govuk-body-l">{service.description || `Information about ${service.name} at ${institution.short_name || institution.name}.`}</p>
          {service.details?.length ? <><h2 className="govuk-heading-l">What this service provides</h2><ul className="govuk-list govuk-list--bullet">{service.details.map((detail) => <li key={detail}>{detail}</li>)}</ul></> : null}
          {facts.length > 0 && <div className="healthcare-facts"><h2 className="govuk-heading-m">Key information</h2><dl className="govuk-summary-list">{facts.map(([label, value]) => <div className="govuk-summary-list__row" key={label}><dt className="govuk-summary-list__key">{label}</dt><dd className="govuk-summary-list__value">{value}</dd></div>)}</dl></div>}
          {service.access && <><h2 className="govuk-heading-l">How to access this service</h2><p className="govuk-body">{service.access}</p></>}
          {service.firstVisit && <><h2 className="govuk-heading-l">What happens at your first visit</h2><p className="govuk-body">{service.firstVisit}</p></>}
          {service.emergencyNote && <div className="govuk-inset-text"><strong>Emergency information</strong><br />{service.emergencyNote}</div>}
          <p className="govuk-body"><Link className="govuk-link" href={`/government/institutions/${slug}/services`}>View all services and clinics</Link></p>
        </div>
      </main>
    </div>
  );
}
