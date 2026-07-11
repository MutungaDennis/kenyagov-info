// app/society-and-culture/page.tsx
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import LastUpdated from "@/components/govuk/LastUpdated";

export const metadata = {
  title: "Society and culture",
  description:
    "Learn about Kenya's people, languages, heritage, national identity and social structures.",
};

export default function SocietyAndCulturePage() {
  const categories = [
    {
      id: "identity-and-heritage",
      name: "National identity and heritage",
      description: "Kenya's symbols, holidays, national events and constitutional values.",
      items: [
        { title: "National symbols", href: "/society-and-culture/national-symbols" },
        { title: "Public holidays", href: "/society-and-culture/holidays" },
        { title: "National events", href: "/society-and-culture/national-events" },
        { title: "Heritage sites", href: "/society-and-culture/heritage-sites" },
        { title: "Constitution and national values", href: "/society-and-culture/constitution-and-national-values" },
        { title: "Cultural calendar", href: "/society-and-culture/cultural-calendar" },
      ]
    },
    {
      id: "people-and-communities",
      name: "People and communities",
      description: "Kenya's diverse communities, languages and faith traditions.",
      items: [
        { title: "Communities", href: "/society-and-culture/communities" },
        { title: "Languages", href: "/society-and-culture/languages" },
        { title: "Religion and faith", href: "/society-and-culture/religion-and-faith" },
        { title: "Urban and rural life", href: "/society-and-culture/urban-and-rural-life" },
        { title: "Diaspora engagement", href: "/society-and-culture/diaspora" },
      ]
    },
    {
      id: "lifestyle-and-creative",
      name: "Lifestyle, arts and sports",
      description: "Arts, food, fashion, sports and tourism in Kenya.",
      items: [
        { title: "Arts and entertainment", href: "/society-and-culture/arts-and-entertainment" },
        { title: "Food and cuisine", href: "/society-and-culture/food-and-cuisine" },
        { title: "Kenyan fashion", href: "/society-and-culture/kenyan-fashion" },
        { title: "Sports and recreation", href: "/society-and-culture/sports-and-recreation" },
        { title: "Media and communication", href: "/society-and-culture/media-and-communication" },
        { title: "Tourism and regions", href: "/society-and-culture/tourism-and-regions" },
      ]
    },
    {
      id: "civic-and-social-life",
      name: "Civic life and social systems",
      description: "Values, education, family life and traditions in Kenya.",
      items: [
        { title: "Civic values", href: "/society-and-culture/civic-values" },
        { title: "Education and youth", href: "/society-and-culture/education-and-youth" },
        { title: "Family and social life", href: "/society-and-culture/family-and-social-life" },
        { title: "Traditional culture", href: "/society-and-culture/traditional-culture" },
        { title: "Public behaviour and etiquette", href: "/society-and-culture/public-behaviour-and-etiquette" },
        { title: "Frequently asked questions", href: "/society-and-culture/faqs" },
      ]
    }
  ];

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Society and culture" },
        ]}
        title="Society and culture"
        lead="Learn about Kenya's people, languages, heritage, national identity and social structures."
      >
        <p className="govuk-body">
          This directory provides information for citizens, students, researchers
          and visitors about Kenyan society and culture.
        </p>
      </PageIntro>

        <div className="govuk-grid-row">
          {/* Main content - left column */}
          <div className="govuk-grid-column-two-thirds">
            
            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Section 1: National identity and heritage */}
            <section id="identity-and-heritage" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">National identity and heritage</h2>
              <p className="govuk-body">
                Kenya's symbols, holidays, national events and constitutional values.
              </p>
              <ul className="govuk-list govuk-list--spaced">
                {categories[0].items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="govuk-link">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Section 2: People and communities */}
            <section id="people-and-communities" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">People and communities</h2>
              <p className="govuk-body">
                Kenya's diverse communities, languages and faith traditions.
              </p>
              <ul className="govuk-list govuk-list--spaced">
                {categories[1].items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="govuk-link">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Section 3: Lifestyle, arts and sports */}
            <section id="lifestyle-and-creative" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Lifestyle, arts and sports</h2>
              <p className="govuk-body">
                Arts, food, fashion, sports and tourism in Kenya.
              </p>
              <ul className="govuk-list govuk-list--spaced">
                {categories[2].items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="govuk-link">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            {/* Section 4: Civic life and social systems */}
            <section id="civic-and-social-life" className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l">Civic life and social systems</h2>
              <p className="govuk-body">
                Values, education, family life and traditions in Kenya.
              </p>
              <ul className="govuk-list govuk-list--spaced">
                {categories[3].items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="govuk-link">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

            <LastUpdated
              published="2026-05-22"
              lastUpdated="2026-07-02"
            />

          </div>

          {/* Sticky Table of Contents - right column */}
          <div className="govuk-grid-column-one-third">
            <aside className="app-toc" role="navigation" aria-label="Contents">
              <h2 className="govuk-heading-s">Contents</h2>
              <ol className="app-toc__list">
                <li>
                  <a href="#identity-and-heritage" className="app-toc__link">
                    National identity and heritage
                  </a>
                </li>
                <li>
                  <a href="#people-and-communities" className="app-toc__link">
                    People and communities
                  </a>
                </li>
                <li>
                  <a href="#lifestyle-and-creative" className="app-toc__link">
                    Lifestyle, arts and sports
                  </a>
                </li>
                <li>
                  <a href="#civic-and-social-life" className="app-toc__link">
                    Civic life and social systems
                  </a>
                </li>
              </ol>
            </aside>
          </div>
        </div>
      

      <style>{`
        .app-toc {
          position: sticky;
          top: 20px;
          padding: 15px;
          border-left: 1px solid #b1b4b6;
          margin-bottom: 30px;
        }

        .app-toc h2 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 10px;
          color: #0b0c0c;
        }

        .app-toc__list {
          list-style: none;
          padding: 0;
          margin: 0;
          counter-reset: toc-counter;
        }

        .app-toc__list li {
          counter-increment: toc-counter;
          margin-bottom: 10px;
          padding-left: 20px;
          position: relative;
        }

        .app-toc__list li::before {
          content: counter(toc-counter) ".";
          position: absolute;
          left: 0;
          color: #505a5f;
          font-weight: 700;
        }

        .app-toc__link {
          color: #1d70b8;
          text-decoration: underline;
          font-size: 16px;
          line-height: 1.4;
        }

        .app-toc__link:hover {
          color: #003078;
          text-decoration-thickness: 3px;
        }

        .app-toc__link:focus {
          outline: 3px solid #fd0;
          outline-offset: 0;
          background-color: #fd0;
          color: #0b0c0c;
          text-decoration: none;
        }

        /* Mobile: hide TOC or make it less prominent */
        @media (max-width: 48.0625rem) {
          .app-toc {
            position: static;
            border-left: none;
            border-top: 1px solid #b1b4b6;
            padding-top: 15px;
            margin-top: 15px;
          }
        }
      `}</style>
    
  
    </>
);
}