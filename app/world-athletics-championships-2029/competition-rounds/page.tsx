import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/site/PageIntro";
import ExternalLink from "../_components/ExternalLink";

export const revalidate = 86400;
export const metadata: Metadata = { title: "Competition rounds and progression", description: "How athletes progress through heats, qualification rounds, semifinals and finals at the World Athletics Championships." };

export default function CompetitionRoundsPage() {
  return (
    <>
      <PageIntro breadcrumbs={[{ text: "Home", href: "/" }, { text: "World Athletics Championships Nairobi 2029", href: "/world-athletics-championships-2029" }, { text: "Events and competition format", href: "/world-athletics-championships-2029/events-competition-format" }, { text: "Competition rounds" }]} title="Competition rounds and progression" />
      <div className="govuk-grid-row"><div className="govuk-grid-column-two-thirds">
        <div className="govuk-inset-text">Round structures and advancement rules will be confirmed in the Nairobi 2029 timetable and entry documents.</div>
        <h2 className="govuk-heading-l">Track rounds</h2>
        <p className="govuk-body">Track events may use preliminary rounds, heats, repechage rounds, semifinals or a direct final. Progression can be based on finishing position, performance or a combination of both.</p>
        <h2 className="govuk-heading-l">Field-event qualification</h2>
        <p className="govuk-body">Jumping and throwing events may use qualification groups. Athletes can advance by achieving an automatic mark or by placing among the required number of best performers.</p>
        <h2 className="govuk-heading-l">Seeding and draws</h2>
        <p className="govuk-body">World rankings, season performances and earlier championship rounds may be used for seeding. Lane, heat, group and competition-order draws follow event rules.</p>
        <h2 className="govuk-heading-l">Automatic and performance qualifiers</h2>
        <p className="govuk-body">Official result displays may distinguish athletes who qualify by place from those who qualify by time, distance, height or another performance rule. Symbols and wording will be explained with the published results.</p>
        <h2 className="govuk-heading-l">Changes and withdrawals</h2>
        <p className="govuk-body">Withdrawals, appeals, disqualifications or schedule changes can alter start lists and progression. Check the latest official list before a session begins.</p>
        <p className="govuk-body"><ExternalLink href="https://worldathletics.org/">World Athletics</ExternalLink> is the authoritative source for competition rules and official results.</p>
        <p className="govuk-body govuk-!-margin-top-8"><Link href="/world-athletics-championships-2029/events-competition-format" className="govuk-link govuk-link--no-visited-state">Back to Events and competition format</Link></p>
      </div></div>
    </>
  );
}
