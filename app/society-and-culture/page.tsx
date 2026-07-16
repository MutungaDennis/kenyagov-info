// app/society-and-culture/page.tsx
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ChevronLinkList from "@/components/site/ChevronLinkList";
import LastUpdated from "@/components/govuk/LastUpdated";

export const revalidate = 86400;
export const dynamic = "force-static";

export const metadata = {
  title: "Society and culture",
  description:
    "Learn about Kenya's people, languages, heritage, national identity and social structures.",
};

const categories = [
  {
    id: "identity-and-heritage",
    name: "National identity and heritage",
    description:
      "Kenya's symbols, holidays, national events and constitutional values.",
    items: [
      {
        title: "National symbols",
        href: "/national-symbols",
        description: "Flag, coat of arms, anthem and related national emblems.",
      },
      {
        title: "Public holidays",
        href: "/society-and-culture/holidays",
        description: "National and public holidays observed in Kenya.",
      },
      {
        title: "National events",
        href: "/national-events",
        description:
          "National days, trade shows, governance gatherings, festivals and sports — browse by category.",
      },
      {
        title: "Heritage sites",
        href: "/society-and-culture/heritage-sites",
        description: "Cultural and natural heritage places across the country.",
      },
      {
        title: "Constitution and national values",
        href: "/society-and-culture/constitution-and-national-values",
        description: "National values and principles in the Constitution.",
      },
      {
        title: "Cultural calendar",
        href: "/society-and-culture/cultural-calendar",
        description: "Cultural and community events calendar.",
      },
    ],
  },
  {
    id: "people-and-communities",
    name: "People and communities",
    description: "Kenya's diverse communities, languages and faith traditions.",
    items: [
      {
        title: "Communities",
        href: "/society-and-culture/communities",
        description: "Overview of Kenya’s communities and social diversity.",
      },
      {
        title: "Languages",
        href: "/society-and-culture/languages",
        description: "Official and community languages used in Kenya.",
      },
      {
        title: "Religion and faith",
        href: "/religion-and-faith",
        description: "Faith communities and religious life in Kenya.",
      },
    ],
  },
];

export default function SocietyAndCulturePage() {
  return (
    <>
      <PageIntro
        fullWidth
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

      <nav className="govuk-!-margin-bottom-6" aria-label="On this page">
        <h2 className="govuk-heading-s">On this page</h2>
        <ul className="govuk-list">
          {categories.map((category) => (
            <li key={category.id}>
              <a className="govuk-link" href={`#${category.id}`}>
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {categories.map((category, index) => (
        <section
          key={category.id}
          id={category.id}
          className="govuk-!-margin-bottom-8"
        >
          {index > 0 && (
            <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
          )}
          <h2 className="govuk-heading-l">{category.name}</h2>
          <p className="govuk-body">{category.description}</p>
          <ChevronLinkList items={category.items} ariaLabel={category.name} />
        </section>
      ))}

      <LastUpdated published="2026-05-22" lastUpdated="2026-07-15" />

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <h2 className="govuk-heading-m">Related</h2>
      <ul className="govuk-list govuk-list--bullet">
        <li>
          <Link href="/constitution" className="govuk-link">
            Constitution of Kenya
          </Link>
        </li>
        <li>
          <Link href="/topics" className="govuk-link">
            Browse topics
          </Link>
        </li>
        <li>
          <Link href="/guides" className="govuk-link">
            Guides and life events
          </Link>
        </li>
      </ul>
    </>
  );
}
