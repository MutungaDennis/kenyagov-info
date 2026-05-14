-- Create leadership categories table
CREATE TABLE IF NOT EXISTS public.leadership_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create leadership subcategories table
CREATE TABLE IF NOT EXISTS public.leadership_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  category_id UUID NOT NULL REFERENCES public.leadership_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create leaders table (replaces governors, senators, MPs)
CREATE TABLE IF NOT EXISTS public.leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  full_name VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  bio TEXT,
  image_url VARCHAR(500),
  category_id UUID NOT NULL REFERENCES public.leadership_categories(id),
  subcategory_id UUID REFERENCES public.leadership_subcategories(id),
  county VARCHAR(255),
  party VARCHAR(255),
  position_type VARCHAR(100), -- 'Elected', 'Nominated', etc.
  deputy_name VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create entity categories table
CREATE TABLE IF NOT EXISTS public.entity_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create entities table
CREATE TABLE IF NOT EXISTS public.entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES public.entity_categories(id),
  county VARCHAR(255),
  region VARCHAR(255),
  image_url VARCHAR(500),
  website_url VARCHAR(500),
  headquarters VARCHAR(500),
  established_date DATE,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaders_category_id ON public.leaders(category_id);
CREATE INDEX IF NOT EXISTS idx_leaders_subcategory_id ON public.leaders(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_leaders_slug ON public.leaders(slug);
CREATE INDEX IF NOT EXISTS idx_leaders_county ON public.leaders(county);
CREATE INDEX IF NOT EXISTS idx_leaders_party ON public.leaders(party);
CREATE INDEX IF NOT EXISTS idx_entities_category_id ON public.entities(category_id);
CREATE INDEX IF NOT EXISTS idx_entities_slug ON public.entities(slug);
CREATE INDEX IF NOT EXISTS idx_entities_county ON public.entities(county);

-- Enable RLS
ALTER TABLE public.leadership_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read access)
CREATE POLICY "Public read access on leadership_categories"
  ON public.leadership_categories FOR SELECT USING (true);

CREATE POLICY "Public read access on leadership_subcategories"
  ON public.leadership_subcategories FOR SELECT USING (true);

CREATE POLICY "Public read access on leaders"
  ON public.leaders FOR SELECT USING (true);

CREATE POLICY "Public read access on entity_categories"
  ON public.entity_categories FOR SELECT USING (true);

CREATE POLICY "Public read access on entities"
  ON public.entities FOR SELECT USING (true);

-- Insert leadership categories
INSERT INTO public.leadership_categories (code, name, description, order_index) VALUES
  ('executive', 'Executive', 'The President and Cabinet', 1),
  ('legislature', 'Legislature', 'National Assembly and Senate', 2),
  ('judiciary', 'Judiciary', 'Judges and Courts', 3),
  ('county', 'County Leadership', 'Governors and County Officials', 4)
ON CONFLICT (code) DO NOTHING;

-- Insert entity categories
INSERT INTO public.entity_categories (code, name, description, order_index) VALUES
  ('ministries', 'Ministries & Departments', 'Government Ministries and Departments', 1),
  ('agencies', 'Agencies & Commissions', 'Government Agencies and Independent Commissions', 2),
  ('counties', 'Counties', 'County Governments', 3),
  ('institutions', 'Institutions', 'Public Institutions and Authorities', 4)
ON CONFLICT (code) DO NOTHING;

-- Insert leadership subcategories
INSERT INTO public.leadership_subcategories (code, category_id, name, description, order_index) VALUES
  ('cabinet-secretaries', (SELECT id FROM public.leadership_categories WHERE code = 'executive'), 'Cabinet Secretaries', 'Members of the Cabinet', 1),
  ('principal-secretaries', (SELECT id FROM public.leadership_categories WHERE code = 'executive'), 'Principal Secretaries', 'Principal Secretaries in Government', 2),
  ('national-assembly', (SELECT id FROM public.leadership_categories WHERE code = 'legislature'), 'National Assembly', 'Members of Parliament', 1),
  ('senate', (SELECT id FROM public.leadership_categories WHERE code = 'legislature'), 'Senate', 'Senators', 2),
  ('chief-justice', (SELECT id FROM public.leadership_categories WHERE code = 'judiciary'), 'Chief Justice & Judges', 'Judiciary Leadership', 1),
  ('governors', (SELECT id FROM public.leadership_categories WHERE code = 'county'), 'Governors', 'County Governors', 1),
  ('deputy-governors', (SELECT id FROM public.leadership_categories WHERE code = 'county'), 'Deputy Governors', 'Deputy County Governors', 2)
ON CONFLICT (code) DO NOTHING;
