'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";

export default function NationalSymbolsPage() {
  return (
    <div className="govuk-width-container">
      {/* GOV.UK Navigation Breadcrumbs */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and Culture", href: "/society-and-culture" },
          { text: "National Symbols", href: "/society-and-culture/national-symbols" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* HEADER SECTION */}
        <div className="govuk-grid-row govuk-!-margin-bottom-7">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">National Identity and Heritage</span>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              National Symbols of Kenya
            </h1>
            <p className="govuk-body-l">
              Article 9(1) of the Constitution of Kenya establishes the official state symbols that represent the sovereignty, unity, and shared cultural values of the Republic.
            </p>
          </div>
        </div>

        {/* LEGAL COMPLIANCE WARNING BANNER */}
        <div className="govuk-grid-row govuk-!-margin-bottom-7">
          <div className="govuk-grid-column-full">
            <div className="govuk-notification-banner" role="region" aria-labelledby="govuk-notification-banner-title" data-module="govuk-notification-banner" style={{ borderLeftColor: "#d4351c" }}>
              <div className="govuk-notification-banner__header" style={{ backgroundColor: "#d4351c" }}>
                <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
                  Legal Notice: Protected Emblems
                </h2>
              </div>
              <div className="govuk-notification-banner__content">
                <h3 className="govuk-notification-banner__heading">
                  National Flag, Emblems and Names Act (Cap. 99)
                </h3>
                <p className="govuk-body">
                  Under Section 3 of <strong>Cap. 99 of the Laws of Kenya</strong>, it is a criminal offence to display, reproduce, or use any specified national emblem (such as the Coat of Arms or Public Seal) or their colourable imitations for trade, business, or unauthorized public profiles without written permission from the Cabinet Secretary. 
                </p>
                <p className="govuk-body">
                  To ensure full legal compliance, this educational service provides precise <strong>textual and constitutional descriptions</strong> of these protected symbols in lieu of downloadable graphic imitations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT AND SIDEBAR MATRIX */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">

            {/* 1. THE NATIONAL FLAG */}
            <section id="national-flag" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">1. The National Flag</h2>
              <p className="govuk-body">
                The national flag is a powerful emblem of independence and pride. It is based on the Kenya African National Union (KANU) independence flag and consists of four colors with a traditional Maasai shield and two crossed spears in the center.
              </p>
              
              {/* Accessible Data Table for Color Symbolism */}
              <table className="govuk-table govuk-!-margin-bottom-4">
                <caption className="govuk-table__caption govuk-table__caption--s">Official Meaning of National Flag Elements</caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header" style={{ width: "30%" }}>Element / Color</th>
                    <th scope="col" className="govuk-table__header">Constitutional Meaning and Significance</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header" style={{ fontWeight: "600" }}>Black</th>
                    <td className="govuk-table__cell">Represents the indigenous people of the Republic of Kenya.</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header" style={{ fontWeight: "600" }}>Red</th>
                    <td className="govuk-table__cell">Symbolizes the blood shed during the arduous struggle for freedom and independence.</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header" style={{ fontWeight: "600" }}>Green</th>
                    <td className="govuk-table__cell">Represents the country&apos;s rich agricultural abundance and natural resources.</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header" style={{ fontWeight: "600" }}>White Lines</th>
                    <td className="govuk-table__cell">Signifies peace, honesty, and national unity across all diverse communities.</td>
                  </tr>
                  <tr className="govuk-table__row">
                    <th scope="row" className="govuk-table__header" style={{ fontWeight: "600" }}>Shield &amp; Spears</th>
                    <td className="govuk-table__cell">Symbolizes the defense of freedom and the readiness to safeguard national sovereignty.</td>
                  </tr>
                </tbody>
              </table>

              <div className="govuk-inset-text">
                <strong>Restriction:</strong> Flying the national flag on private motor vehicles is explicitly restricted by law to the President, Deputy President, Chief Justice, Speakers of Parliament, Cabinet Secretaries, and foreign diplomats. Violations attract strict legal fines or prosecution.
              </div>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 2. THE COAT OF ARMS */}
            <section id="coat-of-arms" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">2. The Coat of Arms</h2>
              <p className="govuk-body">
                The Coat of Arms of Kenya is the state graphic seal of authority. Pursuant to statutory guidelines, we describe its exact heraldic compositions as defined in the Second Schedule of the Constitution:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  <strong>The Supporters:</strong> Two golden African lions, symbolizing wildlife heritage and fierce collective courage, stand as guardians on either side holding traditional East African spears.
                </li>
                <li>
                  <strong>The Central Shield:</strong> Features the national colors (Black, Red, Green, White) with a central rooster holding an axe while moving forward, signifying the break of a new dawn, success, and the continuous will to work.
                </li>
                <li>
                  <strong>The Base Silhouette:</strong> The entire composition rests firmly on a silhouette model representing Mount Kenya.
                </li>
                <li>
                  <strong>Agricultural Abundance:</strong> The foreground features meticulous depictions of Kenya&apos;s primary agricultural cash crops—specifically coffee, pyrethrum, sisal, tea, maize, and pineapples.
                </li>
                <li>
                  <strong>The State Motto Scroll:</strong> At the lowest base, a scroll bears the official national motto: <em>&quot;Harambee&quot;</em> (Kiswahili for &quot;Pulling together in corporate unity&quot;).
                </li>
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
            {/* 3. THE NATIONAL ANTHEM */}
            <section id="national-anthem" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">3. The National Anthem</h2>
              <p className="govuk-body">
                Kenya’s national anthem is a corporate prayer composed by local elders prior to independence in 1963. It was designed to promote patriotism and national cohesion. It is written in both Kiswahili and English:
              </p>
              
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <h3 className="govuk-heading-s">Stanza 1 (Kiswahili)</h3>
                  <p className="govuk-body" style={{ fontStyle: "italic", lineHeight: "1.6" }}>
                    Ee Mungu nguvu yetu<br />
                    Ilete baraka kwetu<br />
                    Haki iwe ngao na mlinzi<br />
                    Natukae na undugu<br />
                    Amani na uhuru<br />
                    Raha tupate na ustawi.
                  </p>
                </div>
                <div className="govuk-grid-column-one-half">
                  <h3 className="govuk-heading-s">Stanza 1 (English)</h3>
                  <p className="govuk-body" style={{ fontStyle: "italic", lineHeight: "1.6" }}>
                    O God of all creation<br />
                    Bless this our land and nation<br />
                    Justice be our shield and defender<br />
                    May we dwell in unity<br />
                    Peace and liberty<br />
                    Plenty be found within our borders.
                  </p>
                </div>
              </div>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 4. THE NATIONAL MOTTO */}
            <section id="national-motto" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">4. The National Motto</h2>
              <p className="govuk-body">
                The official national motto of Kenya is <strong>&quot;Harambee&quot;</strong>, which is Kiswahili for &quot;Let us pull together&quot;. 
              </p>
              <p className="govuk-body">
                Enshrined at the base scroll of the Coat of Arms, it represents Kenya’s foundational tradition of community-based mutual assistance, collective responsibility, and joint resource mobilization to achieve national development priorities.
              </p>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* 5. THE NATIONAL PLEDGE */}
            <section id="national-pledge" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">5. The National Pledge</h2>
              <p className="govuk-body">
                The National Pledge of Loyalty is a solemn civic declaration recited during public assemblies, civil ceremonies, and educational forums to affirm personal allegiance to the sovereign state:
              </p>
              <div style={{ backgroundColor: "#f3f2f1", padding: "20px", borderLeft: "5px solid #1d70b8", marginBottom: "20px" }}>
                <p className="govuk-body" style={{ fontStyle: "italic", fontSize: "19px", lineHeight: "1.5" }}>
                  &quot;I pledge my loyalty to the Republic of Kenya, and to the National Flag; that I will diligently serve my country with all my heart, mind and strength; and that I will maintain and defend the integrity of Kenya, against all enemies, both internal and external, so help me God.&quot;
                </p>
              </div>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* PUBLIC SEAL EXTRA REVENUE MATRIX */}
            <section id="public-seal" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">The Public Seal</h2>
              <p className="govuk-body">
                The Public Seal of Kenya is the official state stamp used by the Executive branch to validate high-level legislative actions, treatial protocols, and presidential proclamations. It features a circular compression enclosing the graphic components of the National Coat of Arms, maintaining sovereign authority under the safe custody of the Head of State.
              </p>
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
                  <Link href="/society-and-culture/constitution-and-national-values" className="govuk-link">
                    <strong>Constitutional Rights and Values</strong>
                  </Link>
                </li>
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/civic-values" className="govuk-link">
                    <strong>Public Participation Frameworks</strong>
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
