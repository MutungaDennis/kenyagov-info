import { Metadata } from 'next';
import Link from 'next/link';
//import GovUKBackLink from '@/components/govuk/BackLink';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';
import PortableTextContent from '@/components/sanity/PortableTextContent';
import { sanityClient } from '@/lib/sanity/client';
import { SERVICE_QUERY, SINGLE_SERVICE_QUERY } from '@/lib/sanity/queries';

export const metadata: Metadata = {
  title: 'Service Details | Kenya Info',
  description: 'Government service information and how to apply',
};

interface Service {
  _id: string;
  title: string;
  slug: { current: string };
  description: string;
  fullDescription: string;
  category: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  website?: string;
  requirements?: any[];
  howToApply?: any[];
  relatedServices?: Array<{
    _id: string;
    title: string;
    slug: { current: string };
    description: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const services = await sanityClient.fetch(SERVICE_QUERY);
    return services.map((service: any) => ({
      slug: service.slug.current,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  let service: Service | null = null;
  let error = null;

  try {
    service = await sanityClient.fetch(SINGLE_SERVICE_QUERY, {
      slug: slug,
    });
  } catch (err) {
    console.error('Error fetching service:', err);
    error = 'Failed to load service details. Please try again later.';
  }

  if (!service) {
    return (
      <div className="govuk-width-container">
        {/* <GovUKBackLink href="/services" /> */}
        <main className="govuk-main-wrapper">
          <h1 className="govuk-heading-xl">Service Not Found</h1>
          <p className="govuk-body">
            The service you&apos;re looking for could not be found.{' '}
            <Link href="/services" className="govuk-link">
              Back to services
            </Link>
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="govuk-width-container">
      {/* <GovUKBackLink href="/services" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: 'Home', href: '/' },
          { text: 'Services', href: '/services' },
          { text: service.title, href: `/services/${service.slug.current}` },
        ]}
      />

      <main className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">{service.title}</h1>
            <p className="govuk-body-l">{service.description}</p>

            {error && (
              <div className="govuk-error-summary" role="alert">
                <h2 className="govuk-error-summary__title">{error}</h2>
              </div>
            )}

            {/* Overview */}
            {service.fullDescription && (
              <section className="govuk-!-margin-top-9">
                <h2 className="govuk-heading-l">Overview</h2>
                <PortableTextContent content={service.fullDescription} />
              </section>
            )}

            {/* Requirements */}
            {service.requirements && service.requirements.length > 0 && (
              <section className="govuk-!-margin-top-9">
                <h2 className="govuk-heading-l">Requirements</h2>
                <PortableTextContent content={service.requirements} />
              </section>
            )}

            {/* How to Apply */}
            {service.howToApply && service.howToApply.length > 0 && (
              <section className="govuk-!-margin-top-9">
                <h2 className="govuk-heading-l">How to Apply</h2>
                <PortableTextContent content={service.howToApply} />
              </section>
            )}

            {/* Contact Information */}
            {service.contactInfo && (
              <section className="govuk-!-margin-top-9">
                <h2 className="govuk-heading-l">Contact Information</h2>
                <div className="govuk-inset-text">
                  {service.contactInfo.phone && (
                    <p className="govuk-body">
                      <strong>Phone:</strong>{' '}
                      <a href={`tel:${service.contactInfo.phone}`} className="govuk-link">
                        {service.contactInfo.phone}
                      </a>
                    </p>
                  )}
                  {service.contactInfo.email && (
                    <p className="govuk-body">
                      <strong>Email:</strong>{' '}
                      <a href={`mailto:${service.contactInfo.email}`} className="govuk-link">
                        {service.contactInfo.email}
                      </a>
                    </p>
                  )}
                  {service.contactInfo.address && (
                    <p className="govuk-body">
                      <strong>Address:</strong> {service.contactInfo.address}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* External Link */}
            {service.website && (
              <section className="govuk-!-margin-top-9">
                <a
                  href={service.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="govuk-button"
                >
                  Visit Official Website
                </a>
              </section>
            )}

            {/* Related Services */}
            {service.relatedServices && service.relatedServices.length > 0 && (
              <section className="govuk-!-margin-top-9">
                <h2 className="govuk-heading-l">Related Services</h2>
                <ul className="govuk-list govuk-list--spaced">
                  {service.relatedServices.map((relatedService) => (
                    <li key={relatedService._id}>
                      <Link
                        href={`/services/${relatedService.slug.current}`}
                        className="govuk-link"
                      >
                        {relatedService.title}
                      </Link>
                      <p className="govuk-body-s govuk-!-margin-top-1">
                        {relatedService.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="govuk-!-margin-top-12">
            
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
