/**
 * IEBC Election Operation Plan (EOP) 2025-2027 - Appendix I: Implementation Timelines.
 * Activity rows live in public/data/election-eop.json (not in the Worker bundle).
 */

import { loadStaticJson } from "@/lib/data/load-static-json";

export type EopActivity = {
  /** Appendix serial (e.g. "4.21", "15.2.4") */
  ref: string;
  title: string;
  /** ISO start date when known */
  startDate: string | null;
  /** ISO end / finish date when known */
  endDate: string | null;
  /** Published duration in days, if given */
  durationDays: number | null;
  /** Top-level appendix section id (1-22) */
  sectionId: string;
  /** Optional mid-level group (e.g. "2.1", "15.2") */
  subsectionId?: string;
  /**
   * Whether voters, candidates, parties, media or observers typically need this date.
   * Used to surface key public dates without hiding the full operational plan.
   */
  publicInterest: boolean;
};

export type EopSection = {
  id: string;
  title: string;
  summary: string;
  publicInterest: boolean;
};

export const EOP_META = {
  title: "Election Operation Plan 2025-2027",
  appendix: "Appendix I: EOP Implementation Timelines",
  electionDate: "2027-08-10",
  electionLabel: "Tuesday, 10 August 2027 General Election",
  sourceUrl: "https://www.iebc.or.ke/uploads/resources/tpFfOlBLRh.pdf",
  sourceLabel: "IEBC official timeline PDF",
  description:
    "EOP timelines for each activity during the General Election, including start and end dates.",
} as const;

export const EOP_SECTIONS: EopSection[] = [
  {
    "id": "1",
    "title": "Election campaign financing",
    "summary": "Spending limits, campaign finance regulations, and expenditure reports that parties and candidates must file.",
    "publicInterest": true
  },
  {
    "id": "2",
    "title": "Nomination",
    "summary": "Party primaries, independent candidacy steps, and presidential supporter verification before official nomination.",
    "publicInterest": true
  },
  {
    "id": "3",
    "title": "Registration of candidates",
    "summary": "When candidates for each office submit nomination papers, dispute resolution, and gazettement of nominees.",
    "publicInterest": true
  },
  {
    "id": "4",
    "title": "Register of voters",
    "summary": "Continuous and enhanced voter registration, biometric verification, audit of the register, and certification before election day.",
    "publicInterest": true
  },
  {
    "id": "5",
    "title": "Party lists",
    "summary": "Special seat (party list) preparation, certification by the Registrar, publication, and allocation after the poll.",
    "publicInterest": true
  },
  {
    "id": "6",
    "title": "Agents",
    "summary": "Deadlines for party and candidate agents and agent training before polling day.",
    "publicInterest": true
  },
  {
    "id": "7",
    "title": "General election operations",
    "summary": "Gazettement of the election, returning officers, tallying centres, polling stations, and Election Day.",
    "publicInterest": true
  },
  {
    "id": "8",
    "title": "General election staff training",
    "summary": "Recruitment and training of temporary election officials, from national trainers down to polling clerks.",
    "publicInterest": false
  },
  {
    "id": "9",
    "title": "General election logistics",
    "summary": "Distribution of materials, ballot printing and packaging, and reverse logistics after the poll.",
    "publicInterest": false
  },
  {
    "id": "10",
    "title": "Results management",
    "summary": "Counting at polling stations, tallying, certificates of election, gazettement, and party-list seat allocation.",
    "publicInterest": true
  },
  {
    "id": "11",
    "title": "Election petitions",
    "summary": "Filing and determination windows for presidential, parliamentary and county election petitions.",
    "publicInterest": true
  },
  {
    "id": "12",
    "title": "Voter education and outreach",
    "summary": "Voter education materials, registration drives, biometric verification education, and outreach to marginalised groups and the diaspora.",
    "publicInterest": true
  },
  {
    "id": "13",
    "title": "Partnerships and stakeholder engagement",
    "summary": "Partnerships with agencies, counties, diaspora offices, youth forums and election technical assistance providers.",
    "publicInterest": false
  },
  {
    "id": "14",
    "title": "Election observation",
    "summary": "Accreditation of long- and short-term observers, observer kits, briefings and the national election conference.",
    "publicInterest": true
  },
  {
    "id": "15",
    "title": "Internal and external communications",
    "summary": "How IEBC plans to communicate with the public, media, and its own staff during the electoral cycle.",
    "publicInterest": true
  },
  {
    "id": "16",
    "title": "Election risk and security management",
    "summary": "Risk frameworks, inter-agency security coordination, and training of security officers on electoral security.",
    "publicInterest": false
  },
  {
    "id": "17",
    "title": "Data protection",
    "summary": "Data protection framework review, staff training and commission data mapping.",
    "publicInterest": false
  },
  {
    "id": "18",
    "title": "Internal audit",
    "summary": "Internal audit framework and regular assurance audits of Commission processes.",
    "publicInterest": false
  },
  {
    "id": "19",
    "title": "Information communication and technology",
    "summary": "KIEMS kits, election technology, results transmission network, open day and technical support for the 2027 poll.",
    "publicInterest": true
  },
  {
    "id": "20",
    "title": "Finance",
    "summary": "Multi-year budget planning and engagement with the National Treasury, Parliament and development partners for election funding.",
    "publicInterest": false
  },
  {
    "id": "21",
    "title": "Procurement, warehousing and logistics",
    "summary": "Procurement plans, stock-taking, disposal of obsolete materials and procurement of election materials and services.",
    "publicInterest": false
  },
  {
    "id": "22",
    "title": "Research, strategy, planning and development",
    "summary": "Monitoring and evaluation, research, post-election evaluation and results/observer report compendia.",
    "publicInterest": false
  }
];

export const EOP_SUBSECTION_LABELS: Record<string, string> = {
  "2.1": "Political party candidates",
  "2.2": "Independent candidates",
  "2.3": "Verification of supporters for presidential candidates",
  "15.1": "Internal communications",
  "15.2": "External communications"
};

export type EopJsonBundle = {
  activities: EopActivity[];
  sections?: EopSection[];
  subsectionLabels?: Record<string, string>;
  meta?: typeof EOP_META;
};

let activitiesCache: EopActivity[] | null = null;

/** Load ~280 EOP activities without embedding them in the Worker bundle. */
export async function loadEopActivities(): Promise<EopActivity[]> {
  if (activitiesCache) return activitiesCache;
  const data = await loadStaticJson<EopJsonBundle>("data/election-eop.json");
  activitiesCache = data.activities ?? [];
  return activitiesCache;
}

/** Empty at module init for bundle size. Prefer loadEopActivities(). */
export const eopActivities2027: EopActivity[] = [];

export const eopActivitiesByElection: Record<number, EopActivity[]> = {
  2027: eopActivities2027,
};
