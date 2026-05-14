import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

const leaders = [
  // National Leaders
  {
    id: 'william-ruto',
    name: 'Dr. William Samoei Ruto',
    title: 'President of the Republic of Kenya',
    category: 'Executive',
    sub_category: 'Head of State',
    description: 'Dr. William Samoei Ruto is the President of the Republic of Kenya and Commander-in-Chief of the Kenya Defence Forces. As Head of State and Government, he oversees the executive branch and provides national leadership.',
    link: '/leaders/william-ruto',
  },
  {
    id: 'kithure-kindiki',
    name: 'Prof. Kithure Kindiki',
    title: 'Deputy President of Kenya',
    category: 'Executive',
    sub_category: 'Deputy Head of Government',
    description: 'Prof. Kithure Kindiki is the Deputy President of the Republic of Kenya. He was sworn into office on 1 November 2024.',
    link: '/leaders/kithure-kindiki',
  },
  {
    id: 'musalia-mudavadi',
    name: 'H.E. Dr. Musalia Mudavadi, E.G.H.',
    title: 'Prime Cabinet Secretary & Cabinet Secretary for Foreign and Diaspora Affairs',
    category: 'Executive',
    sub_category: 'Cabinet',
    description: 'Dr. Musalia Mudavadi is the Prime Cabinet Secretary of Kenya and Cabinet Secretary for Foreign and Diaspora Affairs.',
    link: '/leaders/musalia-mudavadi',
  },
  // Governors
  {
    id: 'johnson-sakaja',
    name: 'Johnson Sakaja',
    title: 'Governor',
    category: 'County Executive',
    county: 'Nairobi',
    description: 'Governor of Nairobi County, Kenya\'s capital.',
    link: '/leaders/johnson-sakaja',
  },
  {
    id: 'kimani-wamatangi',
    name: 'Kimani Wamatangi',
    title: 'Governor',
    category: 'County Executive',
    county: 'Kiambu',
    description: 'Governor of Kiambu County.',
  },
  // MPs
  {
    id: 'babu-owino',
    name: 'Babu Owino',
    title: 'Member of Parliament',
    category: 'Legislature',
    sub_category: 'MP',
    constituency: 'Embakasi East',
    description: 'Represents Embakasi East Constituency in Nairobi County.',
    link: '/leaders/babu-owino',
  },
  {
    id: 'raila-odinga',
    name: 'Raila Amolo Odinga',
    title: 'Member of Parliament',
    category: 'Legislature',
    sub_category: 'MP',
    constituency: 'Lang\'ata',
    description: 'Long-serving MP and former Prime Minister of Kenya.',
    link: '/leaders/raila-odinga',
  },
  {
    id: 'john-mbadi',
    name: 'John Mbadi',
    title: 'Member of Parliament',
    category: 'Legislature',
    sub_category: 'MP',
    constituency: 'Suba South',
    description: 'Represents Suba South Constituency.',
  },
  {
    id: 'gladys-boss',
    name: 'Gladys Boss',
    title: 'Member of Parliament',
    category: 'Legislature',
    sub_category: 'MP',
    constituency: 'Uasin Gishu Women Representative',
    description: 'Women Representative for Uasin Gishu County.',
  },
  {
    id: 'junet-mohamed',
    name: 'Junet Mohamed',
    title: 'Member of Parliament',
    category: 'Legislature',
    sub_category: 'MP',
    constituency: 'Suna East',
    description: 'Represents Suna East Constituency.',
  },
  // MCAs
  {
    id: 'mca-kahawa-west',
    name: 'Hon. David Mugo',
    title: 'Member of County Assembly',
    category: 'County Assembly',
    sub_category: 'MCA',
    county: 'Nairobi',
    constituency: 'Kahawa West Ward',
    description: 'Represents Kahawa West Ward in Nairobi County Assembly.',
  },
  {
    id: 'mca-pipeline',
    name: 'Hon. Esther Wambui',
    title: 'Member of County Assembly',
    category: 'County Assembly',
    sub_category: 'MCA',
    county: 'Nairobi',
    constituency: 'Pipeline Ward',
    description: 'Represents Pipeline Ward in Nairobi County Assembly.',
  },
  {
    id: 'mca-umoja',
    name: 'Hon. Peter Kariuki',
    title: 'Member of County Assembly',
    category: 'County Assembly',
    sub_category: 'MCA',
    county: 'Nairobi',
    constituency: 'Umoja Ward',
    description: 'Represents Umoja Ward.',
  },
  {
    id: 'mca-kawangware',
    name: 'Hon. Mary Njeri',
    title: 'Member of County Assembly',
    category: 'County Assembly',
    sub_category: 'MCA',
    county: 'Nairobi',
    constituency: 'Kawangware Ward',
    description: 'Represents Kawangware Ward in Nairobi County Assembly.',
  },
  // Judiciary
  {
    id: 'martha-koome',
    name: 'Hon. Lady Justice Martha Koome',
    title: 'Chief Justice & President of the Supreme Court',
    category: 'Judiciary',
    sub_category: 'Supreme Court',
    description: 'Head of the Judiciary and President of the Supreme Court of Kenya.',
    link: '/leaders/martha-koome',
  },
  {
    id: 'philomena-mwilu',
    name: 'Hon. Lady Justice Philomena Mwilu',
    title: 'Deputy Chief Justice & Deputy President of the Supreme Court',
    category: 'Judiciary',
    sub_category: 'Supreme Court',
    description: 'Deputy Head of the Judiciary.',
  },
  {
    id: 'mohamed-ibrahim',
    name: 'Hon. Justice Mohamed Ibrahim',
    title: 'Justice of the Supreme Court',
    category: 'Judiciary',
    sub_category: 'Supreme Court',
    description: 'Serves as a Judge of the Supreme Court.',
  },
  {
    id: 'smokin-wanjala',
    name: 'Hon. Justice Smokin Wanjala',
    title: 'Justice of the Supreme Court',
    category: 'Judiciary',
    sub_category: 'Supreme Court',
    description: 'Serves as a Judge of the Supreme Court.',
  },
  {
    id: 'isaac-lenaola',
    name: 'Hon. Justice Isaac Lenaola',
    title: 'Justice of the Supreme Court',
    category: 'Judiciary',
    sub_category: 'Supreme Court',
    description: 'Serves as a Judge of the Supreme Court.',
  },
  {
    id: 'high-court-president',
    name: 'Hon. Justice David Maraga (Rtd)',
    title: 'Former Chief Justice',
    category: 'Judiciary',
    sub_category: 'Supreme Court',
    description: 'Former Chief Justice of Kenya.',
  },
  // Commissions
  {
    id: 'iebc-chair',
    name: 'Hon. Prof. Abdi Guliye',
    title: 'Chairperson',
    category: 'Constitutional Commission',
    organization: 'IEBC',
    description: 'Independent Electoral and Boundaries Commission – Oversees elections in Kenya.',
    link: '/leaders/iebc-chair',
  },
  {
    id: 'eacc-chair',
    name: 'Hon. Twalib Mbarak',
    title: 'Chairperson',
    category: 'Constitutional Commission',
    organization: 'EACC',
    description: 'Ethics and Anti-Corruption Commission – Leads the fight against corruption.',
  },
  {
    id: 'src-chair',
    name: 'Hon. Rachel Ameso Amollo',
    title: 'Chairperson',
    category: 'Constitutional Commission',
    organization: 'SRC',
    description: 'Salaries and Remuneration Commission – Sets remuneration for public officers.',
  },
  {
    id: 'cra-chair',
    name: 'Dr. Jane Njeri Kiringai',
    title: 'Chairperson',
    category: 'Constitutional Commission',
    organization: 'CRA',
    description: 'Commission on Revenue Allocation – Advises on equitable revenue sharing.',
  },
  {
    id: 'ngc-chair',
    name: 'Hon. Gitonga Mukunji',
    title: 'Chairperson',
    category: 'Constitutional Commission',
    organization: 'National Gender and Equality Commission',
    description: 'Promotes gender equality and inclusion.',
  },
  {
    id: 'katiba-chair',
    name: 'Hon. (Dr.) Florence Omollo',
    title: 'Chairperson',
    category: 'Constitutional Commission',
    organization: 'Commission on the Implementation of the Constitution',
    description: 'Monitors implementation of the 2010 Constitution.',
  },
  // Security
  {
    id: 'francis-ogolla',
    name: 'General Francis Ogolla',
    title: 'Chief of Defence Forces',
    category: 'Security',
    sub_category: 'Kenya Defence Forces',
    description: 'Overall commander of the Kenya Defence Forces (Army, Air Force & Navy).',
    link: '/leaders/francis-ogolla',
  },
  {
    id: 'japhet-koome',
    name: 'Japhet Koome',
    title: 'Inspector General of Police',
    category: 'Security',
    sub_category: 'National Police Service',
    description: 'Heads the National Police Service.',
  },
  {
    id: 'noor-gaffan',
    name: 'Noor Gaffan',
    title: 'Director General',
    category: 'Security',
    sub_category: 'National Intelligence Service',
    description: 'Director General of the National Intelligence Service (NIS).',
  },
  {
    id: 'george-kinyanjui',
    name: 'Lt. Gen. George Kinyanjui',
    title: 'Vice Chief of Defence Forces',
    category: 'Security',
    sub_category: 'Kenya Defence Forces',
    description: 'Deputy to the Chief of Defence Forces.',
  },
  {
    id: 'kibor-koech',
    name: 'Lt. Gen. Kibor Koech',
    title: 'Commander, Kenya Army',
    category: 'Security',
    sub_category: 'Kenya Defence Forces',
    description: 'Commander of the Kenya Army.',
  },
]

const categories = [
  { name: 'All Leaders', value: 'All' },
  { name: 'Executive', value: 'Executive' },
  { name: 'Legislature', value: 'Legislature' },
  { name: 'Judiciary', value: 'Judiciary' },
  { name: 'County Executive', value: 'County Executive' },
  { name: 'County Assembly', value: 'County Assembly' },
  { name: 'Constitutional Commission', value: 'Constitutional Commission' },
  { name: 'Independent Office', value: 'Independent Office' },
  { name: 'Security', value: 'Security' },
  { name: 'Diplomatic', value: 'Diplomatic' },
]

async function seed() {
  try {
    console.log('Starting seed...')

    // Clear existing data
    await supabase.from('leaders').delete().neq('id', '')
    await supabase.from('leader_categories').delete().neq('value', '')

    // Seed categories
    console.log('Seeding categories...')
    const { error: categoryError } = await supabase
      .from('leader_categories')
      .insert(categories)

    if (categoryError) {
      console.error('Error seeding categories:', categoryError)
      process.exit(1)
    }

    // Seed leaders
    console.log('Seeding leaders...')
    const { error: leaderError } = await supabase
      .from('leaders')
      .insert(leaders)

    if (leaderError) {
      console.error('Error seeding leaders:', leaderError)
      process.exit(1)
    }

    console.log(`✅ Successfully seeded ${leaders.length} leaders and ${categories.length} categories!`)
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seed()
