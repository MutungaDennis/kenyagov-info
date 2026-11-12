import Link from "next/link";
import { getServices, serviceSlug, type ReferralTemplateData } from "@/lib/healthcare/referral-data";

type HospitalData = ReferralTemplateData & {
  mandate?: string;
  mapUrl?: string;
  emergencyMain?: string;
  referralLine?: string;
  ambulance?: string;
  quickLinks?: { label: string; href?: string | null }[];
  relatedFacilities?: (string | { name: string; href?: string | null; reason?: string })[];
  healthcareLevel?: string;
};

type SocialLink = { platform: string; url: string };

type Props = {
  institution: {
    name: string;
    slug: string;
    short_name?: string | null;
    description?: string | null;
    website_url?: string | null;
    social_media?: unknown;
    phone?: string | null;
    email?: string | null;
    physical_address?: string | null;
    template_key?: string | null;
    template_data?: HospitalData | null;
  };
};

export default function ReferralHospitalProfile({ institution }: Props) {
  const data = institution.template_data || {};
  const services = getServices(data);
  const emergencyMain = data.emergencyMain || institution.phone || "Emergency number not provided";
  const referralLine = data.referralLine || "Referral line not provided";
  const ambulance = data.ambulance || "922";
  const hospitalUrl = `/government/institutions/${institution.slug}`;
  const quickLinks = (data.quickLinks || []).filter((link): link is { label: string; href: string } => typeof link?.label === "string" && typeof link?.href === "string" && link.href.length > 0);
  const relatedFacilities = (data.relatedFacilities || []).map((facility) => {
    if (typeof facility === "string") {
      const [name, href, reason] = facility.split("|").map((part) => part.trim());
      return name && href ? { name, href, reason } : null;
    }
    return facility?.name && facility?.href ? facility : null;
  }).filter((facility): facility is { name: string; href: string; reason?: string } => Boolean(facility));
  const socialLinks: SocialLink[] = Array.isArray(institution.social_media)
    ? institution.social_media.filter((link): link is SocialLink => Boolean(link && typeof link === "object" && "url" in link && typeof link.url === "string"))
    : institution.social_media && typeof institution.social_media === "object"
      ? Object.entries(institution.social_media).filter(([, url]) => typeof url === "string").map(([platform, url]) => ({ platform, url }))
      : [];
  const socialLabel = (platform: string) => platform.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <div className="healthcare-profile">
      <div className="healthcare-masthead">
        <div className="healthcare-masthead__inner">
          <Link className="healthcare-brand" href={hospitalUrl}>{institution.short_name || institution.name}</Link>
          <nav aria-label="Healthcare navigation" className="healthcare-masthead__nav">
            <Link href={`${hospitalUrl}/services`}>Services</Link>
            <Link href={`${hospitalUrl}/about`}>About</Link>
            <Link href={`${hospitalUrl}/contact`}>Contact</Link>
          </nav>
        </div>
      </div>
      <div className="healthcare-emergency-bar" role="region" aria-label="Emergency contacts">
        <strong>Emergency / A&amp;E</strong>
        <a href={`tel:${emergencyMain}`}>{emergencyMain}</a>
        <span>Referral line: <a href={`tel:${referralLine}`}>{referralLine}</a></span>
        <span>National ambulance: <a href={`tel:${ambulance}`}>{ambulance}</a></span>
      </div>

      <header className="healthcare-profile__header">
        <div className="healthcare-profile__hero">
          <p className="govuk-caption-l">Healthcare information</p>
          <p className="govuk-body-l">{data.heroIntro || "Find services, referral information and practical advice for your visit."}</p>
        </div>
        <p className="govuk-caption-l">{data.healthcareLevel === "level-6" || institution.template_key === "healthcare-referral-hospital" ? "Level 6 · National teaching and referral hospital" : data.healthcareLevel ? data.healthcareLevel.replace("level-", "Level ") : "Healthcare facility"}</p>
        <h1 className="govuk-heading-xl">{institution.name}</h1>
      </header>

      <section className="healthcare-profile__intro">
        <h2 className="govuk-heading-l">What do you need to do?</h2>
        <ul className="healthcare-task-list">
          <li><Link href={`${hospitalUrl}/contact#emergency`}><span className="healthcare-task-list__arrow" aria-hidden="true">→</span><span><strong>Emergency / A&amp;E</strong></span></Link></li>
          <li><Link href={`${hospitalUrl}/how-to-get-care`}><span className="healthcare-task-list__arrow" aria-hidden="true">→</span><span><strong>How to get care</strong></span></Link></li>
          <li><Link href={`${hospitalUrl}/services`}><span className="healthcare-task-list__arrow" aria-hidden="true">→</span><span><strong>Find a service or clinic</strong></span></Link></li>
          <li><Link href={`${hospitalUrl}/patient-information#visiting`}><span className="healthcare-task-list__arrow" aria-hidden="true">→</span><span><strong>Visiting hours</strong></span></Link></li>
          <li><Link href={`${hospitalUrl}/patient-information`}><span className="healthcare-task-list__arrow" aria-hidden="true">→</span><span><strong>Patient information</strong></span></Link></li>
          <li><Link href={`${hospitalUrl}/contact`}><span className="healthcare-task-list__arrow" aria-hidden="true">→</span><span><strong>Contact &amp; find us</strong></span></Link></li>
          <li><Link href={`${hospitalUrl}/about`}><span className="healthcare-task-list__arrow" aria-hidden="true">→</span><span><strong>About this hospital</strong></span></Link></li>
        </ul>
      </section>

      {(institution.description || data.mandate) && <section className="healthcare-profile__section healthcare-profile__about"><h2 className="govuk-heading-l">About this hospital</h2>{institution.description && <p className="govuk-body-l">{institution.description}</p>}{data.mandate && <p className="govuk-body">{data.mandate}</p>}<Link className="govuk-link" href={`${hospitalUrl}/about`}>Read more about this hospital</Link></section>}

      <section className="healthcare-profile__section" id="services">
        <h2 className="govuk-heading-l">Services overview</h2>
        <p className="govuk-body">Browse services and clinics to find access information, locations and what to expect.</p>
        {services.length > 0 ? <div className="healthcare-service-grid">{services.slice(0, 9).map((service) => <Link className="healthcare-service-card" href={`${hospitalUrl}/services/${serviceSlug(service)}`} key={serviceSlug(service)}><h3 className="govuk-heading-m">{service.name}<span aria-hidden="true">→</span></h3></Link>)}</div> : <p className="govuk-body">Services and clinics will be listed here when they are added.</p>}
        <Link className="govuk-link" href={`${hospitalUrl}/services`}>View all services and clinics</Link>
      </section>

      <section className="healthcare-profile__section healthcare-contact-summary" id="contact">
        <div>
          <h2 className="govuk-heading-l">Contact &amp; find us</h2>
          <p className="govuk-body">{institution.physical_address || "Address not provided"}</p>
          <p className="govuk-body">Main: {institution.phone || "Not provided"}<br />Email: {institution.email || "Not provided"}</p>
          <div className="healthcare-contact-actions">
            {data.mapUrl && <a className="govuk-button govuk-button--secondary" href={data.mapUrl} target="_blank" rel="noreferrer">Open Google Maps</a>}
            {institution.website_url && <a className="govuk-button govuk-button--secondary" href={institution.website_url} target="_blank" rel="noreferrer">Official website</a>}
          </div>
          {socialLinks.length > 0 && <div className="healthcare-social-links" aria-label="Social media links">{socialLinks.map((link) => <a className="healthcare-social-link" href={link.url} target="_blank" rel="noreferrer" key={`${link.platform}-${link.url}`}><span aria-hidden="true">{socialLabel(link.platform).slice(0, 2).toUpperCase()}</span><strong>{socialLabel(link.platform)}</strong></a>)}</div>}
        </div>
      </section>

      {relatedFacilities.length > 0 && <section className="healthcare-profile__section"><h2 className="govuk-heading-l">Other facilities to consider</h2><p className="govuk-body">You may also find this service at these related facilities.</p><ul className="govuk-list healthcare-related-links">{relatedFacilities.map((facility) => <li key={`${facility.name}-${facility.href}`}><Link className="govuk-link" href={facility.href}>{facility.name}</Link>{facility.reason && <span>{facility.reason}</span>}</li>)}</ul></section>}

      {quickLinks.length > 0 && <section className="healthcare-profile__section"><h2 className="govuk-heading-l">More information</h2><ul className="govuk-list">{quickLinks.map((link) => <li key={link.href}><Link className="govuk-link" href={link.href}>{link.label}</Link></li>)}</ul></section>}

      <footer className="healthcare-profile__footer"><div><h2 className="govuk-heading-m">Contact</h2><p>{institution.name}<br />{institution.physical_address || "Address not provided"}<br />Main: {institution.phone || "Not provided"}<br />Referral: {referralLine}<br />{institution.email || "Email not provided"}</p></div><div><h2 className="govuk-heading-m">Quick links</h2><ul className="govuk-list"><li><Link href={`${hospitalUrl}/services`}>Services &amp; clinics</Link></li><li><Link href={`${hospitalUrl}/patient-information`}>Patient information</Link></li><li><Link href={`${hospitalUrl}/how-to-get-care`}>How to get care</Link></li><li><Link href={`${hospitalUrl}/contact`}>Contact &amp; location</Link></li></ul></div><div><h2 className="govuk-heading-m">More</h2><ul className="govuk-list"><li><Link href={`${hospitalUrl}/about`}>About</Link></li><li><Link href="/government/institutions">Other institutions</Link></li></ul></div></footer>
    </div>
  );
}
