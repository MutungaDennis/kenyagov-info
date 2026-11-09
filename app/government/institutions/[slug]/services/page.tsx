import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import { getServices, serviceSlug, type ReferralTemplateData } from "@/lib/healthcare/referral-data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function InstitutionServicesPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data: institution, error } = await supabase.from("institutions").select("name,short_name,slug,template_key,template_data").eq("slug", slug).eq("is_active", true).maybeSingle();
  if (error) throw new Error("The institution directory is temporarily unavailable.");
  if (!institution || institution.template_key !== "healthcare-referral-hospital") notFound();
  const services = getServices(institution.template_data as ReferralTemplateData);

  return (
    <div className="govuk-width-container healthcare-page-shell">
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb"><ol className="govuk-breadcrumbs__list"><li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href="/government/institutions">Institutions</Link></li><li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href={`/government/institutions/${slug}`}>{institution.short_name || institution.name}</Link></li><li className="govuk-breadcrumbs__list-item" aria-current="page">Services</li></ol></nav>
      <main className="govuk-main-wrapper" id="main-content">
        <span className="govuk-caption-l">{institution.short_name || institution.name}</span>
        <h1 className="govuk-heading-xl">Services and clinics</h1>
        <p className="govuk-body-l">Find specialist care, clinics and departments. Select a service to see how to access it and what to expect.</p>
        {services.length ? Object.entries(Object.groupBy(services, (service) => service.category || "Other services")).map(([category, categoryServices]) => <section className="healthcare-service-group" key={category}><h2 className="govuk-heading-l">{category}</h2><div className="healthcare-service-grid">{(categoryServices ?? []).map((service) => <Link className="healthcare-service-card" href={`/government/institutions/${slug}/services/${serviceSlug(service)}`} key={serviceSlug(service)}><h3 className="govuk-heading-m">{service.name}<span className="healthcare-card-arrow" aria-hidden="true">→</span></h3><p className="govuk-body">{service.description || "Information about this service, access and what to expect."}</p></Link>)}</div></section>) : <div className="govuk-inset-text">Services have not yet been added. Please contact the hospital for help choosing a service.</div>}
        <p className="govuk-body"><Link className="govuk-link" href={`/government/institutions/${slug}`}>Back to {institution.short_name || institution.name}</Link></p>
      </main>
    </div>
  );
}
