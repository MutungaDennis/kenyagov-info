/**
 * Agricultural Society of Kenya (ASK) — shows calendar and branch profiles.
 * Source: ASK public calendar and branch pages (2026).
 * ASK is a private society (Societies Act), not a state corporation; it works
 * closely with government and may receive public support for shows.
 */

export type AskShowTier =
  | "international"
  | "national"
  | "regional"
  | "satellite"
  | "yfck"
  | "meeting"
  | "contest"
  | "conference";

export type AskFeeRow = {
  item: string;
  amount: string;
  note?: string;
};

export type AskShowProfile = {
  slug: string;
  name: string;
  shortName?: string;
  tier: AskShowTier;
  /** Town / primary place name */
  location: string;
  countiesServed?: string[];
  history?: string[];
  locationNotes?: string[];
  standRates?: AskFeeRow[];
  gateCharges?: AskFeeRow[];
  otherCharges?: AskFeeRow[];
  membership?: AskFeeRow[];
  notes?: string[];
  /** Link to more on this site if any */
  relatedHref?: string;
};

export type AskCalendarEvent = {
  id: string;
  /** Display name from ASK calendar */
  name: string;
  year: number;
  /** ISO date YYYY-MM-DD */
  startDate: string;
  endDate: string;
  venue: string;
  /** Town label from calendar */
  place: string;
  tier: AskShowTier;
  /** Links to branch/profile slug when available */
  profileSlug?: string;
  calendarOrder: number;
};

/** 2026 ASK national theme (English + Kiswahili from ASK calendar). */
export const askTheme2026 = {
  year: 2026,
  english:
    "Promoting Climate Smart Agriculture and Trade Initiatives for Sustainable Economic Growth",
  kiswahili:
    "Ukuzaji wa ukulima unaozingatia hali ya hewa thabiti na mipango mahususi ya biashara ili kudumisha uchumi endelevu",
  sourceNote:
    "Calendar of Events for the Year 2026 as published by the Agricultural Society of Kenya.",
};

/**
 * Branch / show profiles (history, rates where published).
 * Satellite shows without published detail still have stubs.
 */
export const askShowProfiles: AskShowProfile[] = [
  // —— International ——
  {
    slug: "mombasa-international-show",
    name: "Mombasa International Show",
    shortName: "M.I.S",
    tier: "international",
    location: "Mombasa",
    history: [
      "The Mombasa International Show (M.I.S) was established in 1903 and is situated on the North Coast of Mombasa.",
      "The showground is about 20 km from Moi International Airport.",
      "M.I.S was elevated in 2002 to international status to attract investors and players in agriculture, trade and tourism.",
    ],
    locationNotes: [
      "North Coast of the coastal resort city of Mombasa",
      "Approximately 20 km from Moi International Airport",
    ],
    standRates: [
      {
        item: "Closed space — large",
        amount: "KSh 60,000 + VAT",
      },
      {
        item: "Closed space — medium",
        amount: "KSh 40,000 + VAT",
      },
      {
        item: "Closed space — small",
        amount: "KSh 30,000 + VAT",
      },
      {
        item: "Open space — 15 ft × 15 ft",
        amount: "KSh 100,000 + VAT",
      },
      {
        item: "Open space — 25 ft × 25 ft",
        amount: "KSh 150,000 + VAT",
      },
      {
        item: "Open space — 50 ft × 50 ft",
        amount: "KSh 180,000 + VAT",
      },
      {
        item: "Open space — 75 ft × 75 ft",
        amount: "KSh 250,000 + VAT",
      },
      {
        item: "Open space — 90 ft × 90 ft",
        amount: "KSh 300,000 + VAT",
      },
      {
        item: "International (foreign) exhibitors",
        amount: "USD 150 per m²",
      },
      {
        item: "Society buildings / local owner-occupier",
        amount: "Depends on location and size (e.g. CBD vs periphery)",
      },
    ],
    gateCharges: [
      {
        item: "Perimeter adult ticket",
        amount: "KSh 300 per person per day",
      },
      {
        item: "Special party adult ticket",
        amount: "KSh 300 per person per day",
        note: "As published in branch schedule; confirm with organiser",
      },
      {
        item: "Special party / student",
        amount: "KSh 250 per student per day",
      },
      {
        item: "Tattoo (event programme item)",
        amount: "KSh 150 per person per day",
      },
      {
        item: "V.I.P car parking",
        amount: "KSh 3,000 per vehicle per day",
      },
    ],
    notes: [
      "Central Business District (CBD) stand premiums apply for prime locations next to the arena.",
      "Pre-show tickets, trade attendant packs, child tickets and vehicle stickers are charged per the branch schedule — confirm the current year with ASK Mombasa before budgeting.",
      "Fees can change; treat published amounts as guidance and verify with the branch.",
    ],
  },
  {
    slug: "nairobi-international-trade-fair",
    name: "Nairobi International Trade Fair",
    shortName: "N.I.T.F",
    tier: "international",
    location: "Nairobi",
    history: [
      "The Nairobi Branch of the Society is referred to as the Nairobi International Trade Fair.",
      "It was established as the East African Agricultural and Horticultural Society (EAA & HS) in 1901. The first show was held at the Jeevanjee Gardens and market in 1902.",
      "N.I.T.F became a Trade Fair in 2002 and offers opportunities for regional, continental and global exhibitors.",
    ],
    locationNotes: [
      "Jamhuri Park, about 10 km from the city centre",
      "Approximately 30 km from Jomo Kenyatta International Airport",
      "About 15 km from Wilson Airport",
      "About 30 km from the Standard Gauge Railway Syokimau Terminus",
    ],
    notes: [
      "Typically a seven-day event running from late September to early October annually (see calendar for exact 2026 dates).",
      "Often described as the largest trade fair of its kind in the East African region — scale varies by year.",
      "Stand and gate charges are published by the Nairobi branch for each edition; confirm current rates with ASK.",
    ],
    relatedHref:
      "/society-and-culture/national-events/nairobi-international-trade-fair",
  },

  // —— National ——
  {
    slug: "central-kenya-national-show",
    name: "Central Kenya National Show (Nyeri)",
    shortName: "Nyeri",
    tier: "national",
    location: "Nyeri",
    countiesServed: ["Nyeri", "Nyandarua", "Kirinyaga", "Murang'a", "Kiambu"],
    history: [
      "A.S.K Central Kenya National Show started in 1968 at Ruringu Stadium and moved to Kabiruini Showground in 1997.",
      "Elevated to national status in 2004 to serve Nyeri, Nyandarua, Kirinyaga, Murang'a and Kiambu counties.",
    ],
    locationNotes: [
      "Along the Nyeri–Nyahururu road, about 6 km from Nyeri town",
      "Near Dedan Kimathi University of Technology",
      "About 2 km from Nyaribo airstrip",
    ],
    standRates: [
      { item: "7.5 ft × 7.5 ft", amount: "KSh 51,920" },
      { item: "10 ft × 15 ft", amount: "KSh 86,440" },
      { item: "15 ft × 15 ft", amount: "KSh 103,840" },
      { item: "20 ft × 20 ft", amount: "KSh 121,240" },
      { item: "30 ft × 30 ft", amount: "KSh 156,040" },
      { item: "50 ft × 50 ft", amount: "KSh 190,840" },
    ],
    gateCharges: [
      { item: "Adult", amount: "KSh 300" },
      { item: "Child", amount: "KSh 250" },
      { item: "Special party — adult", amount: "KSh 250" },
      { item: "Special party — child", amount: "KSh 200" },
    ],
    otherCharges: [
      { item: "Theme interpretation", amount: "KSh 2,000" },
      { item: "Conservancy fee", amount: "KSh 6,000" },
      { item: "Essential sticker", amount: "KSh 3,000" },
      { item: "Catalogue fee", amount: "KSh 1,000" },
      { item: "Pre-show sticker", amount: "KSh 500" },
      {
        item: "Trade exhibitors judging fee (per class, optional)",
        amount: "KSh 1,500",
      },
      { item: "Trade attendant tickets", amount: "KSh 800" },
    ],
  },
  {
    slug: "meru-national-show",
    name: "Meru National Show",
    shortName: "Meru",
    tier: "national",
    location: "Meru",
    countiesServed: ["Meru", "Tharaka-Nithi", "Isiolo"],
    history: [
      "Started in 1968 at Kinoru Stadium; moved to Gitoro Showground in 1990.",
    ],
    locationNotes: [
      "Along the Meru–Nanyuki road, about 4 km from Meru town",
    ],
    standRates: [
      { item: "10 ft × 10 ft", amount: "KSh 49,300" },
      { item: "15 ft × 15 ft", amount: "KSh 55,100" },
      { item: "25 ft × 25 ft", amount: "KSh 66,700" },
      { item: "30 ft × 30 ft", amount: "KSh 78,300" },
      { item: "50 ft × 50 ft", amount: "KSh 84,100" },
      { item: "75 ft × 75 ft", amount: "KSh 95,700" },
      { item: "90 ft × 90 ft", amount: "KSh 124,120" },
    ],
    gateCharges: [
      { item: "Perimeter adult", amount: "KSh 300" },
      { item: "Perimeter child", amount: "KSh 250" },
      { item: "Special party adult", amount: "KSh 250" },
      { item: "Special party child", amount: "KSh 200" },
      { item: "Trade attendant", amount: "KSh 900" },
      { item: "Pre-show", amount: "KSh 250" },
      { item: "Essential sticker", amount: "KSh 3,000" },
    ],
  },
  {
    slug: "nakuru-national-agricultural-show",
    name: "Nakuru National Agricultural Show",
    shortName: "Nakuru",
    tier: "national",
    location: "Nakuru",
    history: [
      "Started in 1920 as the third branch of the Agricultural and Horticultural Society of Kenya.",
      "The area has a high concentration of large-scale farming; the show is near Egerton University and is linked with the Kenya Livestock Breeders Organization (K.L.B.O) headquarters.",
    ],
    locationNotes: [
      "About 1 km north of Nakuru town",
      "Approximately 160 km from Jomo Kenyatta International Airport, Nairobi",
    ],
    standRates: [
      { item: "10 ft × 10 ft", amount: "KSh 89,000" },
      { item: "15 ft × 15 ft", amount: "KSh 100,920" },
      { item: "25 ft × 25 ft", amount: "KSh 112,520" },
      { item: "30 ft × 30 ft", amount: "KSh 124,120" },
      {
        item: "50 ft × 50 ft",
        amount: "KSh 135,720",
        note: "Published figure may be rounded; confirm with branch",
      },
    ],
    gateCharges: [
      { item: "Adult", amount: "KSh 300" },
      { item: "Child", amount: "KSh 250" },
      { item: "Special party adult", amount: "KSh 250" },
      { item: "Special party child", amount: "KSh 200" },
      { item: "Y.F.C.K adult", amount: "KSh 250" },
      { item: "Y.F.C.K child", amount: "KSh 200" },
    ],
  },
  {
    slug: "kisumu-national-show",
    name: "Kisumu National Show",
    shortName: "Kisumu",
    tier: "national",
    location: "Kisumu",
    history: [
      "Established in 1966 at Kisumu Municipal Stadium; relocated to Mamboleo Showground in 1987.",
      "Elevated to regional status in 2010; attracts exhibitors and visitors from neighbouring East African countries.",
    ],
    locationNotes: ["Mamboleo Showground, Kisumu"],
    standRates: [
      { item: "15 ft × 15 ft", amount: "KSh 94,540" },
      { item: "30 ft × 30 ft", amount: "KSh 98,020" },
      { item: "40 ft × 40 ft", amount: "KSh 118,900" },
      { item: "50 ft × 50 ft", amount: "KSh 153,700" },
    ],
    gateCharges: [
      { item: "Perimeter adult", amount: "KSh 300" },
      {
        item: "Perimeter child / special party rates",
        amount: "Confirm with branch",
        note: "Published schedule incomplete on source page",
      },
    ],
  },
  {
    slug: "kitale-national-show",
    name: "Kitale National Show (North Rift)",
    shortName: "Kitale",
    tier: "national",
    location: "Kitale",
    countiesServed: ["Trans Nzoia", "West Pokot", "Turkana"],
    history: [
      "First held in 1956 under chairmanship of H.T. Lloyd; officially opened by Governor Sir Evelyn Baring in 1957.",
      "Elevated to national show status in 1999; name changed from Kitale Show to North Rift National Show.",
    ],
    locationNotes: [
      "About 1 km from Kitale town along the Eldoret–Kitale highway at the Lodwar junction",
      "About 8 km from Kitale airstrip",
      "Between Mt Elgon and the Cherangani hills",
    ],
    standRates: [
      { item: "Open space", amount: "KSh 15 per square ft" },
      { item: "Own occupier building", amount: "KSh 20 per square ft" },
      { item: "Society-owned building", amount: "KSh 25 per square ft" },
      { item: "Small tent 10 ft × 10 ft", amount: "KSh 30,000" },
      { item: "Medium tent 20 ft × 20 ft", amount: "KSh 50,000" },
      { item: "Large tent 30 ft × 30 ft", amount: "KSh 80,000" },
    ],
    gateCharges: [
      { item: "Perimeter adult", amount: "KSh 300" },
      { item: "Perimeter child", amount: "KSh 250" },
      { item: "Special party adult", amount: "KSh 250" },
      { item: "Special party child", amount: "KSh 200" },
      { item: "Y.F.C.K adult", amount: "KSh 250" },
      { item: "Y.F.C.K child", amount: "KSh 200" },
      { item: "Trade attendant", amount: "KSh 1,100" },
      { item: "Essential sticker", amount: "KSh 3,000" },
      { item: "Daily essential sticker", amount: "KSh 1,000" },
    ],
  },
  {
    slug: "eldoret-national-show",
    name: "Eldoret National Show",
    shortName: "Eldoret",
    tier: "national",
    location: "Eldoret",
    history: [
      "First Eldoret Show held in 1925; became the fourth branch of A.S.K after Nairobi and Nakuru.",
    ],
    locationNotes: [
      "About 8 km from Eldoret town along the Kisumu Road",
      "About 10 km from Eldoret airport",
    ],
    standRates: [
      { item: "Extra large plots (100 × 100) ft", amount: "KSh 208,800" },
      { item: "Large plots (75 × 75) ft", amount: "KSh 174,000" },
      { item: "Medium plots (50 × 50) ft", amount: "KSh 139,200" },
      { item: "Semi-medium plots (25 × 25) ft", amount: "KSh 92,800" },
      { item: "Small plots (15 × 15) ft", amount: "KSh 63,800" },
      { item: "Extra small plots (10 × 10) ft", amount: "KSh 46,400" },
      { item: "Collaborator / partnership", amount: "KSh 34,800" },
    ],
    otherCharges: [
      {
        item: "Water charges",
        amount: "KSh 10,000 or KSh 5,000",
      },
      { item: "Sales levy", amount: "KSh 15,000" },
      { item: "Theme interpretation", amount: "KSh 3,800" },
      { item: "Judging per class", amount: "KSh 2,320" },
    ],
    gateCharges: [
      { item: "Perimeter adult", amount: "KSh 300" },
      { item: "Perimeter child", amount: "KSh 250" },
      { item: "Special party adult", amount: "KSh 250" },
      { item: "Special party child", amount: "KSh 200" },
      { item: "Young farmer (child)", amount: "KSh 190" },
      { item: "Trade attendant ticket", amount: "KSh 1,250" },
      { item: "Pre-show car sticker", amount: "KSh 1,000" },
      { item: "Pre-show ticket", amount: "KSh 200" },
      { item: "Essential service stickers (5 days)", amount: "KSh 5,000" },
      {
        item: "Special car park (daily essential)",
        amount: "KSh 1,000 per vehicle per day",
      },
      { item: "Public car park", amount: "KSh 300 per day" },
      { item: "Public transport vehicle park", amount: "KSh 100 per day" },
      { item: "Motor bike park", amount: "KSh 50 per bike per day" },
    ],
    notes: ["Mandatory exhibition charges are subject to 16% VAT where applicable."],
  },
  {
    slug: "machakos-national-show",
    name: "South Eastern Kenya National Show (Machakos)",
    shortName: "Machakos",
    tier: "national",
    location: "Machakos",
    countiesServed: ["Machakos", "Makueni", "Kitui"],
    history: [
      "Machakos branch show started as a Harambee show and was upgraded to A.S.K status in 1997.",
      "Caters for stakeholders from Machakos, Makueni and Kitui counties.",
    ],
    locationNotes: [
      "About 2.8 km from Machakos town",
      "About 54 km from Nairobi",
    ],
    standRates: [
      {
        item: "100 ft × 100 ft (open space)",
        amount: "KSh 110,000 + VAT",
      },
      { item: "50 ft × 50 ft (open space)", amount: "KSh 70,000 + VAT" },
      { item: "35 ft × 35 ft (open space)", amount: "KSh 50,000 + VAT" },
    ],
    otherCharges: [
      {
        item: "Water and conservancy",
        amount: "KSh 3,000 + VAT",
      },
    ],
    gateCharges: [
      { item: "Pre-show ticket", amount: "KSh 150" },
      { item: "Pre-show sticker", amount: "KSh 500" },
      { item: "Perimeter adult", amount: "KSh 300" },
      { item: "Perimeter child", amount: "KSh 250" },
      { item: "Public car sticker", amount: "KSh 200" },
      { item: "Trade attendant ticket", amount: "KSh 1,200" },
      { item: "Essential services sticker", amount: "KSh 3,500" },
      { item: "Daily essential service sticker", amount: "KSh 1,000" },
    ],
    membership: [
      { item: "Executive member", amount: "KSh 8,500" },
      { item: "Full member", amount: "KSh 3,000" },
      { item: "Single member", amount: "KSh 2,000" },
      { item: "KPO single member", amount: "KSh 2,000" },
      { item: "Y.F.C.K member", amount: "KSh 400" },
    ],
    notes: ["Published stand charges are for open space only."],
  },

  // —— Regional ——
  {
    slug: "embu-eastern-kenya-show",
    name: "Eastern Kenya Branch Show (Embu)",
    shortName: "Embu",
    tier: "regional",
    location: "Embu",
    countiesServed: ["Embu", "Kirinyaga", "Tharaka-Nithi"],
    history: [
      "Established in 1968 at Embu Stadium; relocated to Njukiri showground in 1995.",
    ],
    locationNotes: ["Njukiri showground, about 6 km from Embu town"],
    standRates: [
      { item: "10 ft × 10 ft", amount: "KSh 36,140" },
      { item: "15 ft × 15 ft", amount: "KSh 48,940" },
      { item: "20 ft × 20 ft", amount: "KSh 58,180" },
      { item: "25 ft × 25 ft", amount: "KSh 69,780" },
      { item: "30 ft × 30 ft", amount: "KSh 78,380" },
      { item: "40 ft × 40 ft", amount: "KSh 86,100" },
      { item: "50 ft × 50 ft", amount: "KSh 97,100" },
      { item: "60 ft × 60 ft", amount: "KSh 106,120" },
      { item: "70 ft × 70 ft", amount: "KSh 118,100" },
      { item: "80 ft × 80 ft", amount: "KSh 124,120" },
      { item: "90 ft × 90 ft", amount: "KSh 134,100" },
    ],
    otherCharges: [
      { item: "Show theme interpretation", amount: "KSh 1,500" },
      { item: "Conservancy fee", amount: "KSh 4,000" },
      { item: "Essential sticker", amount: "KSh 2,000" },
      { item: "Catalogue fee", amount: "KSh 1,500" },
      { item: "Pre-show sticker", amount: "KSh 500" },
      { item: "Cleansing", amount: "KSh 2,000" },
    ],
    gateCharges: [
      { item: "Perimeter adult", amount: "KSh 250" },
      { item: "Perimeter child", amount: "KSh 200" },
      { item: "Special party adult", amount: "KSh 200" },
      { item: "Special party child", amount: "KSh 150" },
      { item: "Y.F.C.K adult", amount: "KSh 190" },
      { item: "Y.F.C.K child", amount: "KSh 140" },
      { item: "Pre-show", amount: "KSh 100" },
      { item: "Trade attendant", amount: "KSh 500–600" },
      { item: "Essential service sticker", amount: "KSh 2,000" },
      { item: "Daily essential service sticker", amount: "KSh 500" },
      { item: "Public car park", amount: "KSh 250" },
      { item: "Motor bike park", amount: "KSh 100" },
    ],
    membership: [
      { item: "Executive member/guest", amount: "KSh 8,500" },
      { item: "Full member/guest", amount: "KSh 3,000" },
      { item: "Single member", amount: "KSh 2,000" },
      { item: "KPO single member", amount: "KSh 2,000" },
      { item: "Armed forces/guest", amount: "KSh 800" },
      { item: "Y.F.C.K member", amount: "KSh 400" },
    ],
  },
  {
    slug: "migori-sw-kenya-show",
    name: "South West Kenya Branch Show (Migori)",
    shortName: "Migori",
    tier: "regional",
    location: "Migori",
    history: [
      "Started in the 1980s as a Harambee show; first satellite show at Migori Stadium in 2013.",
      "Moved to Lichota (next to the airstrip) in 2014 on land allocated by the county government.",
    ],
    gateCharges: [
      { item: "Pre-show sticker", amount: "KSh 500" },
      { item: "Daily car sticker", amount: "KSh 1,000" },
      { item: "All-days sticker", amount: "KSh 3,000" },
      { item: "Perimeter adult", amount: "KSh 250" },
      { item: "Perimeter child", amount: "KSh 200" },
      { item: "Special party adult", amount: "KSh 200" },
      { item: "Special party child", amount: "KSh 150" },
      { item: "Pre-show entry", amount: "KSh 150" },
    ],
  },
  {
    slug: "mt-kenya-nanyuki-show",
    name: "Mt Kenya Branch Show (Nanyuki)",
    shortName: "Nanyuki",
    tier: "regional",
    location: "Nanyuki",
    history: [
      "Established in 1957; located along the Meru–Nanyuki road.",
      "The region is home to some of the largest beef ranches in the country.",
    ],
    gateCharges: [
      { item: "Perimeter adult", amount: "KSh 250" },
      { item: "Perimeter child", amount: "KSh 200" },
      { item: "Special party adult", amount: "KSh 200" },
      { item: "Special party child", amount: "KSh 150" },
      { item: "Trade attendant", amount: "KSh 900" },
      { item: "Pre-show", amount: "KSh 150" },
    ],
    membership: [
      { item: "Full member", amount: "KSh 3,000" },
      { item: "Single member", amount: "KSh 2,000" },
      { item: "Executive", amount: "KSh 8,500" },
      { item: "Y.F.C.K", amount: "KSh 400" },
      { item: "Disciplined forces", amount: "KSh 800" },
      { item: "KPO", amount: "KSh 2,000" },
    ],
  },
  {
    slug: "garissa-show",
    name: "Garissa Show",
    shortName: "Garissa",
    tier: "regional",
    location: "Garissa",
    countiesServed: ["Garissa", "Mandera", "Tana River"],
    history: [
      "Started as a Harambee show in 1980; elevated to A.S.K status in 1998.",
    ],
    locationNotes: [
      "About 1.2 km from Garissa town",
      "About 2 km from the airstrip",
    ],
    notes: [
      "2026 show date marked T.B.A. on ASK materials — not listed on the main 2026 calendar of events.",
    ],
  },
  {
    slug: "kabarnet-baringo-show",
    name: "Baringo Branch Show (Kabarnet)",
    shortName: "Kabarnet",
    tier: "regional",
    location: "Kabarnet",
    countiesServed: [
      "Baringo",
      "Turkana",
      "West Pokot",
      "Kericho",
      "Samburu",
      "Elgeyo-Marakwet",
    ],
    history: [
      "Established in 1993 as a Harambee show; elevated to ASK status in 1998.",
    ],
    standRates: [
      {
        item: "Own occupier building",
        amount: "KSh 15 per square ft",
      },
      {
        item: "Society-owned building",
        amount: "KSh 15 per square ft",
      },
    ],
    otherCharges: [
      { item: "Theme interpretation", amount: "KSh 2,000" },
      { item: "Water", amount: "KSh 1,000" },
      { item: "Conservancy", amount: "KSh 1,000" },
      { item: "Cleansing", amount: "KSh 1,000" },
      {
        item: "Development charges & application (new exhibitors)",
        amount: "KSh 1,000 + KSh 1,000",
      },
      {
        item: "Judging fee per class (where applicable)",
        amount: "KSh 1,500",
      },
    ],
    gateCharges: [
      { item: "Perimeter adult", amount: "KSh 250" },
      { item: "Perimeter child", amount: "KSh 200" },
      { item: "Special party adult", amount: "KSh 200" },
      { item: "Special party child", amount: "KSh 150" },
      { item: "Y.F.C.K adult", amount: "KSh 200" },
      { item: "Y.F.C.K child", amount: "KSh 150" },
      { item: "Trade attendant", amount: "KSh 650" },
      { item: "Essential car sticker", amount: "KSh 2,000" },
      { item: "Pre-show ticket", amount: "KSh 100" },
      { item: "Pre-show car sticker", amount: "KSh 500" },
    ],
  },
  {
    slug: "kakamega-western-kenya-show",
    name: "Western Kenya Branch Show (Kakamega)",
    shortName: "Kakamega",
    tier: "regional",
    location: "Kakamega",
    countiesServed: ["Kakamega", "Busia", "Vihiga", "Bungoma"],
    history: [
      "Established in 1967; upgraded to A.S.K status in 1980.",
    ],
    locationNotes: [
      "About 2 km from Kakamega town off Kakamega–Webuye road",
      "About 8 km from Kakamega airstrip",
    ],
    standRates: [
      { item: "35 ft × 35 ft", amount: "KSh 46,400" },
      { item: "50 ft × 50 ft", amount: "KSh 75,600" },
      { item: "100 ft × 100 ft", amount: "KSh 127,600" },
    ],
    otherCharges: [
      { item: "Cleansing fee", amount: "KSh 3,480" },
      { item: "Conservancy fee", amount: "KSh 3,480" },
      { item: "Judging fee", amount: "KSh 2,320" },
      { item: "Catalogue booklet", amount: "KSh 580" },
    ],
    gateCharges: [
      { item: "Daily adult", amount: "KSh 250" },
      { item: "Daily child", amount: "KSh 200" },
      { item: "Special party adult", amount: "KSh 200" },
      { item: "Special party child", amount: "KSh 150" },
      { item: "Trade attendant (all days)", amount: "KSh 800" },
      { item: "Y.F.C.K", amount: "KSh 150 per person" },
      { item: "Essential service sticker", amount: "KSh 4,000" },
      {
        item: "Daily essential sticker (from day 2)",
        amount: "KSh 1,000 per day",
      },
      { item: "Public car park", amount: "KSh 250" },
      { item: "Pre-show entry ticket", amount: "KSh 150" },
      { item: "Pre-show car sticker", amount: "KSh 600" },
    ],
    membership: [
      {
        item: "Full member badge + guest + sticker",
        amount: "KSh 3,000",
      },
      {
        item: "Single member badge + sticker",
        amount: "KSh 2,000",
      },
      {
        item: "Executive sticker badge + guest + sticker",
        amount: "KSh 8,500",
      },
    ],
  },
  {
    slug: "kisii-southern-kenya-show",
    name: "Southern Kenya Branch Show (Kisii)",
    shortName: "Kisii",
    tier: "regional",
    location: "Kisii",
    countiesServed: ["Kisii", "Nyamira", "Narok", "Homa Bay"],
    history: [
      "Started as a Harambee show in 1965; upgraded to ASK status in 1979.",
      "Located in Kisii town centre; region includes major tea industry players.",
    ],
    standRates: [
      { item: "Open 10 × 10 ft", amount: "KSh 57,188" },
      { item: "Open 15 × 15 ft", amount: "KSh 62,988" },
      { item: "Open 20 × 20 ft", amount: "KSh 68,788" },
      { item: "Open 25 × 35 ft", amount: "KSh 74,588" },
      { item: "Open 30 × 30 ft", amount: "KSh 80,388" },
      {
        item: "Constructed stands",
        amount: "KSh 30 per sq ft (+ 16% VAT where applicable)",
      },
    ],
    gateCharges: [
      { item: "Pre-show", amount: "KSh 100" },
      { item: "Adult", amount: "KSh 250" },
      { item: "Child", amount: "KSh 200" },
      { item: "Special party adult", amount: "KSh 200" },
      { item: "Special party child", amount: "KSh 150" },
      { item: "Trade attendant", amount: "KSh 800" },
      { item: "Essential car sticker", amount: "KSh 4,000" },
      { item: "Daily car sticker", amount: "KSh 1,000" },
      { item: "Pre-show sticker", amount: "KSh 1,000" },
    ],
    membership: [
      { item: "Executive member", amount: "KSh 8,500" },
      { item: "Full member", amount: "KSh 3,000" },
      { item: "Single member", amount: "KSh 2,000" },
    ],
  },

  // —— Satellite stubs ——
  {
    slug: "bungoma-satellite-show",
    name: "Bungoma Satellite Show",
    tier: "satellite",
    location: "Bungoma",
    notes: [
      "Listed by ASK as a satellite show. Detailed public rates and 2026 calendar dates were not included in the source pack used for this site.",
    ],
  },
  {
    slug: "makueni-satellite-show",
    name: "Makueni Satellite Show",
    tier: "satellite",
    location: "Makueni",
    notes: [
      "Listed by ASK as a satellite show. Detailed public rates and 2026 calendar dates were not included in the source pack used for this site.",
    ],
  },
  {
    slug: "taita-taveta-satellite-show",
    name: "Taita Taveta Satellite Show",
    tier: "satellite",
    location: "Taita-Taveta",
    notes: [
      "Listed by ASK as a satellite show. Detailed public rates and 2026 calendar dates were not included in the source pack used for this site.",
    ],
  },
];

/**
 * Official ASK Calendar of Events for 2026.
 * Venue "J/Park" = Jamhuri Park, Nairobi.
 */
export const askCalendarByYear: Record<number, AskCalendarEvent[]> = {
  2026: [
    {
      id: "2026-01",
      name: "Eldoret National Show",
      year: 2026,
      startDate: "2026-03-04",
      endDate: "2026-03-08",
      venue: "Eldoret Showground",
      place: "Eldoret",
      tier: "national",
      profileSlug: "eldoret-national-show",
      calendarOrder: 1,
    },
    {
      id: "2026-02",
      name: "Eastern Kenya Branch Show",
      year: 2026,
      startDate: "2026-03-12",
      endDate: "2026-03-14",
      venue: "Njukiri Showground",
      place: "Embu",
      tier: "regional",
      profileSlug: "embu-eastern-kenya-show",
      calendarOrder: 2,
    },
    {
      id: "2026-03",
      name: "A.S.K Annual General Meeting",
      year: 2026,
      startDate: "2026-03-27",
      endDate: "2026-03-27",
      venue: "Jamhuri Park",
      place: "Nairobi",
      tier: "meeting",
      calendarOrder: 3,
    },
    {
      id: "2026-04",
      name: "Y.F.C.K National Camp",
      year: 2026,
      startDate: "2026-04-06",
      endDate: "2026-04-10",
      venue: "Machakos",
      place: "Machakos",
      tier: "yfck",
      calendarOrder: 4,
    },
    {
      id: "2026-05",
      name: "Y.F.C.K Tree Planting Day",
      year: 2026,
      startDate: "2026-05-16",
      endDate: "2026-05-16",
      venue: "Nairobi",
      place: "Nairobi",
      tier: "yfck",
      calendarOrder: 5,
    },
    {
      id: "2026-06",
      name: "Mt. Kenya Branch Show",
      year: 2026,
      startDate: "2026-05-20",
      endDate: "2026-05-23",
      venue: "Nanyuki Showground",
      place: "Nanyuki",
      tier: "regional",
      profileSlug: "mt-kenya-nanyuki-show",
      calendarOrder: 6,
    },
    {
      id: "2026-07",
      name: "S.E Kenya National Show",
      year: 2026,
      startDate: "2026-06-03",
      endDate: "2026-06-07",
      venue: "Machakos Showground",
      place: "Machakos",
      tier: "national",
      profileSlug: "machakos-national-show",
      calendarOrder: 7,
    },
    {
      id: "2026-08",
      name: "Western Kenya Branch Show",
      year: 2026,
      startDate: "2026-06-10",
      endDate: "2026-06-13",
      venue: "Kakamega Showground",
      place: "Kakamega",
      tier: "regional",
      profileSlug: "kakamega-western-kenya-show",
      calendarOrder: 8,
    },
    {
      id: "2026-09",
      name: "Y.F.C.K National Rally",
      year: 2026,
      startDate: "2026-06-13",
      endDate: "2026-06-13",
      venue: "Jamhuri Park",
      place: "Nairobi",
      tier: "yfck",
      calendarOrder: 9,
    },
    {
      id: "2026-10",
      name: "Meru National Show",
      year: 2026,
      startDate: "2026-06-17",
      endDate: "2026-06-20",
      venue: "Gitoro Showground",
      place: "Meru",
      tier: "national",
      profileSlug: "meru-national-show",
      calendarOrder: 10,
    },
    {
      id: "2026-11",
      name: "Nakuru National Agricultural Show",
      year: 2026,
      startDate: "2026-07-01",
      endDate: "2026-07-05",
      venue: "Nakuru Showground",
      place: "Nakuru",
      tier: "national",
      profileSlug: "nakuru-national-agricultural-show",
      calendarOrder: 11,
    },
    {
      id: "2026-12",
      name: "Southern Kenya Branch Show",
      year: 2026,
      startDate: "2026-07-09",
      endDate: "2026-07-12",
      venue: "Kisii Showground",
      place: "Kisii",
      tier: "regional",
      profileSlug: "kisii-southern-kenya-show",
      calendarOrder: 12,
    },
    {
      id: "2026-13",
      name: "Kisumu National Show",
      year: 2026,
      startDate: "2026-07-22",
      endDate: "2026-07-26",
      venue: "Mamboleo Showground",
      place: "Kisumu",
      tier: "national",
      profileSlug: "kisumu-national-show",
      calendarOrder: 13,
    },
    {
      id: "2026-14",
      name: "National Teachers Conference",
      year: 2026,
      startDate: "2026-08-05",
      endDate: "2026-08-07",
      venue: "Jamhuri Park",
      place: "Nairobi",
      tier: "conference",
      calendarOrder: 14,
    },
    {
      id: "2026-15",
      name: "Mombasa International Show",
      year: 2026,
      startDate: "2026-09-02",
      endDate: "2026-09-06",
      venue: "Mombasa Showground",
      place: "Mombasa",
      tier: "international",
      profileSlug: "mombasa-international-show",
      calendarOrder: 15,
    },
    {
      id: "2026-16",
      name: "Central Kenya National Show",
      year: 2026,
      startDate: "2026-09-09",
      endDate: "2026-09-12",
      venue: "Kabiruini Showground",
      place: "Nyeri",
      tier: "national",
      profileSlug: "central-kenya-national-show",
      calendarOrder: 16,
    },
    {
      id: "2026-17",
      name: "Baringo Branch Show",
      year: 2026,
      startDate: "2026-09-17",
      endDate: "2026-09-19",
      venue: "Kabarnet Showground",
      place: "Kabarnet",
      tier: "regional",
      profileSlug: "kabarnet-baringo-show",
      calendarOrder: 17,
    },
    {
      id: "2026-18",
      name: "S.W. Kenya Branch Show",
      year: 2026,
      startDate: "2026-09-24",
      endDate: "2026-09-27",
      venue: "Lichota Showground",
      place: "Migori",
      tier: "regional",
      profileSlug: "migori-sw-kenya-show",
      calendarOrder: 18,
    },
    {
      id: "2026-19",
      name: "Nairobi International Trade Fair",
      year: 2026,
      startDate: "2026-09-28",
      endDate: "2026-10-04",
      venue: "Jamhuri Park",
      place: "Nairobi",
      tier: "international",
      profileSlug: "nairobi-international-trade-fair",
      calendarOrder: 19,
    },
    {
      id: "2026-20",
      name: "Kitale National Show",
      year: 2026,
      startDate: "2026-10-07",
      endDate: "2026-10-10",
      venue: "North Rift Showground",
      place: "Kitale",
      tier: "national",
      profileSlug: "kitale-national-show",
      calendarOrder: 20,
    },
    {
      id: "2026-21",
      name: "National Ploughing Contest",
      year: 2026,
      startDate: "2026-11-20",
      endDate: "2026-11-21",
      venue: "Eldoret",
      place: "Eldoret",
      tier: "contest",
      calendarOrder: 21,
    },
  ],
};

export const askTierLabels: Record<AskShowTier, string> = {
  international: "International show",
  national: "National show",
  regional: "Regional / branch show",
  satellite: "Satellite show",
  yfck: "Young Farmers (Y.F.C.K)",
  meeting: "Society meeting",
  contest: "National contest",
  conference: "Conference",
};

export function getAskProfile(slug: string): AskShowProfile | undefined {
  return askShowProfiles.find((p) => p.slug === slug);
}

export function getAllAskProfileSlugs(): string[] {
  return askShowProfiles.map((p) => p.slug);
}

export function getProfilesByTier(tier: AskShowTier): AskShowProfile[] {
  return askShowProfiles.filter((p) => p.tier === tier);
}
