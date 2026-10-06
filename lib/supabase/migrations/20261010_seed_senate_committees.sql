BEGIN;
SET LOCAL lock_timeout = '5s';

WITH seed(category, name, slug, sort_order) AS (
  VALUES
    ('House Keeping Committees', 'The Senate Business Committee', 'senate-business', 1),
    ('House Keeping Committees', 'The Liaison Committee', 'senate-liaison', 2),
    ('House Keeping Committees', 'The Procedures and Rules Committee', 'senate-procedures-rules', 3),
    ('House Keeping Committees', 'The Powers and Privileges Committee', 'senate-powers-privileges', 4),

    ('Standing Committees', 'Agriculture, Livestock and Fisheries', 'senate-agriculture-livestock-fisheries', 1),
    ('Standing Committees', 'Education', 'senate-education', 2),
    ('Standing Committees', 'Information Communication and Technology', 'senate-information-communication-technology', 3),
    ('Standing Committees', 'Roads and Transportation', 'senate-roads-transportation', 4),
    ('Standing Committees', 'Energy', 'senate-energy', 5),
    ('Standing Committees', 'Finance and Budget', 'senate-finance-budget', 6),
    ('Standing Committees', 'Health', 'senate-health', 7),
    ('Standing Committees', 'Justice, Legal Affairs and Human Rights', 'senate-justice-legal-affairs-human-rights', 8),
    ('Standing Committees', 'Devolution and Intergovernmental Relations', 'senate-devolution-intergovernmental-relations', 9),
    ('Standing Committees', 'Labour and Social Welfare', 'senate-labour-social-welfare', 10),
    ('Standing Committees', 'Lands, Environment and Natural Resources', 'senate-lands-environment-natural-resources', 11),
    ('Standing Committees', 'National Cohesion, Equal Opportunity and Regional Integration', 'senate-national-cohesion-equal-opportunity-regional-integration', 12),
    ('Standing Committees', 'National Security and Foreign Relations', 'senate-national-security-foreign-relations', 13),
    ('Standing Committees', 'Tourism, Trade and Industrialization', 'senate-tourism-trade-industrialization', 14),

    ('Sessional Committees', 'County Public Accounts', 'senate-county-public-accounts', 1),
    ('Sessional Committees', 'County Public Investment & Special Funds', 'senate-county-public-investment-special-funds', 2),
    ('Sessional Committees', 'Delegated Legislation', 'senate-delegated-legislation', 3)
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
  'senate',
  seed.category,
  seed.name,
  seed.slug,
  true,
  true,
  seed.sort_order
FROM seed
WHERE NOT EXISTS (
  SELECT 1
  FROM public.parliamentary_committees AS existing
  WHERE existing.chamber = 'senate'
    AND lower(btrim(existing.name)) = lower(btrim(seed.name))
)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
