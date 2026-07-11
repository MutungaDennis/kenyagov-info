// app/society-and-culture/heritage-sites/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { sanityClient } from '@/lib/sanity/client'
import { HERITAGE_SITE_BY_SLUG_QUERY, HERITAGE_SITE_SLUGS_QUERY } from '@/lib/sanity/queries'
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs'
import { PortableText } from '@portabletext/react'
import {
  HeritageSite,
  getCategoryLabel,
  getRegionLabel,
  getStatusLabel,
  isUnescoSite,
  formatDesignation,
} from '@/lib/data/heritageSites.utils'

export const revalidate = 3600

// Generate static params for all site slugs
export async function generateStaticParams() {
  const slugs = await sanityClient.fetch(HERITAGE_SITE_SLUGS_QUERY)
  return slugs.map((s: { slug: string }) => ({ slug: s.slug }))
}

// SEO metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const site: HeritageSite | null = await sanityClient.fetch(HERITAGE_SITE_BY_SLUG_QUERY, { slug })
  
  if (!site) {
    return {
      title: 'Heritage site not found | CitizenGuide.KE',
    }
  }

  return {
    title: `${site.name} | Heritage Sites | CitizenGuide.KE`,
    description: site.shortDescription,
    openGraph: {
      title: site.name,
      description: site.shortDescription,
      type: 'article',
      images: site.mainImage ? [site.mainImage.asset.url] : [],
    },
  }
}

export default async function HeritageSitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const site: HeritageSite | null = await sanityClient.fetch(HERITAGE_SITE_BY_SLUG_QUERY, { slug })

  if (!site) {
    notFound()
  }

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and culture", href: "/society-and-culture" },
          { text: "Heritage sites", href: "/society-and-culture/heritage-sites" },
          { text: site.name, href: `/society-and-culture/heritage-sites/${site.slug}` },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <span className="govuk-caption-xl">{getCategoryLabel(site.category)}</span>
            <h1 className="govuk-heading-xl">{site.name}</h1>

            {/* Status Badge */}
            {site.status !== 'active' && (
              <div className="govuk-warning-text govuk-!-margin-bottom-6">
                <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-visually-hidden">Warning</span>
                  This site is currently {getStatusLabel(site.status).toLowerCase()}
                </strong>
              </div>
            )}

            {/* Key Information Panel */}
            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              <dl className="app-site-details">
                <div>
                  <dt className="govuk-body-s"><strong>Location</strong></dt>
                  <dd className="govuk-body govuk-!-margin-bottom-2">
                    {site.specificLocation || site.county}
                    <br />
                    <span className="govuk-body-s">{getRegionLabel(site.region)} Region</span>
                  </dd>
                </div>
                
                {site.designationYear && (
                  <div>
                    <dt className="govuk-body-s"><strong>Designation</strong></dt>
                    <dd className="govuk-body govuk-!-margin-bottom-2">{formatDesignation(site)}</dd>
                  </div>
                )}

                {site.historicalPeriod && (
                  <div>
                    <dt className="govuk-body-s"><strong>Historical period</strong></dt>
                    <dd className="govuk-body govuk-!-margin-bottom-2">{site.historicalPeriod}</dd>
                  </div>
                )}

                {isUnescoSite(site.category) && (
                  <div>
                    <dt className="govuk-body-s"><strong>UNESCO status</strong></dt>
                    <dd className="govuk-body govuk-!-margin-bottom-2 app-unesco-text">
                      <strong>World Heritage Site</strong>
                      {site.unescoInscriptionNumber && (
                        <span className="govuk-body-s"> (Inscription #{site.unescoInscriptionNumber})</span>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Main Image */}
            {site.mainImage && (
              <figure className="govuk-!-margin-bottom-6">
                <Image
                  src={site.mainImage.asset.url}
                  alt={site.mainImage.alt || site.name}
                  width={800}
                  height={450}
                  style={{ width: '100%', height: 'auto' }}
                />
                {site.mainImage.alt && (
                  <figcaption className="govuk-body-s govuk-!-margin-top-1">
                    {site.mainImage.alt}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Description */}
            <section className="govuk-!-margin-bottom-6">
              <h2 className="govuk-heading-l">About this site</h2>
              <div className="govuk-body">
                <PortableText value={site.fullDescription} />
              </div>
            </section>

            {/* Historical Significance */}
            {site.historicalSignificance && (
              <section className="govuk-!-margin-bottom-6">
                <h2 className="govuk-heading-l">Historical significance</h2>
                <p className="govuk-body">{site.historicalSignificance}</p>
              </section>
            )}

            {/* Associated Communities */}
            {site.associatedCommunities && site.associatedCommunities.length > 0 && (
              <section className="govuk-!-margin-bottom-6">
                <h2 className="govuk-heading-l">Associated communities</h2>
                <ul className="govuk-list govuk-list--bullet">
                  {site.associatedCommunities.map(community => (
                    <li key={community}>{community}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Visitor Information */}
            {site.visitorInfo && (
              <section className="govuk-!-margin-bottom-6">
                <h2 className="govuk-heading-l">Visitor information</h2>
                <dl className="app-visitor-info">
                  {site.visitorInfo.openingHours && (
                    <div>
                      <dt className="govuk-body-s"><strong>Opening hours</strong></dt>
                      <dd className="govuk-body govuk-!-margin-bottom-2">{site.visitorInfo.openingHours}</dd>
                    </div>
                  )}
                  {site.visitorInfo.admissionFee && (
                    <div>
                      <dt className="govuk-body-s"><strong>Admission fee</strong></dt>
                      <dd className="govuk-body govuk-!-margin-bottom-2">{site.visitorInfo.admissionFee}</dd>
                    </div>
                  )}
                  {site.visitorInfo.accessibility && (
                    <div>
                      <dt className="govuk-body-s"><strong>Accessibility</strong></dt>
                      <dd className="govuk-body govuk-!-margin-bottom-2">{site.visitorInfo.accessibility}</dd>
                    </div>
                  )}
                  {site.visitorInfo.facilities && site.visitorInfo.facilities.length > 0 && (
                    <div>
                      <dt className="govuk-body-s"><strong>Facilities</strong></dt>
                      <dd className="govuk-body govuk-!-margin-bottom-2">
                        {site.visitorInfo.facilities.join(', ')}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {/* Gallery */}
            {site.gallery && site.gallery.length > 0 && (
              <section className="govuk-!-margin-bottom-6">
                <h2 className="govuk-heading-l">Gallery</h2>
                <div className="app-gallery-grid">
                  {site.gallery.map((img: any, index: number) => (
                    <figure key={index} className="app-gallery-item">
                      <Image
                        src={img.asset.url}
                        alt={img.alt || `${site.name} - image ${index + 1}`}
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
            {(site.officialWebsite || site.unescoLink || (site.externalLinks && site.externalLinks.length > 0)) && (
              <section className="govuk-!-margin-bottom-6">
                <h2 className="govuk-heading-l">More information</h2>
                <ul className="govuk-list govuk-list--spaced">
                  {site.officialWebsite && (
                    <li>
                      <a 
                        href={site.officialWebsite}
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
                  {site.unescoLink && (
                    <li>
                      <a 
                        href={site.unescoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="govuk-link"
                      >
                        UNESCO listing page
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
                  {site.externalLinks?.map((link: any, index: number) => (
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
              <Link href="/society-and-culture/heritage-sites" className="govuk-link">
                ← Back to heritage sites
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
                    <Link href="/society-and-culture/heritage-sites" className="govuk-link">
                      All heritage sites
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/cultural-calendar" className="govuk-link">
                      Cultural calendar
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/communities" className="govuk-link">
                      Communities
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/national-symbols" className="govuk-link">
                      National symbols
                    </Link>
                  </li>
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      

      <style>{`
        .app-site-details {
          margin: 0;
        }

        .app-site-details div {
          margin-bottom: 10px;
        }

        .app-site-details dt {
          margin-bottom: 2px;
          color: #505a5f;
        }

        .app-site-details dd {
          margin: 0;
        }

        .app-unesco-text {
          color: #00703c;
        }

        .app-visitor-info {
          margin: 0;
        }

        .app-visitor-info div {
          margin-bottom: 15px;
        }

        .app-visitor-info dt {
          margin-bottom: 2px;
          color: #505a5f;
        }

        .app-visitor-info dd {
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