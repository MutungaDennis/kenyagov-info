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
  {
    title: "Tickets",
    href: "/world-athletics-championships-2029/tickets",
    description:
      "Find out when tickets go on sale, where to buy them, ticket types, prices, concessions and how to avoid ticket scams.",
  },
  {
    title: "Travelling to Kenya",
    href: "/world-athletics-championships-2029/travelling-to-kenya",
    description:
      "Check passport, electronic travel authorisation, customs, health and entry requirements before travelling to Kenya.",
  },
  {
    title: "Getting to Nairobi",
    href: "/world-athletics-championships-2029/getting-to-nairobi",
    description:
      "Plan your journey to Nairobi by air, rail, road or regional bus, including airport and station transfers.",
  },
  {
    title: "Getting to the venues",
    href: "/world-athletics-championships-2029/getting-to-the-venues",
    description:
      "Find venue locations, public transport, event shuttles, parking, drop-off points, road closures and travel updates.",
  },
  {
    title: "Accommodation",
    href: "/world-athletics-championships-2029/accommodation",
    description:
      "Understand where to stay, journey times to the venues, accessible accommodation and how to avoid booking scams.",
  },
  {
    title: "Competition programme and results",
    href: "/world-athletics-championships-2029/programme-and-results",
    description:
      "Check competition dates, morning and evening sessions, start lists, Kenyan athletes, results and the medal table.",
  },
  {
    title: "Information for spectators in Kenya",
    href: "/world-athletics-championships-2029/spectators-in-kenya",
    description:
      "Find ticket, payment, inter-county travel, public transport, parking, accommodation and broadcast information for spectators in Kenya.",
  },
  {
    title: "Stadium entry and spectator rules",
    href: "/world-athletics-championships-2029/stadium-entry-and-spectator-rules",
    description:
      "Check gate opening times, security screening, bag limits, prohibited items, photography rules and conditions of entry.",
  },
  {
    title: "Accessibility",
    href: "/world-athletics-championships-2029/accessibility",
    description:
      "Find information about accessible tickets, seating, transport, parking, entrances, toilets and assistance at the venues.",
  },
  {
    title: "Safety, health and emergencies",
    href: "/world-athletics-championships-2029/safety-health-and-emergencies",
    description:
      "Get practical safety and health guidance, emergency contacts, medical information and help with a lost passport or property.",
  },
  {
    title: "Money, payments and connectivity",
    href: "/world-athletics-championships-2029/money-payments-and-connectivity",
    description:
      "Learn about Kenya shillings, cards, mobile money, currency exchange, mobile networks, SIM cards, internet access and electricity.",
  },
  {
    title: "Weather and what to bring",
    href: "/world-athletics-championships-2029/weather-and-what-to-bring",
    description:
      "Check seasonal weather, current forecasts and practical guidance on clothing, sun protection and permitted items.",
  },
  {
    title: "Visiting Nairobi and Kenya",
    href: "/world-athletics-championships-2029/visiting-nairobi-and-kenya",
    description:
      "Plan activities in Nairobi or travel elsewhere in Kenya, and find guidance on local customs and responsible tourism.",
  },
  {
    title: "Volunteering, jobs and business opportunities",
    href: "/world-athletics-championships-2029/volunteering-jobs-and-business",
    description:
      "Find official volunteering, temporary employment, procurement, tender and local business opportunities, and learn how to identify fraud.",
  },
  {
    title: "Media and professional participants",
    href: "/world-athletics-championships-2029/media-and-professional-participants",
    description:
      "Information for journalists, broadcasters, photographers, team officials and other accredited professionals.",
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