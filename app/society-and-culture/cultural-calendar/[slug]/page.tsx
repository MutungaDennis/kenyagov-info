// app/society-and-culture/cultural-calendar/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { sanityClient } from '@/lib/sanity/client'
import { 
  CULTURAL_EVENT_BY_SLUG_QUERY, 
  CULTURAL_EVENT_SLUGS_QUERY 
} from '@/lib/sanity/queries'
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs'
import { PortableText } from '@portabletext/react'
import {
  CulturalEvent,
  formatEventTiming,
  formatEventLocation,
  getCategoryLabel,
} from '@/lib/data/culturalEvents.utils'

export const revalidate = 3600

// Generate static params for all event slugs (tolerate CMS/network outages at build)
export async function generateStaticParams() {
  try {
    const slugs = await sanityClient.fetch(CULTURAL_EVENT_SLUGS_QUERY)
    return (slugs ?? []).map((s: { slug: string }) => ({ slug: s.slug }))
  } catch (error) {
    console.warn(
      '[cultural-calendar] generateStaticParams failed; building without pre-rendered slugs:',
      error instanceof Error ? error.message : error
    )
    return []
  }
}

// SEO metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event: CulturalEvent | null = await sanityClient.fetch(CULTURAL_EVENT_BY_SLUG_QUERY, { slug })
  
  if (!event) {
    return {
      title: 'Event not found | Cultural Calendar | CitizenGuide.KE',
    }
  }

  return {
    title: `${event.name} | Cultural Calendar | CitizenGuide.KE`,
    description: event.shortDescription,
    openGraph: {
      title: event.name,
      description: event.shortDescription,
      type: 'article',
    },
  }
}

export default async function CulturalEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event: CulturalEvent | null = await sanityClient.fetch(CULTURAL_EVENT_BY_SLUG_QUERY, { slug })

  if (!event) {
    notFound()
  }

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and culture", href: "/society-and-culture" },
          { text: "Cultural calendar", href: "/society-and-culture/cultural-calendar" },
          { text: event.name, href: `/society-and-culture/cultural-calendar/${event.slug}` },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <span className="govuk-caption-xl">{getCategoryLabel(event.eventCategory)}</span>
            <h1 className="govuk-heading-xl">{event.name}</h1>

            {/* Key Information Panel */}
            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              <dl className="app-event-details">
                <div>
                  <dt className="govuk-body-s"><strong>When</strong></dt>
                  <dd className="govuk-body govuk-!-margin-bottom-2">{formatEventTiming(event)}</dd>
                </div>
                <div>
                  <dt className="govuk-body-s"><strong>Where</strong></dt>
                  <dd className="govuk-body govuk-!-margin-bottom-2">{formatEventLocation(event)}</dd>
                </div>
                <div>
                  <dt className="govuk-body-s"><strong>Frequency</strong></dt>
                  <dd className="govuk-body govuk-!-margin-bottom-2">{event.frequency}</dd>
                </div>
                {event.organiser && (
                  <div>
                    <dt className="govuk-body-s"><strong>Organised by</strong></dt>
                    <dd className="govuk-body govuk-!-margin-bottom-2">{event.organiser}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Main Image */}
            {event.mainImage && (
              <figure className="govuk-!-margin-bottom-6">
                <Image
                  src={event.mainImage.asset.url}
                  alt={event.mainImage.alt || event.name}
                  width={800}
                  height={450}
                  style={{ width: '100%', height: 'auto' }}
                />
                {event.mainImage.alt && (
                  <figcaption className="govuk-body-s govuk-!-margin-top-1">
                    {event.mainImage.alt}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Description */}
            <section className="govuk-!-margin-bottom-6">
              <h2 className="govuk-heading-l">About this event</h2>
              <div className="govuk-body">
                <PortableText value={event.description} />
              </div>
            </section>

            {/* Significance */}
            {event.significance && (
              <section className="govuk-!-margin-bottom-6">
                <h2 className="govuk-heading-l">Cultural significance</h2>
                <p className="govuk-body">{event.significance}</p>
              </section>
            )}

            {/* Cultural Groups */}
            {event.culturalGroups && event.culturalGroups.length > 0 && (
              <section className="govuk-!-margin-bottom-6">
                <h2 className="govuk-heading-l">Associated communities</h2>
                <ul className="govuk-list govuk-list--bullet">
                  {event.culturalGroups.map(group => (
                    <li key={group}>{group}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Gallery */}
            {event.gallery && event.gallery.length > 0 && (
              <section className="govuk-!-margin-bottom-6">
                <h2 className="govuk-heading-l">Gallery</h2>
                <div className="app-gallery-grid">
                  {event.gallery.map((img: any, index: number) => (
                    <figure key={index} className="app-gallery-item">
                      <Image
                        src={img.asset.url}
                        alt={img.alt || `${event.name} - image ${index + 1}`}
                        width={400}
                        height={300}
                        style={{ width: '100%', height: 'auto' }}
                      />
                      {img.caption && (
                        <figcaption className="govuk-body-s govuk-!-margin-top-1">
                          {img.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </section>
            )}

            {/* External Links */}
            {(event.officialWebsite || (event.externalLinks && event.externalLinks.length > 0)) && (
              <section className="govuk-!-margin-bottom-6">
                <h2 className="govuk-heading-l">More information</h2>
                <ul className="govuk-list govuk-list--spaced">
                  {event.officialWebsite && (
                    <li>
                      <a 
                        href={event.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="govuk-link"
                      >
                        Official website
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          aria-hidden="true"
                          focusable="false"
                          style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }}
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        <span className="govuk-visually-hidden"> (opens in a new tab)</span>
                      </a>
                    </li>
                  )}
                  {event.externalLinks?.map((link: any, index: number) => (
                    <li key={index}>
                      <a 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="govuk-link"
                      >
                        {link.title}
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          aria-hidden="true"
                          focusable="false"
                          style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }}
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        <span className="govuk-visually-hidden"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            <p className="govuk-body">
              <Link href="/society-and-culture/cultural-calendar" className="govuk-link">
                ← Back to cultural calendar
              </Link>
            </p>
          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m">Related pages</h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/society-and-culture/cultural-calendar" className="govuk-link">
                      Cultural calendar
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/holidays" className="govuk-link">
                      Public holidays
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/heritage-sites" className="govuk-link">
                      Heritage sites
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/communities" className="govuk-link">
                      Communities
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      

      <style>{`
        .app-event-details {
          margin: 0;
        }

        .app-event-details div {
          margin-bottom: 10px;
        }

        .app-event-details dt {
          margin-bottom: 2px;
          color: #505a5f;
        }

        .app-event-details dd {
          margin: 0;
        }

        .app-gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .app-gallery-item {
          margin: 0;
        }

        .app-gallery-item img {
          border: 1px solid #b1b4b6;
        }

        @media (max-width: 40.0625rem) {
          .app-gallery-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    
  
  </>
)
}