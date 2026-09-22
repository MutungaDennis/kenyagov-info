BEGIN;
SET LOCAL lock_timeout='5s';
CREATE OR REPLACE FUNCTION public.search_documents(p_query text DEFAULT NULL::text, p_category_slug text DEFAULT NULL::text, p_type_slug text DEFAULT NULL::text, p_topic_slug text DEFAULT NULL::text, p_institution_id uuid DEFAULT NULL::uuid, p_status text DEFAULT NULL::text, p_year_from integer DEFAULT NULL::integer, p_year_to integer DEFAULT NULL::integer, p_sort text DEFAULT 'newest'::text, p_limit integer DEFAULT 30, p_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, title text, short_title text, slug text, summary text, publication_date date, document_year integer, status text, publisher_text text, category_name text, category_slug text, type_name text, type_slug text, total_count bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'pg_catalog', 'public', 'extensions', 'pg_temp'
AS $function$

with filtered as (

  select distinct
    d.*,

    dc.name as category_name,
    dc.slug as category_slug,

    dt.name as type_name,
    dt.slug as type_slug

  from public.documents d

  left join public.document_types dt
    on dt.id = d.document_type_id

  left join public.document_categories dc
    on dc.id = dt.category_id

  left join public.document_topic_links dtl
    on dtl.document_id = d.id

  left join public.document_topics topic
    on topic.id = dtl.topic_id

  where
    d.published_at is not null
    and d.status <> 'Draft'

    and (
      p_category_slug is null
      or dc.slug = p_category_slug
    )

    and (
      p_type_slug is null
      or dt.slug = p_type_slug
    )

    and (
      p_topic_slug is null
      or topic.slug = p_topic_slug
    )

    and (
      p_institution_id is null
      or d.primary_institution_id = p_institution_id
    )

    and (
      p_status is null
      or d.status = p_status
    )

    and (
      p_year_from is null
      or d.document_year >= p_year_from
    )

    and (
      p_year_to is null
      or d.document_year <= p_year_to
    )

    and (
      nullif(trim(p_query), '') is null

      or d.search_document
        @@ websearch_to_tsquery('english', p_query)

      or exists (
        select 1
        from public.document_sections s
        where
          s.document_id = d.id
          and s.search_document
            @@ websearch_to_tsquery('english', p_query)
      )

      or (p_query ~ '[[:alnum:]]' AND public.search_tokens_match(p_query,concat_ws(' ',d.title,d.short_title,d.summary)))
    )
)

select
  f.id,
  f.title,
  f.short_title,
  f.slug,
  f.summary,
  f.publication_date,
  f.document_year,
  f.status,
  f.publisher_text,

  f.category_name,
  f.category_slug,

  f.type_name,
  f.type_slug,

  count(*) over() as total_count

from filtered f

order by

  case
    when p_sort = 'oldest'
    then f.publication_date
  end asc nulls last,

  case
    when p_sort = 'recently-added'
    then f.created_at
  end desc,

  case
    when p_sort = 'recently-updated'
    then f.updated_at
  end desc,

  case
    when p_sort = 'a-z'
    then lower(f.title)
  end asc,

  case
    when p_sort not in (
      'oldest',
      'recently-added',
      'recently-updated',
      'a-z'
    )
    then f.publication_date
  end desc nulls last,

  f.title asc

limit greatest(
  1,
  least(coalesce(p_limit, 30), 100)
)

offset greatest(
  coalesce(p_offset, 0),
  0
);

$function$;

CREATE OR REPLACE FUNCTION public.search_legislation(p_query text DEFAULT NULL::text, p_category text DEFAULT NULL::text, p_status text DEFAULT NULL::text, p_county_code text DEFAULT NULL::text, p_chamber text DEFAULT NULL::text, p_year integer DEFAULT NULL::integer, p_limit integer DEFAULT 30, p_offset integer DEFAULT 0)
 RETURNS TABLE(legal_document_id uuid, title text, short_title text, citation text, slug text, year integer, category text, status text, county_code text, originating_chamber text, href text, total_count bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'pg_catalog', 'public', 'extensions'
AS $function$
  with filtered as (
    select
      d.id as legal_document_id,
      d.title,
      d.short_title,
      d.citation,
      d.slug,
      d.year,
      l.category,
      l.status,
      l.county_code,
      l.originating_chamber,
      l.act_number,
      l.assent_date,
      l.publication_date,
      l.commencement_date,
      case
        when l.category = 'act'
          then '/legislation/acts/' || d.slug
        when l.category = 'county_act'
          then '/legislation/counties/' ||
               coalesce(c.slug, lower(l.county_code)) || '/' || d.slug
        when l.category = 'subsidiary'
          then '/legislation/subsidiary/' || d.slug
        when l.category = 'treaty'
          then '/legislation/treaties/' || d.slug
        else '/legislation'
      end as href
    from public.legislation_documents l
    join public.legal_documents d
      on d.id = l.legal_document_id
    left join public.kenya_counties c
      on c.code = l.county_code
    where
      (p_category is null or l.category = p_category)
      and (p_status is null or l.status = p_status)
      and (p_county_code is null or l.county_code = p_county_code)
      and (p_chamber is null or l.originating_chamber = p_chamber)
      and (p_year is null or d.year = p_year)
      and (
        nullif(btrim(p_query), '') is null
        or (p_query ~ '[[:alnum:]]' AND public.search_tokens_match(p_query,concat_ws(' ',d.title,d.short_title,d.citation,l.act_number,l.cap_number)))
      )
  )
  select
    f.legal_document_id,
    f.title,
    f.short_title,
    f.citation,
    f.slug,
    f.year,
    f.category,
    f.status,
    f.county_code,
    f.originating_chamber,
    f.href,
    count(*) over() as total_count
  from filtered f
  order by
    f.year desc nulls last,
    f.assent_date desc nulls last,
    f.publication_date desc nulls last,
    f.commencement_date desc nulls last,
    f.title asc
  limit greatest(1, least(coalesce(p_limit, 30), 100))
  offset greatest(coalesce(p_offset, 0), 0);
$function$;

NOTIFY pgrst,'reload schema';
COMMIT;

