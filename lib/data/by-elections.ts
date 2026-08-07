/**
 * Kenya by-elections catalogue.
 * Dates drive automatic upcoming / happening now / past classification.
 * Confirm critical details against IEBC notices and the Kenya Gazette.
 */

export type ByElectionSeat =
  | "National Assembly"
  | "Senate"
  | "Member of County Assembly"
  | "Woman Representative"
  | "Governor"
  | "Other";

export type ByElectionCategory = "parliamentary" | "mca" | "other";

export type ByElection = {
  id: string;
  /** Short label, e.g. "Ol Kalou Constituency" */
  area: string;
  county: string;
  seat: ByElectionSeat;
  category: ByElectionCategory;
  /** Poll day (ISO YYYY-MM-DD) */
  date: string;
  /** Optional multi-day end (defaults to date) */
  endDate?: string;
  /** Why the seat fell vacant, if known */
  reason?: string;
  notes?: string;
  year: number;
};

/**
 * Known by-elections (newest first in file; utils re-sort by date).
 * Add new IEBC-gazetted by-elections here — status panels update automatically.
 */
export const byElections: ByElection[] = [
  // —— 2026 ——
  {
    id: "2026-ol-kalou-na",
    area: "Ol Kalou Constituency",
    county: "Nyandarua",
    seat: "National Assembly",
    category: "parliamentary",
    date: "2026-07-16",
    reason: "Vacancy following death of MP David Njuguna Kiaraho",
    year: 2026,
  },
  {
    id: "2026-emurua-dikirr-na",
    area: "Emurua Dikirr Constituency",
    county: "Narok",
    seat: "National Assembly",
    category: "parliamentary",
    date: "2026-05-14",
    reason: "Death of elected leader",
    year: 2026,
  },
  {
    id: "2026-porro-mca",
    area: "Porro Ward",
    county: "Samburu",
    seat: "Member of County Assembly",
    category: "mca",
    date: "2026-05-14",
    reason: "Death of elected leader",
    year: 2026,
  },
  {
    id: "2026-endo-mca",
    area: "Endo Ward",
    county: "Elgeyo Marakwet",
    seat: "Member of County Assembly",
    category: "mca",
    date: "2026-05-14",
    reason: "Death of elected leader",
    year: 2026,
  },
  {
    id: "2026-isiolo-south-na",
    area: "Isiolo South Constituency",
    county: "Isiolo",
    seat: "National Assembly",
    category: "parliamentary",
    date: "2026-01-01",
    reason: "Death of MP Tubi Bidu Mohamed",
    notes: "Exact poll day may be refined when IEBC notice is available; listed by year for historical context.",
    year: 2026,
  },
  {
    id: "2026-west-kabras-mca",
    area: "West Kabras Ward",
    county: "Kakamega",
    seat: "Member of County Assembly",
    category: "mca",
    date: "2026-03-01",
    year: 2026,
    notes: "Approximate period within 2026; refine from IEBC gazette when available.",
  },

  // —— 2025 ——
  {
    id: "2025-kasipul-na",
    area: "Kasipul Constituency",
    county: "Homa Bay",
    seat: "National Assembly",
    category: "parliamentary",
    date: "2025-11-27",
    reason: "Death of MP Charles Ong’ondo Were",
    year: 2025,
  },
  {
    id: "2025-baringo-north-na",
    area: "Baringo North Constituency",
    county: "Baringo",
    seat: "National Assembly",
    category: "parliamentary",
    date: "2025-11-27",
    reason: "Death of MP William Cheptumo",
    year: 2025,
  },
  {
    id: "2025-malava-na",
    area: "Malava Constituency",
    county: "Kakamega",
    seat: "National Assembly",
    category: "parliamentary",
    date: "2025-11-27",
    reason: "Death of MP Malulu Injendi",
    year: 2025,
  },
  {
    id: "2025-magarini-na",
    area: "Magarini Constituency",
    county: "Kilifi",
    seat: "National Assembly",
    category: "parliamentary",
    date: "2025-06-01",
    reason: "Court nullification",
    year: 2025,
    notes: "Month approximate pending gazette confirmation.",
  },
  {
    id: "2025-kariobangi-north-mca",
    area: "Kariobangi North Ward",
    county: "Nairobi",
    seat: "Member of County Assembly",
    category: "mca",
    date: "2025-08-01",
    year: 2025,
  },
  {
    id: "2025-chewani-mca",
    area: "Chewani Ward",
    county: "Tana River",
    seat: "Member of County Assembly",
    category: "mca",
    date: "2025-08-01",
    year: 2025,
  },
  {
    id: "2025-kabuchai-mca",
    area: "Kabuchai Ward",
    county: "Bungoma",
    seat: "Member of County Assembly",
    category: "mca",
    date: "2025-08-01",
    year: 2025,
  },

  // —— 2023 / 2022 ——
  {
    id: "2023-banissa-na",
    area: "Banissa Constituency",
    county: "Mandera",
    seat: "National Assembly",
    category: "parliamentary",
    date: "2023-07-01",
    reason: "Death of MP Kulow Maalim Hassan",
    year: 2023,
  },
  {
    id: "2023-elgeyo-marakwet-senate",
    area: "Elgeyo Marakwet County",
    county: "Elgeyo Marakwet",
    seat: "Senate",
    category: "parliamentary",
    date: "2023-01-05",
    year: 2023,
  },
  {
    id: "2022-bungoma-senate",
    area: "Bungoma County",
    county: "Bungoma",
    seat: "Senate",
    category: "parliamentary",
    date: "2022-12-08",
    year: 2022,
  },
];
