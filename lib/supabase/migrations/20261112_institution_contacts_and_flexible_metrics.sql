alter table public.institutions
  alter column funding_model type text using funding_model::text,
  alter column last_annual_report_year type text using last_annual_report_year::text,
  alter column number_of_employees type text using number_of_employees::text,
  alter column annual_budget_estimate type text using annual_budget_estimate::text;

alter table public.institutions
  add column if not exists contact_points jsonb not null default '[]'::jsonb;

update public.institutions i
set contact_points = coalesce((
  select jsonb_agg(jsonb_build_object('type', c.kind, 'purpose', c.purpose, 'value', c.value))
  from (values
    ('email'::text, 'General inquiries'::text, i.email),
    ('phone'::text, 'General inquiries'::text, i.phone),
    ('phone'::text, 'Toll-free'::text, i.toll_free),
    ('phone'::text, 'WhatsApp'::text, i.whatsapp)
  ) as c(kind, purpose, value)
  where nullif(trim(c.value), '') is not null
), '[]'::jsonb)
where i.contact_points = '[]'::jsonb;
