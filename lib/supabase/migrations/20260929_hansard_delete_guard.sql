create or replace function public.validate_hansard_publication(p_id uuid) returns void
language plpgsql security invoker set search_path='' as $$
declare s public.hansard_sittings; begin
select * into s from public.hansard_sittings where id=p_id;
if not found or s.status is distinct from 'published' then return; end if;
if not exists(select 1 from public.hansard_contributions where sitting_id=p_id) then raise exception 'A published sitting needs at least one contribution'; end if;
if exists(select 1 from public.hansard_contributions c where c.sitting_id=p_id and
 (c.review_status<>'reviewed' or c.speaker_kind='unknown' or length(trim(c.body_text))=0 or
  (c.speaker_kind='member' and (c.link_status<>'confirmed' or c.leader_id is null or c.leader_role_id is null)) or
  c.link_status in ('unmatched','suggested'))) then raise exception 'Review every contribution and confirm member links before publishing'; end if;
if exists(select 1 from public.hansard_contributions c left join public.leader_roles r on r.id=c.leader_role_id
 where c.sitting_id=p_id and c.speaker_kind='member' and
 (r.id is null or r.leader_id<>c.leader_id or public.hansard_role_house(r.house,r.title) is distinct from s.house_type or r.term_start_date>s.sitting_date or (r.term_end_date is not null and r.term_end_date<s.sitting_date))) then
 raise exception 'A linked parliamentary role does not match the member, house or sitting date'; end if;
end $$;
