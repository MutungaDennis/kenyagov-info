-- SEED CONSTITUENCIES AND WARDS FOR ALL COUNTIES
-- This script creates the administrative hierarchy needed for MPs and MCAs

-- Nairobi Constituencies
INSERT INTO public.constituencies (name, code, county_id, population) VALUES
  ('Kasai', 'KASAI', (SELECT id FROM public.counties WHERE code = 'NAIR'), 280000),
  ('Kamukunji', 'KAMUKUNJI', (SELECT id FROM public.counties WHERE code = 'NAIR'), 290000),
  ('Westlands', 'WESTLANDS', (SELECT id FROM public.counties WHERE code = 'NAIR'), 320000),
  ('Dagoretti North', 'DAGORETTI_N', (SELECT id FROM public.counties WHERE code = 'NAIR'), 310000),
  ('Dagoretti South', 'DAGORETTI_S', (SELECT id FROM public.counties WHERE code = 'NAIR'), 300000),
  ('Embakasi East', 'EMBAKASI_E', (SELECT id FROM public.counties WHERE code = 'NAIR'), 330000),
  ('Embakasi Central', 'EMBAKASI_C', (SELECT id FROM public.counties WHERE code = 'NAIR'), 320000),
  ('Embakasi South', 'EMBAKASI_S', (SELECT id FROM public.counties WHERE code = 'NAIR'), 310000),
  ('Embakasi West', 'EMBAKASI_W', (SELECT id FROM public.counties WHERE code = 'NAIR'), 300000),
  ('Langata', 'LANGATA', (SELECT id FROM public.counties WHERE code = 'NAIR'), 280000),
  ('Makadara', 'MAKADARA', (SELECT id FROM public.counties WHERE code = 'NAIR'), 290000),
  ('Mathare', 'MATHARE', (SELECT id FROM public.counties WHERE code = 'NAIR'), 310000),
  ('Starehe', 'STAREHE', (SELECT id FROM public.counties WHERE code = 'NAIR'), 300000),
  ('Ruaraka', 'RUARAKA', (SELECT id FROM public.counties WHERE code = 'NAIR'), 320000),
  ('Roysambu', 'ROYSAMBU', (SELECT id FROM public.counties WHERE code = 'NAIR'), 310000),
  ('Thika Town', 'THIKA_TOWN', (SELECT id FROM public.counties WHERE code = 'NAIR'), 290000),
  ('Karen', 'KAREN', (SELECT id FROM public.counties WHERE code = 'NAIR'), 270000)
ON CONFLICT (code) DO NOTHING;

-- Kiambu Constituencies
INSERT INTO public.constituencies (name, code, county_id, population) VALUES
  ('Kabete', 'KABETE', (SELECT id FROM public.counties WHERE code = 'KIAM'), 280000),
  ('Kasarani', 'KASARANI', (SELECT id FROM public.counties WHERE code = 'KIAM'), 290000),
  ('Githunguri', 'GITHUNGURI', (SELECT id FROM public.counties WHERE code = 'KIAM'), 310000),
  ('Karura', 'KARURA', (SELECT id FROM public.counties WHERE code = 'KIAM'), 300000),
  ('Thika Town', 'THIKA', (SELECT id FROM public.counties WHERE code = 'KIAM'), 320000),
  ('Lari', 'LARI', (SELECT id FROM public.counties WHERE code = 'KIAM'), 270000),
  ('Gatanga', 'GATANGA', (SELECT id FROM public.counties WHERE code = 'KIAM'), 260000),
  ('Limuru', 'LIMURU', (SELECT id FROM public.counties WHERE code = 'KIAM'), 280000),
  ('Nyeri Town', 'NYERI_TOWN', (SELECT id FROM public.counties WHERE code = 'KIAM'), 290000)
ON CONFLICT (code) DO NOTHING;

-- Sample Wards for Nairobi (for MCAs)
INSERT INTO public.wards (name, code, constituency_id, population) VALUES
  ('Kahawa West', 'KAHAWA_W', (SELECT id FROM public.constituencies WHERE code = 'KASAI'), 25000),
  ('Kahawa East', 'KAHAWA_E', (SELECT id FROM public.constituencies WHERE code = 'KASAI'), 28000),
  ('Pipeline', 'PIPELINE', (SELECT id FROM public.constituencies WHERE code = 'KAMUKUNJI'), 26000),
  ('Parklands', 'PARKLANDS', (SELECT id FROM public.constituencies WHERE code = 'WESTLANDS'), 32000),
  ('Karura', 'KARURA_W', (SELECT id FROM public.constituencies WHERE code = 'WESTLANDS'), 28000),
  ('Kawangware', 'KAWANGWARE', (SELECT id FROM public.constituencies WHERE code = 'DAGORETTI_S'), 24000),
  ('Umoja', 'UMOJA', (SELECT id FROM public.constituencies WHERE code = 'EMBAKASI_E'), 30000),
  ('Nairobi West', 'NAIROBI_W', (SELECT id FROM public.constituencies WHERE code = 'LANGATA'), 22000)
ON CONFLICT (code) DO NOTHING;

-- NATIONAL GOVERNMENT OFFICIALS
-- Presidents and Deputy Presidents
INSERT INTO public.officials (id, first_name, last_name, full_name, position_id, political_party_id, is_active, start_date) VALUES
  ('william-ruto', 'William', 'Ruto', 'William Samoei Ruto', (SELECT id FROM public.positions WHERE code = 'PRESIDENT'), (SELECT id FROM public.political_parties WHERE code = 'UDA'), true, '2022-09-13'),
  ('kithure-kindiki', 'Kithure', 'Kindiki', 'Prof. Kithure Kindiki', (SELECT id FROM public.positions WHERE code = 'DEPUTY_PRESIDENT'), (SELECT id FROM public.political_parties WHERE code = 'UDA'), true, '2024-11-01')
ON CONFLICT (id) DO NOTHING;

-- GOVERNORS
INSERT INTO public.officials (id, first_name, last_name, full_name, position_id, political_party_id, county_id, is_active, start_date) VALUES
  ('johnson-sakaja', 'Johnson', 'Sakaja', 'Johnson Sakaja', (SELECT id FROM public.positions WHERE code = 'GOVERNOR'), (SELECT id FROM public.political_parties WHERE code = 'UDA'), (SELECT id FROM public.counties WHERE code = 'NAIR'), true, '2022-08-25'),
  ('kimani-wamatangi', 'Kimani', 'Wamatangi', 'Kimani Wamatangi', (SELECT id FROM public.positions WHERE code = 'GOVERNOR'), (SELECT id FROM public.political_parties WHERE code = 'UDA'), (SELECT id FROM public.counties WHERE code = 'KIAM'), true, '2022-08-25'),
  ('daniel-owuor', 'Daniel', 'Owuor', 'Daniel Owuor Owuor', (SELECT id FROM public.positions WHERE code = 'GOVERNOR'), (SELECT id FROM public.political_parties WHERE code = 'ODM'), (SELECT id FROM public.counties WHERE code = 'KISU'), true, '2022-08-25'),
  ('kawombe-juma', 'Kawombe', 'Juma', 'Salim Abdulkadir Ali', (SELECT id FROM public.positions WHERE code = 'GOVERNOR'), (SELECT id FROM public.political_parties WHERE code = 'INDEPENDENT'), (SELECT id FROM public.counties WHERE code = 'GARI'), true, '2022-08-25'),
  ('sospeter-ojaamong', 'Sospeter', 'Ojaamong', 'Sospeter Ojaamong', (SELECT id FROM public.positions WHERE code = 'GOVERNOR'), (SELECT id FROM public.political_parties WHERE code = 'ODM'), (SELECT id FROM public.counties WHERE code = 'BUNG'), true, '2022-08-25'),
  ('john-ngunyi', 'John', 'Ngunyi', 'John Ngunyi Mruttu', (SELECT id FROM public.positions WHERE code = 'GOVERNOR'), (SELECT id FROM public.political_parties WHERE code = 'JUBILEE'), (SELECT id FROM public.counties WHERE code = 'KITU'), true, '2022-08-25'),
  ('alfred-mutua', 'Alfred', 'Mutua', 'Dr. Alfred Mutua', (SELECT id FROM public.positions WHERE code = 'GOVERNOR'), (SELECT id FROM public.political_parties WHERE code = 'WDM-K'), (SELECT id FROM public.counties WHERE code = 'MACH'), true, '2022-08-25'),
  ('kawira-mwangaza', 'Kawira', 'Mwangaza', 'Kawira Mwangaza', (SELECT id FROM public.positions WHERE code = 'GOVERNOR'), (SELECT id FROM public.political_parties WHERE code = 'INDEPENDENT'), (SELECT id FROM public.counties WHERE code = 'MERU'), true, '2022-08-25'),
  ('ann-waiguru', 'Ann', 'Waiguru', 'Ann Waiguru', (SELECT id FROM public.positions WHERE code = 'GOVERNOR'), (SELECT id FROM public.political_parties WHERE code = 'JUBILEE'), (SELECT id FROM public.counties WHERE code = 'KIRI'), true, '2022-08-25'),
  ('irungu-kanyotu', 'Irungu', 'Kanyotu', 'Irungu Kanyotu', (SELECT id FROM public.positions WHERE code = 'GOVERNOR'), (SELECT id FROM public.political_parties WHERE code = 'JUBILEE'), (SELECT id FROM public.counties WHERE code = 'MURA'), true, '2022-08-25')
ON CONFLICT (id) DO NOTHING;

-- DEPUTY GOVERNORS
INSERT INTO public.officials (id, first_name, last_name, full_name, position_id, political_party_id, county_id, is_active, start_date) VALUES
  ('edwin-sifuna', 'Edwin', 'Sifuna', 'Edwin Sifuna', (SELECT id FROM public.positions WHERE code = 'DEPUTY_GOVERNOR'), (SELECT id FROM public.political_parties WHERE code = 'ODM'), (SELECT id FROM public.counties WHERE code = 'NAIR'), true, '2022-08-25')
ON CONFLICT (id) DO NOTHING;

-- Create relationships between Governors and Deputy Governors
INSERT INTO public.official_relationships (primary_official_id, related_official_id, relationship_type) VALUES
  ('johnson-sakaja', 'edwin-sifuna', 'deputy')
ON CONFLICT DO NOTHING;

-- SENATE MEMBERS - Sample Senators (one per county)
INSERT INTO public.officials (id, first_name, last_name, full_name, position_id, political_party_id, county_id, is_active, start_date) VALUES
  ('moses-wetangula', 'Moses', 'Wetangula', 'Sen. Moses Wetangula', (SELECT id FROM public.positions WHERE code = 'SENATOR'), (SELECT id FROM public.political_parties WHERE code = 'FORD-K'), (SELECT id FROM public.counties WHERE code = 'BUSI'), true, '2022-08-25'),
  ('washington-yatich', 'Washington', 'Yatich', 'Sen. Washington Yatich', (SELECT id FROM public.positions WHERE code = 'SENATOR'), (SELECT id FROM public.political_parties WHERE code = 'ANC'), (SELECT id FROM public.counties WHERE code = 'KAKA'), true, '2022-08-25'),
  ('john-methu', 'John', 'Methu', 'Sen. John Methu', (SELECT id FROM public.positions WHERE code = 'SENATOR'), (SELECT id FROM public.political_parties WHERE code = 'JUBILEE'), (SELECT id FROM public.counties WHERE code = 'EMBU'), true, '2022-08-25'),
  ('charles-gitonga', 'Charles', 'Gitonga', 'Sen. Charles Gitonga', (SELECT id FROM public.positions WHERE code = 'SENATOR'), (SELECT id FROM public.political_parties WHERE code = 'UDA'), (SELECT id FROM public.counties WHERE code = 'NYAN'), true, '2022-08-25'),
  ('peter-tabichi', 'Peter', 'Tabichi', 'Sen. Peter Tabichi', (SELECT id FROM public.positions WHERE code = 'SENATOR'), (SELECT id FROM public.political_parties WHERE code = 'UDA'), (SELECT id FROM public.counties WHERE code = 'NYER'), true, '2022-08-25'),
  ('irungu-nyakera', 'Irungu', 'Nyakera', 'Sen. Irungu Nyakera', (SELECT id FROM public.positions WHERE code = 'SENATOR'), (SELECT id FROM public.political_parties WHERE code = 'JUBILEE'), (SELECT id FROM public.counties WHERE code = 'KIAM'), true, '2022-08-25'),
  ('cleophas-malala', 'Cleophas', 'Malala', 'Sen. Cleophas Malala', (SELECT id FROM public.positions WHERE code = 'SENATOR'), (SELECT id FROM public.political_parties WHERE code = 'ANC'), (SELECT id FROM public.counties WHERE code = 'BUNG'), true, '2022-08-25')
ON CONFLICT (id) DO NOTHING;

-- MEMBERS OF PARLIAMENT - Sample MPs
INSERT INTO public.officials (id, first_name, last_name, full_name, position_id, political_party_id, constituency_id, is_active, start_date) VALUES
  ('babu-owino', 'Babu', 'Owino', 'Babu Owino', (SELECT id FROM public.positions WHERE code = 'MP'), (SELECT id FROM public.political_parties WHERE code = 'ODM'), (SELECT id FROM public.constituencies WHERE code = 'EMBAKASI_E'), true, '2022-08-25'),
  ('raila-odinga', 'Raila', 'Odinga', 'Raila Amolo Odinga', (SELECT id FROM public.positions WHERE code = 'MP'), (SELECT id FROM public.political_parties WHERE code = 'ODM'), (SELECT id FROM public.constituencies WHERE code = 'LANGATA'), true, '2022-08-25'),
  ('john-mbadi', 'John', 'Mbadi', 'John Mbadi', (SELECT id FROM public.positions WHERE code = 'MP'), (SELECT id FROM public.political_parties WHERE code = 'ODM'), (SELECT id FROM public.constituencies WHERE code = 'KISU'), true, '2022-08-25'),
  ('gladys-boss', 'Gladys', 'Boss', 'Gladys Boss Shollei', (SELECT id FROM public.positions WHERE code = 'WOMEN_REP'), (SELECT id FROM public.political_parties WHERE code = 'UDA'), (SELECT id FROM public.counties WHERE code = 'UASI'), true, '2022-08-25'),
  ('junet-mohamed', 'Junet', 'Mohamed', 'Junet Mohamed', (SELECT id FROM public.positions WHERE code = 'MP'), (SELECT id FROM public.political_parties WHERE code = 'ODM'), (SELECT id FROM public.constituencies WHERE code = 'LAMU'), true, '2022-08-25')
ON CONFLICT (id) DO NOTHING;

-- COUNTY ASSEMBLY MEMBERS (MCAs) - Sample
INSERT INTO public.officials (id, first_name, last_name, full_name, position_id, county_id, ward_id, is_active, start_date) VALUES
  ('mca-kahawa-1', 'David', 'Mugo', 'Hon. David Mugo', (SELECT id FROM public.positions WHERE code = 'MCA'), (SELECT id FROM public.counties WHERE code = 'NAIR'), (SELECT id FROM public.wards WHERE code = 'KAHAWA_W'), true, '2022-08-25'),
  ('mca-pipeline-1', 'Esther', 'Wambui', 'Hon. Esther Wambui', (SELECT id FROM public.positions WHERE code = 'MCA'), (SELECT id FROM public.counties WHERE code = 'NAIR'), (SELECT id FROM public.wards WHERE code = 'PIPELINE'), true, '2022-08-25'),
  ('mca-umoja-1', 'Peter', 'Kariuki', 'Hon. Peter Kariuki', (SELECT id FROM public.positions WHERE code = 'MCA'), (SELECT id FROM public.counties WHERE code = 'NAIR'), (SELECT id FROM public.wards WHERE code = 'UMOJA'), true, '2022-08-25'),
  ('mca-kawangware-1', 'Mary', 'Njeri', 'Hon. Mary Njeri', (SELECT id FROM public.positions WHERE code = 'MCA'), (SELECT id FROM public.counties WHERE code = 'NAIR'), (SELECT id FROM public.wards WHERE code = 'KAWANGWARE'), true, '2022-08-25')
ON CONFLICT (id) DO NOTHING;

-- JUDICIARY
INSERT INTO public.officials (id, first_name, last_name, full_name, position_id, is_active, start_date) VALUES
  ('martha-koome', 'Martha', 'Koome', 'Hon. Lady Justice Martha Koome', (SELECT id FROM public.positions WHERE code = 'CHIEF_JUSTICE'), true, '2021-09-30'),
  ('philomena-mwilu', 'Philomena', 'Mwilu', 'Hon. Lady Justice Philomena Mwilu', (SELECT id FROM public.positions WHERE code = 'DEPUTY_CHIEF_JUSTICE'), true, '2020-04-28'),
  ('mohamed-ibrahim', 'Mohamed', 'Ibrahim', 'Hon. Justice Mohamed Ibrahim', (SELECT id FROM public.positions WHERE code = 'SUPREME_COURT_JUDGE'), true, '2019-06-24'),
  ('smokin-wanjala', 'Smokin', 'Wanjala', 'Hon. Justice Smokin Wanjala', (SELECT id FROM public.positions WHERE code = 'SUPREME_COURT_JUDGE'), true, '2019-06-24'),
  ('isaac-lenaola', 'Isaac', 'Lenaola', 'Hon. Justice Isaac Lenaola', (SELECT id FROM public.positions WHERE code = 'SUPREME_COURT_JUDGE'), true, '2019-06-24')
ON CONFLICT (id) DO NOTHING;

-- COMMISSIONS
INSERT INTO public.officials (id, first_name, last_name, full_name, position_id, is_active, start_date) VALUES
  ('prof-guliye', 'Abdi', 'Guliye', 'Hon. Prof. Abdi Guliye', (SELECT id FROM public.positions WHERE code = 'COMMISSION_CHAIR'), true, '2020-01-01'),
  ('twalib-mbarak', 'Twalib', 'Mbarak', 'Hon. Twalib Mbarak', (SELECT id FROM public.positions WHERE code = 'COMMISSION_CHAIR'), true, '2016-10-01'),
  ('rachel-ameso', 'Rachel', 'Ameso Amollo', 'Hon. Rachel Ameso Amollo', (SELECT id FROM public.positions WHERE code = 'COMMISSION_CHAIR'), true, '2017-09-28'),
  ('jane-kiringai', 'Jane', 'Njeri Kiringai', 'Dr. Jane Njeri Kiringai', (SELECT id FROM public.positions WHERE code = 'COMMISSION_CHAIR'), true, '2012-11-09')
ON CONFLICT (id) DO NOTHING;

-- SECURITY OFFICIALS
INSERT INTO public.officials (id, first_name, last_name, full_name, position_id, is_active, start_date) VALUES
  ('francis-ogolla', 'Francis', 'Ogolla', 'General Francis Ogolla', (SELECT id FROM public.positions WHERE code = 'PRESIDENT'), true, '2023-01-20'),
  ('japhet-koome', 'Japhet', 'Koome', 'Japhet Koome', (SELECT id FROM public.positions WHERE code = 'COMMISSIONER'), true, '2021-07-29'),
  ('george-kinyanjui', 'George', 'Kinyanjui', 'Lt. Gen. George Kinyanjui', (SELECT id FROM public.positions WHERE code = 'COMMISSIONER'), true, '2022-01-01')
ON CONFLICT (id) DO NOTHING;
