-- No fixtures are retained; this entire integration test rolls back.
begin;
select public.save_hansard_document('{"schema_version":2,"sitting":{"id":"00000000-0000-4000-8000-000000000001","slug":"migration-test-hansard-public","title":"Migrationdebate","house_type":"senate","sitting_date":"2026-09-29","status":"published","source_access":"public","review_status":"reviewed"},"sections":[{"section_key":"one","heading":"Debate","sort_order":1}],"contributions":[{"contribution_key":"one","section_key":"one","sort_order":1,"speaker_kind":"guest","speaker_name":"Test witness","body_html":"<p>Migrationdebate testimony</p>","body_text":"Migrationdebate testimony","link_status":"not-applicable","review_status":"reviewed"}],"sources":[]}'::jsonb);
select public.save_hansard_document('{"schema_version":2,"sitting":{"id":"00000000-0000-4000-8000-000000000002","slug":"migration-test-hansard-draft","title":"Private migrationdebate","house_type":"senate","sitting_date":"2026-09-29","status":"draft"},"sections":[],"contributions":[],"sources":[]}'::jsonb);
select public.save_government_service('{"_id":"migration-test-service-public","title":"Migrationpassport public","slug":{"current":"migration-test-public"},"status":"published"}'::jsonb);
select public.save_government_service('{"_id":"migration-test-service-draft","title":"Migrationpassport private","slug":{"current":"migration-test-private"},"status":"draft"}'::jsonb);
set constraints all immediate;
set constraints all deferred;
do $$ declare role_record public.leader_roles; begin
  begin
    perform public.save_hansard_document('{"sitting":{"id":"00000000-0000-4000-8000-000000000001","slug":"migration-test-hansard-public","title":"Broken replacement","house_type":"senate","sitting_date":"2026-09-29","status":"published","source_access":"public","review_status":"reviewed"},"sections":[],"contributions":[]}'::jsonb);
    raise exception 'TEST: invalid publication accepted';
  exception when raise_exception then
    if SQLERRM like 'TEST:%' then raise; end if;
  end;
  if (select title from public.hansard_sittings where id='00000000-0000-4000-8000-000000000001') <> 'Migrationdebate' then raise exception 'Atomic save failed'; end if;
  select * into role_record from public.leader_roles where public.hansard_role_house(house,title)='national-assembly' limit 1;
  if role_record.id is null then raise exception 'Test requires one parliamentary role'; end if;
  begin
    update public.hansard_contributions set speaker_kind='member',leader_id=role_record.leader_id,leader_role_id=role_record.id,link_status='confirmed' where sitting_id='00000000-0000-4000-8000-000000000001';
    perform public.validate_hansard_publication('00000000-0000-4000-8000-000000000001');
    raise exception 'TEST: wrong house accepted';
  exception when raise_exception then if SQLERRM like 'TEST:%' then raise; end if; end;
  begin
    update public.hansard_sittings set house_type='national-assembly',sitting_date=role_record.term_start_date-1 where id='00000000-0000-4000-8000-000000000001';
    update public.hansard_contributions set speaker_kind='member',leader_id=role_record.leader_id,leader_role_id=role_record.id,link_status='confirmed' where sitting_id='00000000-0000-4000-8000-000000000001';
    perform public.validate_hansard_publication('00000000-0000-4000-8000-000000000001');
    raise exception 'TEST: out-of-term member accepted';
  exception when raise_exception then if SQLERRM like 'TEST:%' then raise; end if; end;
  -- A genuine role on its effective date can be published and queried by member.
  update public.hansard_sittings set house_type='national-assembly',sitting_date=role_record.term_start_date where id='00000000-0000-4000-8000-000000000001';
  update public.hansard_contributions set speaker_kind='member',leader_id=role_record.leader_id,leader_role_id=role_record.id,link_status='confirmed' where sitting_id='00000000-0000-4000-8000-000000000001';
  perform public.validate_hansard_publication('00000000-0000-4000-8000-000000000001');
  if not exists(select 1 from public.hansard_member_candidates('national-assembly',role_record.term_start_date,(select full_name from public.leaders where id=role_record.leader_id)) where leader_role_id=role_record.id) then raise exception 'Eligible member missing from link picker'; end if;
end $$;
do $$ declare senator public.leader_roles; begin
 begin
  update public.hansard_sittings set source_access='unknown' where id='00000000-0000-4000-8000-000000000001';
  raise exception 'Unverified source published';
 exception when check_violation then null; end;
 begin
  update public.hansard_sittings set source_access='restricted' where id='00000000-0000-4000-8000-000000000001';
  raise exception 'Restricted source published';
 exception when check_violation then null; end;
 begin
  update public.hansard_sittings set source_community_id='1653b0ba-1c30-45fa-be00-98afccf14b49' where id='00000000-0000-4000-8000-000000000001';
  raise exception 'Restricted community published under a public label';
 exception when check_violation then null; end;
 begin
  update public.hansard_sittings set proceeding_type='bound-volume' where id='00000000-0000-4000-8000-000000000001';
  raise exception 'Internal proceeding published';
 exception when check_violation then null; end;
 update public.hansard_sittings set proceeding_type='joint-sitting',source_community_id='5e16943d-6a47-4935-8224-bd443a2c93dd' where id='00000000-0000-4000-8000-000000000001';
 perform public.validate_hansard_publication('00000000-0000-4000-8000-000000000001');
 select * into senator from public.leader_roles where public.hansard_role_house(house,title)='senate' limit 1;
 if senator.id is null then raise exception 'Test needs a Senate role'; end if;
 update public.hansard_sittings set sitting_date=senator.term_start_date where id='00000000-0000-4000-8000-000000000001';
 update public.hansard_contributions set leader_id=senator.leader_id,leader_role_id=senator.id where sitting_id='00000000-0000-4000-8000-000000000001';
 perform public.validate_hansard_publication('00000000-0000-4000-8000-000000000001');
end $$;
set local role anon;
do $$ begin
 if (select count(*) from public.hansard_repository_communities) <> 3 then raise exception 'Internal communities exposed'; end if;
 if (select count(*) from public.search_hansard_content('migrationdebate','joint-sitting','senate',0,25)) <> 2 then raise exception 'Joint search/member tracing failed'; end if;
 if (select count(*) from public.hansard_sittings where slug like 'migration-test-%') <> 1 then raise exception 'Draft sitting exposed'; end if;
 if (select count(*) from public.hansard_contributions where sitting_id in ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002')) <> 1 then raise exception 'Contribution visibility wrong'; end if;
 if (select count(*) from public.government_services where id like 'migration-test-%') <> 1 then raise exception 'Draft service exposed'; end if;
 if (select count(*) from public.search_migrated_content('migrationpassport',60)) <> 1 then raise exception 'Search exposed private service'; end if;
 if (select count(*) from public.search_migrated_content('migrationdebate',60)) <> 2 then raise exception 'Hansard full-text search failed'; end if;
 begin
  insert into public.hansard_sittings(slug,title,house_type,sitting_date) values('unauthorized','Unauthorized','senate',current_date);
  raise exception 'Anonymous write allowed';
 exception when insufficient_privilege then null; end;
end $$;
set local role authenticated;
do $$ begin
 if (select count(*) from public.hansard_sittings where slug like 'migration-test-%') <> 1 then raise exception 'Non-admin can read drafts'; end if;
 begin
  update public.hansard_sittings set title='Unauthorized' where slug='migration-test-hansard-public';
  if found then raise exception 'Non-admin update allowed'; end if;
 exception when insufficient_privilege then null; end;
end $$;
reset role;
-- Even a formerly published source becomes invisible when its community is restricted.
update public.hansard_repository_communities set access_level='restricted' where id='5e16943d-6a47-4935-8224-bd443a2c93dd';
set local role anon;
do $$ begin
 if exists(select 1 from public.hansard_sittings where slug like 'migration-test-%') then raise exception 'Restricted sitting leaked'; end if;
 if exists(select 1 from public.hansard_contributions where sitting_id='00000000-0000-4000-8000-000000000001') then raise exception 'Restricted member contribution leaked'; end if;
 if exists(select 1 from public.search_hansard_content('migrationdebate')) then raise exception 'Restricted record leaked through Hansard search'; end if;
 if exists(select 1 from public.search_migrated_content('migrationdebate',60)) then raise exception 'Restricted record leaked through global search'; end if;
end $$;
reset role;
update public.hansard_repository_communities set access_level='public' where id='5e16943d-6a47-4935-8224-bd443a2c93dd';
delete from public.hansard_sittings where id='00000000-0000-4000-8000-000000000001';
set constraints all immediate;
rollback;
