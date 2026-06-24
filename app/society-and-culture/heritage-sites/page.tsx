'use client';

import { useState } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";
import GovUKDashboardCard from "@/components/govuk/DashboardCard";

interface HeritageSite {
  title: string;
  href: string;
  metaText: string;
  region: 'Coastal' | 'Nairobi / Central' | 'Rift Valley' | 'Nyanza / Western' | 'Northern / Eastern';
  category: 'unesco' | 'monument';
  description: string;
}

export default function HeritageSitesPage() {
  // Comprehensive legally gazetted dataset mapping Kenya's heritage matrix
  const sites: HeritageSite[] = [
    // ==========================================
    // UNESCO CULTURAL WORLD HERITAGE SITES
    // ==========================================
    {
      title: "Lamu Old Town",
      href: "/society-and-culture/heritage-sites/lamu-old-town",
      metaText: "UNESCO World Heritage Site (Cultural)",
      region: "Coastal",
      category: "unesco",
      description: "Oldest well-preserved Swahili town in East Africa. It has kept its traditional life and coral buildings for over 700 years.",
    },
    {
      title: "Fort Jesus, Mombasa",
      href: "/society-and-culture/heritage-sites/fort-jesus",
      metaText: "UNESCO World Heritage Site (Cultural)",
      region: "Coastal",
      category: "unesco",
      description: "Portuguese fort built 1593-1596. It shows 16th century military design and the history of Indian Ocean trade.",
    },
    {
      title: "Sacred Mijikenda Kaya Forests",
      href: "/society-and-culture/heritage-sites/kaya-forests",
      metaText: "UNESCO World Heritage Site (Cultural)",
      region: "Coastal",
      category: "unesco",
      description: "Coastal forests with old fortified villages (Kayas). Mijikenda people see them as sacred ancestral sites.",
    },
    {
      title: "Thimlich Ohinga Archaeological Site",
      href: "/society-and-culture/heritage-sites/thimlich-ohinga",
      metaText: "UNESCO World Heritage Site (Cultural)",
      region: "Nyanza / Western",
      category: "unesco",
      description: "Located in Migori, this dry-stone walled structural enclosure complex represents the largest and best-preserved traditional pastoral fortresses in the Lake Victoria basin.",
    },
    {
      title: "The Historic Town and Archaeological Site of Gedi",
      href: "/society-and-culture/heritage-sites/gedi-ruins",
      metaText: "UNESCO World Heritage Site (Cultural)",
      region: "Coastal",
      category: "unesco",
      description: "A historical 15th-century Swahili walled town hidden deep within the Arabuko Sokoke forest, showcasing highly advanced urban plumbing, mosques, and coral stone masonry.",
    },
    // ==========================================
    // UNESCO NATURAL WORLD HERITAGE SITES
    // ==========================================
    {
      title: "Mount Kenya National Park and Natural Forest",
      href: "/society-and-culture/heritage-sites/mount-kenya",
      metaText: "UNESCO World Heritage Site (Natural)",
      region: "Nairobi / Central",
      category: "unesco",
      description: "Africa’s second-highest peak, featuring glaciated summits, afro-alpine moorlands, and diverse montane ecosystems critical to national ecological survival.",
    },
    {
      title: "Lake Turkana National Parks",
      href: "/society-and-culture/heritage-sites/lake-turkana",
      metaText: "UNESCO World Heritage Site (Natural)",
      region: "Northern / Eastern",
      category: "unesco",
      description: "Encompassing Sibiloi, Central Island, and South Island parks; it holds the world's largest permanent desert lake and forms an unmatched global fossil treasure trove.",
    },
    {
      title: "Kenya Lake System in the Great Rift Valley",
      href: "/society-and-culture/heritage-sites/rift-valley-lakes",
      metaText: "UNESCO World Heritage Site (Natural)",
      region: "Rift Valley",
      category: "unesco",
      description: "Comprising Lakes Nakuru, Bogoria, and Elementaita; an interconnected alkaline lake system that serves as the world's primary feeding grounds for lesser flamingos.",
    },
    // ==========================================
    // HISTORICAL NATIONAL MONUMENTS
    // ==========================================
    {
      title: "Olorgesailie Prehistoric Site",
      href: "/society-and-culture/heritage-sites/olorgesailie",
      metaText: "National Monument",
      region: "Rift Valley",
      category: "monument",
      description: "Situated along Magadi Road, this site is globally renowned for its immense concentration of Acheulean stone handaxes, documenting early human evolutionary tools.",
    },
    {
      title: "Kariandusi Prehistoric Site",
      href: "/society-and-culture/heritage-sites/kariandusi",
      metaText: "National Monument",
      region: "Rift Valley",
      category: "monument",
      description: "An Early Stone Age archaeological riverbed excavation site near Gilgil, revealing prehistoric volcanic layers and heavy obsidian glass tools.",
    },
    {
      title: "Koobi Fora Archaeological Site",
      href: "/society-and-culture/heritage-sites/koobi-fora",
      metaText: "National Monument",
      region: "Northern / Eastern",
      category: "monument",
      description: "Located within East Turkana, widely dubbed the 'Cradle of Mankind' for its monumental discoveries of early hominid fossils including Homo habilis and Homo erectus.",
    },
    {
      title: "Hyrax Hill Prehistoric Site",
      href: "/society-and-culture/heritage-sites/hyrax-hill",
      metaText: "National Monument",
      region: "Rift Valley",
      category: "monument",
      description: "A prominent Neolithic, Late Stone Age, and Iron Age settlement site overlooking Lake Nakuru, complete with ancient stone walled enclosures and burial mounds.",
    },
    {
      title: "Songhor Prehistoric Site",
      href: "/society-and-culture/heritage-sites/songhor",
      metaText: "National Monument",
      region: "Nyanza / Western",
      category: "monument",
      description: "An early Miocene fossil bed rich in ancient primate remains dating back nearly 20 million years, vital to global evolutionary anthropology.",
    },
    {
      title: "Jumba la Mtwana Ruins",
      href: "/society-and-culture/heritage-sites/jumba-la-mtwana",
      metaText: "National Monument",
      region: "Coastal",
      category: "monument",
      description: "A 13th-century abandoned Swahili stone settlement resting on the Kilifi coastline, preserving ruins of four distinct mosques, tomb landmarks, and stone dwellings.",
    },
    {
      title: "Mnarani Ruins",
      href: "/society-and-culture/heritage-sites/mnarani-ruins",
      metaText: "National Monument",
      region: "Coastal",
      category: "monument",
      description: "The historical architectural remnants of a 15th-to-17th-century Swahili town overlooking Kilifi Creek, characterized by pristine pillar tombs and great ancient baobabs.",
    },
    {
      title: "Siyu Fort",
      href: "/society-and-culture/heritage-sites/siyu-fort",
      metaText: "National Monument",
      region: "Coastal",
      category: "monument",
      description: "Located on Pate Island within the Lamu Archipelago; uniquely outstanding as the only coastal defensive fort built completely by local Swahili rulers rather than foreign powers.",
    },
    {
      title: "Takwa Ruins",
      href: "/society-and-culture/heritage-sites/takwa-ruins",
      metaText: "National Monument",
      region: "Coastal",
      category: "monument",
      description: "The structural remains of a prosperous 15th-century Muslim trading town on Manda Island, abandoned due to fresh water salinization, noted for its Pillar Mosque.",
    },
    {
      title: "Mombasa Old Town Conservation Area",
      href: "/society-and-culture/heritage-sites/mombasa-old-town",
      metaText: "National Monument",
      region: "Coastal",
      category: "monument",
      description: "A legally protected cultural core surrounding Fort Jesus, displaying a rich architectural convergence of historical Asian, Arab, Portuguese, and British design layers.",
    },
    {
      title: "Uhuru Gardens National Monument & Museum",
      href: "/society-and-culture/heritage-sites/uhuru-gardens",
      metaText: "National Monument",
      region: "Nairobi / Central",
      category: "monument",
      description: "Kenya's largest historic memorial park. The birthplace of sovereign Kenya where the national flag was first hoisted in 1963, featuring grand memorials and state military archives.",
    },
    {
      title: "The Nairobi Gallery (Point Zero)",
      href: "/society-and-culture/heritage-sites/nairobi-gallery",
      metaText: "National Monument",
      region: "Nairobi / Central",
      category: "monument",
      description: "Erected in 1913 as the Old Provincial Commissioner's office, housing 'Point Zero' from which all national highway travel distances were historically measured.",
    },
    {
      title: "Kenyatta House (Maralal)",
      href: "/society-and-culture/heritage-sites/kenyatta-house-maralal",
      metaText: "National Monument",
      region: "Northern / Eastern",
      category: "monument",
      description: "The historic modern bungalow within Samburu County where Mzee Jomo Kenyatta was detained by colonial authorities prior to his final release before independence.",
    },
    {
      title: "Kapenguria Old Prison",
      href: "/society-and-culture/heritage-sites/kapenguria-prison",
      metaText: "National Monument",
      region: "Northern / Eastern",
      category: "monument",
      description: "The colonial correctional facility where the 'Kapenguria Six' nationalist freedom fighters were held, tried, and imprisoned during the 1952 state of emergency.",
    },
    {
      title: "Karen Blixen Museum",
      href: "/society-and-culture/heritage-sites/karen-blixen",
      metaText: "National Monument",
      region: "Nairobi / Central",
      category: "monument",
      description: "The historical 1912 suburban farmhouse belonging to the famous Danish author of the memoir 'Out of Africa', preserving early colonial agricultural heritage architecture.",
    },
    {
      title: "Lord Baden-Powell Grave & Paxtu House",
      href: "/society-and-culture/heritage-sites/baden-powell-grave",
      metaText: "National Monument",
      region: "Nairobi / Central",
      category: "monument",
      description: "The final resting place and cottage home of Lord Robert Baden-Powell, the founder of the international Scout Movement, situated in Nyeri.",
    }
  ];

  // Filtering React state variables using functional hooks
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  // Logic filter cascade matching the state selection matrices
  const filteredSites = sites.filter((site) => {
    const matchesCategory = selectedCategory === "all" || site.category === selectedCategory;
    const matchesRegion = selectedRegion === "all" || site.region === selectedRegion;
    return matchesCategory && matchesRegion;
  });
  return (
    <div className="govuk-width-container">
      {/* GOV.UK Navigation Breadcrumbs */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and Culture", href: "/society-and-culture" },
          { text: "Heritage Sites", href: "/society-and-culture/heritage-sites" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* HEADER BLOCK */}
        <div className="govuk-grid-row govuk-!-margin-bottom-7">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">National Identity and Heritage</span>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              Historical and Heritage Sites
            </h1>
            <p className="govuk-body-l">
              Review and explore the protected archaeological settlements, historical monuments, and environmental heritage zones legally designated under the National Museums and Heritage Act (Cap. 216).
            </p>
          </div>
        </div>

        {/* TWO COLUMN MATRIX GRID */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* TAB INTERFACE - CATEGORY SELECTION */}
            <div className="govuk-tabs" style={{ marginBottom: "30px" }}>
              <h2 className="govuk-tabs__title">Contents</h2>
              <ul className="govuk-tabs__list" role="tablist">
                <li 
                  className={`govuk-tabs__list-item ${selectedCategory === "all" ? "govuk-tabs__list-item--selected" : ""}`}
                  role="presentation"
                >
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="govuk-tabs__tab"
                    role="tab"
                    aria-selected={selectedCategory === "all"}
                    style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}
                  >
                    All Protected Sites
                  </button>
                </li>
                <li 
                  className={`govuk-tabs__list-item ${selectedCategory === "unesco" ? "govuk-tabs__list-item--selected" : ""}`}
                  role="presentation"
                >
                  <button
                    onClick={() => setSelectedCategory("unesco")}
                    className="govuk-tabs__tab"
                    role="tab"
                    aria-selected={selectedCategory === "unesco"}
                    style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}
                  >
                    UNESCO World Heritage
                  </button>
                </li>
                <li 
                  className={`govuk-tabs__list-item ${selectedCategory === "monument" ? "govuk-tabs__list-item--selected" : ""}`}
                  role="presentation"
                >
                  <button
                    onClick={() => setSelectedCategory("monument")}
                    className="govuk-tabs__tab"
                    role="tab"
                    aria-selected={selectedCategory === "monument"}
                    style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}
                  >
                    National Monuments
                  </button>
                </li>
              </ul>
            </div>

            {/* DROPDOWN REGIONAL FILTER BAR */}
            <div className="govuk-form-group" style={{ marginBottom: "35px", padding: "15px", backgroundColor: "#f3f2f1", borderLeft: "4px solid #1d70b8" }}>
              <label className="govuk-label govuk-!-font-weight-bold" htmlFor="region-filter">
                Filter by Geographic Region
              </label>
              <select
                className="govuk-select"
                id="region-filter"
                name="region-filter"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                style={{ minWidth: "250px", marginTop: "5px" }}
              >
                <option value="all">All Regions Across Kenya</option>
                <option value="Coastal">Coastal Region</option>
                <option value="Nairobi / Central">Nairobi / Central Region</option>
                <option value="Rift Valley">Rift Valley Region</option>
                <option value="Nyanza / Western">Nyanza / Western Region</option>
                <option value="Northern / Eastern">Northern / Eastern Region</option>
              </select>
            </div>

            {/* RESULTS DIRECTORY SECTION */}
            <section aria-labelledby="monuments-list-heading">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 id="monuments-list-heading" className="govuk-heading-l" style={{ margin: 0 }}>
                  Protected Registry Directory
                </h2>
                <span className="govuk-body-s govuk-!-font-weight-bold" style={{ color: "#505a5f" }}>
                  Showing {filteredSites.length} of {sites.length} sites
                </span>
              </div>
              
              {/* Dynamic rendering with zero fallback handling state */}
              {filteredSites.length > 0 ? (
                filteredSites.map((site) => (
                  <GovUKDashboardCard
                    key={site.href}
                    title={site.title}
                    href={site.href}
                    metaText={`${site.metaText} — ${site.region}`}
                    description={site.description}
                  />
                ))
              ) : (
                <div style={{ padding: "30px", border: "1px dashed #b1b4b6", textAlign: "center", marginTop: "20px" }}>
                  <p className="govuk-body govuk-!-font-weight-bold">No registered sites match the selected criteria.</p>
                  <button 
                    onClick={() => { setSelectedCategory("all"); setSelectedRegion("all"); }} 
                    className="govuk-link" 
                    style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", textDecoration: "underline" }}
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* SIDEBAR NAVIGATION COLUMN */}
          <aside className="govuk-grid-column-one-third" role="complementary">
            <div className="society-top-border">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Related Guidance</h2>
              <ul className="govuk-list govuk-body-s">
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/cultural-calendar" className="govuk-link">
                    <strong>Seasonal Cultural Calendar</strong>
                  </Link>
                </li>
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/national-events" className="govuk-link">
                    <strong>National State Events</strong>
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

        {/* FOOTER FEEDBACK BAR */}
        <div className="govuk-grid-row govuk-!-margin-top-6">
          <div className="govuk-grid-column-full">
            <LastUpdated published="2026-05-22" lastUpdated="2026-05-22" />
            
          </div>
        </div>

      </main>
    </div>
  );
}
