import Link from 'next/link';

export const revalidate = 3600;
//import GovUKBackLink from '@/components/govuk/BackLink';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';
import { getGuideBySlug, getGuides } from '@/lib/sanity/client';
import { PortableText } from '@portabletext/react';
import type { Metadata } from 'next';

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const guide = await getGuideBySlug(slug);
    return {
      title: guide?.title || 'Guide',
      description: guide?.description || 'Government guide',
    };
  } catch {
    return {
      title: 'Guide',
      description: 'Government guide',
    };
  }
}

export async function generateStaticParams() {
  try {
    const guides = await getGuides();
    return guides.map((guide: any) => ({
      slug: guide.slug.current,
    }));
  } catch {
    return [];
  }
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  let guide = null;

  try {
    guide = await getGuideBySlug(slug);
  } catch (error) {
    console.error('Error fetching guide:', error);
  }

  if (!guide) {
    return (
      <div className="govuk-error-summary">
        <h2 className="govuk-error-summary__title">Guide not found</h2>
        <div className="govuk-error-summary__body">
          <p className="govuk-body">The guide you are looking for could not be found.</p>
          <Link href="/guides" className="govuk-link">
            Back to guides
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
    
      {/* <GovUKBackLink href="/guides" /> */}

      <GovUKBreadcrumbs
        items={[
          { text: 'Home', href: '/' },
          { text: 'Guides', href: '/guides' },
          { text: guide.title, href: `/guides/${slug}` },
        ]}
      />

      
        <article>
          <h1 className="govuk-heading-xl">{guide.title}</h1>
          
          {guide.description && (
            <p className="govuk-body-l">{guide.description}</p>
          )}

          {guide.author && (
            <p className="govuk-body-s text-gray-600 govuk-!-margin-bottom-6">
              By {guide.author.name} • Published {new Date(guide.publishedAt).toLocaleDateString()}
            </p>
          )}

          {/* Content */}
          <div className="govuk-!-margin-bottom-8">
            {guide.content ? (
              <div>
                <PortableText value={guide.content} />
              </div>
            ) : (
              <p className="govuk-body">No content available for this guide.</p>
            )}
          </div>

          {/* Related Guides */}
          {guide.relatedGuides && guide.relatedGuides.length > 0 && (
            <section className="govuk-!-margin-top-8">
              <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible" />
              <h2 className="govuk-heading-m govuk-!-margin-top-8">Related Guides</h2>
              <ul className="govuk-list govuk-list--bullet">
                {guide.relatedGuides.map((relatedGuide: any) => (
                  <li key={relatedGuide._id}>
                    <Link
                      href={`/guides/${relatedGuide.slug.current}`}
                      className="govuk-link"
                    >
                      {relatedGuide.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

      
    
  
    </>
);
}
