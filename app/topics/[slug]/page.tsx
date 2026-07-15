import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "@/components/site/ExternalLink";
import RelatedNav from "@/components/site/RelatedNav";
import { getAllTopicSlugs, getTopicBySlug, topics } from "@/lib/topics";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllTopicSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return { title: "Topic not found" };
  return {
    title: topic.title,
    description: topic.summary,
  };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const otherTopics = topics
    .filter((t) => t.slug !== topic.slug)
    .slice(0, 6)
    .map((t) => ({ text: t.title, href: `/topics/${t.slug}` }));

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Topics", href: "/topics" },
          { text: topic.title },
        ]}
        caption="Topics"
        title={topic.title}
        lead={topic.lead}
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              This page is guidance only. CitizenGuide.KE does not process
              applications or take payments. Use official government portals for
              transactions.
            </p>
          </div>

          {topic.sections.map((section) => (
            <section key={section.heading} className="govuk-!-margin-bottom-6">
              <h2 className="govuk-heading-l">{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="govuk-body">
                  {paragraph}
                </p>
              ))}
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

          {topic.officialLinks && topic.officialLinks.length > 0 && (
            <>
              <h2 className="govuk-heading-l">Official websites</h2>
              <ul className="govuk-list govuk-list--bullet">
                {topic.officialLinks.map((link) => (
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
            </>
          )}

          {topic.relatedServices && topic.relatedServices.length > 0 && (
            <>
              <h2 className="govuk-heading-l">Related on this website</h2>
              <ul className="govuk-list govuk-list--bullet">
                {topic.relatedServices.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="govuk-link">
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <RelatedNav
          title="More topics"
          links={[
            { text: "All topics", href: "/topics" },
            { text: "Services A to Z", href: "/services/a-z" },
            ...otherTopics,
          ]}
        />
      </div>
    </>
  );
}
