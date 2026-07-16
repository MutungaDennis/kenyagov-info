// app/society-and-culture/cultural-calendar/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import { sanityClient } from '@/lib/sanity/client'
import { CULTURAL_EVENTS_QUERY } from '@/lib/sanity/queries'
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs'
import LastUpdated from '@/components/govuk/LastUpdated'
import {
  CulturalEvent,
  formatEventTiming,
  formatEventLocation,
  getQuarterInfo,
  getUpcomingEvents,
  getCurrentQuarter,
} from '@/lib/data/culturalEvents.utils'

export const metadata: Metadata = {
  title: 'Cultural Calendar | Society and Culture | CitizenGuide.KE',
  description: 'A chronological guide to Kenya\'s cultural festivals, traditional ceremonies, natural phenomena, and community celebrations throughout the year.',
}

export const revalidate = 3600 // Revalidate every hour

export default async function CulturalCalendarPage() {
  const events: CulturalEvent[] = await sanityClient.fetch(CULTURAL_EVENTS_QUERY)
  
  const upcomingEvents = getUpcomingEvents(events, 3)
  const currentQuarter = getCurrentQuarter()
  
  const quarters: Array<'Q1' | 'Q2' | 'Q3' | 'Q4'> = ['Q1', 'Q2', 'Q3', 'Q4']

  return (
    <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and culture", href: "/society-and-culture" },
          { text: "Cultural calendar", href: "/society-and-culture/cultural-calendar" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl">Cultural calendar</h1>
            
            <p className="govuk-body-l">
              A guide to Kenya's cultural festivals, traditional ceremonies, natural phenomena and community celebrations throughout the year.
            </p>

            {events.length === 0 ? (
              <div className="govuk-inset-text">
                <p className="govuk-body">
                  No cultural events are currently listed. Check back soon for updates.
                </p>
              </div>
            ) : (
              <>
                {/* UPCOMING EVENTS */}
                {upcomingEvents.length > 0 && (
                  <section className="govuk-!-margin-bottom-8">
                    <h2 className="govuk-heading-l">Coming up</h2>
                    <p className="govuk-body">
                      Cultural events happening soon in Kenya.
                    </p>
                    <ul className="govuk-list govuk-list--spaced">
                      {upcomingEvents.map(event => (
                        <li key={event._id} className="app-cultural-event-upcoming">
                          <Link 
                            href={`/society-and-culture/cultural-calendar/${event.slug}`}
                            className="govuk-link govuk-link--no-visited-state"
                          >
                            <strong className="govuk-!-font-size-19">{event.name}</strong>
                          </Link>
                          <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-1">
                            <strong>{formatEventTiming(event)}</strong>
                          </p>
                          <p className="govuk-body-s govuk-!-margin-bottom-0">
                            {formatEventLocation(event)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

                {/* EVENTS BY QUARTER */}
                {quarters.map(quarter => {
                  const quarterEvents = events.filter(e => e.quarter === quarter)
                  if (quarterEvents.length === 0) return null
                  
                  const quarterInfo = getQuarterInfo(quarter)
                  const isCurrentQuarter = quarter === currentQuarter

                  return (
                    <section 
                      key={quarter} 
                      id={quarter.toLowerCase()}
                      className={`govuk-!-margin-bottom-8 ${isCurrentQuarter ? 'app-current-quarter' : ''}`}
                    >
                      <h2 className="govuk-heading-l">
                        {quarterInfo.label}
                        <span className="govuk-caption-m govuk-!-margin-top-1">
                          {quarterInfo.months}
                        </span>
                      </h2>

                      {isCurrentQuarter && (
                        <p className="govuk-body-s app-current-quarter-label">
                          <strong>Current quarter</strong>
                        </p>
                      )}

                      <ul className="govuk-list govuk-list--spaced">
                        {quarterEvents.map(event => (
                          <li key={event._id} className="app-cultural-event-item">
                            <Link 
                              href={`/society-and-culture/cultural-calendar/${event.slug}`}
                              className="govuk-link govuk-link--no-visited-state"
                            >
                              <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                                {event.name}
                              </h3>
                            </Link>
                            <p className="govuk-body-s govuk-!-margin-bottom-1">
                              <strong>{formatEventTiming(event)}</strong>
                              {' • '}
                              {formatEventLocation(event)}
                            </p>
                            <p className="govuk-body-s govuk-!-margin-bottom-0">
                              {event.shortDescription}
                            </p>
                            {event.culturalGroups && event.culturalGroups.length > 0 && (
                              <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                                <span className="govuk-visually-hidden">Associated communities: </span>
                                {event.culturalGroups.join(', ')}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )
                })}

                <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

                {/* LEGAL / GENERAL NOTICE */}
                <div className="govuk-inset-text">
                  <p className="govuk-body govuk-!-margin-bottom-0">
                    Dates for seasonal, approximate and periodic events may vary each year. 
                    Check with the organising body or county government for confirmed dates before travelling.
                  </p>
                </div>

                <LastUpdated published="2026-05-22" lastUpdated="2026-07-02" />
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m">Related pages</h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/society-and-culture/holidays" className="govuk-link">
                      Public holidays
                    </Link>
                  </li>
                  <li>
                    <Link href="/national-events" className="govuk-link">
                      National events
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
                  <li>
                    <Link href="/national-symbols" className="govuk-link">
                      National symbols
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture" className="govuk-link">
                      All society and culture
                    </Link>
                  </li>
                </ul>
              </nav>

              <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

              <div className="govuk-inset-text">
                <p className="govuk-body govuk-!-margin-bottom-0">
                  The Ministry of Sports, Culture and Heritage coordinates national cultural events and festivals.
                </p>
              </div>
            </aside>
          </div>
        </div>
      

      <style>{`
        .app-cultural-event-upcoming {
          padding: 15px;
          border-left: 4px solid #1d70b8;
          background-color: #f3f2f1;
          margin-bottom: 15px;
        }

        .app-cultural-event-item {
          padding: 15px 0;
          border-bottom: 1px solid #b1b4b6;
        }

        .app-cultural-event-item:last-child {
          border-bottom: none;
        }

        .app-current-quarter {
          padding: 20px;
          background-color: #f3f2f1;
          border-left: 5px solid #00703c;
        }

        .app-current-quarter-label {
          color: #00703c;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 14px;
        }

        .app-cultural-event-item h3 {
          color: #1d70b8;
        }

        .app-cultural-event-item h3:hover {
          text-decoration-thickness: 3px;
        }
      `}</style>
    
  
    </>
)
}