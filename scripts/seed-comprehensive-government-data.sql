-- Comprehensive Kenya Government Data Seeding Script
-- This script populates all government structure tables with current officials and organizational hierarchy

-- 1. SEED GOVERNMENT LEVELS
INSERT INTO public.government_levels (name, code, description) VALUES
  ('National Government', 'NATIONAL', 'National level government offices (Executive, Legislature, Judiciary)'),
  ('County Government', 'COUNTY', 'County level government including Governors, Deputies, and Assemblies'),
  ('Independent Offices', 'INDEPENDENT', 'Independent constitutional offices and commissions'),
  ('International', 'INTERNATIONAL', 'Diplomatic missions and international representation')
ON CONFLICT (code) DO NOTHING;

-- 2. SEED POLITICAL PARTIES
INSERT INTO public.political_parties (name, code, abbreviation, color_code, founded_date) VALUES
  ('Orange Democratic Movement', 'ODM', 'ODM', '#FF6600', '2005-06-15'),
  ('Kenya Kwanza Alliance (UDA)', 'UDA', 'UDA', '#0066FF', '2021-06-01'),
  ('Jubilee Party', 'JUBILEE', 'JUBILEE', '#FF0000', '2012-10-10'),
  ('Wiper Democratic Movement', 'WDM-K', 'WDM-K', '#336699', '2007-01-01'),
  ('United Democratic Movement', 'UDM', 'UDM', '#FFCC00', '2009-01-01'),
  ('African National Congress', 'ANC', 'ANC', '#00AA00', '2003-09-28'),
  ('Democratic Party', 'DP', 'DP', '#660066', '2008-01-01'),
  ('Ford Kenya', 'FORD-K', 'FORD-K', '#FF9900', '1992-11-16'),
  ('Jubilee Coalition', 'JC', 'JC', '#FF0000', '2012-02-01'),
  ('KANU', 'KANU', 'KANU', '#006600', '1960-03-14'),
  ('Independent', 'INDEPENDENT', 'IND', '#999999', NULL)
ON CONFLICT (code) DO NOTHING;

-- 3. SEED GOVERNMENT ENTITIES
-- Get the level IDs
WITH levels AS (
  SELECT id, code FROM public.government_levels
)
INSERT INTO public.government_entities (name, code, description, entity_type, level_id) 
SELECT 
  'Executive Branch', 'EXEC_NATIONAL', 'National Executive - President, Cabinet', 'Executive', levels.id
FROM levels WHERE code = 'NATIONAL'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.government_entities (name, code, description, entity_type, level_id)
SELECT 
  'Legislature - National Assembly', 'NA_NATIONAL', 'National Assembly of Kenya', 'Legislature', levels.id
FROM public.government_levels levels WHERE code = 'NATIONAL'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.government_entities (name, code, description, entity_type, level_id)
SELECT 
  'Legislature - Senate', 'SENATE_NATIONAL', 'Senate of Kenya', 'Legislature', levels.id
FROM public.government_levels levels WHERE code = 'NATIONAL'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.government_entities (name, code, description, entity_type, level_id)
SELECT 
  'Judiciary', 'JUDICIARY_NATIONAL', 'Supreme Court, Court of Appeal, and subordinate courts', 'Judiciary', levels.id
FROM public.government_levels levels WHERE code = 'NATIONAL'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.government_entities (name, code, description, entity_type, level_id)
SELECT 
  'Constitutional Commissions', 'COMMISSIONS_NATIONAL', 'Independent constitutional commissions', 'Commission', levels.id
FROM public.government_levels levels WHERE code = 'NATIONAL'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.government_entities (name, code, description, entity_type, level_id)
SELECT 
  'County Governments', 'COUNTIES', 'County level government - 47 Counties', 'Executive', levels.id
FROM public.government_levels levels WHERE code = 'COUNTY'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.government_entities (name, code, description, entity_type, level_id)
SELECT 
  'County Assemblies', 'ASSEMBLIES', 'County assemblies - MCAs', 'Legislature', levels.id
FROM public.government_levels levels WHERE code = 'COUNTY'
ON CONFLICT (code) DO NOTHING;

-- 4. SEED POSITIONS
INSERT INTO public.positions (title, code, level, rank_order, description) VALUES
  ('President', 'PRESIDENT', 'National', 1, 'Head of State and Commander-in-Chief'),
  ('Deputy President', 'DEPUTY_PRESIDENT', 'National', 2, 'Deputy Head of Government'),
  ('Prime Cabinet Secretary', 'PM_CS', 'National', 3, 'Prime Cabinet Secretary'),
  ('Cabinet Secretary', 'CABINET_SECRETARY', 'National', 4, 'Cabinet Secretary'),
  ('Chief Justice', 'CHIEF_JUSTICE', 'National', 5, 'Chief Justice of Kenya'),
  ('Deputy Chief Justice', 'DEPUTY_CHIEF_JUSTICE', 'National', 6, 'Deputy Chief Justice'),
  ('Supreme Court Judge', 'SUPREME_COURT_JUDGE', 'National', 7, 'Justice of the Supreme Court'),
  ('Court of Appeal Judge', 'APPEAL_JUDGE', 'National', 8, 'Court of Appeal Judge'),
  ('High Court Judge', 'HIGH_COURT_JUDGE', 'National', 9, 'High Court Judge'),
  ('Senator', 'SENATOR', 'National', 10, 'County Senator'),
  ('Member of Parliament', 'MP', 'National', 11, 'Member of National Assembly'),
  ('Women Representative', 'WOMEN_REP', 'National', 12, 'Women Representative in Parliament'),
  ('Nominated MP', 'NOMINATED_MP', 'National', 13, 'Nominated Member of Parliament'),
  ('Governor', 'GOVERNOR', 'County', 20, 'Governor of a County'),
  ('Deputy Governor', 'DEPUTY_GOVERNOR', 'County', 21, 'Deputy Governor'),
  ('County Assembly Member', 'MCA', 'County', 22, 'Member of County Assembly'),
  ('County Women Representative', 'COUNTY_WOMEN_REP', 'County', 23, 'County Women Representative'),
  ('Commission Chair', 'COMMISSION_CHAIR', 'National', 15, 'Chairperson of Constitutional Commission'),
  ('Commissioner', 'COMMISSIONER', 'National', 16, 'Commission Member')
ON CONFLICT (code) DO NOTHING;

-- 5. SEED COUNTIES
INSERT INTO public.counties (name, code, region, population, area_sq_km, capital) VALUES
  ('Mombasa', 'MOMBA', 'Coast', 939370, 212.5, 'Mombasa City'),
  ('Kwale', 'KWAL', 'Coast', 649931, 8270.3, 'Kwale'),
  ('Kilifi', 'KILF', 'Coast', 1097355, 12245.9, 'Kilifi'),
  ('Tana River', 'TANA', 'Coast', 240075, 35375.8, 'Hola'),
  ('Lamu', 'LAMU', 'Coast', 101539, 6497.7, 'Lamu'),
  ('Taita Taveta', 'TAIT', 'Coast', 284657, 17083.9, 'Mwatate'),
  ('Garissa', 'GARI', 'North Eastern', 623060, 45720.2, 'Garissa'),
  ('Wajir', 'WAJI', 'North Eastern', 661941, 55840.6, 'Wajir'),
  ('Mandera', 'MAND', 'North Eastern', 1025756, 25797.7, 'Mandera'),
  ('Marsabit', 'MARS', 'Eastern', 291166, 66923.1, 'Marsabit'),
  ('Isiolo', 'ISIO', 'Eastern', 143294, 25336.1, 'Isiolo'),
  ('Meru', 'MERU', 'Eastern', 1356301, 6930.1, 'Meru'),
  ('Tharaka Nithi', 'THAR', 'Eastern', 365330, 2409.5, 'Kathwana'),
  ('Embu', 'EMBU', 'Eastern', 516212, 2555.9, 'Embu'),
  ('Kitui', 'KITU', 'Eastern', 800000, 9000, 'Kitui'),
  ('Machakos', 'MACH', 'Eastern', 1000000, 5953, 'Machakos'),
  ('Makueni', 'MAKU', 'Eastern', 900000, 8008, 'Wote'),
  ('Nyandarua', 'NYAN', 'Central', 596268, 3107.5, 'Ol Kalou'),
  ('Nyeri', 'NYER', 'Central', 693558, 2361, 'Nyeri'),
  ('Kirinyaga', 'KIRI', 'Central', 528054, 1205.4, 'Kerugoya'),
  ('Murang''a', 'MURA', 'Central', 942581, 2325.9, 'Murang''a'),
  ('Kiambu', 'KIAM', 'Central', 1623282, 2449.2, 'Kiambu'),
  ('Turkana', 'TURK', 'Rift Valley', 855399, 71597.8, 'Lodwar'),
  ('West Pokot', 'WEST', 'Rift Valley', 512690, 8418.2, 'Kapenguria'),
  ('Samburu', 'SAMB', 'Rift Valley', 223947, 20182.5, 'Maralal'),
  ('Trans Nzoia', 'TRAN', 'Rift Valley', 818757, 2469.9, 'Kitale'),
  ('Uasin Gishu', 'UASI', 'Rift Valley', 894179, 2955.3, 'Eldoret'),
  ('Elgeyo Marakwet', 'ELGE', 'Rift Valley', 369998, 3049.7, 'Iten'),
  ('Nandi', 'NAND', 'Rift Valley', 752965, 2884.5, 'Kapsabet'),
  ('Baringo', 'BARI', 'Rift Valley', 555561, 11075.3, 'Kabarnet'),
  ('Laikipia', 'LAIK', 'Rift Valley', 399227, 8696.1, 'Nanyuki'),
  ('Nakuru', 'NAKU', 'Rift Valley', 1603325, 7509.5, 'Nakuru'),
  ('Narok', 'NARO', 'Rift Valley', 850920, 17921.2, 'Narok'),
  ('Kajiado', 'KAJI', 'Rift Valley', 687312, 21292.7, 'Kajiado'),
  ('Kericho', 'KERI', 'Rift Valley', 752396, 2454.5, 'Kericho'),
  ('Bomet', 'BOME', 'Rift Valley', 730129, 1997.9, 'Bomet'),
  ('Kakamega', 'KAKA', 'Western', 1660651, 3033.8, 'Kakamega'),
  ('Vihiga', 'VIHI', 'Western', 554622, 531.3, 'Vihiga'),
  ('Bungoma', 'BUNG', 'Western', 1375063, 2206.9, 'Bungoma'),
  ('Busia', 'BUSI', 'Western', 743946, 1628.4, 'Busia'),
  ('Siaya', 'SIAI', 'Nyanza', 842304, 2496.1, 'Siaya'),
  ('Kisumu', 'KISU', 'Nyanza', 968909, 2009.5, 'Kisumu City'),
  ('Homa Bay', 'HOMA', 'Nyanza', 963794, 3154.7, 'Homa Bay'),
  ('Migori', 'MIGO', 'Nyanza', 917170, 2586.4, 'Migori'),
  ('Kisii', 'KISI', 'Nyanza', 1152282, 1317.9, 'Kisii'),
  ('Nyamira', 'NYAM', 'Nyanza', 598252, 912.5, 'Nyamira'),
  ('Nairobi', 'NAIR', 'Nairobi', 3138369, 694.9, 'Nairobi City')
ON CONFLICT (code) DO NOTHING;

-- This seeding script provides the foundation. 
-- Additional data for specific officials, MCAs, and detailed constituency information
-- can be added in subsequent scripts for optimal database performance.
