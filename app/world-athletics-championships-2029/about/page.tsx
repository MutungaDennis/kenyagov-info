import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "About the World Athletics Championships Nairobi 2029",
  description:
    "Learn about the World Athletics Championships Nairobi 2029, including dates, venues, events, athletes, organizers, Nairobi's selection and official announcements.",
};

const topicGroups = [
  {
    heading: "Understand the championships",
    description:
      "Learn how the championships work and find the confirmed arrangements for Nairobi 2029.",
    topics: [
      {
        title: "World Athletics Championships explained",
        href: "/world-athletics-championships-2029/championships-explained",
        description:
          "What the championships are, how often they are held and how they differ from athletics at the Olympic Games.",
      },
      {
        title: "Dates and venues",
        href: "/world-athletics-championships-2029/dates-venues",
        description:
          "Confirmed dates, competition venues, training venues and information about opening and closing ceremonies.",
      },
      {
        title: "Events and competition format",
        href: "/world-athletics-championships-2029/events-competition-format",
        description:
          "Track, field, road and combined events, including heats, qualification rounds, semifinals and finals.",
      },
      {
        title: "Countries and athletes",
        href: "/world-athletics-championships-2029/countries-athletes",
        description:
          "Participating countries, qualification arrangements, confirmed entries and information about the Kenyan team.",
      },
    ],
  },
  {
    heading: "Nairobi, Kenya and World Athletics",
    description:
      "Find out why Nairobi is hosting the championships and what the event means for Kenya and Africa.",
    topics: [
      {
        title: "How Nairobi was selected",
        href: "/world-athletics-championships-2029/nairobi-selection",
        description:
          "The bidding process, World Athletics Council decision and published reasons for selecting Nairobi.",
      },
      {
        title: "Why Nairobi 2029 matters",
        href: "/world-athletics-championships-2029/why-nairobi-2029-matters",
        description:
          "The significance of staging the championships in Africa for the first time and the expected legacy of the event.",
      },
      {
        title: "Kenya and World Athletics",
        href: "/world-athletics-championships-2029/kenya-world-athletics",
        description:
          "Kenya's championship record, notable performances and experience of hosting international athletics events.",
      },
      {
        title: "Previous and future host cities",
        href: "/world-athletics-championships-2029/host-cities",
        description:
          "Countries and cities that have hosted the championships, including Beijing 2027, Nairobi 2029 and Munich 2031.",
      },
    ],
  },
  {
    heading: "Organization and official information",
    description:
      "Understand who is responsible for the championships and where official information is published.",
    topics: [
      {
        title: "Championship organizers",
        href: "/world-athletics-championships-2029/organizers",
        description:
          "The responsibilities of World Athletics, Kenyan institutions, the local organizing committee and other event partners.",
      },
      {
        title: "Official announcements and updates",
        href: "/world-athletics-championships-2029/official-announcements",
        description:
          "Dated announcements from World Athletics, the event organizers and responsible Kenyan public institutions.",
      },
    ],
  },
] as const;

export default function AboutChampionshipsPage() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          {
            text: "World Athletics Championships Nairobi 2029",
            href: "/world-athletics-championships-2029",
          },
          { text: "About the championships" },
        ]}
        title="About the championships"
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            <strong>Some event details have not yet been announced.</strong>{" "}
            Exact dates, venues, participating athletes and the full programme
            will be added after official confirmation.
          </div>

          {topicGroups.map((group) => (
            <section
              key={group.heading}
              aria-labelledby={group.heading
                .toLowerCase()
                .replaceAll(" ", "-")
                .replaceAll(",", "")}
            >
              <h2
                className="govuk-heading-l govuk-!-margin-top-8"
                id={group.heading
                  .toLowerCase()
                  .replaceAll(" ", "-")
                  .replaceAll(",", "")}
              >
                {group.heading}
              </h2>

              <p className="govuk-body">{group.description}</p>

              <ul className="govuk-list govuk-list--spaced">
                {group.topics.map((topic) => (
                  <li key={topic.href}>
                    <Link
                      href={topic.href}
                      className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-bold"
                    >
                      {topic.title}
                    </Link>

                    <p className="govuk-body govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                      {topic.description}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <div className="govuk-inset-text govuk-!-margin-top-8">
            CitizenGuide.KE is an independent civic information platform. It
            is not affiliated with World Athletics, the Government of Kenya or
            the event organizers. Follow the official links provided on this
            website for event applications, payments and transactions.
          </div>
        </div>
      </div>
    </>
  );
}
