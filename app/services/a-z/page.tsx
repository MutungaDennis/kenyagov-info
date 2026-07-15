import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import { client } from "@/sanity/lib/client";

export const metadata: Metadata = {
  title: "Services A to Z",
  description:
    "Alphabetical list of Kenyan public service guides on CitizenGuide.KE.",
};

type ServiceRow = {
  title: string;
  slug: string;
  summary: string;
};

const SERVICES_AZ_QUERY = `*[_type == "governmentService" && defined(slug.current)] | order(title asc) {
  title,
  "slug": slug.current,
  summary
}`;

function letterOf(title: string): string {
  const ch = title.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(ch) ? ch : "#";
}

export default async function ServicesAZPage() {
  let services: ServiceRow[] = [];
  try {
    services = await client.fetch<ServiceRow[]>(SERVICES_AZ_QUERY);
  } catch {
    services = [];
  }

  const byLetter = new Map<string, ServiceRow[]>();
  for (const service of services) {
    if (!service.slug || !service.title) continue;
    const letter = letterOf(service.title);
    const list = byLetter.get(letter) ?? [];
    list.push(service);
    byLetter.set(letter, list);
  }

  const letters = Array.from(byLetter.keys()).sort((a, b) => {
    if (a === "#") return 1;
    if (b === "#") return -1;
    return a.localeCompare(b);
  });

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Services", href: "/services" },
          { text: "A to Z" },
        ]}
        title="Services A to Z"
        lead="An alphabetical index of public service guides on this website. For applications and payments, follow the official links on each guide."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          {services.length === 0 ? (
            <div className="govuk-inset-text">
              <p className="govuk-body">
                No service guides are available in the directory right now. Try
                the{" "}
                <Link href="/services" className="govuk-link">
                  services search
                </Link>{" "}
                or{" "}
                <Link href="/topics" className="govuk-link">
                  browse topics
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <nav
                className="govuk-!-margin-bottom-6"
                aria-label="Jump to letter"
              >
                <p className="govuk-body govuk-!-margin-bottom-2">
                  <strong>Jump to:</strong>
                </p>
                <p className="govuk-body">
                  {letters.map((letter, index) => (
                    <span key={letter}>
                      {index > 0 ? " · " : null}
                      <a className="govuk-link" href={`#letter-${letter}`}>
                        {letter}
                      </a>
                    </span>
                  ))}
                </p>
              </nav>

              <p className="govuk-body-s">
                Showing {services.length} service
                {services.length === 1 ? "" : "s"}. You can also{" "}
                <Link href="/services" className="govuk-link">
                  filter by topic or organisation
                </Link>
                .
              </p>

              {letters.map((letter) => (
                <section
                  key={letter}
                  id={`letter-${letter}`}
                  className="govuk-!-margin-bottom-8"
                >
                  <h2 className="govuk-heading-l">{letter}</h2>
                  <ul className="govuk-list govuk-list--spaced">
                    {(byLetter.get(letter) ?? []).map((service) => (
                      <li key={service.slug}>
                        <Link
                          href={`/${service.slug}`}
                          className="govuk-link govuk-!-font-weight-bold"
                        >
                          {service.title}
                        </Link>
                        {service.summary ? (
                          <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                            {service.summary}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </>
          )}
        </div>

        <div className="govuk-grid-column-one-third">
          <aside role="complementary">
            <h2 className="govuk-heading-m">Related</h2>
            <ul className="govuk-list govuk-list--spaced">
              <li>
                <Link href="/services" className="govuk-link">
                  Services search and filters
                </Link>
              </li>
              <li>
                <Link href="/topics" className="govuk-link">
                  Browse topics
                </Link>
              </li>
              <li>
                <Link href="/ecitizen" className="govuk-link">
                  eCitizen explained
                </Link>
              </li>
              <li>
                <Link href="/huduma-centres" className="govuk-link">
                  Huduma Centres
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
