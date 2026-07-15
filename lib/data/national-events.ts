/**
 * National events — hub categories and detail pages.
 * Expand items and body sections as more verified data arrives
 * (e.g. trade expositions calendars, regional festival dates).
 *
 * URLs: /society-and-culture/national-events
 *       /society-and-culture/national-events/[slug]
 */

export type NationalEventLink = {
  text: string;
  href: string;
  external?: boolean;
};

export type NationalEventSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  links?: NationalEventLink[];
};

export type NationalEvent = {
  slug: string;
  title: string;
  /** Short line for chevron list on hub */
  summary: string;
  /** Optional meta under title on hub, e.g. "1 June" */
  meta?: string;
  /** Category slug this event belongs to */
  categorySlug: string;
  lead: string;
  sections: NationalEventSection[];
  relatedLinks?: NationalEventLink[];
};

export type NationalEventCategory = {
  slug: string;
  title: string;
  description: string;
  /** Order on hub page */
  order: number;
};

export const nationalEventCategories: NationalEventCategory[] = [
  {
    slug: "official-national-days",
    title: "Official national days",
    description:
      "The three national days recognised in the Constitution of Kenya, with state ceremonies and public observance.",
    order: 1,
  },
  {
    slug: "agricultural-and-trade-expositions",
    title: "Agricultural and trade expositions",
    description:
      "Major shows and trade fairs that promote farming, industry, investment and public exhibition of goods and services.",
    order: 2,
  },
  {
    slug: "governance-and-civic-events",
    title: "Governance and civic events",
    description:
      "Recurring national gatherings about devolution, accountability and how government works with citizens and counties.",
    order: 3,
  },
  {
    slug: "education-arts-and-youth",
    title: "Education, arts and youth festivals",
    description:
      "National competitive and creative festivals for schools, colleges and young people.",
    order: 4,
  },
  {
    slug: "cultural-and-heritage-festivals",
    title: "Cultural and heritage festivals",
    description:
      "Widely recognised cultural festivals and heritage celebrations across Kenya’s regions.",
    order: 5,
  },
  {
    slug: "sports-and-national-gatherings",
    title: "Sports and national gatherings",
    description:
      "Sporting events and mass gatherings that form part of Kenya’s public and international identity.",
    order: 6,
  },
];

export const nationalEvents: NationalEvent[] = [
  // —— Official national days ——
  {
    slug: "madaraka-day",
    title: "Madaraka Day",
    summary:
      "Commemorates internal self-government on 1 June 1963. Observed with state ceremonies.",
    meta: "1 June · National day",
    categorySlug: "official-national-days",
    lead: "Madaraka Day is one of Kenya’s three constitutional national days. It marks the attainment of internal self-government on 1 June 1963, before full independence later that year.",
    sections: [
      {
        heading: "What it commemorates",
        paragraphs: [
          "On Madaraka Day, Kenya remembers the transfer of self-governing powers under colonial transition arrangements. It is distinct from Jamhuri Day, which marks independence and the republic.",
        ],
      },
      {
        heading: "How it is observed",
        paragraphs: [
          "Typical public features of national day celebrations can include a presidential address, ceremonies involving the Kenya Defence Forces and security services, cultural performances, and public broadcasts. The main national ceremony is often hosted in a designated venue, which in recent years has sometimes been rotated among counties to promote national cohesion. Exact programmes are announced each year.",
        ],
      },
      {
        heading: "Legal basis",
        paragraphs: [
          "National days are set out in the Constitution of Kenya. Public holiday observance for the day is also reflected in public holiday practice — see the national holidays page for gazetted days off.",
        ],
        links: [
          {
            text: "Article 9 — National symbols and national days",
            href: "/constitution/chapter/2/article/9",
          },
          {
            text: "Public holidays",
            href: "/society-and-culture/holidays",
          },
        ],
      },
    ],
    relatedLinks: [
      { text: "Jamhuri Day", href: "/society-and-culture/national-events/jamhuri-day" },
      { text: "Mashujaa Day", href: "/society-and-culture/national-events/mashujaa-day" },
      { text: "National symbols", href: "/society-and-culture/national-symbols" },
    ],
  },
  {
    slug: "mashujaa-day",
    title: "Mashujaa Day",
    summary:
      "Honours heroes of the independence struggle and citizens who contribute to the nation. Observed on 20 October.",
    meta: "20 October · National day",
    categorySlug: "official-national-days",
    lead: "Mashujaa Day (Heroes’ Day) is a constitutional national day. It honours those who struggled for freedom and Kenyans who contribute significantly to the country’s development.",
    sections: [
      {
        heading: "What it commemorates",
        paragraphs: [
          "Mashujaa Day focuses on courage, sacrifice and service — including historical freedom fighters and contemporary contribution to national life. It replaced earlier colonial-era or single-personality commemorative framing with a broader constitutional idea of national heroes.",
        ],
      },
      {
        heading: "How it is observed",
        paragraphs: [
          "Observance can include state ceremonies, awards or recognition of heroes, cultural programmes and public education about Kenya’s history. The main national venue and guest list are announced for each year.",
        ],
      },
      {
        heading: "Legal basis",
        paragraphs: [
          "Listed among the national days in Article 9 of the Constitution.",
        ],
        links: [
          {
            text: "Article 9 — National symbols and national days",
            href: "/constitution/chapter/2/article/9",
          },
          {
            text: "Constitution and national values",
            href: "/society-and-culture/constitution-and-national-values",
          },
        ],
      },
    ],
    relatedLinks: [
      { text: "Madaraka Day", href: "/society-and-culture/national-events/madaraka-day" },
      { text: "Jamhuri Day", href: "/society-and-culture/national-events/jamhuri-day" },
      { text: "Heritage sites", href: "/society-and-culture/heritage-sites" },
    ],
  },
  {
    slug: "jamhuri-day",
    title: "Jamhuri Day",
    summary:
      "Kenya’s main national day on 12 December — independence (1963) and the Republic (1964).",
    meta: "12 December · National day",
    categorySlug: "official-national-days",
    lead: "Jamhuri Day is Kenya’s primary national day. It marks full independence on 12 December 1963 and the declaration of the Republic on 12 December 1964.",
    sections: [
      {
        heading: "What it commemorates",
        paragraphs: [
          "“Jamhuri” means republic. The day combines remembrance of independence from colonial rule with the constitutional status of Kenya as a republic. It is widely treated as the centrepiece of the national ceremonial calendar.",
        ],
      },
      {
        heading: "How it is observed",
        paragraphs: [
          "Celebrations commonly include a major state ceremony, military parade elements, cultural displays and a presidential address. Host counties or venues may vary; follow official announcements for the current year.",
        ],
      },
      {
        heading: "Legal basis",
        paragraphs: [
          "Listed among the national days in Article 9 of the Constitution.",
        ],
        links: [
          {
            text: "Article 9 — National symbols and national days",
            href: "/constitution/chapter/2/article/9",
          },
          {
            text: "Public holidays",
            href: "/society-and-culture/holidays",
          },
        ],
      },
    ],
    relatedLinks: [
      { text: "Madaraka Day", href: "/society-and-culture/national-events/madaraka-day" },
      { text: "How government works", href: "/how-government-works" },
    ],
  },

  // —— Agricultural and trade ——
  {
    slug: "ask-shows",
    title: "Agricultural Society of Kenya (ASK) shows",
    summary:
      "Full 2026 calendar, next upcoming show, and branch rates — international, national and regional shows.",
    meta: "Calendar · Next event highlighted",
    categorySlug: "agricultural-and-trade-expositions",
    lead: "ASK runs Kenya’s network of agricultural shows and trade fairs. Use the dedicated ASK shows page for the full calendar (next, upcoming and past events), show classifications, and stand or gate charges where published.",
    sections: [
      {
        heading: "Open the full ASK guide",
        paragraphs: [
          "The dedicated guide includes the 2026 theme, a highlighted next event (like public holidays on GOV.UK), upcoming and past tables, and profiles for Mombasa International Show, Nairobi International Trade Fair, national and regional branches.",
        ],
        links: [
          {
            text: "ASK shows calendar and rates",
            href: "/society-and-culture/national-events/ask-shows",
          },
        ],
      },
      {
        heading: "About ASK",
        paragraphs: [
          "The Agricultural Society of Kenya is a private membership society (not a government parastatal). It works closely with government; state agencies often exhibit and public funds may support shows. Confirm fees with the relevant branch.",
        ],
      },
    ],
    relatedLinks: [
      {
        text: "ASK shows calendar and rates",
        href: "/society-and-culture/national-events/ask-shows",
      },
      {
        text: "Nairobi International Trade Fair",
        href: "/society-and-culture/national-events/ask-shows/nairobi-international-trade-fair",
      },
      {
        text: "Mombasa International Show",
        href: "/society-and-culture/national-events/ask-shows/mombasa-international-show",
      },
    ],
  },
  {
    slug: "nairobi-international-trade-fair",
    title: "Nairobi International Trade Fair (NITF)",
    summary:
      "ASK international trade fair at Jamhuri Park — 28 September to 4 October 2026 on the published calendar.",
    meta: "28 Sep – 4 Oct 2026 · Nairobi",
    categorySlug: "agricultural-and-trade-expositions",
    lead: "The Nairobi International Trade Fair is the Nairobi branch of the Agricultural Society of Kenya. Full history, location notes and the 2026 calendar entry are on the ASK shows profile.",
    sections: [
      {
        heading: "Open the full NITF / ASK profile",
        paragraphs: [
          "See dates in the national calendar, location (Jamhuri Park), history from 1901/1902, and links to the full ASK programme.",
        ],
        links: [
          {
            text: "Nairobi International Trade Fair — ASK profile",
            href: "/society-and-culture/national-events/ask-shows/nairobi-international-trade-fair",
          },
          {
            text: "Full ASK calendar and next event",
            href: "/society-and-culture/national-events/ask-shows",
          },
        ],
      },
    ],
    relatedLinks: [
      {
        text: "Mombasa International Show",
        href: "/society-and-culture/national-events/ask-shows/mombasa-international-show",
      },
      {
        text: "ASK shows hub",
        href: "/society-and-culture/national-events/ask-shows",
      },
    ],
  },
  {
    slug: "trade-and-industry-expositions",
    title: "Trade and industry expositions",
    summary:
      "National and sector trade fairs for manufacturing, housing, ICT, energy and investment — overview for expansion.",
    meta: "Various · Announced annually",
    categorySlug: "agricultural-and-trade-expositions",
    lead: "Beyond ASK agricultural shows, Kenya hosts sector trade expositions organised by industry associations, government agencies and private partners. This page is a summary placeholder for a fuller directory.",
    sections: [
      {
        heading: "What belongs here",
        paragraphs: [
          "Events that are national or multi-county in profile and focused on trade, investment, manufacturing, housing, digital economy, energy or related industries. Local market days are better covered under county or cultural calendar content.",
        ],
      },
      {
        heading: "How we will expand this page",
        paragraphs: [
          "As verified calendars and organisers are supplied, this section can list major recurring expos with typical months, venues, hosts and public access notes — in the same way ASK and NITF are covered.",
        ],
        bullets: [
          "Name and organiser",
          "Typical time of year",
          "Venue or host city",
          "Whether the public can attend",
          "Link to official announcement source",
        ],
      },
    ],
    relatedLinks: [
      {
        text: "ASK shows",
        href: "/society-and-culture/national-events/ask-shows",
      },
      { text: "Starting a business guide", href: "/guides/starting-a-business" },
    ],
  },

  // —— Governance ——
  {
    slug: "devolution-conference",
    title: "Devolution Conference",
    summary:
      "Major intergovernmental conference on devolution, county performance and accountability — not an agricultural show.",
    meta: "Recurring · Rotating host counties",
    categorySlug: "governance-and-civic-events",
    lead: "The Devolution Conference is a high-profile governance event focused on Kenya’s devolved system of government. It brings together national and county leaders, public officers, development partners and civil society. It is not an Agricultural Society of Kenya trade show.",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "The conference is associated with dialogue on devolution implementation, service delivery, intergovernmental relations and accountability. Hosting is often rotated among counties. Frequency and exact branding can vary; treat each edition’s programme as announced by the organisers (including the Council of Governors and partners).",
        ],
      },
      {
        heading: "Why it sits under governance, not trade expos",
        paragraphs: [
          "Unlike ASK shows, the conference is about public administration and the constitutional system of counties. For agricultural exhibitions, see ASK shows and the Nairobi International Trade Fair.",
        ],
        links: [
          {
            text: "County vs national government",
            href: "/county-vs-national",
          },
          {
            text: "Devolution",
            href: "/government/counties/devolution",
          },
          {
            text: "How government works",
            href: "/how-government-works",
          },
        ],
      },
      {
        heading: "Public access",
        paragraphs: [
          "Some sessions may be open or livestreamed; others are for registered delegates. Check the official conference announcement for each year.",
        ],
      },
    ],
    relatedLinks: [
      {
        text: "Chapter 11 — Devolved government",
        href: "/constitution/chapter/11",
      },
      { text: "County governments", href: "/government/counties" },
    ],
  },
  {
    slug: "civic-and-public-participation-events",
    title: "Civic and public participation events",
    summary:
      "How national and county public participation forums relate to the civic calendar.",
    meta: "Ongoing · National and county",
    categorySlug: "governance-and-civic-events",
    lead: "Kenya’s Constitution emphasises public participation in governance. National and county governments convene hearings, budget forums and consultation processes throughout the year.",
    sections: [
      {
        heading: "What to expect",
        paragraphs: [
          "These are not always single “festival-style” national days. They include budget public participation, bill consultations and county assembly outreach. Announcements are usually local or sector-specific.",
        ],
        links: [
          {
            text: "Access to information",
            href: "/access-to-information",
          },
          {
            text: "How public money works",
            href: "/how-public-money-works",
          },
        ],
      },
    ],
    relatedLinks: [
      {
        text: "Article 10 — National values and principles of governance",
        href: "/constitution/chapter/2/article/10",
      },
    ],
  },

  // —— Education & arts ——
  {
    slug: "kenya-national-drama-and-film-festival",
    title: "Kenya National Drama and Film Festival (KNDFF)",
    summary:
      "National creative arts festival for schools, colleges and universities — theatre, spoken word and student film.",
    meta: "Annual · Education sector",
    categorySlug: "education-arts-and-youth",
    lead: "The Kenya National Drama and Film Festival is a major national platform for student performance and film. It showcases theatre, spoken word, and related creative work from educational institutions.",
    sections: [
      {
        heading: "Who takes part",
        paragraphs: [
          "Primary and secondary schools, colleges and universities typically progress through local and regional stages toward national finals. Exact rules and calendars are set by the education and festival organising structures each year.",
        ],
      },
      {
        heading: "Why it matters",
        paragraphs: [
          "The festival is part of Kenya’s public cultural and education life. It develops talent, preserves performance traditions and gives young people a national stage.",
        ],
      },
    ],
    relatedLinks: [
      {
        text: "Kenya Music Festival",
        href: "/society-and-culture/national-events/kenya-music-festival",
      },
      { text: "Education topic", href: "/topics/education" },
    ],
  },
  {
    slug: "kenya-music-festival",
    title: "Kenya Music Festival",
    summary:
      "Long-running national music, dance and elocution festival rooted in schools and colleges.",
    meta: "Annual · Education sector",
    categorySlug: "education-arts-and-youth",
    lead: "The Kenya Music Festival is one of Africa’s longest-running school-centred festivals of music, dance and elocution. It celebrates indigenous and contemporary performance.",
    sections: [
      {
        heading: "What it includes",
        paragraphs: [
          "Classes typically cover choral music, instrumental work, traditional dance, verse speaking and related categories. Institutions compete through progressive levels toward national adjudication.",
        ],
      },
      {
        heading: "History in brief",
        paragraphs: [
          "The festival has operated for many decades and remains a fixture of the education and culture calendar. Venue and dates for national finals are announced annually.",
        ],
      },
    ],
    relatedLinks: [
      {
        text: "Kenya National Drama and Film Festival",
        href: "/society-and-culture/national-events/kenya-national-drama-and-film-festival",
      },
      {
        text: "Languages",
        href: "/society-and-culture/languages",
      },
    ],
  },

  // —— Cultural & heritage ——
  {
    slug: "lamu-cultural-festival",
    title: "Lamu Cultural Festival",
    summary:
      "Celebration of Swahili coastal heritage in Lamu, a UNESCO World Heritage setting.",
    meta: "Annual · Lamu County",
    categorySlug: "cultural-and-heritage-festivals",
    lead: "The Lamu Cultural Festival celebrates Swahili coastal heritage — crafts, performance, dhow culture and community traditions — in and around Lamu Old Town.",
    sections: [
      {
        heading: "What visitors and residents experience",
        paragraphs: [
          "Programmes in recent years have included cultural processions, traditional sports such as donkey races, dhow-related activities, music, craft and food. Exact line-ups change each year.",
        ],
      },
      {
        heading: "Heritage context",
        paragraphs: [
          "Lamu Old Town is recognised as a UNESCO World Heritage site. Festival organisation typically involves county leadership, community groups and heritage institutions such as the National Museums of Kenya ecosystem. Confirm dates with official Lamu County or festival announcements.",
        ],
        links: [
          {
            text: "Heritage sites",
            href: "/society-and-culture/heritage-sites",
          },
          {
            text: "Cultural calendar",
            href: "/society-and-culture/cultural-calendar",
          },
        ],
      },
    ],
    relatedLinks: [
      {
        text: "Communities",
        href: "/society-and-culture/communities",
      },
      {
        text: "Religion and faith",
        href: "/society-and-culture/religion-and-faith",
      },
    ],
  },
  {
    slug: "regional-cultural-festivals",
    title: "Regional cultural festivals (overview)",
    summary:
      "How Kenya’s regions mark culture through festivals — a framework for a fuller multi-region directory.",
    meta: "Various · County and community",
    categorySlug: "cultural-and-heritage-festivals",
    lead: "Kenya’s cultural life is regional as well as national. Many counties and communities host festivals that are locally important and sometimes nationally known. This page explains how we group them and will grow as verified events are added.",
    sections: [
      {
        heading: "Regions to represent",
        paragraphs: [
          "A representative directory should not stop at Nairobi and the coast. Over time, entries can cover Rift Valley, lake region, Mount Kenya, western Kenya, northern Kenya and pastoralist cultures, and urban creative festivals — always with clear organisers and dates.",
        ],
        bullets: [
          "Coastal and Swahili heritage events",
          "Highland and Rift cultural gatherings",
          "Lake region festivals",
          "Northern and pastoralist public cultural events",
          "Urban literature, film and music festivals with public programmes",
        ],
      },
      {
        heading: "What we need before listing an event",
        paragraphs: [
          "A public name, typical timing, host county or venue type, organising body, and a reliable source. Avoid political campaign rallies and unverified social media events.",
        ],
      },
    ],
    relatedLinks: [
      {
        text: "Lamu Cultural Festival",
        href: "/society-and-culture/national-events/lamu-cultural-festival",
      },
      {
        text: "Cultural calendar",
        href: "/society-and-culture/cultural-calendar",
      },
    ],
  },

  // —— Sports ——
  {
    slug: "safari-rally",
    title: "Safari Rally",
    summary:
      "Historic motorsport event with deep roots in Kenya’s sporting identity; modern WRC editions when hosted.",
    meta: "Motorsport · International profile",
    categorySlug: "sports-and-national-gatherings",
    lead: "The Safari Rally is one of Kenya’s most famous sporting events. It has a long history in African motorsport and, in modern form, has returned as a round of the FIA World Rally Championship when scheduled.",
    sections: [
      {
        heading: "National significance",
        paragraphs: [
          "The rally is part of Kenya’s international sporting brand. Routes, service parks and spectator points are announced for each edition. Safety and access rules are set by organisers and security agencies.",
        ],
      },
      {
        heading: "Check before you go",
        paragraphs: [
          "Dates, itinerary and ticketing change every season. Use official Safari Rally / WRC and Government of Kenya tourism or sports announcements for the current year.",
        ],
      },
    ],
    relatedLinks: [
      {
        text: "Sports and national gatherings (category)",
        href: "/society-and-culture/national-events/sports-and-national-gatherings",
      },
    ],
  },
  {
    slug: "athletics-and-national-sporting-events",
    title: "Athletics and national sporting events",
    summary:
      "Kenya’s athletics championships and major meets that shape national sporting culture.",
    meta: "Various · National and international",
    categorySlug: "sports-and-national-gatherings",
    lead: "Athletics is central to Kenya’s global sporting reputation. National trials, championships and international meets hosted in Kenya are part of the public sports calendar.",
    sections: [
      {
        heading: "What this page covers",
        paragraphs: [
          "A high-level overview of why athletics and selected national competitions matter culturally — not live results. Specific meet calendars belong with Athletics Kenya and event organisers.",
        ],
      },
      {
        heading: "Related public interest",
        paragraphs: [
          "School and college sports, football cup finals and other mass spectator events can be added here as verified recurring national fixtures.",
        ],
      },
    ],
    relatedLinks: [
      {
        text: "Safari Rally",
        href: "/society-and-culture/national-events/safari-rally",
      },
    ],
  },

  // —— Category overview “landing” pages (also chevron targets) ——
  {
    slug: "official-national-days",
    title: "Official national days (overview)",
    summary:
      "Madaraka Day, Mashujaa Day and Jamhuri Day under Article 9 of the Constitution.",
    meta: "Category overview",
    categorySlug: "official-national-days",
    lead: "Kenya has three national days named in the Constitution. This overview links to each day. For other public holidays (Labour Day, religious holidays and others), use the holidays page.",
    sections: [
      {
        heading: "The three national days",
        paragraphs: [
          "Madaraka Day (1 June), Mashujaa Day (20 October) and Jamhuri Day (12 December) are listed in Article 9. They are observed with state ceremonies and are also treated as public holidays in practice.",
        ],
        links: [
          {
            text: "Article 9 — National symbols and national days",
            href: "/constitution/chapter/2/article/9",
          },
        ],
      },
      {
        heading: "Events in this category",
        paragraphs: [
          "Open each day for a short history, how it is observed, and related links.",
        ],
      },
    ],
    relatedLinks: [
      { text: "Madaraka Day", href: "/society-and-culture/national-events/madaraka-day" },
      { text: "Mashujaa Day", href: "/society-and-culture/national-events/mashujaa-day" },
      { text: "Jamhuri Day", href: "/society-and-culture/national-events/jamhuri-day" },
      { text: "Public holidays", href: "/society-and-culture/holidays" },
    ],
  },
  {
    slug: "agricultural-and-trade-expositions",
    title: "Agricultural and trade expositions (overview)",
    summary:
      "ASK shows, Nairobi International Trade Fair and other trade expos — farming and industry, not governance summits.",
    meta: "Category overview",
    categorySlug: "agricultural-and-trade-expositions",
    lead: "This category covers public agricultural shows and trade expositions. Governance conferences such as the Devolution Conference are listed under governance and civic events.",
    sections: [
      {
        heading: "What you will find here",
        paragraphs: [
          "Summaries of major expositions. Detailed show calendars and exhibitor lists will grow as verified data is added — including more trade and industry fairs beyond agriculture.",
        ],
      },
    ],
    relatedLinks: [
      { text: "ASK shows", href: "/society-and-culture/national-events/ask-shows" },
      {
        text: "Nairobi International Trade Fair",
        href: "/society-and-culture/national-events/nairobi-international-trade-fair",
      },
      {
        text: "Trade and industry expositions",
        href: "/society-and-culture/national-events/trade-and-industry-expositions",
      },
    ],
  },
  {
    slug: "governance-and-civic-events",
    title: "Governance and civic events (overview)",
    summary:
      "Devolution Conference and public participation — how Kenya debates government in public forums.",
    meta: "Category overview",
    categorySlug: "governance-and-civic-events",
    lead: "These events are about how Kenya is governed: devolution, accountability and public participation. They are separate from agricultural trade fairs.",
    sections: [
      {
        heading: "Related civic guidance",
        paragraphs: [
          "For structure of government and counties, use the government explainers on this site.",
        ],
        links: [
          { text: "How government works", href: "/how-government-works" },
          { text: "County vs national", href: "/county-vs-national" },
          { text: "Devolution", href: "/government/counties/devolution" },
        ],
      },
    ],
    relatedLinks: [
      {
        text: "Devolution Conference",
        href: "/society-and-culture/national-events/devolution-conference",
      },
      {
        text: "Civic and public participation events",
        href: "/society-and-culture/national-events/civic-and-public-participation-events",
      },
    ],
  },
  {
    slug: "education-arts-and-youth",
    title: "Education, arts and youth festivals (overview)",
    summary:
      "National school and college festivals for drama, film, music and related arts.",
    meta: "Category overview",
    categorySlug: "education-arts-and-youth",
    lead: "Kenya’s education system supports large national festivals that shape cultural life for young people. Open each festival page for a short overview.",
    sections: [
      {
        heading: "In this category",
        paragraphs: [
          "Drama and film, music festival, and room to add science fairs or other national youth competitions when documented.",
        ],
      },
    ],
    relatedLinks: [
      {
        text: "Kenya National Drama and Film Festival",
        href: "/society-and-culture/national-events/kenya-national-drama-and-film-festival",
      },
      {
        text: "Kenya Music Festival",
        href: "/society-and-culture/national-events/kenya-music-festival",
      },
    ],
  },
  {
    slug: "cultural-and-heritage-festivals",
    title: "Cultural and heritage festivals (overview)",
    summary:
      "Festivals that celebrate Kenya’s cultures and heritage — starting with Lamu and a multi-region framework.",
    meta: "Category overview",
    categorySlug: "cultural-and-heritage-festivals",
    lead: "Cultural festivals express Kenya’s diversity. This category starts with well-known examples and a framework for regional expansion.",
    sections: [
      {
        heading: "Balance across Kenya",
        paragraphs: [
          "Listings should grow beyond a single coastal example. Use the regional overview page to guide future entries.",
        ],
      },
    ],
    relatedLinks: [
      {
        text: "Lamu Cultural Festival",
        href: "/society-and-culture/national-events/lamu-cultural-festival",
      },
      {
        text: "Regional cultural festivals overview",
        href: "/society-and-culture/national-events/regional-cultural-festivals",
      },
    ],
  },
  {
    slug: "sports-and-national-gatherings",
    title: "Sports and national gatherings (overview)",
    summary:
      "Safari Rally, athletics and other sporting events with national profile.",
    meta: "Category overview",
    categorySlug: "sports-and-national-gatherings",
    lead: "Sport is part of Kenya’s public culture and international identity. This category summarises major recurring or iconic events.",
    sections: [
      {
        heading: "In this category",
        paragraphs: [
          "Safari Rally, athletics overview, and space for other verified national fixtures.",
        ],
      },
    ],
    relatedLinks: [
      {
        text: "Safari Rally",
        href: "/society-and-culture/national-events/safari-rally",
      },
      {
        text: "Athletics and national sporting events",
        href: "/society-and-culture/national-events/athletics-and-national-sporting-events",
      },
    ],
  },
];

const BASE = "/society-and-culture/national-events";

export function nationalEventHref(slug: string): string {
  return `${BASE}/${slug}`;
}

export function getNationalEventBySlug(slug: string): NationalEvent | undefined {
  return nationalEvents.find((e) => e.slug === slug);
}

export function getAllNationalEventSlugs(): string[] {
  return nationalEvents.map((e) => e.slug);
}

export function getEventsForCategory(categorySlug: string): NationalEvent[] {
  return nationalEvents.filter(
    (e) => e.categorySlug === categorySlug && e.slug !== categorySlug,
  );
}

export function getCategoryBySlug(
  slug: string,
): NationalEventCategory | undefined {
  return nationalEventCategories.find((c) => c.slug === slug);
}

export function getSortedCategories(): NationalEventCategory[] {
  return [...nationalEventCategories].sort((a, b) => a.order - b.order);
}

/**
 * Hub chevron rows for a category: leaf topics only (not the category overview page).
 * Category overview pages remain available via related links on detail pages.
 */
export function getHubCategoryItems(categorySlug: string): Array<{
  title: string;
  href: string;
  description: string;
  meta?: string;
}> {
  return getEventsForCategory(categorySlug).map((child) => ({
    title: child.title,
    href: nationalEventHref(child.slug),
    description: child.summary,
    meta: child.meta,
  }));
}
