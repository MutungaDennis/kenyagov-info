import Link from "next/link";
import type { ReactNode } from "react";
import ExternalLink from "@/components/site/ExternalLink";
import { DEFAULT_CARE_VISITS, getServices, serviceSlug, type ReferralTemplateData } from "@/lib/healthcare/referral-data";

type HealthcareContentEntry = { title: string; description?: string; linkLabel?: string; href?: string };
type HospitalData = ReferralTemplateData & {
  careVisitsTitle?: string;
  careVisits?: HealthcareContentEntry[];
  servicesTitle?: string;
  serviceLinks?: HealthcareContentEntry[];
  featuredTitle?: string;
  featured?: HealthcareContentEntry[];
  moreInformationTitle?: string;
  moreInformation?: HealthcareContentEntry[];
  footerColumns?: HealthcareContentEntry[];
  mandate?: string;
  mapUrl?: string;
  emergencyMain?: string;
  referralLine?: string | string[];
  ambulance?: string;
  quickLinks?: { label: string; href?: string | null }[];
  relatedFacilities?: (string | { name: string; href?: string | null; reason?: string })[];
  healthcareLevel?: string;
};

function safeExternalUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function isInternalHref(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

function ProfileLink({ href, children, className = "govuk-link" }: { href: string; children: ReactNode; className?: string }) {
  const externalHref = safeExternalUrl(href);
  if (externalHref) return <ExternalLink href={externalHref} className={className}>{children}</ExternalLink>;
  if (isInternalHref(href)) return <Link href={href} className={className}>{children}</Link>;
  return null;
}

function readContentEntries(value: unknown, slug?: string): HealthcareContentEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || typeof item.title !== "string" || !item.title.trim()) return [];
    const rawHref = typeof item.href === "string" ? item.href.trim() : "";
    const href = rawHref && (safeExternalUrl(rawHref) || isInternalHref(rawHref))
      ? rawHref.replaceAll("{slug}", slug || "")
      : "";
    return [{
      title: item.title.trim(),
      description: typeof item.description === "string" ? item.description.trim() : "",
      linkLabel: typeof item.linkLabel === "string" ? item.linkLabel.trim() : "",
      href,
    }];
  });
}

function readReferralLines(value: unknown): string[] {
  const entries = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[;\n]/) : [];
  return entries.flatMap((entry) => typeof entry === "string" ? entry.split(/[;\n]/).map((line) => line.trim()).filter(Boolean) : []);
}

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
    fax?: string | null;
    toll_free?: string | null;
    whatsapp?: string | null;
    contact_points?: unknown;
    headquarters?: string | null;
    physical_address?: string | null;
    postal_address?: string | null;
    portal_url?: string | null;
    map_url?: string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
    template_key?: string | null;
    template_data?: HospitalData | null;
  };
};

export default function ReferralHospitalProfile({ institution }: Props) {
  const data = institution.template_data || {};
  const services = getServices(data);
  const hospitalUrl = `/government/institutions/${institution.slug}`;
  const savedCareVisits = readContentEntries(data.careVisits, institution.slug);
  const careVisits = savedCareVisits.length > 0
    ? savedCareVisits
    : readContentEntries(DEFAULT_CARE_VISITS, institution.slug);
  const serviceLinks = readContentEntries(data.serviceLinks, institution.slug);
  const featured = readContentEntries(data.featured, institution.slug);
  const moreInformation = readContentEntries(data.moreInformation, institution.slug);
  const footerColumns = readContentEntries(data.footerColumns, institution.slug);
  const groupedFooterLinks = footerColumns.reduce<{ title: string; links: HealthcareContentEntry[] }[]>((groups, entry) => {
    const existing = groups.find((group) => group.title === entry.title);
    if (existing) existing.links.push(entry);
    else groups.push({ title: entry.title, links: [entry] });
    return groups;
  }, []);
  const emergencyMain = data.emergencyMain || institution.phone || "Emergency number not provided";
  const referralLines = readReferralLines(data.referralLine);
  const ambulance = data.ambulance || "922";
  const quickLinks = (data.quickLinks || []).filter((link): link is { label: string; href: string } =>
    typeof link?.label === "string" && typeof link.href === "string" &&
    (Boolean(safeExternalUrl(link.href)) || isInternalHref(link.href)),
  );
  const relatedFacilities = (data.relatedFacilities || []).map((facility) => {
    if (typeof facility === "string") {
      const [name, href, reason] = facility.split("|").map((part) => part.trim());
      return name && href ? { name, href, reason } : null;
    }
    return facility?.name && facility?.href ? facility : null;
  }).filter((facility): facility is { name: string; href: string; reason?: string } =>
    Boolean(facility && typeof facility.href === "string" && (safeExternalUrl(facility.href) || isInternalHref(facility.href))),
  );

  return (
    <div className="healthcare-profile">
      <div className="healthcare-emergency-bar" role="region" aria-label="Emergency contacts">
        <div className="healthcare-emergency-bar__inner">
          <span><strong>Emergency &amp; referral hotline:</strong> Call <a href={`tel:${emergencyMain.replace(/[^\d+]/g, "")}`}>{emergencyMain}</a>{referralLines.length > 0 && <> or {referralLines.map((line, index) => <span key={`${line}-${index}`}>{index > 0 && " or "}<a href={`tel:${line.replace(/[^\d+]/g, "")}`}>{line}</a></span>)}</>}</span>
          <a className="healthcare-emergency-bar__urgent" href="#urgent-care">Urgent medical help</a>
        </div>
      </div>
      <div className="healthcare-masthead">
        <div className="healthcare-masthead__inner">
          <div className="healthcare-brand">
            <Link href={hospitalUrl}>{institution.name}</Link>
            <span>{institution.short_name || "National referral and teaching hospital"} · Republic of Kenya</span>
          </div>
          <Link className="healthcare-referrals-button" href="#urgent-care">24/7 Referrals</Link>
        </div>
      </div>
      <nav aria-label="Primary navigation" className="healthcare-primary-nav">
        <div className="healthcare-primary-nav__inner">
          <Link href={`${hospitalUrl}/services`}>Health &amp; clinics A to Z</Link>
          <Link href={`${hospitalUrl}/patient-information`}>Patient &amp; visitor guide</Link>
          <Link href={`${hospitalUrl}/how-to-get-care#emergency`}>Urgent &amp; emergency care</Link>
          <Link href={`${hospitalUrl}/about`}>About the hospital</Link>
        </div>
      </nav>

      <header className="healthcare-profile__hero-wrap">
        <div className="healthcare-profile__hero">
          <p className="healthcare-profile__eyebrow">Healthcare facility information</p>
          <h1>{institution.name}: services and patient information</h1>
          <p className="healthcare-profile__hero-intro">{data.heroIntro || "Find services, referral information and practical advice for a visit."}</p>
          <div className="healthcare-profile__hero-meta">
            <span>{data.healthcareLevel || "Healthcare facility"}</span>
            <span>{institution.headquarters || institution.physical_address || "Location not provided"}</span>
          </div>
        </div>
      </header>

      {careVisits.length > 0 && (
        <section className="healthcare-profile__section healthcare-home-section" aria-labelledby="care-visits-heading">
          <h2 className="govuk-heading-l" id="care-visits-heading">{data.careVisitsTitle || "Manage your care and visits"}</h2>
          <ul className="healthcare-popular-links">
            {careVisits.map((entry, index) => <li key={`${entry.title}-${index}`}>
              <span className="healthcare-popular-links__arrow" aria-hidden="true">→</span>
              <div>{entry.href ? <ProfileLink href={entry.href} className="healthcare-popular-links__title">{entry.title}</ProfileLink> : <strong className="healthcare-popular-links__title">{entry.title}</strong>}
                {entry.description && <p>{entry.description}</p>}
              </div>
            </li>)}
          </ul>
        </section>
      )}

      <section className="healthcare-profile__section healthcare-home-section" id="services" aria-labelledby="services-heading">
        <div className="healthcare-service-layout">
          <div>
            <h2 className="govuk-heading-l" id="services-heading">{data.servicesTitle || "Hospital services"}</h2>
            {serviceLinks.length > 0 ? <ul className="healthcare-service-links">{serviceLinks.map((entry, index) => <li key={`${entry.title}-${index}`}>
              <ProfileLink href={entry.href || `${hospitalUrl}/services`} className="healthcare-service-links__link">{entry.title}<span className="healthcare-service-links__arrow" aria-hidden="true">›</span></ProfileLink>
              {entry.description && <p>{entry.description}</p>}
            </li>)}</ul> : services.length > 0 ? <ul className="healthcare-service-links">{services.slice(0, 5).map((service) => <li key={serviceSlug(service)}><Link className="healthcare-service-links__link" href={`${hospitalUrl}/services/${serviceSlug(service)}`}>{service.name}<span className="healthcare-service-links__arrow" aria-hidden="true">›</span></Link></li>)}</ul> : <p className="govuk-body">Service information will be added when available.</p>}
            <Link className="govuk-link" href={`${hospitalUrl}/services`}>Find other clinical departments</Link>
          </div>
          <aside className="healthcare-urgent-panel" id="urgent-care" aria-labelledby="urgent-care-heading">
            <h2 className="govuk-heading-m" id="urgent-care-heading"><span aria-hidden="true">✚</span> Urgent care &amp; emergency referrals</h2>
            <p>If you need urgent medical advice or are referring an acute patient, contact the hospital using the lines below.</p>
            <div className="healthcare-urgent-panel__lines">
              <strong>Emergency and referral lines</strong>
              <a href={`tel:${emergencyMain.replace(/[^\d+]/g, "")}`}>{emergencyMain}</a>
              {referralLines.map((line, index) => <a href={`tel:${line.replace(/[^\d+]/g, "")}`} key={`${line}-${index}`}>{line}</a>)}
              <span>National ambulance: <a href={`tel:${ambulance.replace(/[^\d+]/g, "")}`}>{ambulance}</a></span>
            </div>
            <p className="healthcare-urgent-panel__note">For life-threatening emergencies, go directly to the nearest emergency department.</p>
          </aside>
        </div>
      </section>

      {featured.length > 0 && <section className="healthcare-profile__section healthcare-home-section" aria-labelledby="featured-heading"><h2 className="govuk-heading-l" id="featured-heading">{data.featuredTitle || "Featured"}</h2><div className="healthcare-featured-grid">{featured.map((entry, index) => <article className="healthcare-featured-card" key={`${entry.title}-${index}`}><h3>{entry.href ? <ProfileLink href={entry.href}>{entry.title}</ProfileLink> : entry.title}</h3>{entry.description && <p>{entry.description}</p>}{entry.href && <ProfileLink href={entry.href} className="healthcare-featured-card__action">{entry.linkLabel || `Read about ${entry.title}`}<span aria-hidden="true"> →</span></ProfileLink>}</article>)}</div></section>}

      {moreInformation.length > 0 && <section className="healthcare-profile__section healthcare-home-section" aria-labelledby="more-information-heading"><h2 className="govuk-heading-l" id="more-information-heading">{data.moreInformationTitle || "More information and advice"}</h2><ul className="healthcare-advice-grid">{moreInformation.map((entry, index) => <li key={`${entry.title}-${index}`}><h3>{entry.href ? <ProfileLink href={entry.href}>{entry.title}</ProfileLink> : entry.title}</h3>{entry.description && <p>{entry.description}</p>}</li>)}</ul></section>}

      {relatedFacilities.length > 0 && <section className="healthcare-profile__section"><h2 className="govuk-heading-l">Other facilities to consider</h2><p className="govuk-body">You may also find this service at these related facilities.</p><ul className="govuk-list healthcare-related-links">{relatedFacilities.map((facility) => <li key={`${facility.name}-${facility.href}`}><ProfileLink href={facility.href}>{facility.name}</ProfileLink>{facility.reason && <span>{facility.reason}</span>}</li>)}</ul></section>}

      {quickLinks.length > 0 && <section className="healthcare-profile__section"><h2 className="govuk-heading-l">More information</h2><ul className="govuk-list">{quickLinks.map((link) => <li key={link.href}><ProfileLink href={link.href}>{link.label}</ProfileLink></li>)}</ul></section>}

      <footer className="healthcare-profile__footer">
        {groupedFooterLinks.length > 0 ? groupedFooterLinks.map((group) => <div key={group.title}><h2 className="govuk-heading-m">{group.title}</h2><ul className="govuk-list">{group.links.map((entry, index) => <li key={`${entry.title}-${entry.href}-${index}`}>{entry.href ? <ProfileLink href={entry.href}>{entry.linkLabel || entry.title}</ProfileLink> : entry.linkLabel || entry.title}</li>)}</ul></div>) : <>
          <div><h2 className="govuk-heading-m">Contact</h2><p>{institution.name}<br />{institution.physical_address || "Address not provided"}<br />Main: {institution.phone || "Not provided"}<br />Referral: {referralLines.length ? referralLines.join(" · ") : "Not provided"}<br />{institution.email || "Email not provided"}</p></div>
          <div><h2 className="govuk-heading-m">Patient information</h2><ul className="govuk-list"><li><Link href={`${hospitalUrl}/services`}>Services and clinics</Link></li><li><Link href={`${hospitalUrl}/patient-information`}>Patient information</Link></li><li><Link href={`${hospitalUrl}/how-to-get-care`}>How to get care</Link></li><li><Link href={`${hospitalUrl}/contact`}>Contact and location</Link></li></ul></div>
          <div><h2 className="govuk-heading-m">About and other institutions</h2><ul className="govuk-list"><li><Link href={`${hospitalUrl}/about`}>About this facility</Link></li><li><Link href="/government/institutions">Other institutions</Link></li></ul></div>
        </>}
      </footer>
    </div>
  );
}
