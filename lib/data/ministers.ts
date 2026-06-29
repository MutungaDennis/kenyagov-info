// lib/data/ministers.ts

export interface Assignment {
  roleTitle: string;
  department?: string;
  departmentSlug?: string;
  isExecutiveOffice?: boolean;
}

export interface CabinetOfficial {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  fullName: string;
  biography: string;
  responsibilities: string[];
  education?: string[];
  politicalCareer?: string[];
  personalLife?: string;
  assignments: Assignment[];
}

// ============================================================================
// EXECUTIVE LEADERSHIP (Items 1 - 3)
// ============================================================================
export const officialsRegistryPart1: Record<string, CabinetOfficial> = {
  "william-ruto": {
    id: "william-ruto",
    slug: "william-ruto",
    firstName: "William",
    lastName: "Ruto",
    fullName: "H.E. Dr. William Samoei Ruto, CGH",
    biography: "Dr. William Ruto is the President of Kenya. He is the head of state, head of government, and commander-in-chief of the Kenya Defence Forces. He was born in a small village in Uasin Gishu County and worked hard from a young age, selling chicken and groundnuts to support his education.",
    responsibilities: [
      "Leads the national government and sets the direction for the country",
      "Commands the Kenya Defence Forces",
      "Appoints cabinet secretaries and other senior officials",
      "Represents Kenya in international meetings and agreements"
    ],
    education: [
      "PhD in Plant Ecology – University of Nairobi (2018)",
      "MSc in Plant Ecology – University of Nairobi (2011)",
      "BSc in Botany and Zoology – University of Nairobi (1990)"
    ],
    politicalCareer: [
      "President of Kenya (2022 – present)",
      "Deputy President of Kenya (2013 – 2022)",
      "Cabinet Minister for Agriculture and Higher Education",
      "Started in politics in 1992 with the Youth for KANU movement"
    ],
    personalLife: "He is married to Rachel Chebet Ruto. They have seven children. He often speaks about the importance of hard work and education.",
    assignments: [
      {
        roleTitle: "President & Commander-in-Chief",
        department: "Executive Office of the President",
        departmentSlug: "executive-office-of-the-president",
        isExecutiveOffice: true
      }
    ]
  },

  "kithure-kindiki": {
    id: "kithure-kindiki",
    slug: "kithure-kindiki",
    firstName: "Kithure",
    lastName: "Kindiki",
    fullName: "H.E. Prof. Kithure Kindiki, EGH",
    biography: "Professor Kithure Kindiki is the Deputy President of Kenya. He is a lawyer and former university lecturer who rose through the Senate before joining the cabinet. He now supports the President in running the government.",
    responsibilities: [
      "Assists the President in running the government",
      "Takes over presidential duties when the President is away",
      "Coordinates government work across ministries"
    ],
    education: [
      "PhD in International Law – University of Pretoria, South Africa",
      "Master of Laws (LLM) – University of Pretoria",
      "Bachelor of Laws (LLB) – Moi University",
      "Postgraduate Diploma in Law – Kenya School of Law"
    ],
    politicalCareer: [
      "Deputy President of Kenya (2024 – present)",
      "Cabinet Secretary for Interior and National Administration (2022 – 2024)",
      "Senator for Tharaka-Nithi County (2013 – 2022)",
      "Senate Majority Leader and later Deputy Speaker of the Senate"
    ],
    personalLife: "He is married to Joyce Kithure and they have two children. Before politics, he was a respected law professor.",
    assignments: [
      {
        roleTitle: "Deputy President",
        department: "Office of the Deputy President",
        departmentSlug: "office-of-the-deputy-president",
        isExecutiveOffice: true
      }
    ]
  },

  "musalia-mudavadi": {
    id: "musalia-mudavadi",
    slug: "musalia-mudavadi",
    firstName: "Musalia",
    lastName: "Mudavadi",
    fullName: "Hon. Dr. Musalia Mudavadi, EGH",
    biography: "Dr. Musalia Mudavadi serves as Prime Cabinet Secretary. He helps coordinate the work of the entire government and also serves as Cabinet Secretary for Foreign Affairs. He has many years of experience in both national and international politics.",
    responsibilities: [
      "Coordinates the work of all cabinet secretaries",
      "Leads Kenya’s foreign policy and international relations",
      "Helps manage the government’s legislative agenda in Parliament"
    ],
    education: [
      "Bachelor of Arts in Economics – University of Nairobi"
    ],
    politicalCareer: [
      "Prime Cabinet Secretary (2022 – present)",
      "Cabinet Secretary for Foreign Affairs (2022 – present)",
      "Has served in various senior government positions since the 1990s",
      "Former Vice President of Kenya (briefly in 2002)"
    ],
    personalLife: "He is a seasoned politician from the Luhya community with decades of experience in public service.",
    assignments: [
      {
        roleTitle: "Prime Cabinet Secretary",
        department: "Office of the Prime Cabinet Secretary (Executive Office of the President)",
        departmentSlug: "executive-office-of-the-president",
        isExecutiveOffice: true
      },
      {
        roleTitle: "Cabinet Secretary for Foreign Affairs",
        department: "Ministry of Foreign Affairs and Diaspora Affairs",
        departmentSlug: "ministry-of-foreign-affairs",
        isExecutiveOffice: false
      }
    ]
  }
};

// ============================================================================
// OFFICIALS REGISTRY CONTINUED (Items 4 - 9)
// ============================================================================
export const officialsRegistryPart2: Record<string, CabinetOfficial> = {
  "onesimus-kipchumba-murkomen": {
    id: "onesimus-kipchumba-murkomen",
    slug: "onesimus-kipchumba-murkomen",
    firstName: "Kipchumba",
    lastName: "Murkomen",
    fullName: "Hon. Onesimus Kipchumba Murkomen, EGH",
    biography: "Kipchumba Murkomen is the Cabinet Secretary for Interior and National Administration. He is in charge of internal security, border control, national administration, and public safety across the country.",
    responsibilities: [
      "Oversees internal security and national administration",
      "Manages the police service and border control",
      "Coordinates county administration and public safety programs"
    ],
    education: [
      "Bachelor of Laws (LLB) – University of Nairobi",
      "Master of Laws (LLM) – University of Pretoria",
      "Advocate of the High Court of Kenya"
    ],
    politicalCareer: [
      "Cabinet Secretary for Interior (2022 – present)",
      "Senator for Elgeyo-Marakwet County (2013 – 2022)",
      "Member of Parliament for Marakwet East",
      "Served as Senate Majority Leader"
    ],
    personalLife: "He is married and has children. He comes from Elgeyo-Marakwet County.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Interior and National Administration",
        departmentSlug: "ministry-of-interior",
        isExecutiveOffice: false
      }
    ]
  },

  "john-mbadi-ngongo": {
    id: "john-mbadi-ngongo",
    slug: "john-mbadi-ngongo",
    firstName: "John",
    lastName: "Mbadi",
    fullName: "Hon. John Mbadi Ng'ongo, EGH",
    biography: "John Mbadi is the Cabinet Secretary for the National Treasury and Economic Planning. He is responsible for managing the country’s money, taxes, government spending, and economic planning.",
    responsibilities: [
      "Manages national budget and public finances",
      "Oversees tax collection and economic planning",
      "Controls government spending and debt"
    ],
    education: [
      "Bachelor of Commerce – University of Nairobi",
      "Certified Public Accountant (CPA)"
    ],
    politicalCareer: [
      "Cabinet Secretary for the National Treasury (2024 – present)",
      "Member of Parliament for Suba South",
      "Former Leader of Minority Party in the National Assembly",
      "Long-serving legislator since 2007"
    ],
    personalLife: "He is a seasoned politician and accountant from Homa Bay County.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "The National Treasury and Economic Planning",
        departmentSlug: "national-treasury",
        isExecutiveOffice: false
      }
    ]
  },

  "aden-duale": {
    id: "aden-duale",
    slug: "aden-duale",
    firstName: "Aden",
    lastName: "Duale",
    fullName: "Hon. Aden Barre Duale, EGH",
    biography: "Aden Duale is the Cabinet Secretary for Health. He leads efforts to improve healthcare services, expand Universal Health Coverage, and manage hospitals and disease control across Kenya.",
    responsibilities: [
      "Oversees public health services and hospitals",
      "Drives Universal Health Coverage (UHC) programs",
      "Manages disease prevention and health policy"
    ],
    education: [
      "Bachelor of Education – Moi University",
      "Master of Business Administration (MBA) – JKUAT"
    ],
    politicalCareer: [
      "Cabinet Secretary for Health (2025 – present)",
      "Previously Cabinet Secretary for Defence and Environment",
      "Member of Parliament for Garissa Township (2007 – 2022)",
      "Former Majority Leader of the National Assembly"
    ],
    personalLife: "He comes from Garissa County and has a background in teaching and business before politics.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Health",
        departmentSlug: "ministry-of-health",
        isExecutiveOffice: false
      }
    ]
  },

  "soipan-tuya": {
    id: "soipan-tuya",
    slug: "soipan-tuya",
    firstName: "Soipan",
    lastName: "Tuya",
    fullName: "Hon. Roselinda Soipan Tuya, EGH",
    biography: "Soipan Tuya is the Cabinet Secretary for Defence. She is responsible for the Kenya Defence Forces, national security policy, and protecting Kenya’s borders and sovereignty.",
    responsibilities: [
      "Oversees the Kenya Defence Forces",
      "Develops defence and security policy",
      "Manages military operations and international defence cooperation"
    ],
    education: [
      "Bachelor of Laws (LLB) – University of Nairobi",
      "Master of Laws (LLM) – University of Washington, USA",
      "Postgraduate Diploma in Law – Kenya School of Law"
    ],
    politicalCareer: [
      "Cabinet Secretary for Defence (2024 – present)",
      "Previously Cabinet Secretary for Environment",
      "Member of Parliament for Narok County (two terms)",
      "Nominated Senator before joining Cabinet"
    ],
    personalLife: "She is from Narok County and is one of the prominent women leaders from the Maasai community.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Defence",
        departmentSlug: "ministry-of-defence",
        isExecutiveOffice: false
      }
    ]
  },

  "hassan-ali-joho": {
    id: "hassan-ali-joho",
    slug: "hassan-ali-joho",
    firstName: "Hassan",
    lastName: "Joho",
    fullName: "Hon. Hassan Ali Joho, EGH",
    biography: "Hassan Joho is the Cabinet Secretary for Mining, Blue Economy and Maritime Affairs. He works to develop Kenya’s mining sector, protect ocean resources, and improve ports and maritime infrastructure.",
    responsibilities: [
      "Develops mining and mineral resources policy",
      "Promotes the Blue Economy and ocean resources",
      "Oversees ports, shipping, and maritime infrastructure"
    ],
    education: [
      "BA in Business Administration and Human Resource Management – Kampala University",
      "Various diplomas in business, shipping and logistics"
    ],
    politicalCareer: [
      "Cabinet Secretary for Mining, Blue Economy and Maritime Affairs (2024 – present)",
      "Governor of Mombasa County (2013 – 2022)",
      "Member of Parliament for Kisauni Constituency",
      "Long-time politician from the Coast region"
    ],
    personalLife: "He was born and raised in Mombasa and is a well-known leader from the coastal region.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Mining, Blue Economy and Maritime Affairs",
        departmentSlug: "ministry-of-mining",
        isExecutiveOffice: false
      }
    ]
  },

  "julius-migos-ogamba": {
    id: "julius-migos-ogamba",
    slug: "julius-migos-ogamba",
    firstName: "Julius",
    lastName: "Ogamba",
    fullName: "Hon. Julius Migos Ogamba",
    biography: "Julius Migos Ogamba is the Cabinet Secretary for Education. He leads efforts to improve schools, universities, technical training, and the overall quality of education in Kenya.",
    responsibilities: [
      "Oversees primary, secondary and higher education",
      "Manages curriculum development and teacher training",
      "Coordinates universities, TVET institutions and student funding"
    ],
    education: [
      "Bachelor of Laws (LLB) – University of Nairobi",
      "Master of Laws (LLM) – University of Dundee, Scotland",
      "Postgraduate Diploma in Law – Kenya School of Law"
    ],
    politicalCareer: [
      "Cabinet Secretary for Education (2024 – present)",
      "Chairman of KenGen Board before joining Cabinet",
      "Advocate with nearly 30 years of legal experience",
      "Commissioner for Oaths and Notary Public"
    ],
    personalLife: "He comes from Kisii County and has a strong background in law and public service.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Education",
        departmentSlug: "ministry-of-education",
        isExecutiveOffice: false
      }
    ]
  }
};

// ============================================================================
// OFFICIALS REGISTRY CONTINUED (Items 10 - 15)
// ============================================================================
export const officialsRegistryPart3: Record<string, CabinetOfficial> = {
  "alice-wahome": {
    id: "alice-wahome",
    slug: "alice-wahome",
    firstName: "Alice",
    lastName: "Wahome",
    fullName: "Hon. Alice Wahome, EGH",
    biography: "Alice Wahome is the Cabinet Secretary for Lands, Public Works, Housing and Urban Development. She works on land registration, affordable housing, and major infrastructure projects across the country.",
    responsibilities: [
      "Oversees land registration and title deeds",
      "Leads affordable housing and urban development projects",
      "Manages public works and government buildings"
    ],
    education: [
      "Bachelor of Laws (LLB) – University of Nairobi (1984)",
      "Postgraduate Diploma in Law – Kenya School of Law"
    ],
    politicalCareer: [
      "Cabinet Secretary for Lands, Public Works, Housing and Urban Development",
      "Member of Parliament for Kandara Constituency (three terms)",
      "Long-serving advocate and politician from Murang’a County"
    ],
    personalLife: "She is a lawyer by training and has been active in politics since the 1990s.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Lands, Public Works, Housing and Urban Development",
        departmentSlug: "ministry-of-lands",
        isExecutiveOffice: false
      }
    ]
  },

  "wycliffe-ambetsa-oparanya": {
    id: "wycliffe-ambetsa-oparanya",
    slug: "wycliffe-ambetsa-oparanya",
    firstName: "Wycliffe",
    lastName: "Oparanya",
    fullName: "Hon. Wycliffe Ambetsa Oparanya, FCPA, EGH",
    biography: "Wycliffe Oparanya is the Cabinet Secretary for Co-operatives and Micro, Small and Medium Enterprises (MSMEs) Development. He supports small businesses, SACCOs, and helps grow the cooperative movement in Kenya.",
    responsibilities: [
      "Supports small businesses and MSMEs",
      "Strengthens cooperative societies and SACCOs",
      "Promotes entrepreneurship and job creation"
    ],
    education: [
      "Bachelor of Commerce",
      "Fellow of the Institute of Certified Public Accountants of Kenya (FCPA)"
    ],
    politicalCareer: [
      "Cabinet Secretary for Co-operatives and MSMEs",
      "Governor of Kakamega County (2013 – 2022)",
      "Member of Parliament for Butere Constituency",
      "Former Minister in previous governments"
    ],
    personalLife: "He is a certified accountant and experienced leader from Kakamega County.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Co-operatives and Micro, Small and Medium Enterprises (MSMEs) Development",
        departmentSlug: "ministry-of-cooperatives",
        isExecutiveOffice: false
      }
    ]
  },

  "alfred-mutua": {
    id: "alfred-mutua",
    slug: "alfred-mutua",
    firstName: "Alfred",
    lastName: "Mutua",
    fullName: "Hon. Dr. Alfred Mutua, EGH",
    biography: "Dr. Alfred Mutua is the Cabinet Secretary for Labour and Social Protection. He handles labour relations, worker safety, social welfare programs, and support for vulnerable groups in society.",
    responsibilities: [
      "Manages labour laws and worker rights",
      "Oversees social protection and cash transfer programs",
      "Handles issues affecting persons with disabilities and the elderly"
    ],
    education: [
      "PhD in Communication",
      "Bachelor’s degree in Communication and Journalism"
    ],
    politicalCareer: [
      "Cabinet Secretary for Labour and Social Protection",
      "Governor of Machakos County (2013 – 2022)",
      "Former Government Spokesperson",
      "Long-time politician and communication expert"
    ],
    personalLife: "He was the first Governor of Machakos County and is known for his communication skills.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Labour and Social Protection",
        departmentSlug: "ministry-of-labour",
        isExecutiveOffice: false
      }
    ]
  },

  "rebecca-miano": {
    id: "rebecca-miano",
    slug: "rebecca-miano",
    firstName: "Rebecca",
    lastName: "Miano",
    fullName: "Hon. Rebecca Miano, EGH",
    biography: "Rebecca Miano is the Cabinet Secretary for Tourism and Wildlife. She works to grow Kenya’s tourism industry, protect wildlife, and promote conservation efforts.",
    responsibilities: [
      "Promotes Kenya as a top tourist destination",
      "Oversees national parks and wildlife conservation",
      "Supports community-based tourism and anti-poaching efforts"
    ],
    education: [
      "Bachelor of Laws (LLB)",
      "Advocate of the High Court of Kenya"
    ],
    politicalCareer: [
      "Cabinet Secretary for Tourism and Wildlife",
      "Former Managing Director of Kenya Electricity Generating Company (KenGen)",
      "Experienced corporate leader before joining government"
    ],
    personalLife: "She has a strong background in law and corporate leadership.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Tourism and Wildlife",
        departmentSlug: "ministry-of-tourism",
        isExecutiveOffice: false
      }
    ]
  },

  "salim-mvurya": {
    id: "salim-mvurya",
    slug: "salim-mvurya",
    firstName: "Salim",
    lastName: "Mvurya",
    fullName: "Hon. Salim Mvurya, EGH",
    biography: "Salim Mvurya is the Cabinet Secretary for Youth Affairs, Creative Economy and Sports. He focuses on creating opportunities for young people, developing sports, and supporting the creative industries.",
    responsibilities: [
      "Creates programs and opportunities for young people",
      "Develops sports infrastructure and talent",
      "Supports music, film, and other creative industries"
    ],
    education: [
      "Bachelor’s degree in Education"
    ],
    politicalCareer: [
      "Cabinet Secretary for Youth Affairs, Creative Economy and Sports",
      "Governor of Kwale County (2013 – 2022)",
      "Long-serving leader from the Coast region"
    ],
    personalLife: "He comes from Kwale County and has served as a governor for two terms.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Youth Affairs, Creative Economy and Sports",
        departmentSlug: "ministry-of-youth-sports",
        isExecutiveOffice: false
      }
    ]
  },

  "davis-chirchir": {
    id: "davis-chirchir",
    slug: "davis-chirchir",
    firstName: "Davis",
    lastName: "Chirchir",
    fullName: "Hon. Davis Chirchir, EGH",
    biography: "Davis Chirchir is the Cabinet Secretary for Roads and Transport. He is responsible for roads, railways, ports, airports, and overall transport infrastructure in Kenya.",
    responsibilities: [
      "Oversees construction and maintenance of roads",
      "Manages railways, ports and aviation",
      "Improves public transport and infrastructure projects"
    ],
    education: [
      "Bachelor of Science in Electrical Engineering"
    ],
    politicalCareer: [
      "Cabinet Secretary for Roads and Transport",
      "Previously served as Cabinet Secretary for Energy",
      "Experienced engineer and long-serving public servant"
    ],
    personalLife: "He is an engineer by training with many years in public service.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Roads and Transport",
        departmentSlug: "ministry-of-roads",
        isExecutiveOffice: false
      }
    ]
  }
};

// ============================================================================
// OFFICIALS REGISTRY CONCLUDED (Items 16 - 24)
// ============================================================================
export const officialsRegistryPart4: Record<string, CabinetOfficial> = {
  "eric-muriithi-muuga": {
    id: "eric-muriithi-muuga",
    slug: "eric-muriithi-muuga",
    firstName: "Eric",
    lastName: "Muuga",
    fullName: "Hon. Eric Muriithi Muuga",
    biography: "Eric Muriithi Muuga is the Cabinet Secretary for Water, Sanitation and Irrigation. He leads efforts to provide clean water, improve sanitation, and expand irrigation for farming across Kenya.",
    responsibilities: [
      "Expands access to clean water and sanitation",
      "Develops irrigation projects for farmers",
      "Manages water resources and dams"
    ],
    education: [
      "Bachelor of Science in Civil Engineering"
    ],
    politicalCareer: [
      "Cabinet Secretary for Water, Sanitation and Irrigation",
      "Previously served as a Principal Secretary",
      "Experienced engineer in the water sector"
    ],
    personalLife: "He is an engineer with deep experience in water and infrastructure projects.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Water, Sanitation and Irrigation",
        departmentSlug: "ministry-of-water",
        isExecutiveOffice: false
      }
    ]
  },

  "deborah-mulongo-barasa": {
    id: "deborah-mulongo-barasa",
    slug: "deborah-mulongo-barasa",
    firstName: "Deborah",
    lastName: "Barasa",
    fullName: "Hon. Dr. Deborah Mulongo Barasa",
    biography: "Dr. Deborah Barasa is the Cabinet Secretary for Environment, Climate Change and Forestry. She leads efforts to protect the environment, fight climate change, and increase Kenya’s forest cover.",
    responsibilities: [
      "Protects the environment and natural resources",
      "Leads climate change action and adaptation",
      "Oversees forestry and tree planting programs"
    ],
    education: [
      "PhD in a relevant field",
      "Medical background (Doctor)"
    ],
    politicalCareer: [
      "Cabinet Secretary for Environment, Climate Change and Forestry",
      "Previously served in health-related roles",
      "Experienced professional in public health and environment"
    ],
    personalLife: "She is a doctor by training and brings technical expertise to environmental issues.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Environment, Climate Change & Forestry",
        departmentSlug: "ministry-of-environment",
        isExecutiveOffice: false
      }
    ]
  },

  "lee-maiyani-kinyanjui": {
    id: "lee-maiyani-kinyanjui",
    slug: "lee-maiyani-kinyanjui",
    firstName: "Lee",
    lastName: "Kinyanjui",
    fullName: "Hon. Lee Maiyani Kinyanjui",
    biography: "Lee Kinyanjui is the Cabinet Secretary for Investments, Trade and Industry. He works to attract foreign investment, grow local industries, and create jobs through trade and manufacturing.",
    responsibilities: [
      "Attracts foreign and local investment",
      "Promotes manufacturing and industrial growth",
      "Develops trade policies and Special Economic Zones"
    ],
    education: [
      "Bachelor’s degree in Business Administration"
    ],
    politicalCareer: [
      "Cabinet Secretary for Investments, Trade and Industry",
      "Former Governor of Nakuru County",
      "Long-serving politician from Rift Valley"
    ],
    personalLife: "He has served as a governor and brings business and leadership experience.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Investments, Trade and Industry",
        departmentSlug: "ministry-of-trade",
        isExecutiveOffice: false
      }
    ]
  },

  "mutahi-kagwe": {
    id: "mutahi-kagwe",
    slug: "mutahi-kagwe",
    firstName: "Mutahi",
    lastName: "Kagwe",
    fullName: "Hon. Mutahi Kagwe, EGH",
    biography: "Mutahi Kagwe is the Cabinet Secretary for Agriculture and Livestock Development. He leads efforts to improve farming, support dairy farmers, and ensure food security for Kenyans.",
    responsibilities: [
      "Supports farmers and agricultural production",
      "Oversees livestock development and dairy sector",
      "Promotes food security and value addition"
    ],
    education: [
      "Bachelor of Commerce"
    ],
    politicalCareer: [
      "Cabinet Secretary for Agriculture and Livestock Development",
      "Previously Cabinet Secretary for Health during COVID-19 period",
      "Former Senator and long-serving politician"
    ],
    personalLife: "He is from Nyeri County and has served in multiple cabinet positions.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Agriculture and Livestock Development",
        departmentSlug: "ministry-of-agriculture",
        isExecutiveOffice: false
      }
    ]
  },

  "james-opiyo-wandayi": {
    id: "james-opiyo-wandayi",
    slug: "james-opiyo-wandayi",
    firstName: "Opiyo",
    lastName: "Wandayi",
    fullName: "Hon. James Opiyo Wandayi, EGH",
    biography: "Opiyo Wandayi is the Cabinet Secretary for Energy and Petroleum. He oversees electricity generation, oil exploration, and efforts to provide affordable and reliable energy to Kenyans.",
    responsibilities: [
      "Manages electricity generation and distribution",
      "Oversees oil, gas and renewable energy projects",
      "Works to lower energy costs and expand access"
    ],
    education: [
      "Bachelor of Science in Electrical Engineering"
    ],
    politicalCareer: [
      "Cabinet Secretary for Energy and Petroleum",
      "Member of Parliament for Ugunja Constituency",
      "Former Leader of Minority in the National Assembly"
    ],
    personalLife: "He is an engineer by training and a long-serving legislator from Siaya County.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Energy and Petroleum",
        departmentSlug: "ministry-of-energy",
        isExecutiveOffice: false
      }
    ]
  },

  "william-kabogo-gitau": {
    id: "william-kabogo-gitau",
    slug: "william-kabogo-gitau",
    firstName: "William",
    lastName: "Kabogo",
    fullName: "Hon. William Kabogo Gitau",
    biography: "William Kabogo is the Cabinet Secretary for Information, Communication and the Digital Economy. He leads the rollout of digital services, fibre optic networks, and Kenya’s digital transformation.",
    responsibilities: [
      "Expands digital infrastructure and internet access",
      "Oversees e-government services and the digital economy",
      "Manages broadcasting and information policy"
    ],
    education: [
      "Bachelor’s degree in Business Administration"
    ],
    politicalCareer: [
      "Cabinet Secretary for Information, Communication and the Digital Economy",
      "Former Governor of Kiambu County",
      "Experienced businessman and politician"
    ],
    personalLife: "He comes from Kiambu County and has a background in business and county leadership.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Information, Communication and the Digital Economy",
        departmentSlug: "ministry-of-ict",
        isExecutiveOffice: false
      }
    ]
  },

  "geoffrey-kiringa-ruku": {
    id: "geoffrey-kiringa-ruku",
    slug: "geoffrey-kiringa-ruku",
    firstName: "Geoffrey",
    lastName: "Ruku",
    fullName: "Hon. Geoffrey Kiringa Ruku",
    biography: "Geoffrey Ruku is the Cabinet Secretary for Public Service and Human Capital Development. He works to improve government performance, train civil servants, and strengthen public institutions.",
    responsibilities: [
      "Improves performance of government ministries and agencies",
      "Oversees training and development of public servants",
      "Leads public service reforms and human capital development"
    ],
    education: [
      "Bachelor’s degree"
    ],
    politicalCareer: [
      "Cabinet Secretary for Public Service and Human Capital Development",
      "Former Member of Parliament",
      "Experienced public administrator"
    ],
    personalLife: "He brings experience from both Parliament and public administration.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of Public Service and Human Capital Development",
        departmentSlug: "ministry-of-public-service",
        isExecutiveOffice: false
      }
    ]
  },

  "beatrice-asukul-moe": {
    id: "beatrice-asukul-moe",
    slug: "beatrice-asukul-moe",
    firstName: "Beatrice",
    lastName: "Asukul",
    fullName: "Hon. Beatrice Asukul Moe",
    biography: "Beatrice Asukul Moe is the Cabinet Secretary for East African Community and Regional Affairs. She works on regional trade, cross-border projects, and development in Arid and Semi-Arid Lands (ASALs).",
    responsibilities: [
      "Promotes regional integration in East Africa",
      "Handles cross-border trade and infrastructure",
      "Supports development in arid and semi-arid areas"
    ],
    education: [
      "Bachelor’s degree"
    ],
    politicalCareer: [
      "Cabinet Secretary for East African Community and Regional Affairs",
      "Long-serving politician from Turkana County",
      "Former Member of Parliament"
    ],
    personalLife: "She comes from Turkana County and has strong experience in regional and ASAL development issues.",
    assignments: [
      {
        roleTitle: "Cabinet Secretary",
        department: "Ministry of East African Community and Regional Affairs",
        departmentSlug: "ministry-of-eac",
        isExecutiveOffice: false
      }
    ]
  },

  "dorcas-oduor": {
    id: "dorcas-oduor",
    slug: "dorcas-oduor",
    firstName: "Dorcas",
    lastName: "Oduor",
    fullName: "Hon. Dorcas Oduor, SC, EBS, OGW",
    biography: "Dorcas Oduor is the Attorney-General of Kenya. She is the principal legal advisor to the government, oversees state litigation, and leads the Department of Justice.",
    responsibilities: [
      "Serves as the chief legal advisor to the government",
      "Oversees drafting of laws and state litigation",
      "Leads the Department of Justice"
    ],
    education: [
      "Bachelor of Laws (LLB)",
      "Senior Counsel (SC)"
    ],
    politicalCareer: [
      "Attorney-General of the Republic of Kenya",
      "Highly experienced legal practitioner",
      "Appointed based on professional legal expertise"
    ],
    personalLife: "She is a Senior Counsel with vast experience in law and public service.",
    assignments: [
      {
        roleTitle: "Attorney-General",
        department: "Office of the Attorney-General and Department of Justice",
        departmentSlug: "office-of-the-attorney-general",
        isExecutiveOffice: false
      }
    ]
  },

  "mercy-kiiru-wanjau": {
    id: "mercy-kiiru-wanjau",
    slug: "mercy-kiiru-wanjau",
    firstName: "Mercy",
    lastName: "Wanjau",
    fullName: "Hon. Mercy Kiiru Wanjau, CBS",
    biography: "Mercy Kiiru Wanjau is the Secretary to the Cabinet. She coordinates Cabinet meetings, tracks implementation of decisions, and supports the operations of the Executive Office.",
    responsibilities: [
      "Coordinates Cabinet meetings and agendas",
      "Tracks implementation of Cabinet decisions",
      "Supports the smooth running of the Executive Office"
    ],
    education: [
      "Bachelor’s degree"
    ],
    politicalCareer: [
      "Secretary to the Cabinet",
      "Senior public administrator with experience in government coordination"
    ],
    personalLife: "She is a senior public servant with strong experience in government operations.",
    assignments: [
      {
        roleTitle: "Secretary to the Cabinet",
        department: "Executive Office of the President",
        departmentSlug: "executive-office-of-the-president",
        isExecutiveOffice: true
      }
    ]
  }
};

// ============================================================================
// CONSOLIDATED OBJECT REGISTRY & POSITIONAL SEED ARRAYS
// ============================================================================
export const officialsRegistry: Record<string, CabinetOfficial> = {
  ...officialsRegistryPart1,
  ...officialsRegistryPart2,
  ...officialsRegistryPart3,
  ...officialsRegistryPart4
};

export const executiveLeadershipIds = ["william-ruto", "kithure-kindiki", "musalia-mudavadi"];

export const cabinetSecretariesIds = [
  "musalia-mudavadi",
  "onesimus-kipchumba-murkomen",
  "john-mbadi-ngongo",
  "aden-duale",
  "soipan-tuya",
  "hassan-ali-joho",
  "julius-migos-ogamba",
  "alice-wahome",
  "wycliffe-ambetsa-oparanya",
  "alfred-mutua",
  "rebecca-miano",
  "salim-mvurya",
  "davis-chirchir",
  "eric-muriithi-muuga",
  "deborah-mulongo-barasa",
  "lee-maiyani-kinyanjui",
  "mutahi-kagwe",
  "james-opiyo-wandayi",
  "william-kabogo-gitau",
  "geoffrey-kiringa-ruku",
  "beatrice-asukul-moe"
];

export const alsoAttendsCabinetIds = ["dorcas-oduor", "mercy-kiiru-wanjau"];