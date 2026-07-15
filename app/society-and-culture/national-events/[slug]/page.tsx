import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageIntro from "@/components/site/PageIntro";
import ChevronLinkList from "@/components/site/ChevronLinkList";
import ExternalLink from "@/components/site/ExternalLink";
import LastUpdated from "@/components/govuk/LastUpdated";
import {
  getAllNationalEventSlugs,
  getCategoryBySlug,
  getEventsForCategory,
  getNationalEventBySlug,
  nationalEventHref,
} from "@/lib/data/national-events";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllNationalEventSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getNationalEventBySlug(slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.summary,
  };
}

export default async function NationalEventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = getNationalEventBySlug(slug);
  if (!event) notFound();

  const category = getCategoryBySlug(event.categorySlug);
  const isCategoryOverview = event.slug === event.categorySlug;
  const siblings = getEventsForCategory(event.categorySlug).filter(
    (e) => e.slug !== event.slug,
  );

  return (
    <>
      <PageIntro
        fullWidth
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Society and culture", href: "/society-and-culture" },
          {
            text: "National events",
            href: "/society-and-culture/national-events",
          },
          { text: event.title },
        ]}
        caption={category?.title ?? "National events"}
        title={event.title}
        lead={event.lead}
      >
        {event.meta ? (
          <p className="govuk-body-s govuk-!-margin-bottom-0">
            <strong>{event.meta}</strong>
          </p>
        ) : null}
      </PageIntro>

      <div className="govuk-inset-text">
        <p className="govuk-body govuk-!-margin-bottom-0">
          Summary guide only. Dates, venues and programmes change. Confirm with
          the organiser or official announcements before you travel or plan
          coverage.
        </p>
      </div>

      {event.sections.map((section) => (
        <section key={section.heading} className="govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-l">{section.heading}</h2>
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 48)} className="govuk-body">
              {p}
            </p>
          ))}
          {section.bullets && section.bullets.length > 0 && (
            <ul className="govuk-list govuk-list--bullet">
              {section.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          {section.links && section.links.length > 0 && (
            <ul className="govuk-list govuk-list--bullet">
              {section.links.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <ExternalLink href={link.href}>{link.text}</ExternalLink>
                  ) : (
                    <Link href={link.href} className="govuk-link">
                      {link.text}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {isCategoryOverview && siblings.length > 0 && (
        <section className="govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-l">Topics in this category</h2>
          <ChevronLinkList
            ariaLabel={`Topics in ${event.title}`}
            items={siblings.map((s) => ({
              title: s.title,
              href: nationalEventHref(s.slug),
              description: s.summary,
              meta: s.meta,
            }))}
          />
        </section>
      )}

      {!isCategoryOverview && (
        <p className="govuk-body">
          <Link
            href={nationalEventHref(event.categorySlug)}
            className="govuk-link"
          >
            More in {category?.title ?? "this category"}
          </Link>
          {" · "}
          <Link
            href="/society-and-culture/national-events"
            className="govuk-link"
          >
            All national events
          </Link>
        </p>
      )}

      {event.relatedLinks && event.relatedLinks.length > 0 && (
        <section className="govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-m">Related</h2>
          <ul className="govuk-list govuk-list--bullet">
            {event.relatedLinks.map((link) => (
              <li key={link.href}>
                {link.external ? (
                  <ExternalLink href={link.href}>{link.text}</ExternalLink>
                ) : (
                  <Link href={link.href} className="govuk-link">
                    {link.text}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!isCategoryOverview && siblings.length > 0 && (
        <section className="govuk-!-margin-bottom-6">
          <h2 className="govuk-heading-m">Other topics in this category</h2>
          <ChevronLinkList
            ariaLabel="Related events"
            items={siblings.slice(0, 6).map((s) => ({
              title: s.title,
              href: nationalEventHref(s.slug),
              description: s.summary,
              meta: s.meta,
            }))}
          />
        </section>
      )}

      <LastUpdated published="2026-07-15" lastUpdated="2026-07-15" />
    </>
  );
}
