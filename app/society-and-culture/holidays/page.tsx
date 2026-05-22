// app/society-andculture/holidays/page.tsx

import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

export default function HolidaysPage() {
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          {
            text: "Society and culture",
            href: "/society-and-culture",
          },
          {
            text: "Public holidays",
            href: "/holidays",
          },
        ]}
      />

      <main
        className="govuk-main-wrapper"
        id="main-content"
        role="main"
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">
              Public holidays in Kenya
            </h1>

            {/* NEXT HOLIDAY FIRST */}
            <div
              className="govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-8"
              style={{
                textAlign: "left",
                background: "#00703c",
                borderColor: "#00703c",
              }}
            >
              <h2
                className="govuk-panel__title"
                style={{
                  fontSize: "1.8rem",
                  marginBottom: "10px",
                }}
              >
                Next public holiday
              </h2>

              <div
                className="govuk-panel__body"
                style={{
                  fontSize: "2rem",
                  lineHeight: 1.3,
                }}
              >
                <strong>28 May 2026</strong>

                <span
                  className="govuk-body"
                  style={{
                    display: "block",
                    color: "#ffffff",
                    marginTop: "10px",
                  }}
                >
                  Thursday — Eid al-Adha *
                </span>
              </div>
            </div>

            <p className="govuk-body-l">
              Kenya observes national, religious and
              special gazetted public holidays under the{" "}
              <strong>Public Holidays Act (Cap. 110)</strong>.
            </p>

            <div className="govuk-inset-text">
              <p className="govuk-body">
                <strong>*</strong> Religious holiday
                declared following lunar sightings or
                faith observances.
              </p>

              <p className="govuk-body">
                <strong>**</strong> Holiday designated
                specifically for members of a particular
                faith community.
              </p>

              <p className="govuk-body govuk-!-margin-bottom-0">
                <strong>†</strong> Ad-hoc or special
                national holiday declared through a
                Gazette Notice by the Cabinet Secretary
                responsible for Interior.
              </p>
            </div>

            {/* LEGAL EXPLAINER */}
            <section className="govuk-!-margin-top-8 govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">
                Understanding public holidays in Kenya
              </h2>

              <p className="govuk-body">
                Public holidays in Kenya are governed by
                the Employment Act, 2007 and the Public
                Holidays Act (Cap. 110).
              </p>

              <h3 className="govuk-heading-m">
                How public holidays are declared
              </h3>

              <p className="govuk-body">
                Permanent public holidays are established
                in law. Additional or one-off holidays
                may be declared through an official
                Gazette Notice issued by the Cabinet
                Secretary responsible for Interior and
                National Administration.
              </p>

              <p className="govuk-body">
                Once a holiday has been gazetted, it
                carries the same legal effect as any
                other national public holiday.
              </p>

              <h3 className="govuk-heading-m">
                Employee rights on public holidays
              </h3>

              <ul className="govuk-list govuk-list--bullet">
                <li>
                  Employees are entitled to a paid day
                  off on public holidays.
                </li>

                <li>
                  Employers cannot deduct salary because
                  a workplace closes for a holiday.
                </li>

                <li>
                  If a public holiday falls on a Sunday,
                  the following Monday becomes a public
                  holiday automatically.
                </li>

                <li>
                  Holidays falling on Saturdays do not
                  automatically shift unless officially
                  gazetted.
                </li>
              </ul>

              <h3 className="govuk-heading-m">
                Working during a public holiday
              </h3>

              <p className="govuk-body">
                Employees working on a public holiday may
                receive:
              </p>

              <ul className="govuk-list govuk-list--bullet">
                <li>
                  Double pay for hours worked, or
                </li>

                <li>
                  An alternative paid day off (time off
                  in lieu), where agreed.
                </li>
              </ul>

              <h3 className="govuk-heading-m">
                Religious and community holidays
              </h3>

              <p className="govuk-body">
                Some holidays, such as Diwali, may be
                designated specifically for members of a
                particular faith community.
              </p>
            </section>

            {/* TABS */}
            <div className="govuk-tabs" data-module="govuk-tabs">
              <h2 className="govuk-tabs__title">
                Holiday schedules
              </h2>

              <ul className="govuk-tabs__list">
                <li className="govuk-tabs__list-item govuk-tabs__list-item--selected">
                  <a
                    className="govuk-tabs__tab"
                    href="#year-2026"
                  >
                    2026 holidays
                  </a>
                </li>

                <li className="govuk-tabs__list-item">
                  <a
                    className="govuk-tabs__tab"
                    href="#year-2027"
                  >
                    2027 holidays
                  </a>
                </li>

                <li className="govuk-tabs__list-item">
                  <a
                    className="govuk-tabs__tab"
                    href="#year-2028"
                  >
                    2028 holidays
                  </a>
                </li>

                <li className="govuk-tabs__list-item">
                  <a
                    className="govuk-tabs__tab"
                    href="#past-holidays"
                  >
                    Past holidays
                  </a>
                </li>
              </ul>

              {/* 2026 */}
              <div
                className="govuk-tabs__panel"
                id="year-2026"
              >
                <h2 className="govuk-heading-l">
                  Public holidays in 2026
                </h2>

                <table className="govuk-table">
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th className="govuk-table__header">
                        Date
                      </th>
                      <th className="govuk-table__header">
                        Day
                      </th>
                      <th className="govuk-table__header">
                        Holiday
                      </th>
                    </tr>
                  </thead>

                  <tbody className="govuk-table__body">
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        1 January 2026
                      </td>
                      <td className="govuk-table__cell">
                        Thursday
                      </td>
                      <td className="govuk-table__cell">
                        New Year&apos;s Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        20 March 2026
                      </td>
                      <td className="govuk-table__cell">
                        Friday
                      </td>
                      <td className="govuk-table__cell">
                        Eid al-Fitr *
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        3 April 2026
                      </td>
                      <td className="govuk-table__cell">
                        Friday
                      </td>
                      <td className="govuk-table__cell">
                        Good Friday
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        6 April 2026
                      </td>
                      <td className="govuk-table__cell">
                        Monday
                      </td>
                      <td className="govuk-table__cell">
                        Easter Monday
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        1 May 2026
                      </td>
                      <td className="govuk-table__cell">
                        Friday
                      </td>
                      <td className="govuk-table__cell">
                        Labour Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        28 May 2026
                      </td>
                      <td className="govuk-table__cell">
                        Thursday
                      </td>
                      <td className="govuk-table__cell">
                        Eid al-Adha *
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        1 June 2026
                      </td>
                      <td className="govuk-table__cell">
                        Monday
                      </td>
                      <td className="govuk-table__cell">
                        Madaraka Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        10 October 2026
                      </td>
                      <td className="govuk-table__cell">
                        Saturday
                      </td>
                      <td className="govuk-table__cell">
                        Mazingira Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        20 October 2026
                      </td>
                      <td className="govuk-table__cell">
                        Tuesday
                      </td>
                      <td className="govuk-table__cell">
                        Mashujaa Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        8 November 2026
                      </td>
                      <td className="govuk-table__cell">
                        Sunday
                      </td>
                      <td className="govuk-table__cell">
                        Diwali **
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        12 December 2026
                      </td>
                      <td className="govuk-table__cell">
                        Saturday
                      </td>
                      <td className="govuk-table__cell">
                        Jamhuri Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        25 December 2026
                      </td>
                      <td className="govuk-table__cell">
                        Friday
                      </td>
                      <td className="govuk-table__cell">
                        Christmas Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        26 December 2026
                      </td>
                      <td className="govuk-table__cell">
                        Saturday
                      </td>
                      <td className="govuk-table__cell">
                        Boxing Day
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2027 */}
              <div
                className="govuk-tabs__panel govuk-tabs__panel--hidden"
                id="year-2027"
              >
                <h2 className="govuk-heading-l">
                  Public holidays in 2027
                </h2>

                <table className="govuk-table">
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th className="govuk-table__header">
                        Date
                      </th>
                      <th className="govuk-table__header">
                        Day
                      </th>
                      <th className="govuk-table__header">
                        Holiday
                      </th>
                    </tr>
                  </thead>

                  <tbody className="govuk-table__body">
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        1 January 2027
                      </td>
                      <td className="govuk-table__cell">
                        Friday
                      </td>
                      <td className="govuk-table__cell">
                        New Year&apos;s Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        10 March 2027
                      </td>
                      <td className="govuk-table__cell">
                        Wednesday
                      </td>
                      <td className="govuk-table__cell">
                        Eid al-Fitr *
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        26 March 2027
                      </td>
                      <td className="govuk-table__cell">
                        Friday
                      </td>
                      <td className="govuk-table__cell">
                        Good Friday
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        29 March 2027
                      </td>
                      <td className="govuk-table__cell">
                        Monday
                      </td>
                      <td className="govuk-table__cell">
                        Easter Monday
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        1 May 2027
                      </td>
                      <td className="govuk-table__cell">
                        Saturday
                      </td>
                      <td className="govuk-table__cell">
                        Labour Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        17 May 2027
                      </td>
                      <td className="govuk-table__cell">
                        Monday
                      </td>
                      <td className="govuk-table__cell">
                        Eid al-Adha *
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        1 June 2027
                      </td>
                      <td className="govuk-table__cell">
                        Tuesday
                      </td>
                      <td className="govuk-table__cell">
                        Madaraka Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        10 August 2027
                      </td>
                      <td className="govuk-table__cell">
                        Tuesday
                      </td>
                      <td className="govuk-table__cell">
                        General Election Day †
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        10 October 2027
                      </td>
                      <td className="govuk-table__cell">
                        Sunday
                      </td>
                      <td className="govuk-table__cell">
                        Mazingira Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        11 October 2027
                      </td>
                      <td className="govuk-table__cell">
                        Monday
                      </td>
                      <td className="govuk-table__cell">
                        Mazingira Day Substitute Holiday
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        20 October 2027
                      </td>
                      <td className="govuk-table__cell">
                        Wednesday
                      </td>
                      <td className="govuk-table__cell">
                        Mashujaa Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        29 October 2027
                      </td>
                      <td className="govuk-table__cell">
                        Friday
                      </td>
                      <td className="govuk-table__cell">
                        Diwali **
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        12 December 2027
                      </td>
                      <td className="govuk-table__cell">
                        Sunday
                      </td>
                      <td className="govuk-table__cell">
                        Jamhuri Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        13 December 2027
                      </td>
                      <td className="govuk-table__cell">
                        Monday
                      </td>
                      <td className="govuk-table__cell">
                        Jamhuri Day Substitute Holiday
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2028 */}
              <div
                className="govuk-tabs__panel govuk-tabs__panel--hidden"
                id="year-2028"
              >
                <h2 className="govuk-heading-l">
                  Public holidays in 2028
                </h2>

                <table className="govuk-table">
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th className="govuk-table__header">
                        Date
                      </th>
                      <th className="govuk-table__header">
                        Day
                      </th>
                      <th className="govuk-table__header">
                        Holiday
                      </th>
                    </tr>
                  </thead>

                  <tbody className="govuk-table__body">
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        1 January 2028
                      </td>
                      <td className="govuk-table__cell">
                        Saturday
                      </td>
                      <td className="govuk-table__cell">
                        New Year&apos;s Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        3 January 2028
                      </td>
                      <td className="govuk-table__cell">
                        Monday
                      </td>
                      <td className="govuk-table__cell">
                        New Year Substitute Holiday
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        26 February 2028
                      </td>
                      <td className="govuk-table__cell">
                        Saturday
                      </td>
                      <td className="govuk-table__cell">
                        Eid al-Fitr *
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        14 April 2028
                      </td>
                      <td className="govuk-table__cell">
                        Friday
                      </td>
                      <td className="govuk-table__cell">
                        Good Friday
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        17 April 2028
                      </td>
                      <td className="govuk-table__cell">
                        Monday
                      </td>
                      <td className="govuk-table__cell">
                        Easter Monday
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        1 May 2028
                      </td>
                      <td className="govuk-table__cell">
                        Monday
                      </td>
                      <td className="govuk-table__cell">
                        Labour Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        5 May 2028
                      </td>
                      <td className="govuk-table__cell">
                        Friday
                      </td>
                      <td className="govuk-table__cell">
                        Eid al-Adha *
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        1 June 2028
                      </td>
                      <td className="govuk-table__cell">
                        Thursday
                      </td>
                      <td className="govuk-table__cell">
                        Madaraka Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        10 October 2028
                      </td>
                      <td className="govuk-table__cell">
                        Tuesday
                      </td>
                      <td className="govuk-table__cell">
                        Mazingira Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        20 October 2028
                      </td>
                      <td className="govuk-table__cell">
                        Friday
                      </td>
                      <td className="govuk-table__cell">
                        Mashujaa Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        17 November 2028
                      </td>
                      <td className="govuk-table__cell">
                        Friday
                      </td>
                      <td className="govuk-table__cell">
                        Diwali **
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        12 December 2028
                      </td>
                      <td className="govuk-table__cell">
                        Tuesday
                      </td>
                      <td className="govuk-table__cell">
                        Jamhuri Day
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* PAST HOLIDAYS */}
              <div
                className="govuk-tabs__panel govuk-tabs__panel--hidden"
                id="past-holidays"
              >
                <h2 className="govuk-heading-l">
                  Past public holidays
                </h2>

                <div className="govuk-inset-text">
                  Holidays are listed from December
                  backwards to January for easier
                  reference.
                </div>

                {/* 2025 */}
                <h3 className="govuk-heading-m">2025</h3>

                <table className="govuk-table">
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th className="govuk-table__header">
                        Date
                      </th>
                      <th className="govuk-table__header">
                        Holiday
                      </th>
                    </tr>
                  </thead>

                  <tbody className="govuk-table__body">
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        26 December 2025
                      </td>
                      <td className="govuk-table__cell">
                        Boxing Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        25 December 2025
                      </td>
                      <td className="govuk-table__cell">
                        Christmas Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        12 December 2025
                      </td>
                      <td className="govuk-table__cell">
                        Jamhuri Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        20 October 2025
                      </td>
                      <td className="govuk-table__cell">
                        Mashujaa Day / Diwali **
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        10 October 2025
                      </td>
                      <td className="govuk-table__cell">
                        Mazingira Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        6 June 2025
                      </td>
                      <td className="govuk-table__cell">
                        Eid al-Adha *
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        2 June 2025
                      </td>
                      <td className="govuk-table__cell">
                        Madaraka Day Substitute Holiday
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        1 May 2025
                      </td>
                      <td className="govuk-table__cell">
                        Labour Day
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        21 April 2025
                      </td>
                      <td className="govuk-table__cell">
                        Easter Monday
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        18 April 2025
                      </td>
                      <td className="govuk-table__cell">
                        Good Friday
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        31 March 2025
                      </td>
                      <td className="govuk-table__cell">
                        Eid al-Fitr *
                      </td>
                    </tr>

                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        1 January 2025
                      </td>
                      <td className="govuk-table__cell">
                        New Year&apos;s Day
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="govuk-!-margin-top-9">
              <h2 className="govuk-heading-m">
                Legal notice
              </h2>

              <div className="govuk-inset-text">
                Public holiday dates may change
                following official Gazette Notices,
                moon sightings, court decisions or
                special national declarations by the
                Government of Kenya.
              </div>
            </div>

            <GovUKFeedback />
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="govuk-grid-column-one-third">
            <aside
              style={{
                borderTop: "4px solid #1d70b8",
                paddingTop: "15px",
              }}
            >
              <h2 className="govuk-heading-m">
                Related guidance
              </h2>

              <ul className="govuk-list">
                <li>
                  <a
                    href="#"
                    className="govuk-link"
                  >
                    Employment rights during public
                    holidays
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    className="govuk-link"
                  >
                    How Gazette Notices work
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    className="govuk-link"
                  >
                    Religious and designated holidays
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    className="govuk-link"
                  >
                    Overtime and compensation rules
                  </a>
                </li>
              </ul>

              <div className="govuk-inset-text">
                The Ministry of Interior and National
                Administration is responsible for
                gazetting public holidays in Kenya.
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}