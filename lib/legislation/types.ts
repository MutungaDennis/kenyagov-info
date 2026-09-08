export type LegislationCategory = "act" | "county_act" | "subsidiary" | "treaty";
export type Chamber = "national_assembly" | "senate" | "county_assembly";

export type LegislationKind =
  | "principal"
  | "amending"
  | "repealing"
  | "revision"
  | "consolidation"
  | "subsidiary"
  | "treaty"
  | "other";

export type LegislationListItem = {
  legal_document_id: string;
  title: string;
  short_title: string | null;
  citation: string | null;
  slug: string;
  year: number | null;
  category: LegislationCategory;
  status: string;
  legislation_kind?: LegislationKind | null;
  county_code: string | null;
  originating_chamber: Chamber | null;
  href: string;
  total_count?: number;
};

export type LegislationDocument = {
  legal_document_id: string;
  legislation_document_id: string;
  title: string;
  short_title: string | null;
  citation: string | null;
  slug: string;
  year: number | null;
  document_type: string;
  category: LegislationCategory;
  jurisdiction_level: "national" | "county" | "international";
  county_code: string | null;
  county_name: string | null;
  county_slug: string | null;
  legislature_name: string | null;
  originating_chamber: Chamber | null;
  act_number: string | null;
  cap_number: string | null;
  bill_reference: string | null;
  long_title: string | null;
  assent_date: string | null;
  publication_date: string | null;
  commencement_date: string | null;
  repeal_date: string | null;
  last_amended_date: string | null;
  current_version_date: string | null;
  status: string;
  is_current: boolean;
  legislation_kind: LegislationKind | null;
  source_url: string | null;
  source_publisher: string | null;
  treaty_type: string | null;
  treaty_status: string | null;
  signature_date: string | null;
  ratification_date: string | null;
  entry_into_force_date: string | null;
};

export type LegislationProvision = {
  id: string;
  legal_provision_id: string;
  provision_type: string;
  provision_number: string | null;
  heading: string | null;
  body_text: string;
  body_html: string;
  sort_order: number;
  canonical_path: string;
};

export type LegislationAmendmentItem = {
  id: string;
  item_key: string;
  provision_label: string;
  operation_type: string;
  amendment_text: string;
  amendment_html: string;
  sort_order: number;
  source_line_start: number | null;
  source_line_end: number | null;
};

export type LegislationAmendmentGroup = {
  id: string;
  group_key: string;
  written_law_title: string;
  written_law_citation: string | null;
  target_legal_document_id: string | null;
  target_document_slug: string | null;
  target_document_title: string | null;
  sort_order: number;
  source_line_start: number | null;
  source_line_end: number | null;
  items: LegislationAmendmentItem[];
};
