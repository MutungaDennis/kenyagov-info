'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import GovUKBreadcrumbs from '@/components/govuk/Breadcrumbs';
import LastUpdated from '@/components/govuk/LastUpdated';
import { holidays, Holiday } from '@/lib/data/holidays';
import {
  getNextHoliday,
  getUpcomingHolidaysThisYear,
  getPastHolidaysThisYear,
  getHolidaysForYear,
  getPastYearHolidays,
  getPastYearsRange,
  formatDate,
  formatDateShort,
  getDayOfWeek,
  getHolidaySymbol,
  getCurrentYear,
} from '@/lib/data/holidays.utils';

// Reusable holiday table component
function HolidayTable({ 
  holidays, 
  showYear = false,
  caption 
}: { 
  holidays: Holiday[];
  showYear?: boolean;
  caption: string;
}) {
  if (holidays.length === 0) {
    return (
      <p className="govuk-body">
        No public holidays recorded for this period.
      </p>
    );
  }

  return (
    <table className="govuk-table">
      <caption className="govuk-table__caption govuk-visually-hidden">
        {caption}
      </caption>
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th scope="col" className="govuk-table__header">Date</th>
          <th scope="col" className="govuk-table__header">Day</th>
          <th scope="col" className="govuk-table__header">Holiday</th>
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {holidays.map((holiday, index) => (
          <tr key={`${holiday.date}-${index}`} className="govuk-table__row">
            <td className="govuk-table__cell">
              {showYear ? formatDate(holiday.date) : formatDateShort(holiday.date)}
            </td>
            <td className="govuk-table__cell">
              {getDayOfWeek(holiday.date)}
            </td>
            <td className="govuk-table__cell">
              {holiday.name}
              {getHolidaySymbol(holiday.type) && (
                <span> {getHolidaySymbol(holiday.type)}</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function HolidaysPage() {
  const currentYear = getCurrentYear();
  const nextYear = currentYear + 1;
  const yearAfterNext = currentYear + 2;

  const nextHoliday = useMemo(() => getNextHoliday(), []);
  const upcomingThisYear = useMemo(() => getUpcomingHolidaysThisYear(), []);
  const pastThisYear = useMemo(() => getPastHolidaysThisYear(), []);
  const nextYearHolidays = useMemo(() => getHolidaysForYear(nextYear), [nextYear]);
  const yearAfterNextHolidays = useMemo(() => getHolidaysForYear(yearAfterNext), [yearAfterNext]);
  const pastYears = useMemo(() => getPastYearsRange(2020), []);

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and culture", href: "/society-and-culture" },
          { text: "Public holidays", href: "/society-and-culture/holidays" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            <h1 className="govuk-heading-xl">Public holidays in Kenya</h1>

            {/* Next Holiday Panel */}
            {nextHoliday && (
              <div className="app-next-holiday-panel govuk-!-margin-bottom-8">
                <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Next public holiday</h2>
                <p className="govuk-heading-l govuk-!-margin-bottom-1">
                  {formatDate(nextHoliday.date)}
                </p>
                <p className="govuk-body-l govuk-!-margin-bottom-0">
                  {getDayOfWeek(nextHoliday.date)} — {nextHoliday.name}
                  {getHolidaySymbol(nextHoliday.type) && (
                    <span> {getHolidaySymbol(nextHoliday.type)}</span>
                  )}
                </p>
              </div>
            )}

            <p className="govuk-body-l">
              Kenya observes national, religious and special gazetted public holidays under the{' '}
              <strong>Public Holidays Act (Cap. 110)</strong>.
            </p>

            <div className="govuk-inset-text">
              <p className="govuk-body govuk-!-margin-bottom-2">
                <strong>*</strong> Religious holiday declared following lunar sightings or faith observances.
              </p>
              <p className="govuk-body govuk-!-margin-bottom-2">
                <strong>**</strong> Holiday designated specifically for members of a particular faith community.
              </p>
              <p className="govuk-body govuk-!-margin-bottom-0">
                <strong>†</strong> Ad-hoc or special national holiday declared through a Gazette Notice.
              </p>
            </div>

            {/* UPCOMING HOLIDAYS THIS YEAR */}
            <section className="govuk-!-margin-top-8 govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Upcoming public holidays</h2>
              <p className="govuk-body">
                Public holidays remaining in {currentYear}.
              </p>
              <HolidayTable
                holidays={upcomingThisYear}
                caption={`Upcoming public holidays in ${currentYear}`}
              />
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* NEXT YEAR */}
            <section className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Public holidays in {nextYear}</h2>
              <HolidayTable
                holidays={nextYearHolidays}
                caption={`Public holidays in ${nextYear}`}
              />
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* YEAR AFTER NEXT */}
            <section className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Public holidays in {yearAfterNext}</h2>
              <HolidayTable
                holidays={yearAfterNextHolidays}
                caption={`Public holidays in ${yearAfterNext}`}
              />
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* PAST HOLIDAYS */}
            <section className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Past public holidays</h2>
              <p className="govuk-body">
                Public holidays that have already taken place, listed from most recent to oldest.
              </p>

              {/* Past holidays this year */}
              {pastThisYear.length > 0 && (
                <>
                  <h3 className="govuk-heading-m">{currentYear}</h3>
                  <HolidayTable
                    holidays={pastThisYear}
                    showYear={true}
                    caption={`Past public holidays in ${currentYear}`}
                  />
                </>
              )}

              {/* Past years */}
              {pastYears.map(year => {
                const yearHolidays = getPastYearHolidays(year);
                if (yearHolidays.length === 0) return null;

                return (
                  <div key={year} className="govuk-!-margin-top-6">
                    <h3 className="govuk-heading-m">{year}</h3>
                    <HolidayTable
                      holidays={yearHolidays}
                      showYear={true}
                      caption={`Public holidays in ${year}`}
                    />
                  </div>
                );
              })}
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* LEGAL EXPLAINER - Collapsible */}
            <details className="govuk-details govuk-!-margin-bottom-6" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  Understanding public holidays in Kenya
                </span>
              </summary>
              <div className="govuk-details__text">
                <p className="govuk-body">
                  Public holidays in Kenya are governed by the Employment Act, 2007 and the Public Holidays Act (Cap. 110).
                </p>

                <h3 className="govuk-heading-s">How public holidays are declared</h3>
                <p className="govuk-body">
                  Permanent public holidays are established in law. Additional or one-off holidays may be declared through an official Gazette Notice issued by the Cabinet Secretary responsible for Interior and National Administration.
                </p>
                <p className="govuk-body">
                  Once a holiday has been gazetted, it carries the same legal effect as any other national public holiday.
                </p>

                <h3 className="govuk-heading-s">Employee rights on public holidays</h3>
                <ul className="govuk-list govuk-list--bullet">
                  <li>Employees are entitled to a paid day off on public holidays.</li>
                  <li>Employers cannot deduct salary because a workplace closes for a holiday.</li>
                  <li>If a public holiday falls on a Sunday, the following Monday becomes a public holiday automatically.</li>
                  <li>Holidays falling on Saturdays do not automatically shift unless officially gazetted.</li>
                </ul>

                <h3 className="govuk-heading-s">Working during a public holiday</h3>
                <p className="govuk-body">Employees working on a public holiday may receive:</p>
                <ul className="govuk-list govuk-list--bullet">
                  <li>Double pay for hours worked, or</li>
                  <li>An alternative paid day off (time off in lieu), where agreed.</li>
                </ul>

                <h3 className="govuk-heading-s">Religious and community holidays</h3>
                <p className="govuk-body">
                  Some holidays, such as Diwali, may be designated specifically for members of a particular faith community.
                </p>
              </div>
            </details>

            <div className="govuk-inset-text">
              <p className="govuk-body govuk-!-margin-bottom-0">
                Public holiday dates may change following official Gazette Notices, moon sightings, court decisions or special national declarations by the Government of Kenya.
              </p>
            </div>

            <LastUpdated published="2026-05-22" lastUpdated="2026-07-02" />
          </div>

          {/* Sidebar */}
          <div className="govuk-grid-column-one-third">
            <aside className="govuk-!-display-none-print" role="complementary">
              <h2 className="govuk-heading-m">Related pages</h2>
              <nav role="navigation">
                <ul className="govuk-list govuk-list--spaced">
                  <li>
                    <Link href="/society-and-culture/national-events" className="govuk-link">
                      National events
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/cultural-calendar" className="govuk-link">
                      Cultural calendar
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/national-symbols" className="govuk-link">
                      National symbols
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/constitution-and-national-values" className="govuk-link">
                      Constitution and national values
                    </Link>
                  </li>
                  <li>
                    <Link href="/society-and-culture/communities" className="govuk-link">
                      Communities
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
                  The Ministry of Interior and National Administration is responsible for gazetting public holidays in Kenya.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <style>{`
        .app-next-holiday-panel {
          background-color: #00703c;
          color: #ffffff;
          padding: 20px;
          border-left: 5px solid #005a30;
        }

        .app-next-holiday-panel h2,
        .app-next-holiday-panel p {
          color: #ffffff;
        }

        .app-next-holiday-panel .govuk-heading-l {
          color: #ffffff;
          font-size: 2rem;
          line-height: 1.2;
        }

        .app-next-holiday-panel .govuk-body-l {
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}