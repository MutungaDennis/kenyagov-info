'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";

export default function NationalEventsPage() {
  return (
    <div className="govuk-width-container">
      {/* GOV.UK Navigation Breadcrumbs */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and Culture", href: "/society-and-culture" },
          { text: "National Events", href: "/society-and-culture/national-events" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* HEADER SECTION */}
        <div className="govuk-grid-row govuk-!-margin-bottom-7">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">National Identity and Heritage</span>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              National Events and Celebrations
            </h1>
            <p className="govuk-body-l">
              A comprehensive directory of official state celebrations, annual public expositions, and major cultural festivals hosted across the Republic of Kenya.
            </p>
          </div>
        </div>

        {/* CONTENT AND SIDEBAR MATRIX */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">

            {/* 1. STATUTORY NATIONAL DAYS */}
            <section id="statutory-days" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">1. Official State Celebrations</h2>
              <p className="govuk-body">
                Article 9(3) of the Constitution recognizes three national days. These events feature presidential addresses, military parades by the Kenya Defence Forces (KDF), and cultural exhibitions, rotated across different counties to promote national cohesion.
              </p>

              {/* Accessible Data Table for State Events */}
              <table className="govuk-table govuk-!-margin-bottom-4">
                <caption className="govuk-table__caption govuk-table__caption--s">Official Statutory National Celebrations</caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header" style={{ width: "25%" }}>Event Name</th>
                    <th scope="col" className="govuk-table__header" style={{ width: "20%" }}>Annual Date</th>
                    <th scope="col" className="govuk-table__header">National Significance and Core Theme</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header" style={{ fontWeight: "600" }}>Madaraka Day</th>
                    <td className="govuk-table__cell">1 June</td>
                    <td className="govuk-table__cell">Commemorates the attainment of internal self-governance from British colonial rule in 1963.</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header" style={{ fontWeight: "600" }}>Mashujaa Day</th>
                    <td className="govuk-table__cell">20 October</td>
                    <td className="govuk-table__cell">Honours the heroes who struggled for independence and citizens who contribute significantly to modern national development.</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header" style={{ fontWeight: "600" }}>Jamhuri Day</th>
                    <td className="govuk-table__cell">12 December</td>
                    <td className="govuk-table__cell">Kenya&apos;s primary national day. Marks both the establishment of full independence (1963) and the status of a republic (1964).</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 2. ANNUAL CIVIC & EXPOSITION EVENTS */}
            <section id="expositions" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">2. National Agricultural and Trade Expositions</h2>
              <p className="govuk-body">
                The government promotes trade, innovation, and food security through scheduled annual expositions that bring together local industries, international investors, and smallholder farmers.
              </p>

              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <strong>ASK International Shows:</strong> Coordinated by the Agricultural Society of Kenya, these trade fairs take place annually across major regional hubs (including Nairobi, Mombasa, Kisumu, and Eldoret) to exhibit advanced technologies in farming and manufacturing.
                </li>
                <li>
                  <strong>Nairobi International Trade Fair (NITF):</strong> The largest trade exposition in East Africa, occurring over a seven-day window between late September and early October at the Jamhuri Park Showground.
                </li>
                <li>
                  <strong>The Devolution Conference:</strong> A key biennial governance event rotated across counties, facilitating public performance audits, state accountability reviews, and multi-sectoral development tracking between national and county governments.
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 3. NATIONAL CULTURAL FESTIVALS */}
            <section id="cultural-festivals" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">3. State-Sponsored Cultural and Arts Festivals</h2>
              <p className="govuk-body">
                To safeguard intangible cultural heritage, the Ministry of Sports, Culture and the Arts regulates and sponsors competitive annual festivals for academic institutions and community troupes.
              </p>

              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <strong>Kenya National Drama and Film Festival (KNDFF):</strong> The premier creative arts festival for schools, colleges, and universities, highlighting theatrical performance, spoken word, and student cinema.
                </li>
                <li>
                  <strong>Kenya Music Festival:</strong> Running for over nine decades, it remains the largest classroom-centered music, dance, and elocution festival in Africa, celebrating diverse indigenous traditions and modern compositions.
                </li>
                <li>
                  <strong>Lamu Cultural Festival:</strong> An annual celebration supported by the National Museums of Kenya to preserve Swahili heritage, featuring dhow races, donkey races, and traditional coastal crafts within the UNESCO World Heritage site.
                </li>
              </ul>
            </section>

          </div>

          {/* SIDEBAR NAVIGATION COLUMN */}
          <aside className="govuk-grid-column-one-third" role="complementary">
            <div className="society-top-border">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Related Guidance</h2>
              <ul className="govuk-list govuk-body-s">
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/holidays" className="govuk-link">
                    <strong>National Days and Public Holidays</strong>
                  </Link>
                </li>
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/heritage-sites" className="govuk-link">
                    <strong>Historical and Heritage Sites</strong>
                  </Link>
                </li>
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/cultural-calendar" className="govuk-link">
                    <strong>Seasonal Cultural Calendar</strong>
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* FEEDBACK & FOOTER METADATA */}
        <div className="govuk-grid-row govuk-!-margin-top-6">
          <div className="govuk-grid-column-full">
            <LastUpdated published="2026-05-22" lastUpdated="2026-05-22" />
            
          </div>
        </div>

      </main>
    </div>
  );
}
