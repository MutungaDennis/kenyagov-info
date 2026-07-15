/**
 * Citizen-facing topic taxonomy for /topics and related hubs.
 * Kenya-first life events and public service clusters (GOV.UK-style browse).
 */

export type TopicLink = {
  text: string;
  href: string;
  external?: boolean;
};

export type Topic = {
  slug: string;
  title: string;
  summary: string;
  lead: string;
  /** What this topic covers */
  sections: Array<{
    heading: string;
    body: string[];
    links?: TopicLink[];
  }>;
  relatedServices?: TopicLink[];
  officialLinks?: TopicLink[];
};

export const topics: Topic[] = [
  {
    slug: "identity-civil-registration",
    title: "Identity and civil registration",
    summary:
      "Birth and death certificates, national ID, marriage registration and police clearance.",
    lead: "Find information about civil registration and identity documents in Kenya. Applications and payments are handled on official government systems such as eCitizen — not on this website.",
    sections: [
      {
        heading: "What this covers",
        body: [
          "Civil registration records births, deaths and marriages. Identity documents include the national identity card and related verification services. A certificate of good conduct (police clearance) is often required for employment, migration or licensing.",
          "National registration and immigration services are delivered through the national government. Many applications start online and may require a visit to a Huduma Centre or designated office for biometrics.",
        ],
        links: [
          { text: "eCitizen portal", href: "https://www.ecitizen.go.ke", external: true },
          { text: "Huduma Centres explained", href: "/huduma-centres" },
          { text: "Browse related services", href: "/services?category=civil-registration" },
        ],
      },
      {
        heading: "Common tasks",
        body: [
          "Register a birth or death, apply for a birth or death certificate, apply for or replace a national ID, register a marriage, or apply for a police clearance certificate.",
          "Requirements, fees and processing times change. Always confirm details on the official portal or with the responsible department before you travel or pay an agent.",
        ],
      },
      {
        heading: "Who is responsible",
        body: [
          "Civil registration and national identity functions sit under the national government (including the relevant State Department and Directorate of Immigration / registration services as organised by the executive).",
          "For workplace or migration clearances, the Directorate of Criminal Investigations (DCI) processes police clearance applications through official channels.",
        ],
      },
    ],
    relatedServices: [
      { text: "All public services", href: "/services" },
      { text: "Services A to Z", href: "/services/a-z" },
      { text: "eCitizen explained", href: "/ecitizen" },
    ],
    officialLinks: [
      { text: "eCitizen", href: "https://www.ecitizen.go.ke", external: true },
    ],
  },
  {
    slug: "passports-travel",
    title: "Passports, visas and travel",
    summary:
      "Kenyan passports, travel documents, eTA and living or working abroad.",
    lead: "Guidance on passports, immigration profiles and travel-related government processes. Use official immigration and eCitizen channels for applications.",
    sections: [
      {
        heading: "Passports and travel documents",
        body: [
          "Kenyan citizens apply for ordinary, diplomatic or service passports through official immigration services. Applications are commonly started online and completed with biometrics at designated centres.",
          "Keep your details accurate, allow enough time before travel, and only use official payment channels. Unofficial agents cannot guarantee faster processing.",
        ],
        links: [
          { text: "Passports and travel services", href: "/services?category=passports-travel" },
          { text: "eCitizen", href: "https://www.ecitizen.go.ke", external: true },
        ],
      },
      {
        heading: "Visitors and residents",
        body: [
          "Foreign nationals may need an electronic travel authorisation (eTA), visa or permit depending on nationality and purpose of stay. Rules change — check the official immigration website before travel.",
          "Work permits, residence and student pathways are managed by immigration authorities. This site explains concepts only; it does not issue permits.",
        ],
      },
      {
        heading: "Kenyans abroad",
        body: [
          "Kenyan missions abroad provide consular assistance within their mandate. Diaspora citizens should use official mission websites and the Ministry of Foreign Affairs for contacts.",
          "Voting rights for citizens abroad follow IEBC rules for each election cycle.",
        ],
        links: [
          { text: "Elections and voting", href: "/elections" },
          { text: "Contact government", href: "/contact-government" },
        ],
      },
    ],
    relatedServices: [
      { text: "Scams and fake websites", href: "/scams" },
      { text: "Huduma Centres", href: "/huduma-centres" },
    ],
  },
  {
    slug: "driving-transport",
    title: "Driving and transport",
    summary:
      "Learner permits, driving licences, vehicle transfer and NTSA-related processes.",
    lead: "Information about driving licences, vehicle ownership changes and related transport services. Transactions are completed on official NTSA and eCitizen systems.",
    sections: [
      {
        heading: "Learning to drive and licences",
        body: [
          "New drivers typically start with a provisional driving licence (PDL), training with a licensed school, then a test and smart driving licence process as set by the National Transport and Safety Authority (NTSA).",
          "Renewals, category upgrades and replacements follow NTSA rules. Confirm fees and documents on the official site before applying.",
        ],
        links: [
          { text: "Driving and transport services", href: "/services?category=driving-transport" },
          { text: "NTSA", href: "https://www.ntsa.go.ke", external: true },
        ],
      },
      {
        heading: "Vehicles",
        body: [
          "Transfer of ownership, number plates and related vehicle records are handled through official systems. Always verify that a vehicle is not stolen or under restriction through lawful channels.",
          "Public service vehicle (PSV) rules, inspection and insurance requirements are separate from private car licensing.",
        ],
      },
    ],
    relatedServices: [
      { text: "All services", href: "/services" },
      { text: "eCitizen explained", href: "/ecitizen" },
    ],
  },
  {
    slug: "money-tax",
    title: "Money, tax and pensions",
    summary:
      "KRA PIN, tax returns, compliance checks and social security basics.",
    lead: "High-level information about tax and social security in Kenya. Filing and payments happen on official systems such as iTax — never on CitizenGuide.KE.",
    sections: [
      {
        heading: "Kenya Revenue Authority (KRA)",
        body: [
          "Most taxpayers need a KRA Personal Identification Number (PIN). Individuals and businesses file returns and pay taxes through iTax and related KRA channels.",
          "This site does not calculate your tax liability. For obligations, deadlines and forms, use KRA’s official guidance or a licensed tax professional.",
        ],
        links: [
          { text: "Money and tax services", href: "/services?category=money-tax" },
          { text: "KRA iTax", href: "https://itax.kra.go.ke", external: true },
        ],
      },
      {
        heading: "Pensions and social security",
        body: [
          "The National Social Security Fund (NSSF) provides social security contributions for eligible workers. Occupational and individual pension schemes are regulated separately.",
          "Confirm contribution rates and member portals on official NSSF and Retirement Benefits Authority sources.",
        ],
      },
      {
        heading: "Public finance (citizen view)",
        body: [
          "How national and county budgets are shared is explained on our public money page. That is different from your personal tax account.",
        ],
        links: [
          { text: "How public money works", href: "/how-public-money-works" },
        ],
      },
    ],
    relatedServices: [
      { text: "Scams and fake websites", href: "/scams" },
      { text: "Open data", href: "/open-data" },
    ],
  },
  {
    slug: "health",
    title: "Health and social care",
    summary:
      "Public health cover, hospitals and high-level guidance on government health systems.",
    lead: "Overview of government health-related services and social health insurance arrangements. Clinical advice must come from qualified health workers — not this website.",
    sections: [
      {
        heading: "Social health insurance",
        body: [
          "Kenya has moved toward a social health insurance model (including arrangements replacing or succeeding NHIF under newer laws and institutions such as the Social Health Authority). Registration, contributions and benefits are defined by law and official regulations.",
          "Check the official Social Health Authority / Ministry of Health channels for current registration steps, contribution rules and benefit packages. Do not rely on unofficial agents.",
        ],
        links: [
          { text: "Ministry of Health (official)", href: "https://www.health.go.ke", external: true },
        ],
      },
      {
        heading: "Public health facilities",
        body: [
          "County governments manage many primary and secondary public health facilities. National referral hospitals and specialised programmes have their own governance.",
          "Emergencies: use local emergency numbers and the nearest appropriate facility. This site is not an emergency service.",
        ],
        links: [
          { text: "County vs national government", href: "/county-vs-national" },
          { text: "Emergency and safety information", href: "/emergency-and-safety" },
        ],
      },
    ],
    relatedServices: [
      { text: "Browse all topics", href: "/topics" },
      { text: "Contact government", href: "/contact-government" },
    ],
  },
  {
    slug: "education",
    title: "Education and training",
    summary:
      "Basic education, exams, university placement, HELB and TVET overview.",
    lead: "How education is organised in Kenya at a high level, and where to find official information on exams, placement and student finance.",
    sections: [
      {
        heading: "Structure of education",
        body: [
          "Kenya has transitioned toward the Competency Based Curriculum (CBC) alongside reforms to earlier 8-4-4 pathways. Early childhood education is largely a county function; primary and secondary policy is national, with delivery shared across institutions.",
          "The Teachers Service Commission (TSC) manages teachers in public service. Curriculum and examinations involve specialised agencies such as KNEC for national assessments.",
        ],
      },
      {
        heading: "Higher education and training",
        body: [
          "University placement is commonly coordinated through KUCCPS for government-sponsored pathways. Student loans and bursaries may involve HELB and other schemes with their own eligibility rules.",
          "Technical and Vocational Education and Training (TVET) is an important pathway — check the relevant state department and institution websites for admissions.",
        ],
        links: [
          { text: "Policy documents", href: "/documents" },
          { text: "Constitution — education rights", href: "/constitution" },
        ],
      },
    ],
    relatedServices: [
      { text: "Guides", href: "/guides" },
      { text: "Services", href: "/services" },
    ],
  },
  {
    slug: "land-property",
    title: "Land, housing and property",
    summary:
      "Land search, rates, titles and property-related public processes.",
    lead: "Information about land administration and property-related government processes. Always verify titles and payments on official systems. Land fraud is common — use caution.",
    sections: [
      {
        heading: "Titles and searches",
        body: [
          "Land registration and related services are delivered through national land administration systems (including digital platforms such as Ardhisasa where rolled out). County governments collect rates and manage some planning and housing functions.",
          "Never pay for a ‘title’ outside official channels. Confirm ownership through lawful search processes and, where needed, qualified professionals.",
        ],
        links: [
          { text: "Land and property services", href: "/services?category=land-property" },
          { text: "Scams and fake websites", href: "/scams" },
        ],
      },
      {
        heading: "Disputes and institutions",
        body: [
          "The National Land Commission and the courts have distinct roles in land governance and disputes. This website does not provide legal advice.",
          "Succession and inheritance of property follow succession law and court processes.",
        ],
      },
    ],
    relatedServices: [
      { text: "Access to information", href: "/access-to-information" },
      { text: "Crime, justice and the law", href: "/topics/crime-justice" },
    ],
  },
  {
    slug: "business",
    title: "Business and self-employed",
    summary:
      "Business names, companies, county permits and common licences.",
    lead: "Starting and running a business involves national registries, tax registration and often county licences. This page points you to the right type of process.",
    sections: [
      {
        heading: "Registering a business",
        body: [
          "Business names and companies are registered through the Business Registration Service / official company registry channels, often via eCitizen. You will usually also need a KRA PIN and may need sector licences.",
          "A single business permit is typically issued by the county government where you operate. Requirements differ by county and activity.",
        ],
        links: [
          { text: "Business services", href: "/services?category=business-self-employed" },
          { text: "eCitizen", href: "https://www.ecitizen.go.ke", external: true },
          { text: "KRA iTax", href: "https://itax.kra.go.ke", external: true },
        ],
      },
      {
        heading: "Employing people",
        body: [
          "Employers have duties under labour law, including statutory deductions where applicable (tax, social security, health contributions as required by current law).",
          "Sector regulators (for example energy, food safety, transport) issue additional licences.",
        ],
      },
    ],
    relatedServices: [
      { text: "Money and tax", href: "/topics/money-tax" },
      { text: "County vs national", href: "/county-vs-national" },
    ],
  },
  {
    slug: "work-employment",
    title: "Work and employment",
    summary:
      "Labour rights overview, workplace issues and public service employment pointers.",
    lead: "High-level information about work and employment in Kenya. For disputes, use the labour offices, unions, or legal advice as appropriate.",
    sections: [
      {
        heading: "Your rights at work",
        body: [
          "Employment relationships are governed by the Constitution, the Employment Act and related labour laws. Core ideas include fair labour practices, written particulars of employment where required, and protection against unfair termination under the law.",
          "This is not legal advice. For a specific dispute, contact the Ministry of Labour channels, a qualified advocate, or an accredited legal aid provider.",
        ],
        links: [
          { text: "Constitution of Kenya", href: "/constitution" },
          { text: "How to complain about government", href: "/complain-about-government" },
        ],
      },
      {
        heading: "Public service jobs",
        body: [
          "National public service recruitment is typically advertised by the Public Service Commission and individual ministries or agencies. County public service boards recruit for county roles.",
          "Always apply through official advertisements. Treat unsolicited job offers that ask for fees as potential scams.",
        ],
        links: [
          { text: "Scams and fake websites", href: "/scams" },
          { text: "Government institutions", href: "/government/institutions" },
        ],
      },
    ],
  },
  {
    slug: "benefits-social-protection",
    title: "Benefits and social protection",
    summary:
      "Cash transfer programmes and support for vulnerable groups — high-level overview.",
    lead: "Kenya runs several social protection programmes for older persons, persons with severe disability, orphans and vulnerable children, and other groups. Eligibility and payment systems are set by government.",
    sections: [
      {
        heading: "Common programme types",
        body: [
          "Inua Jamii and related cash transfer programmes support eligible households through official registration and payment mechanisms. Names, benefit levels and enrolment windows change over time.",
          "Disability-related support may involve the National Council for Persons with Disabilities (NCPWD) and other agencies for registration and benefits.",
        ],
      },
      {
        heading: "How to get accurate information",
        body: [
          "Use Ministry of Labour and Social Protection, county social development offices, and official programme announcements. Beware of people who claim they can ‘register you faster’ for a fee.",
        ],
        links: [
          { text: "Scams and fake websites", href: "/scams" },
          { text: "Disability and inclusion", href: "/topics/disability" },
        ],
      },
    ],
  },
  {
    slug: "crime-justice",
    title: "Crime, justice and the law",
    summary:
      "Reporting crime, courts overview, legal aid and administrative justice.",
    lead: "How the justice system is organised at a high level and where citizens can turn for reporting crime, complaints and court information. This is not legal advice.",
    sections: [
      {
        heading: "Reporting crime",
        body: [
          "Report crimes to the National Police Service at a police station. You can request an occurrence book (OB) number for your report. Emergencies should use official emergency numbers.",
          "Corruption-related reports may also go to the Ethics and Anti-Corruption Commission (EACC) through its official channels.",
        ],
        links: [
          { text: "Emergency and safety", href: "/emergency-and-safety" },
          { text: "Complain about government", href: "/complain-about-government" },
        ],
      },
      {
        heading: "Courts and prosecution",
        body: [
          "The Judiciary is independent. Court structure includes magistrates’ courts, the High Court, specialised courts, the Court of Appeal and the Supreme Court.",
          "The Office of the Director of Public Prosecutions (ODPP) conducts public prosecutions. Judgments and cause lists are published through official Judiciary channels where available.",
        ],
        links: [
          { text: "The Judiciary", href: "/government/judiciary" },
          { text: "Constitution", href: "/constitution" },
        ],
      },
      {
        heading: "Administrative justice",
        body: [
          "The Commission on Administrative Justice (Office of the Ombudsman) handles maladministration complaints against public officers and bodies within its mandate.",
        ],
        links: [
          { text: "Access to information", href: "/access-to-information" },
        ],
      },
    ],
  },
  {
    slug: "local-county-services",
    title: "Local and county services",
    summary:
      "What counties do, ward representation, and local licences and billing.",
    lead: "County governments deliver many services closest to citizens — from early childhood education and local health facilities to trade licences and county roads.",
    sections: [
      {
        heading: "What counties typically handle",
        body: [
          "The Fourth Schedule of the Constitution divides functions between the national and county governments. Counties commonly handle local health facilities, county transport, trade development and regulation, county planning, and early childhood education, among other functions.",
          "National government retains functions such as foreign affairs, national defence, immigration, and primary education policy frameworks — see our county vs national guide.",
        ],
        links: [
          { text: "County vs national government", href: "/county-vs-national" },
          { text: "County governments", href: "/government/counties" },
          { text: "Devolution", href: "/government/counties/devolution" },
        ],
      },
      {
        heading: "Your local representatives",
        body: [
          "Each ward elects a Member of the County Assembly (MCA). Counties also have a governor, deputy governor, and a county assembly. Nationally you may be represented by an MP, woman representative and senator depending on the seat.",
        ],
        links: [
          { text: "Find your representatives", href: "/find-your-representatives" },
          { text: "Wards", href: "/government/counties/wards" },
        ],
      },
    ],
  },
  {
    slug: "elections-participation",
    title: "Elections and participation",
    summary:
      "Voter registration, elections, parties and how to take part in democratic processes.",
    lead: "Elections in Kenya are managed by the Independent Electoral and Boundaries Commission (IEBC). Use this site for orientation; use IEBC for official registers and results.",
    sections: [
      {
        heading: "Voting and registration",
        body: [
          "Eligible citizens must be registered to vote. You can check registration details and polling station information through IEBC channels when open.",
          "General elections, by-elections and referendums follow constitutional timelines and IEBC calendars.",
        ],
        links: [
          { text: "Elections hub", href: "/elections" },
          { text: "Voter registration", href: "/elections/voter-registration" },
          { text: "Polling stations", href: "/elections/polling-stations" },
        ],
      },
      {
        heading: "Parties and coalitions",
        body: [
          "Political parties are registered and regulated under Kenyan law. Coalitions and party-hopping rules are set out in statute and IEBC processes.",
        ],
        links: [
          { text: "Political parties", href: "/elections/political-parties" },
          { text: "Coalitions", href: "/elections/coalitions" },
        ],
      },
    ],
  },
  {
    slug: "environment-farming",
    title: "Environment and farming",
    summary:
      "Environment regulation overview and agricultural public programmes at a high level.",
    lead: "National and county governments share roles in agriculture and environment. Use official ministry and regulator sites for licences, subsidies and compliance.",
    sections: [
      {
        heading: "Environment",
        body: [
          "The National Environment Management Authority (NEMA) and related bodies regulate environmental impact, waste and related compliance. Climate and drought response involve specialised agencies such as NDMA for drought management.",
        ],
        links: [
          { text: "Emergency and safety", href: "/emergency-and-safety" },
        ],
      },
      {
        heading: "Agriculture",
        body: [
          "Agriculture is largely a county function for many extension and local services, with national policy, research and some programmes at national level.",
          "Input subsidy or support programmes, when available, are announced officially. Treat social media ‘registration’ links with caution.",
        ],
        links: [
          { text: "Scams and fake websites", href: "/scams" },
          { text: "County governments", href: "/government/counties" },
        ],
      },
    ],
  },
  {
    slug: "digital-government",
    title: "Digital government",
    summary:
      "eCitizen, Huduma Centres and how online public services work.",
    lead: "Most national public services are delivered online through eCitizen and related agency portals, with Huduma Centres offering assisted in-person access.",
    sections: [
      {
        heading: "eCitizen",
        body: [
          "eCitizen is the main government services gateway for many national services. You create an account, apply, pay and track applications on official domains only.",
        ],
        links: [
          { text: "eCitizen explained", href: "/ecitizen" },
          { text: "Open eCitizen", href: "https://www.ecitizen.go.ke", external: true },
        ],
      },
      {
        heading: "Huduma Centres",
        body: [
          "Huduma Centres are one-stop service centres where citizens can access multiple government services with assistance. They complement — not replace — online systems.",
        ],
        links: [
          { text: "Huduma Centres explained", href: "/huduma-centres" },
        ],
      },
      {
        heading: "Stay safe online",
        body: [
          "Phishing sites often copy eCitizen, KRA or NTSA branding. Check the web address carefully and never share one-time passwords (OTPs).",
        ],
        links: [
          { text: "Scams and fake websites", href: "/scams" },
        ],
      },
    ],
  },
  {
    slug: "disability",
    title: "Disability and inclusion",
    summary:
      "Rights, registration pointers and accessible public services overview.",
    lead: "Persons with disabilities have constitutional rights to dignity, access and reasonable accommodation. Public bodies should provide accessible services.",
    sections: [
      {
        heading: "Rights and institutions",
        body: [
          "The Constitution protects equality and freedom from discrimination. The Persons with Disabilities Act and related policies set out more detailed rights and institutional roles.",
          "The National Council for Persons with Disabilities (NCPWD) handles registration and related programmes within its mandate.",
        ],
        links: [
          { text: "Constitution", href: "/constitution" },
          { text: "Accessibility statement for this website", href: "/accessibility" },
        ],
      },
      {
        heading: "Accessing services",
        body: [
          "When applying for government services, ask about accessible formats, priority queues at Huduma Centres, and official tax or duty relief schemes that may apply — confirm on official sites.",
        ],
        links: [
          { text: "Huduma Centres", href: "/huduma-centres" },
          { text: "Benefits and social protection", href: "/topics/benefits-social-protection" },
        ],
      },
    ],
  },
  {
    slug: "youth",
    title: "Youth",
    summary:
      "Public programmes and civic information relevant to young Kenyans.",
    lead: "Young people interact with government through education, work, enterprise funds, digital skills programmes and civic participation. Always use official application portals.",
    sections: [
      {
        heading: "Education and work",
        body: [
          "Pathways include secondary education, TVET, university, apprenticeships and public internship or digital work programmes when advertised officially.",
          "Avoid paying individuals who promise guaranteed government jobs or fund approvals.",
        ],
        links: [
          { text: "Education and training", href: "/topics/education" },
          { text: "Work and employment", href: "/topics/work-employment" },
          { text: "Scams and fake websites", href: "/scams" },
        ],
      },
      {
        heading: "Participation",
        body: [
          "Register to vote when eligible, engage county public participation processes, and use formal channels for petitions and feedback.",
        ],
        links: [
          { text: "Elections", href: "/elections" },
          { text: "How government works", href: "/how-government-works" },
        ],
      },
    ],
  },
];

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}

export function getAllTopicSlugs(): string[] {
  return topics.map((t) => t.slug);
}
