import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ChevronLinkList from "@/components/site/ChevronLinkList";
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
        fullWidth
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Services", href: "/services" },
          { text: "A to Z" },
        ]}
        title="Services A to Z"
        lead="An alphabetical index of public service guides on this website. For applications and payments, follow the official links on each guide."
      />

      {services.length === 0 ? (
        <div className="govuk-inset-text">
          <p className="govuk-body">
            No service guides are available in the directory right now. Try the{" "}
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
          <nav className="govuk-!-margin-bottom-6" aria-label="Jump to letter">
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

          <p className="govuk-body-s govuk-!-margin-bottom-6">
            Showing {services.length} service
            {services.length === 1 ? "" : "s"}. You can also{" "}
            <Link href="/services" className="govuk-link">
              filter by topic or organisation
            </Link>
            ,{" "}
            <Link href="/services/popular" className="govuk-link">
              popular services
            </Link>
            , or{" "}
            <Link href="/topics" className="govuk-link">
              browse topics
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
              <ChevronLinkList
                ariaLabel={`Services starting with ${letter}`}
                items={(byLetter.get(letter) ?? []).map((service) => ({
                  title: service.title,
                  href: `/${service.slug}`,
                  description: service.summary,
                }))}
              />
            </section>
          ))}
        </>
      )}
    </>
  );
}
