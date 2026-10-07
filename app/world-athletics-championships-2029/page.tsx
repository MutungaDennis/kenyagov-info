import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import styles from "./page.module.css";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "World Athletics Championships Nairobi 2029",
  description:
    "Information about the World Athletics Championships Nairobi 2029, including tickets, travel to Kenya, venues, transport, accommodation, accessibility and spectator guidance.",
};

const championshipTopics = [
  {
    title: "About the championships",
    href: "/world-athletics-championships-2029/about",
    description:
      "Find confirmed information about the event, including dates, venues, participating countries, organizers and official announcements.",
  },
] as const;

export default function WorldAthleticsChampionships2029Page() {
  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "World Athletics Championships Nairobi 2029" },
        ]}
        title="World Athletics Championships Nairobi 2029"
        lead="Information for people in Kenya and visitors from East Africa, Africa and around the world who are planning to attend the championships."
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-inset-text">
            Nairobi will host the World Athletics Championships in September
            2029. Exact competition dates, ticket arrangements and the full
            programme have not yet been announced. This guide will be updated
            as official information becomes available.
          </div>

          <h2 className="govuk-heading-l">Topics</h2>

          <ul className={`govuk-list ${styles.topicList}`}>
            {championshipTopics.map((topic) => (
              <li className={styles.topicItem} key={topic.href}>
                <Link
                  href={topic.href}
                  className={`${styles.topicLink} govuk-link--no-visited-state`}
                >
                  <span className={styles.topicHeading}>
                    <span className={styles.topicTitle}>{topic.title}</span>
                    <span className={styles.chevron} aria-hidden="true">
                      ›
                    </span>
                  </span>

                  <span className={styles.topicDescription}>
                    {topic.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="govuk-inset-text govuk-!-margin-top-8">
            CitizenGuide.KE is an independent civic information platform. It
            is not affiliated with World Athletics, the Government of Kenya or
            the event organizers. Use the official services linked from this
            guide for applications, payments, tickets and accreditation.
          </div>
        </div>
      </div>
    </>
  );
}