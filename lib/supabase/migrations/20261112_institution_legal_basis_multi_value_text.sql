alter table public.institutions
  alter column legal_basis_type type text
  using legal_basis_type::text;
