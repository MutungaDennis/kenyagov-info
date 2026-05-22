'use client';

import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import LastUpdated from "@/components/govuk/LastUpdated";

export default function SocietyAndCulturePage() {
  // Logical thematic grouping of all 23 parameters to fit the official GOV.UK browse grid pattern
  const categories = [
    {
      id: "identity-and-heritage",
      name: "National Identity and Heritage",
      description: "Official symbols, national celebrations, and constitutional records.",
      items: [
        { title: "National Symbols", href: "/society-and-culture/national-symbols" },
        { title: "Public Holidays", href: "/society-and-culture/holidays" },
        { title: "National Events", href: "/society-and-culture/national-events" },
        { title: "Heritage Sites", href: "/society-and-culture/heritage-sites" },
        { title: "Constitution and National Values", href: "/society-and-culture/constitution-and-national-values" },
        { title: "Cultural Calendar", href: "/society-and-culture/cultural-calendar" },
      ]
    },
    {
      id: "people-and-communities",
      name: "People and Communities",
      description: "Demographics, spoken regional dialects, and faith groups.",
      items: [
        { title: "Communities", href: "/society-and-culture/communities" },
        { title: "Languages", href: "/society-and-culture/languages" },
        { title: "Religion and Faith", href: "/society-and-culture/religion-and-faith" },
        { title: "Urban and Rural Life", href: "/society-and-culture/urban-and-rural-life" },
        { title: "Diaspora Engagement", href: "/society-and-culture/diaspora" },
      ]
    },
    {
      id: "lifestyle-and-creative",
      name: "Lifestyle, Creative Arts and Sports",
      description: "Kenyan literature, music, cuisine, garments, and athletics history.",
      items: [
        { title: "Arts and Entertainment", href: "/society-and-culture/arts-and-entertainment" },
        { title: "Food and Cuisine", href: "/society-and-culture/food-and-cuisine" },
        { title: "Kenyan Fashion", href: "/society-and-culture/kenyan-fashion" },
        { title: "Sports and Recreation", href: "/society-and-culture/sports-and-recreation" },
        { title: "Media and Communication", href: "/society-and-culture/media-and-communication" },
        { title: "Tourism and Regions", href: "/society-and-culture/tourism-and-regions" },
      ]
    },
    {
      id: "civic-and-social-life",
      name: "Civic Life and Social Systems",
      description: "Social systems, educational networks, etiquette, and values.",
      items: [
        { title: "Civic Values", href: "/society-and-culture/civic-values" },
        { title: "Education and Youth", href: "/society-and-culture/education-and-youth" },
        { title: "Family and Social Life", href: "/society-and-culture/family-and-social-life" },
        { title: "Traditional Culture", href: "/society-and-culture/traditional-culture" },
        { title: "Public Behaviour and Etiquette", href: "/society-and-culture/public-behaviour-and-etiquette" },
        { title: "Frequently Asked Questions", href: "/society-and-culture/faqs" },
      ]
    }
  ];

  return (
    <div className="govuk-width-container">
      {/* GOV.UK Breadcrumbs with explicit aria labels */}
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and Culture", href: "/society-and-culture" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        {/* Header Block Section */}
        <div className="govuk-grid-row govuk-!-margin-bottom-7">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">
              Society and Culture in Kenya
            </h1>
            <p className="govuk-body-l">
              Access educational documentation regarding Kenya’s people, languages, historic heritage, national identity, and social structures.
            </p>
            <p className="govuk-body">
              This directory provides verified datasets to support citizens, civic educators, students, researchers, and visitors navigating public life.
            </p>
          </div>

          {/* Clean sidebar pattern replacing the invalid inset box */}
          <aside className="govuk-grid-column-one-third" role="complementary">
            <div style={{ borderTop: "2px solid #1d70b8", paddingTop: "15px" }}>
              <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Top Tasks</h2>
              <ul className="govuk-list govuk-body-s">
                <li className="govuk-!-margin-bottom-2">
                  <Link href="/society-and-culture/holidays" className="govuk-link"><strong>View upcoming public holidays</strong></Link>
                </li>
                <li className="govuk-!-margin-bottom-2">
                  <Link href="/society-and-culture/national-symbols" className="govuk-link"><strong>Download official national symbols</strong></Link>
                </li>
                <li>
                  <Link href="/society-and-culture/constitution-and-national-values" className="govuk-link"><strong>Read core civic values</strong></Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

        {/* 2-Column Responsive Browse Services Grid Matrix */}
        <div className="govuk-grid-row">
          {categories.map((category) => (
            <div key={category.id} className="govuk-grid-column-one-half govuk-!-margin-bottom-6">
              <section aria-labelledby={`heading-${category.id}`} style={{ paddingRight: "15px" }}>
                <h2 id={`heading-${category.id}`} className="govuk-heading-m govuk-!-margin-bottom-1">
                  <span style={{ borderBottom: "1px solid #0b0c0c", paddingBottom: "2px" }}>
                    {category.name}
                  </span>
                </h2>
                <p className="govuk-body-s" style={{ color: "#505a5f", marginTop: "8px", marginBottom: "15px" }}>
                  {category.description}
                </p>
                <ul className="govuk-list" style={{ paddingLeft: 0 }}>
                  {category.items.map((item) => (
                    <li key={item.href} className="govuk-!-margin-bottom-2" style={{ fontSize: "19px", lineHeight: "1.3" }}>
                      <Link href={item.href} className="govuk-link" style={{ fontWeight: "600", textDecorationThickness: "2px" }}>
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ))}
        </div>

        {/* Closing Metadata Signposting Controls */}
        <div className="govuk-grid-row govuk-!-margin-top-4">
          <div className="govuk-grid-column-full">
            <LastUpdated
              published="2026-05-22"
              lastUpdated="2026-05-22"
            />
            <GovUKFeedback />
          </div>
        </div>

      </main>
    </div>
  );
}
