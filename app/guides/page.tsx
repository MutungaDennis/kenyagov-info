import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import ChevronLinkList from "@/components/site/ChevronLinkList";
import { getGuides } from "@/lib/sanity/client";

export const revalidate = 3600;

export const metadata = {
  title: "Guides and life events",
  description:
    "Step-by-step plain English guides to Kenyan government services, life events and citizen rights.",
};

const lifeEventGuides = [
  {
    title: "Having a baby — government steps",
    href: "/guides/having-a-baby",
    description:
      "Birth registration, health pointers and documents you may need later.",
  },
  {
    title: "Registering a death — government steps",
    href: "/guides/registering-a-death",
    description:
      "Death registration, certificates and high-level succession pointers.",
  },
  {
    title: "Starting a business — government steps",
    href: "/guides/starting-a-business",
    description:
      "Business registration, tax PIN, county permits and sector licences.",
  },
];

export default async function GuidesPage() {
  let guides: any[] = [];
  try {
    guides = await getGuides();
  } catch (error) {
    console.error("Error fetching guides:", error);
  }

  const featuredGuides = guides.filter((g: any) => g.featured);
  const regularGuides = guides.filter((g: any) => !g.featured);

  return (
    <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Guides" },
        ]}
      />

      <h1 className="govuk-heading-xl">Guides and life events</h1>
      <p className="govuk-body-l">
        Step-by-step guides to help you navigate government services and major
        life events. These pages explain processes — applications happen on
        official systems.
      </p>

      <h2 className="govuk-heading-m">Life events</h2>
      <ChevronLinkList
        ariaLabel="Life event guides"
        items={lifeEventGuides.map((guide) => ({
          title: guide.title,
          href: guide.href,
          description: guide.description,
        }))}
      />

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      {featuredGuides.length > 0 && (
        <section className="govuk-!-margin-bottom-8">
          <h2 className="govuk-heading-m">Featured guides</h2>
          <ChevronLinkList
            ariaLabel="Featured guides"
            items={featuredGuides.map((guide: any) => ({
              title: guide.title,
              href: `/guides/${guide.slug.current}`,
              description: guide.description,
            }))}
          />
        </section>
      )}

      <section>
        <h2 className="govuk-heading-m">More guides</h2>
        {regularGuides.length > 0 ? (
          <ChevronLinkList
            ariaLabel="More guides"
            items={regularGuides.map((guide: any) => ({
              title: guide.title,
              href: `/guides/${guide.slug.current}`,
              description: guide.description,
            }))}
          />
        ) : (
          <div className="govuk-inset-text">
            <p className="govuk-body">
              Additional CMS guides will appear here when published. Start with
              life events above, or{" "}
              <Link href="/topics" className="govuk-link">
                browse topics
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

      <h2 className="govuk-heading-m">Related</h2>
      <ul className="govuk-list govuk-list--bullet">
        <li>
          <Link href="/services/popular" className="govuk-link">
            Popular services
          </Link>
        </li>
        <li>
          <Link href="/services/a-z" className="govuk-link">
            Services A to Z
          </Link>
        </li>
        <li>
          <Link href="/content-style-guide" className="govuk-link">
            Content style guide
          </Link>
        </li>
      </ul>
    </>
  );
}
