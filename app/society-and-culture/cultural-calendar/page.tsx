'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";

export default function CulturalCalendarPage() {
  return (
    <div className="govuk-width-container">
      {/* GOV.UK Navigation Breadcrumbs */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and Culture", href: "/society-and-culture" },
          { text: "Cultural Calendar", href: "/society-and-culture/cultural-calendar" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* HEADER SECTION */}
        <div className="govuk-grid-row govuk-!-margin-bottom-7">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">National Identity and Heritage</span>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              The Kenyan Cultural Calendar
            </h1>
            <p className="govuk-body-l">
              A chronological guide to seasonal natural phenomena, ethnic heritage assemblies, historical festivals, and community celebrations observed throughout the year across Kenya.
            </p>
          </div>
        </div>

        {/* CONTENT AND SIDEBAR MATRIX */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">

            {/* FIRST QUARTER */}
            <section id="first-quarter" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l" style={{ borderBottom: "3px solid #1d70b8", paddingBottom: "5px" }}>
                First Quarter (January – March)
              </h2>
              
              <div className="govuk-!-margin-bottom-4">
                <h3 className="govuk-heading-m govuk-!-margin-bottom-1">East African Arts Festival</h3>
                <span className="govuk-body-s" style={{ fontWeight: "bold", color: "#505a5f", display: "block", marginBottom: "10px" }}>Occurs: March | Location: Nairobi</span>
                <p className="govuk-body">
                  Hosted by the National Museums of Kenya, this three-day global exhibition highlights painting, sculpture, fashion design, literature, and indigenous music talent from across the region.
                </p>
              </div>
            </section>

            {/* SECOND QUARTER */}
            <section id="second-quarter" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l" style={{ borderBottom: "3px solid #1d70b8", paddingBottom: "5px" }}>
                Second Quarter (April – June)
              </h2>

              <div className="govuk-!-margin-bottom-4">
                <h3 className="govuk-heading-m govuk-!-margin-bottom-1">The Safari Rally Kenya</h3>
                <span className="govuk-body-s" style={{ fontWeight: "bold", color: "#505a5f", display: "block", marginBottom: "10px" }}>Occurs: Easter Weekend / Mid-Year | Location: Naivasha, Nakuru County</span>
                <p className="govuk-body">
                  A legendary motorsport competition, currently part of the World Rally Championship (WRC) calendar. It attracts millions of citizens and international spectators to the floor of the Great Rift Valley.
                </p>
              </div>

              <div className="govuk-!-margin-bottom-4">
                <h3 className="govuk-heading-m govuk-!-margin-bottom-1">Madaraka Day Festivities</h3>
                <span className="govuk-body-s" style={{ fontWeight: "bold", color: "#505a5f", display: "block", marginBottom: "10px" }}>Occurs: 1 June | Location: Rotating County Host</span>
                <p className="govuk-body">
                  The first official national day of the year, bringing together regional ethnic dancing troupes, choral unions, and military displays to celebrate self-governance.
                </p>
              </div>
            </section>
                        {/* THIRD QUARTER - THE PEAK SEASON */}
            <section id="third-quarter" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l" style={{ borderBottom: "3px solid #1d70b8", paddingBottom: "5px" }}>
                Third Quarter (July – September)
              </h2>

              <div className="govuk-!-margin-bottom-4">
                <h3 className="govuk-heading-m govuk-!-margin-bottom-1">The Great Wildebeest Migration</h3>
                <span className="govuk-body-s" style={{ fontWeight: "bold", color: "#505a5f", display: "block", marginBottom: "10px" }}>Occurs: July – August | Location: Maasai Mara National Reserve</span>
                <p className="govuk-body">
                  Recognized as one of the Seven Natural Wonders of Africa. Over two million wildebeests, zebras, and antelopes cross the Mara River from the Serengeti into Kenya, a seasonal shift that underpins local wildlife heritage celebrations.
                </p>
              </div>

              <div className="govuk-!-margin-bottom-4">
                <h3 className="govuk-heading-m govuk-!-margin-bottom-1">Maralal Camel Derby</h3>
                <span className="govuk-body-s" style={{ fontWeight: "bold", color: "#505a5f", display: "block", marginBottom: "10px" }}>Occurs: August | Location: Maralal Town, Samburu County</span>
                <p className="govuk-body">
                  An intense annual camel race event that serves as a vehicle for peace and cohesion among northern nomadic communities, featuring rich cultural attire displays by the Samburu, Turkana, and Pokot peoples.
                </p>
              </div>

              <div className="govuk-!-margin-bottom-4">
                <h3 className="govuk-heading-m govuk-!-margin-bottom-1">The Kenya Music Festival National Finals</h3>
                <span className="govuk-body-s" style={{ fontWeight: "bold", color: "#505a5f", display: "block", marginBottom: "10px" }}>Occurs: August | Location: Designated Regional University Campus</span>
                <p className="govuk-body">
                  The culmination of the largest school-based cultural event on the continent, bringing together thousands of learners to showcase traditional folk songs, instrumental ensembles, and cultural dances.
                </p>
              </div>
            </section>

            {/* FOURTH QUARTER */}
            <section id="fourth-quarter" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l" style={{ borderBottom: "3px solid #1d70b8", paddingBottom: "5px" }}>
                Fourth Quarter (October – December)
              </h2>

              <div className="govuk-!-margin-bottom-4">
                <h3 className="govuk-heading-m govuk-!-margin-bottom-1">Mashujaa Cultural Assemblies</h3>
                <span className="govuk-body-s" style={{ fontWeight: "bold", color: "#505a5f", display: "block", marginBottom: "10px" }}>Occurs: 20 October | Location: National</span>
                <p className="govuk-body">
                  A period dedicated to honouring cultural icons, historical freedom fighters, and community elders who protect the intangible cultural heritage of Kenya&apos;s 40+ unique communities.
                </p>
              </div>

              <div className="govuk-!-margin-bottom-4">
                <h3 className="govuk-heading-m govuk-!-margin-bottom-1">Lamu Cultural Festival</h3>
                <span className="govuk-body-s" style={{ fontWeight: "bold", color: "#505a5f", display: "block", marginBottom: "10px" }}>Occurs: November | Location: Lamu Old Town (UNESCO Site)</span>
                <p className="govuk-body">
                  An immersive event designed to promote Swahili culture and traditions. The schedule features traditional dhow racing, donkey races, Swahili poetry recitations, and local musical showcases.
                </p>
              </div>

              <div className="govuk-!-margin-bottom-4">
                <h3 className="govuk-heading-m govuk-!-margin-bottom-1">Jamhuri Day Celebrations</h3>
                <span className="govuk-body-s" style={{ fontWeight: "bold", color: "#505a5f", display: "block", marginBottom: "10px" }}>Occurs: 12 December | Location: Nairobi (Nyayo/Kasarani Stadium)</span>
                <p className="govuk-body">
                  Kenya&apos;s ultimate Republic holiday, closing out the state events loop with extensive cross-cultural multi-ethnic music performances, creative theatrical displays, and historical fly-pasts.
                </p>
              </div>
            </section>

          </div>

          {/* SIDEBAR NAVIGATION COLUMN */}
          <aside className="govuk-grid-column-one-third" role="complementary">
            <div className="society-top-border">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Related Guidance</h2>
              <ul className="govuk-list govuk-body-s">
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/national-events" className="govuk-link">
                    <strong>National State Events</strong>
                  </Link>
                </li>
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/heritage-sites" className="govuk-link">
                    <strong>Historical Heritage Sites</strong>
                  </Link>
                </li>
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/traditional-culture" className="govuk-link">
                    <strong>Traditional Practices &amp; Ceremonies</strong>
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

