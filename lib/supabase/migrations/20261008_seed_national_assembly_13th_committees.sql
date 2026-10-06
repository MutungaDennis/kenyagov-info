BEGIN;
SET LOCAL lock_timeout = '5s';

WITH seed(category, name, slug, sort_order) AS (
  VALUES
    ('Departmental Committees', 'Administration and Internal Security', 'national-assembly-13th-administration-internal-security', 1),
    ('Departmental Committees', 'Agriculture and Livestock', 'national-assembly-13th-agriculture-livestock', 2),
    ('Departmental Committees', 'Blue Economy, Water and Irrigation', 'national-assembly-13th-blue-economy-water-irrigation', 3),
    ('Departmental Committees', 'Communication, Information and Innovation', 'national-assembly-13th-communication-information-innovation', 4),
    ('Departmental Committees', 'Defence, Intelligence and Foreign Relations', 'national-assembly-13th-defence-intelligence-foreign-relations', 5),
    ('Departmental Committees', 'Education', 'national-assembly-13th-education', 6),
    ('Departmental Committees', 'Energy', 'national-assembly-13th-energy', 7),
    ('Departmental Committees', 'Environment, Forestry and Mining', 'national-assembly-13th-environment-forestry-mining', 8),
    ('Departmental Committees', 'Finance and National Planning', 'national-assembly-13th-finance-national-planning', 9),
    ('Departmental Committees', 'Health', 'national-assembly-13th-health', 10),
    ('Departmental Committees', 'Housing, Urban Planning and Public Works', 'national-assembly-13th-housing-urban-planning-public-works', 11),
    ('Departmental Committees', 'Justice and Legal Affairs Committee (JLAC)', 'national-assembly-13th-justice-legal-affairs-jlac', 12),
    ('Departmental Committees', 'Labour', 'national-assembly-13th-labour', 13),
    ('Departmental Committees', 'Lands', 'national-assembly-13th-lands', 14),
    ('Departmental Committees', 'Regional Development Committee', 'national-assembly-13th-regional-development', 15),
    ('Departmental Committees', 'Social Protection', 'national-assembly-13th-social-protection', 16),
    ('Departmental Committees', 'Sports and Culture', 'national-assembly-13th-sports-culture', 17),
    ('Departmental Committees', 'Tourism and Wildlife', 'national-assembly-13th-tourism-wildlife', 18),
    ('Departmental Committees', 'Trade, Industry and Cooperatives', 'national-assembly-13th-trade-industry-cooperatives', 19),
    ('Departmental Committees', 'Transport and Infrastructure', 'national-assembly-13th-transport-infrastructure', 20),

    ('Financial Audit and Appropriations Committees', 'Budget and Appropriations Committee', 'national-assembly-13th-budget-appropriations', 1),
    ('Financial Audit and Appropriations Committees', 'Public Accounts Committee (PAC)', 'national-assembly-13th-public-accounts-pac', 2),
    ('Financial Audit and Appropriations Committees', 'Public Debt and Privatization Committee', 'national-assembly-13th-public-debt-privatization', 3),
    ('Financial Audit and Appropriations Committees', 'Special Funds Accounts Committee', 'national-assembly-13th-special-funds-accounts', 4),
    ('Financial Audit and Appropriations Committees', 'Decentralized Funds Accounts Committee', 'national-assembly-13th-decentralized-funds-accounts', 5),
    ('Financial Audit and Appropriations Committees', 'Public Investments Committee on Governance & Education', 'national-assembly-13th-public-investments-governance-education', 6),
    ('Financial Audit and Appropriations Committees', 'Public Investments Committee on Commercial Affairs & Energy', 'national-assembly-13th-public-investments-commercial-affairs-energy', 7),
    ('Financial Audit and Appropriations Committees', 'Public Investments Committee on Social Services Administration & Agriculture', 'national-assembly-13th-public-investments-social-services-agriculture', 8),

    ('Housekeeping and Operational Committees', 'House Business Committee (HBC)', 'national-assembly-13th-house-business-hbc', 1),
    ('Housekeeping and Operational Committees', 'Committee on Selection', 'national-assembly-13th-selection', 2),
    ('Housekeeping and Operational Committees', 'Procedure and House Rules Committee', 'national-assembly-13th-procedure-house-rules', 3),
    ('Housekeeping and Operational Committees', 'Committee on Powers and Privileges', 'national-assembly-13th-powers-privileges', 4),
    ('Housekeeping and Operational Committees', 'Members'' Services and Facilities Committee', 'national-assembly-13th-members-services-facilities', 5),
    ('Housekeeping and Operational Committees', 'Liaison Committee', 'national-assembly-13th-liaison', 6),

    ('Select and General Purpose Committees', 'Committee on Appointments', 'national-assembly-13th-appointments', 1),
    ('Select and General Purpose Committees', 'Committee on Implementation', 'national-assembly-13th-implementation', 2),
    ('Select and General Purpose Committees', 'Committee on Delegated Legislation', 'national-assembly-13th-delegated-legislation', 3),
    ('Select and General Purpose Committees', 'Public Petitions Committee', 'national-assembly-13th-public-petitions', 4),
    ('Select and General Purpose Committees', 'Diaspora Affairs and Migrant Workers Committee', 'national-assembly-13th-diaspora-affairs-migrant-workers', 5),
    ('Select and General Purpose Committees', 'Regional Integration Committee', 'national-assembly-13th-regional-integration', 6),
    ('Select and General Purpose Committees', 'Constitutional Implementation Oversight Committee (CIOC)', 'national-assembly-13th-constitutional-implementation-oversight-cioc', 7),
    ('Select and General Purpose Committees', 'Parliamentary Broadcasting and Library Committee', 'national-assembly-13th-parliamentary-broadcasting-library', 8),
    ('Select and General Purpose Committees', 'National Government Constituencies Development Fund (NG-CDF) Committee', 'national-assembly-13th-ng-cdf', 9),

    ('Joint and Statutory Committees', 'National Cohesion and Equal Opportunity Committee', 'national-assembly-13th-national-cohesion-equal-opportunity', 1),
    ('Joint and Statutory Committees', 'Parliamentary Pensions Management Committee', 'national-assembly-13th-parliamentary-pensions-management', 2)
)
INSERT INTO public.parliamentary_committees (
  chamber,
  category,
  name,
  slug,
  is_active,
  is_published,
  sort_order
)
SELECT
  'national_assembly',
  seed.category,
  seed.name,
  seed.slug,
  true,
  false,
  seed.sort_order
FROM seed
WHERE NOT EXISTS (
  SELECT 1
  FROM public.parliamentary_committees AS existing
  WHERE existing.chamber = 'national_assembly'
    AND lower(btrim(existing.name)) = lower(btrim(seed.name))
)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
