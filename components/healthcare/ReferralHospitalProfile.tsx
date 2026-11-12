import Link from "next/link";
import type { ReactNode } from "react";
import ExternalLink from "@/components/site/ExternalLink";
import { getServices, serviceSlug, type ReferralTemplateData } from "@/lib/healthcare/referral-data";

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

type SocialLink = { platform: string; url: string };
type ContactType = "email" | "telephone" | "mobile" | "fax";
type ContactPoint = { type: ContactType; purpose?: string; value: string };

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

function readContactPoints(value: unknown): ContactPoint[] {
  let points = value;
  if (typeof points === "string") {
    try {
      points = JSON.parse(points);
    } catch {
      points = [];
    }
  }
  if (!Array.isArray(points)) return [];
  return points.flatMap((point) => {
    if (!point || typeof point !== "object" || typeof point.value !== "string" || !point.value.trim()) return [];
    const type: ContactType | null = point.type === "email" ? "email"
      : point.type === "mobile" ? "mobile"
        : point.type === "telephone" || point.type === "phone" ? "telephone"
          : null;
    if (!type) return [];
    return [{
      type,
      value: point.value.trim(),
      purpose: typeof point.purpose === "string" ? point.purpose.trim() : "",
    }];
  });
}

function readContentEntries(value: unknown): HealthcareContentEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || typeof item.title !== "string" || !item.title.trim()) return [];
    const href = typeof item.href === "string" && (safeExternalUrl(item.href) || isInternalHref(item.href)) ? item.href : "";
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
  const careVisits = readContentEntries(data.careVisits);
  const serviceLinks = readContentEntries(data.serviceLinks);
  const featured = readContentEntries(data.featured);
  const moreInformation = readContentEntries(data.moreInformation);
  const footerColumns = readContentEntries(data.footerColumns);
  const groupedFooterLinks = footerColumns.reduce<{ title: string; links: HealthcareContentEntry[] }[]>((groups, entry) => {
    const existing = groups.find((group) => group.title === entry.title);
    if (existing) existing.links.push(entry);
    else groups.push({ title: entry.title, links: [entry] });
    return groups;
  }, []);
  const emergencyMain = data.emergencyMain || institution.phone || "Emergency number not provided";
  const referralLines = readReferralLines(data.referralLine);
  const ambulance = data.ambulance || "922";
  const hospitalUrl = `/government/institutions/${institution.slug}`;
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
  const rawSocialLinks: SocialLink[] = Array.isArray(institution.social_media)
    ? institution.social_media.filter((link): link is SocialLink => Boolean(link && typeof link === "object" && "url" in link && typeof link.url === "string"))
    : institution.social_media && typeof institution.social_media === "object"
      ? Object.entries(institution.social_media).filter(([, url]) => typeof url === "string").map(([platform, url]) => ({ platform, url }))
      : [];
  const socialLinks = rawSocialLinks.flatMap((link) => {
    const url = safeExternalUrl(link.url);
    return url ? [{ ...link, url }] : [];
  });
  const contactPoints = readContactPoints(institution.contact_points);
  const contactMethods = [
    ...contactPoints,
    ...(institution.phone ? [{ type: "telephone" as const, purpose: "General inquiries", value: institution.phone }] : []),
    ...(institution.email ? [{ type: "email" as const, purpose: "General inquiries", value: institution.email }] : []),
    ...(institution.toll_free ? [{ type: "telephone" as const, purpose: "Toll-free", value: institution.toll_free }] : []),
    ...(institution.whatsapp ? [{ type: "mobile" as const, purpose: "WhatsApp", value: institution.whatsapp }] : []),
    ...(institution.fax ? [{ type: "fax" as const, purpose: "Fax", value: institution.fax }] : []),
  ].filter((point, index, points) => points.findIndex((candidate) => candidate.type === point.type && candidate.value === point.value) === index);
  const contactGroups = [
    { type: "telephone" as const, label: "Telephone" },
    { type: "mobile" as const, label: "Mobile" },
    { type: "email" as const, label: "Email" },
    { type: "fax" as const, label: "Fax" },
  ].map((group) => ({ ...group, points: contactMethods.filter((point) => point.type === group.type) })).filter((group) => group.points.length > 0);
  const physicalAddresses = [institution.headquarters, institution.physical_address].filter((address, index, addresses): address is string => Boolean(address && addresses.indexOf(address) === index));
  const mapUrl = safeExternalUrl(institution.map_url) || safeExternalUrl(data.mapUrl) || (institution.latitude != null && institution.longitude != null
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${institution.latitude},${institution.longitude}`)}`
    : null);
  const websiteUrl = safeExternalUrl(institution.website_url);
  const portalUrl = safeExternalUrl(institution.portal_url);
  const visitingHours = Array.isArray(data.visitingHours) ? data.visitingHours.filter((period) =>
    Boolean(period && typeof period.days === "string" && period.days.trim() && typeof period.hours === "string" && period.hours.trim()),
  ) : [];
  const visitingInstructions = Array.isArray(data.visitingInstructions)
    ? data.visitingInstructions.filter((instruction): instruction is string => typeof instruction === "string" && instruction.trim().length > 0)
    : [];
  const socialLabel = (platform: string) => platform.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <div className="healthcare-profile">
      <div className="healthcare-masthead">
        <div className="healthcare-masthead__inner">
          <div className="healthcare-brand"><Link href={hospitalUrl}>{institution.name}</Link></div>
          <nav aria-label="Healthcare navigation" className="healthcare-masthead__nav">
            <Link href="#services">Services</Link>
            {careVisits.length > 0 && <Link href="#care-visits-heading">Manage care and visits</Link>}
            <Link href={`${hospitalUrl}/about`}>About</Link>
          </nav>
        </div>
      </div>
      <div className="healthcare-emergency-bar" role="region" aria-label="Emergency contacts">
        <strong>Emergency / A&amp;E</strong>
        <a href={`tel:${emergencyMain.replace(/[^\d+]/g, "")}`}>{emergencyMain}</a>
        <span>Referral line: {referralLines.length > 0 ? referralLines.map((line, index) => <span key={`${line}-${index}`}>{index > 0 && " · "}<a href={`tel:${line.replace(/[^\d+]/g, "")}`}>{line}</a></span>) : "Referral line not provided"}</span>
        <span>National ambulance: <a href={`tel:${ambulance}`}>{ambulance}</a></span>
      </div>

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
        <h2 className="govuk-heading-l" id="services-heading">{data.servicesTitle || "Services"}</h2>
        {serviceLinks.length > 0 && <ul className="healthcare-service-links">{serviceLinks.map((entry, index) => <li key={`${entry.title}-${index}`}>
          {entry.href ? <ProfileLink href={entry.href} className="healthcare-service-links__link">{entry.title}<span aria-hidden="true">›</span></ProfileLink> : <strong>{entry.title}</strong>}
          {entry.description && <p>{entry.description}</p>}
        </li>)}</ul>}
        {services.length > 0 ? <div className="healthcare-service-grid">{services.slice(0, 9).map((service) => <Link className="healthcare-service-card" href={`${hospitalUrl}/services/${serviceSlug(service)}`} key={serviceSlug(service)}><h3 className="govuk-heading-m">{service.name}<span aria-hidden="true">→</span></h3></Link>)}</div> : serviceLinks.length === 0 ? <p className="govuk-body">Service information will be added when available.</p> : null}
        <Link className="govuk-link" href={`${hospitalUrl}/services`}>View all services and clinics</Link>
      </section>

      <section className="healthcare-profile__section healthcare-visiting-card" aria-labelledby="visiting-hours-heading">
        <h2 className="govuk-heading-l" id="visiting-hours-heading">Visiting hours</h2>
        {visitingHours.length > 0 ? (
          <dl className="healthcare-visiting-hours">
            {visitingHours.map((period, index) => (
              <div className="healthcare-visiting-hours__period" key={`${period.days}-${period.hours}-${index}`}>
                <dt>{period.days}</dt>
                <dd>{period.hours}{period.note && <span>{period.note}</span>}</dd>
              </div>
            ))}
          </dl>
        ) : !data.visiting ? (
          <p className="govuk-body">Visiting guidance will be added by the hospital.</p>
        ) : null}
        {data.visiting && <p className="govuk-body">{data.visiting}</p>}
        {visitingInstructions.length > 0 && (
          <div className="healthcare-visiting-instructions">
            <h3 className="govuk-heading-s">Visitor instructions</h3>
            <ul className="govuk-list govuk-list--bullet">
              {visitingInstructions.map((instruction, index) => <li key={`${instruction}-${index}`}>{instruction}</li>)}
            </ul>
          </div>
        )}
        <Link className="govuk-link" href={`${hospitalUrl}/patient-information#visiting`}>More visiting information</Link>
      </section>

      <section className="healthcare-profile__section healthcare-contact-summary" id="contact">
        <div className="healthcare-contact-summary__content">
          <h2 className="govuk-heading-l">Contact &amp; find us</h2>
          {physicalAddresses.length > 0 ? physicalAddresses.map((address, index) => (
            <p className="govuk-body" key={`${address}-${index}`}><strong>{index === 0 ? "Headquarters" : "Physical address"}</strong><br />{address}</p>
          )) : <p className="govuk-body">Headquarters not provided</p>}
          {institution.postal_address && <p className="govuk-body"><strong>Postal address</strong><br />{institution.postal_address}</p>}
          {contactGroups.length > 0 && (
            <dl className="healthcare-contact-details">
              {contactGroups.map((group) => (
                <div className="healthcare-contact-details__row" key={group.type}>
                  <dt>{group.label}</dt>
                  <dd>{group.points.map((point, index) => (
                    <span key={`${point.value}-${index}`}>
                      {index > 0 && " · "}
                      <a className="govuk-link" href={group.type === "email" ? `mailto:${point.value}` : `tel:${point.value.replace(/[^\d+]/g, "")}`}>{point.value}</a>
                      {point.purpose && <span className="govuk-hint"> ({point.purpose})</span>}
                    </span>
                  ))}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="healthcare-contact-actions">
            {mapUrl && <ExternalLink className="govuk-button govuk-button--secondary" href={mapUrl}>Open Google Maps</ExternalLink>}
            {websiteUrl && <ExternalLink className="govuk-button govuk-button--secondary" href={websiteUrl}>Official website</ExternalLink>}
            {portalUrl && <ExternalLink className="govuk-button govuk-button--secondary" href={portalUrl}>Service portal</ExternalLink>}
          </div>
          {socialLinks.length > 0 && (
            <div className="healthcare-social-links" aria-label="Social media links">
              {socialLinks.map((link) => <ExternalLink className="healthcare-social-link" href={link.url} key={`${link.platform}-${link.url}`}><span aria-hidden="true">{socialLabel(link.platform).slice(0, 2).toUpperCase()}</span><strong>{socialLabel(link.platform)}</strong></ExternalLink>)}
            </div>
          )}
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
