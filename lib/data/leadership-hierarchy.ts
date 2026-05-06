// Leadership hierarchy data structure for dynamic routing
// This bridges data from files into a queryable format that can be moved to Supabase later

export type LeadershipCategory = 'executive' | 'legislature' | 'judiciary' | 'county';
export type LeadershipSubcategory = 
  | 'cabinet-secretaries'
  | 'principal-secretaries'
  | 'national-assembly'
  | 'senate'
  | 'chief-justice'
  | 'governors'
  | 'deputy-governors';

export interface LeaderProfile {
  id: string;
  slug: string;
  name: string;
  category: LeadershipCategory;
  subcategory: LeadershipSubcategory;
  title?: string;
  party?: string;
  location?: string;
  image?: string;
  bio?: string;
  metadata?: Record<string, any>;
}

// Category and subcategory mapping
export const LEADERSHIP_HIERARCHY: Record<LeadershipCategory, {
  name: string;
  slug: string;
  description: string;
  subcategories: Record<LeadershipSubcategory, { name: string; slug: string; description: string }>;
}> = {
  executive: {
    name: 'Executive',
    slug: 'executive',
    description: 'The President and Cabinet',
    subcategories: {
      'cabinet-secretaries': {
        name: 'Cabinet Secretaries',
        slug: 'cabinet-secretaries',
        description: 'Members of the Cabinet',
      },
      'principal-secretaries': {
        name: 'Principal Secretaries',
        slug: 'principal-secretaries',
        description: 'Principal Secretaries in Government',
      },
      'national-assembly': {
        name: 'National Assembly',
        slug: 'national-assembly',
        description: 'Members of Parliament',
      },
      'senate': {
        name: 'Senate',
        slug: 'senate',
        description: 'Senators',
      },
      'chief-justice': {
        name: 'Chief Justice',
        slug: 'chief-justice',
        description: 'Judiciary Leadership',
      },
      'governors': {
        name: 'Governors',
        slug: 'governors',
        description: 'County Governors',
      },
      'deputy-governors': {
        name: 'Deputy Governors',
        slug: 'deputy-governors',
        description: 'Deputy County Governors',
      },
    },
  },
  legislature: {
    name: 'Legislature',
    slug: 'legislature',
    description: 'National Assembly and Senate',
    subcategories: {
      'national-assembly': {
        name: 'National Assembly',
        slug: 'national-assembly',
        description: 'Members of Parliament',
      },
      'senate': {
        name: 'Senate',
        slug: 'senate',
        description: 'Senators',
      },
      'cabinet-secretaries': {
        name: 'Cabinet Secretaries',
        slug: 'cabinet-secretaries',
        description: 'Members of the Cabinet',
      },
      'principal-secretaries': {
        name: 'Principal Secretaries',
        slug: 'principal-secretaries',
        description: 'Principal Secretaries in Government',
      },
      'chief-justice': {
        name: 'Chief Justice',
        slug: 'chief-justice',
        description: 'Judiciary Leadership',
      },
      'governors': {
        name: 'Governors',
        slug: 'governors',
        description: 'County Governors',
      },
      'deputy-governors': {
        name: 'Deputy Governors',
        slug: 'deputy-governors',
        description: 'Deputy County Governors',
      },
    },
  },
  judiciary: {
    name: 'Judiciary',
    slug: 'judiciary',
    description: 'Judges and Courts',
    subcategories: {
      'chief-justice': {
        name: 'Chief Justice & Judges',
        slug: 'chief-justice',
        description: 'Judiciary Leadership',
      },
      'cabinet-secretaries': {
        name: 'Cabinet Secretaries',
        slug: 'cabinet-secretaries',
        description: 'Members of the Cabinet',
      },
      'principal-secretaries': {
        name: 'Principal Secretaries',
        slug: 'principal-secretaries',
        description: 'Principal Secretaries in Government',
      },
      'national-assembly': {
        name: 'National Assembly',
        slug: 'national-assembly',
        description: 'Members of Parliament',
      },
      'senate': {
        name: 'Senate',
        slug: 'senate',
        description: 'Senators',
      },
      'governors': {
        name: 'Governors',
        slug: 'governors',
        description: 'County Governors',
      },
      'deputy-governors': {
        name: 'Deputy Governors',
        slug: 'deputy-governors',
        description: 'Deputy County Governors',
      },
    },
  },
  county: {
    name: 'County Leadership',
    slug: 'county',
    description: 'Governors and County Officials',
    subcategories: {
      'governors': {
        name: 'Governors',
        slug: 'governors',
        description: 'County Governors',
      },
      'deputy-governors': {
        name: 'Deputy Governors',
        slug: 'deputy-governors',
        description: 'Deputy County Governors',
      },
      'cabinet-secretaries': {
        name: 'Cabinet Secretaries',
        slug: 'cabinet-secretaries',
        description: 'Members of the Cabinet',
      },
      'principal-secretaries': {
        name: 'Principal Secretaries',
        slug: 'principal-secretaries',
        description: 'Principal Secretaries in Government',
      },
      'national-assembly': {
        name: 'National Assembly',
        slug: 'national-assembly',
        description: 'Members of Parliament',
      },
      'senate': {
        name: 'Senate',
        slug: 'senate',
        description: 'Senators',
      },
      'chief-justice': {
        name: 'Chief Justice',
        slug: 'chief-justice',
        description: 'Judiciary Leadership',
      },
    },
  },
};

// Entity hierarchy for organizations/institutions
export type EntityCategory = 'ministries' | 'agencies' | 'counties' | 'institutions';

export interface Entity {
  id: string;
  slug: string;
  name: string;
  category: EntityCategory;
  description?: string;
  county?: string;
  region?: string;
  image?: string;
  website?: string;
  headquarters?: string;
  metadata?: Record<string, any>;
}

export const ENTITY_HIERARCHY: Record<EntityCategory, {
  name: string;
  slug: string;
  description: string;
}> = {
  ministries: {
    name: 'Ministries & Departments',
    slug: 'ministries',
    description: 'Government Ministries and Departments',
  },
  agencies: {
    name: 'Agencies & Commissions',
    slug: 'agencies',
    description: 'Government Agencies and Independent Commissions',
  },
  counties: {
    name: 'Counties',
    slug: 'counties',
    description: 'County Governments',
  },
  institutions: {
    name: 'Institutions',
    slug: 'institutions',
    description: 'Public Institutions and Authorities',
  },
};

// Helper functions for hierarchy traversal
export function isValidLeadershipCategory(category: string): category is LeadershipCategory {
  return ['executive', 'legislature', 'judiciary', 'county'].includes(category);
}

export function isValidLeadershipSubcategory(subcategory: string): subcategory is LeadershipSubcategory {
  return [
    'cabinet-secretaries',
    'principal-secretaries',
    'national-assembly',
    'senate',
    'chief-justice',
    'governors',
    'deputy-governors',
  ].includes(subcategory);
}

export function isValidEntityCategory(category: string): category is EntityCategory {
  return ['ministries', 'agencies', 'counties', 'institutions'].includes(category);
}

export function getCategoryBySubcategory(subcategory: LeadershipSubcategory): LeadershipCategory | null {
  for (const [category, data] of Object.entries(LEADERSHIP_HIERARCHY)) {
    if (subcategory in data.subcategories) {
      return category as LeadershipCategory;
    }
  }
  return null;
}

export function getSubcategoriesForCategory(category: LeadershipCategory): Record<string, { name: string; slug: string; description: string }> {
  return LEADERSHIP_HIERARCHY[category]?.subcategories || {};
}
