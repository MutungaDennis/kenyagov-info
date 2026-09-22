-- Match the public legislation directory: legal status, rather than unused publication timestamps.
BEGIN;
SET LOCAL lock_timeout='5s';
CREATE OR REPLACE VIEW public.global_search_view WITH (security_invoker=true) AS
SELECT i.id::text,id_slug.slug,i.name,i.description AS snippet,'Institution'::text AS entity_type,
  '/government/institutions'::text AS base_route,i.search_vector,coalesce(i.search_boost,10) AS rank_boost,
  concat_ws(' ',i.name,i.short_name,i.official_name,array_to_string(i.aliases,' '),array_to_string(i.common_misspellings,' '),array_to_string(i.former_names,' ')) AS match_text
FROM public.institutions i CROSS JOIN LATERAL (SELECT i.slug) id_slug WHERE i.is_active=true
UNION ALL
SELECT l.id::text,l.slug,l.full_name,l.bio,'Leader','/government/people',l.search_vector,5,
  concat_ws(' ',l.full_name,l.title,l.current_organization,l.current_county,l.current_constituency,l.current_party)
FROM public.leaders l WHERE l.is_active=true AND l.slug IS NOT NULL
UNION ALL
SELECT m.id::text,m.slug,concat_ws(' ',m.first_name,m.other_names,m.surname),m.bio,'Official','/government/people',
  to_tsvector('english',concat_ws(' ',m.first_name,m.other_names,m.surname,m.assembly_role,c.name,w.name)),5,
  concat_ws(' ',m.first_name,m.other_names,m.surname,m.assembly_role,c.name,w.name)
FROM public.mcas m LEFT JOIN public.counties c ON c.id=m.county_id LEFT JOIN public.wards w ON w.id=m.ward_id
WHERE m.status='Active' AND m.slug IS NOT NULL
UNION ALL
SELECT c.id::text,c.slug,c.name,NULL::text,'County','/government/institutions',c.search_vector,6,
  concat_ws(' ',c.name,c.headquarters,c.region)
FROM public.counties c WHERE c.is_active=true
UNION ALL
SELECT c.id::text,''::text,c.name,'Browse wards in this constituency','Constituency',
  '/government/counties/wards?constituency='||replace(c.name,' ','%20'),c.search_vector,4,c.name
FROM public.constituencies c WHERE c.is_active IS DISTINCT FROM false
UNION ALL
SELECT w.id::text,w.slug||'/about',w.name,NULL::text,'Ward','/government/counties/wards',w.search_vector,3,
  concat_ws(' ',w.name,w.county_name,w.constituency_name)
FROM public.wards w WHERE w.is_active IS DISTINCT FROM false
UNION ALL
SELECT p.id::text,p.slug,p.name,p.slogan,'Political Party','/elections/political-parties',p.search_vector,4,
  concat_ws(' ',p.name,p.abbreviation)
FROM public.political_parties p WHERE p.slug IS NOT NULL
UNION ALL
SELECT s.id::text,s.slug,s.official_name,concat_ws(' · ',s.main_tier,s.sub_county,s.county),'School','/government/institutions',
  s.public_search_vector,3,concat_ws(' ',s.official_name,s.short_name,s.county,s.sub_county)
FROM public.education_schools s WHERE s.ownership='public'
UNION ALL
SELECT d.id::text,d.slug,d.title,coalesce(d.summary,d.description),'Document','/documents',
  to_tsvector('english',concat_ws(' ',d.title,d.short_title,d.summary)),4,concat_ws(' ',d.title,d.short_title)
FROM public.documents d WHERE d.published_at IS NOT NULL AND d.status<>'Draft' AND d.slug IS NOT NULL
UNION ALL
SELECT a.id::text,a.article_number::text,'Article '||a.article_number||': '||a.title,a.title,'Constitutional Article','/constitution/article',
  to_tsvector('english','Constitution Article '||a.article_number||' '||a.title),5,'Constitution Article '||a.article_number||' '||a.title
FROM public.constitution_articles a
UNION ALL
SELECT ld.id::text,legal.slug,legal.title,coalesce(ld.long_title,legal.short_title),
  CASE ld.category WHEN 'act' THEN 'Act of Parliament' WHEN 'county_act' THEN 'County Law' WHEN 'subsidiary' THEN 'Subsidiary Legislation' ELSE 'Treaty' END,
  CASE ld.category WHEN 'act' THEN '/legislation/acts' WHEN 'county_act' THEN '/legislation/counties/'||county.slug WHEN 'subsidiary' THEN '/legislation/subsidiary' ELSE '/legislation/treaties' END,
  to_tsvector('english',concat_ws(' ',legal.title,legal.short_title,legal.citation,ld.long_title)),6,
  concat_ws(' ',legal.title,legal.short_title,legal.citation,legal.year,county.name)
FROM public.legislation_documents ld JOIN public.legal_documents legal ON legal.id=ld.legal_document_id
LEFT JOIN public.kenya_counties county ON county.code=ld.county_code
WHERE ld.status IN ('In force','Partially in force','Not yet commenced','Repealed','Spent','Revoked','Superseded','Historical') AND legal.slug IS NOT NULL
  AND (ld.category<>'county_act' OR county.slug IS NOT NULL)
UNION ALL
SELECT b.id::text,b.slug,b.title,b.summary,'Cabinet Brief','/government/cabinet/briefs',b.search_vector,4,concat_ws(' ',b.title,b.summary)
FROM public.cabinet_briefs b WHERE b.is_published=true
UNION ALL
SELECT s.id::text,s.slug,s.title,s.summary,'Presidential Speech','/government/presidency/speeches',s.search_vector,4,concat_ws(' ',s.title,s.summary)
FROM public.presidential_speeches s WHERE s.is_published=true
UNION ALL
SELECT g.id::text,g.year::text||'/'||g.issue_number::text,'Kenya Gazette '||g.year||' issue '||g.issue_number,NULL::text,'Gazette Issue','/kenya-gazette',
  to_tsvector('english','Kenya Gazette '||g.year||' issue '||g.issue_number),3,'Kenya Gazette '||g.year||' issue '||g.issue_number
FROM public.gazette_issues g WHERE g.year IS NOT NULL AND g.issue_number IS NOT NULL;

NOTIFY pgrst,'reload schema';
COMMIT;
