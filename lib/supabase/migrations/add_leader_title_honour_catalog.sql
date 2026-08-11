-- Catalogues for admin-managed name titles (Justice, SC, Wakili…) and
-- national honours beyond the built-in list. Selected values still store on
-- leaders.name_titles / leaders.national_honours (jsonb arrays).

CREATE TABLE IF NOT EXISTS public.leader_name_title_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leader_name_title_options_value_key UNIQUE (value)
);

CREATE TABLE IF NOT EXISTS public.leader_national_honour_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leader_national_honour_options_value_key UNIQUE (value)
);

COMMENT ON TABLE public.leader_name_title_options IS
  'Admin-extensible honorifics before the name (e.g. Justice, SC, Wakili). Built-in options also live in app code.';

COMMENT ON TABLE public.leader_national_honour_options IS
  'Admin-extensible national honours / post-nominals after the name.';

CREATE INDEX IF NOT EXISTS leader_name_title_options_active_idx
  ON public.leader_name_title_options (is_active, sort_order);

CREATE INDEX IF NOT EXISTS leader_national_honour_options_active_idx
  ON public.leader_national_honour_options (is_active, sort_order);

-- Example seed customs (safe if re-run)
INSERT INTO public.leader_name_title_options (value, label, sort_order)
VALUES
  ('Justice', 'Justice', 40),
  ('Lady Justice', 'Lady Justice', 41),
  ('SC', 'SC (Senior Counsel)', 42),
  ('Wakili', 'Wakili', 43),
  ('Capt.', 'Capt.', 50),
  ('C.J.', 'C.J. (Chief Justice)', 35)
ON CONFLICT (value) DO NOTHING;
