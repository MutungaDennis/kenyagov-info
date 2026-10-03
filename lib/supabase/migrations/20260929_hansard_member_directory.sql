-- A parliamentary directory must not infer house from a missing constituency.
-- Include former members so historical contributions remain discoverable.
create view public.hansard_members with (security_invoker = true) as
select l.id,l.slug,l.full_name,l.title,l.current_party,l.current_county,l.current_constituency,
  array_agg(distinct public.hansard_role_house(r.house,r.title)) as parliamentary_houses
from public.leaders l join public.leader_roles r on r.leader_id=l.id
where public.hansard_role_house(r.house,r.title) in ('national-assembly','senate')
group by l.id,l.slug,l.full_name,l.title,l.current_party,l.current_county,l.current_constituency;
grant select on public.hansard_members to anon,authenticated,service_role;
