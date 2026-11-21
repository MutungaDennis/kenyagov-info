export type FundRecord = {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  official_name?: string | null;
  institution_type: string | null;
  institution_category?: string | null;
  fund_levy_type: string | null;
  fund_classification: string | null;
  fund_legal_form?: string | null;
  accessibility_type?: string | null;
  funding_source?: string | null;
  fund_operational_structure?: string | null;
  description: string | null;
  mandate: string | null;
  functions?: string[] | null;
  target_population: string | null;
  legal_basis_name?: string | null;
  legal_basis_reference: string | null;
  establishment_act?: string | null;
  parent_institution_id: string | null;
  supervising_ministry_id?: string | null;
  website_url: string | null;
  portal_url: string | null;
  application_url: string | null;
  status: string | null;
  is_active?: boolean | null;
};

export type FundParent = {
  id: string;
  slug: string;
  name: string;
};
