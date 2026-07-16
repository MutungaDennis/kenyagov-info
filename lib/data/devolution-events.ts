/**
 * Council of Governors (CoG) — Devolution Conference editions
 * and Devolution Sensitisation Week (DSW) editions.
 * Verified institutional dates, venues and themes as supplied for this site.
 */

export type DatePrecision = "exact" | "year-only";

export type DevolutionConferenceEdition = {
  edition: number;
  label: string;
  startDate: string;
  endDate: string;
  hostCounty: string;
  venue: string;
  theme: string;
  notes?: string;
};

export type DswEdition = {
  edition: number;
  label: string;
  startDate: string;
  endDate: string;
  hostCounty: string;
  venue: string;
  notes?: string;
  precision: DatePrecision;
};

/** Biennial CoG Devolution Conference editions (1st–9th). */
export const devolutionConferences: DevolutionConferenceEdition[] = [
  {
    edition: 1,
    label: "1st",
    startDate: "2014-04-03",
    endDate: "2014-04-04",
    hostCounty: "Kwale",
    venue: "Leisure Lodge Resort, Diani",
    theme:
      "One Year into Devolution: Celebrating the Milestones, Confronting the Challenges and Re-affirming our Commitment to Devolution",
  },
  {
    edition: 2,
    label: "2nd",
    startDate: "2015-04-21",
    endDate: "2015-04-24",
    hostCounty: "Kisumu",
    venue: "Tom Mboya Labour College",
    theme:
      "Appreciating the Gains, Assessing the Challenges and Navigating the Future of Devolution",
  },
  {
    edition: 3,
    label: "3rd",
    startDate: "2016-04-19",
    endDate: "2016-04-23",
    hostCounty: "Meru",
    venue: "Meru National Polytechnic",
    theme:
      "The Promise of Devolution: Consolidating the Gains after Transition and Looking into the Future",
  },
  {
    edition: 4,
    label: "4th",
    startDate: "2017-03-06",
    endDate: "2017-03-09",
    hostCounty: "Nakuru",
    venue: "Kenya Wildlife Service Training Institute (KWSTI), Naivasha",
    theme: "Devolution Transforming Lives: Tell Your Story!",
  },
  {
    edition: 5,
    label: "5th",
    startDate: "2018-04-23",
    endDate: "2018-04-27",
    hostCounty: "Kakamega",
    venue: "Kakamega High School",
    theme:
      "Sustainable, productive, effective and efficient governments for results delivery",
  },
  {
    edition: 6,
    label: "6th",
    startDate: "2019-03-04",
    endDate: "2019-03-08",
    hostCounty: "Kirinyaga",
    venue: "Kirinyaga University",
    theme: "Deliver. Transform. Measure. Remaining Accountable",
  },
  {
    edition: 7,
    label: "7th",
    startDate: "2021-11-23",
    endDate: "2021-11-26",
    hostCounty: "Makueni",
    venue: "Makueni Boys High School",
    theme: "Multi-Level Governance for Climate Action",
    notes:
      "Held in late 2021 after no conference in 2020 (COVID-19 public health restrictions).",
  },
  {
    edition: 8,
    label: "8th",
    startDate: "2023-08-15",
    endDate: "2023-08-19",
    hostCounty: "Uasin Gishu",
    venue: "Eldoret Sports Club",
    theme: "10 Years of Devolution: The Past, Present and The Future",
  },
  {
    edition: 9,
    label: "9th",
    startDate: "2025-08-12",
    endDate: "2025-08-15",
    hostCounty: "Homa Bay",
    venue: "Homa Bay High School",
    theme:
      "For the People, For Prosperity: Devolution as a Catalyst for Equity, Inclusion, and Social Justice",
  },
];

/**
 * Devolution Sensitisation Week (DSW).
 * Editions 2–3: host year/county verified; multi-day span not fixed in source
 * (precision: year-only). Edition 4 has exact dates for 2026.
 */
export const dswEditions: DswEdition[] = [
  {
    edition: 1,
    label: "1st",
    startDate: "2017-11-29",
    endDate: "2017-12-01",
    hostCounty: "Nairobi",
    venue: "Kencom Fountain area, Nairobi",
    notes: "Inaugural pilot phase.",
    precision: "exact",
  },
  {
    edition: 2,
    label: "2nd",
    startDate: "2018-01-01",
    endDate: "2018-12-31",
    hostCounty: "Mombasa",
    venue: "Mombasa County",
    notes:
      "Hosted in Mombasa County to showcase county development milestones and civic education. Precise multi-day session dates for 2018 were not fixed in the source pack used for this site.",
    precision: "year-only",
  },
  {
    edition: 3,
    label: "3rd",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    hostCounty: "Homa Bay",
    venue: "Homa Bay County",
    notes:
      "Hosted in Homa Bay County in tandem with the build-up to the 9th Biennial Devolution Conference, to capture public feedback. Precise multi-day session dates for 2025 were not fixed beyond host county and context.",
    precision: "year-only",
  },
  {
    edition: 4,
    label: "4th",
    startDate: "2026-07-27",
    endDate: "2026-08-01",
    hostCounty: "Garissa",
    venue: "Young Muslim Primary School, Garissa County",
    notes:
      "Finalised by the Council of Governors: 27 July – 1 August 2026.",
    precision: "exact",
  },
];

export const devolutionConferenceNotes = {
  covid2020:
    "No Devolution Conference took place in 2020 because of public health restrictions during the COVID-19 pandemic. That pushed the 7th edition to late 2021.",
  biennial:
    "After the 2021 event, the Council of Governors moved away from an annual format. The conference is intended to take place about once every two years so counties have more time to implement resolutions. The next conference after the 9th (August 2025) would typically fall in 2027; a host county, venue and theme have not been announced in the sources used for this page.",
  organiser:
    "Convened under the Council of Governors (CoG) with national government, county governments and partners. Public access and programmes are set for each edition.",
};
