/**
 * IEBC official general election timeline milestones.
 * Source: IEBC “Campaign period for purposes of Tuesday, 10th August, 2027 General Election”
 * (tpFfOlBLRh.pdf) — https://www.iebc.or.ke/uploads/resources/tpFfOlBLRh.pdf
 *
 * Dates are ISO YYYY-MM-DD for automatic upcoming / happening now / past status.
 */

export type TimelineKind = "deadline" | "period" | "election-day";

export type ElectionTimelineMilestone = {
  id: string;
  /** Short heading for lists and panels */
  title: string;
  /** Full description from IEBC notice (plain language) */
  description: string;
  /** Start date, or single deadline / election day */
  date: string;
  /** End of a period (campaign, nomination window, etc.) */
  endDate?: string;
  kind: TimelineKind;
  /** Optional clock window text (campaign hours, nomination delivery hours) */
  timeNotes?: string;
  /** Order for display within same day (lower first) */
  sortOrder: number;
  year: number;
};

/** Kenya Constitution: general election on second Tuesday of August every 5 years. */
export const GENERAL_ELECTION_2027 = {
  year: 2027,
  electionDate: "2027-08-10",
  label: "Tuesday, 10 August 2027 General Election",
  sourceUrl: "https://www.iebc.or.ke/uploads/resources/tpFfOlBLRh.pdf",
  sourceLabel: "IEBC official timeline (PDF)",
};

/**
 * 2027 general election calendar milestones (IEBC).
 * Sorted by date in utils; sortOrder breaks ties.
 */
export const electionTimeline2027: ElectionTimelineMilestone[] = [
  {
    id: "2027-public-officer-resign",
    title: "Public officers resign to contest",
    description:
      "A public officer who intends to contest in the General Election shall resign from public office within six (6) months before the date of Election, being on or before Tuesday, 9 February 2027.",
    date: "2027-02-09",
    kind: "deadline",
    sortOrder: 10,
    year: 2027,
  },
  {
    id: "2027-party-membership-lists",
    title: "Party membership lists to IEBC",
    description:
      "Political Parties shall submit the Party Membership lists to the Commission on or before Tuesday, 16 March 2027.",
    date: "2027-03-16",
    kind: "deadline",
    sortOrder: 20,
    year: 2027,
  },
  {
    id: "2027-party-primaries-notice",
    title: "Party primaries notice (names, dates, venues)",
    description:
      "Political parties intending to present candidates in the General Election shall submit the names of persons contesting in the party primaries, the date and venues of the primaries on or before Tuesday, 16 March 2027.",
    date: "2027-03-16",
    kind: "deadline",
    sortOrder: 21,
    year: 2027,
  },
  {
    id: "2027-primaries-and-independents",
    title: "Party primaries done; independents leave parties",
    description:
      "A political party intending to present a candidate in the General Election shall conduct its primaries and resolve intra-party disputes on or before Sunday, 9 May 2027. Candidates intending to participate as independent candidates shall not be members of any registered political party by Sunday, 9 May 2027 (at least 3 months before the General Election). Independents shall also submit names and symbols to the Commission on or before Sunday, 9 May 2027.",
    date: "2027-05-09",
    kind: "deadline",
    sortOrder: 30,
    year: 2027,
  },
  {
    id: "2027-campaign-period",
    title: "Campaign period",
    description:
      "The campaign period for purposes of the Tuesday, 10 August 2027 General Election shall commence on Saturday, 29 May 2027 and cease on Saturday, 7 August 2027, being 48 hours before the General Election Day.",
    date: "2027-05-29",
    endDate: "2027-08-07",
    kind: "period",
    timeNotes:
      "Campaign time shall run from 7.00 a.m. to 6.00 p.m. each day during the campaign period.",
    sortOrder: 40,
    year: 2027,
  },
  {
    id: "2027-nomination-of-candidates",
    title: "Nomination of party and independent candidates",
    description:
      "The days for the nomination of Political Party candidates and Independent candidates for the General Election shall be between Saturday, 29 May 2027 and Friday, 11 June 2027. Nomination papers shall be delivered by the candidates to the Chairperson of the Independent Electoral and Boundaries Commission between the hours of eight o’clock in the morning and one o’clock in the afternoon and between the hours of two o’clock and four o’clock in the afternoon at a place designated by the Commission.",
    date: "2027-05-29",
    endDate: "2027-06-11",
    kind: "period",
    timeNotes:
      "Delivery hours: 8.00 a.m.–1.00 p.m. and 2.00 p.m.–4.00 p.m. each nomination day.",
    sortOrder: 41,
    year: 2027,
  },
  {
    id: "2027-nomination-disputes",
    title: "Nomination disputes lodging deadline",
    description:
      "Disputes relating to or arising from nominations shall be determined within ten (10) days of the lodging of the dispute with the Commission. The lodging of the dispute shall not be later than Saturday, 12 June 2027.",
    date: "2027-06-12",
    kind: "deadline",
    sortOrder: 50,
    year: 2027,
  },
  {
    id: "2027-election-agents",
    title: "Election agents submitted to IEBC",
    description:
      "Participating political parties and independent candidates shall appoint and submit to the Commission the name of National, County, Constituency Election Agent and polling station agents on or before Tuesday, 27 July 2027.",
    date: "2027-07-27",
    kind: "deadline",
    sortOrder: 60,
    year: 2027,
  },
  {
    id: "2027-campaign-silence",
    title: "Campaign silence (48 hours before poll)",
    description:
      "Campaigns cease on Saturday, 7 August 2027 — 48 hours before General Election Day.",
    date: "2027-08-07",
    kind: "deadline",
    sortOrder: 70,
    year: 2027,
  },
  {
    id: "2027-general-election-day",
    title: "General Election Day",
    description:
      "If the General Elections are contested, the poll will take place on Tuesday, 10 August 2027 in the respective gazetted electoral areas. An election of the President of the Republic of Kenya shall be held on Tuesday, 10 August 2027.",
    date: "2027-08-10",
    kind: "election-day",
    sortOrder: 80,
    year: 2027,
  },
];

/** All timeline years we hold (extend when IEBC publishes future calendars). */
export const electionTimelinesByYear: Record<
  number,
  ElectionTimelineMilestone[]
> = {
  2027: electionTimeline2027,
};
