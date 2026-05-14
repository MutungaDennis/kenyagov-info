import { createClient as createServerClient } from './server';

// Type definitions for government data
export interface Official {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  phone?: string;
  position_id: number;
  political_party_id?: number;
  county_id?: number;
  constituency_id?: number;
  ward_id?: number;
  office_address?: string;
  image_url?: string;
  bio?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OfficialWithRelations extends Official {
  positions?: Position;
  political_parties?: PoliticalParty;
  counties?: County;
  constituencies?: Constituency;
  wards?: Ward;
}

export interface Position {
  id: number;
  title: string;
  code: string;
  level: string;
  entity_id?: number;
  rank_order?: number;
  description?: string;
  created_at: string;
}

export interface PoliticalParty {
  id: number;
  name: string;
  code: string;
  abbreviation?: string;
  color_code?: string;
  founded_date?: string;
  created_at: string;
}

export interface County {
  id: number;
  name: string;
  code: string;
  region?: string;
  population?: number;
  area_sq_km?: number;
  capital?: string;
  image_url?: string;
  created_at: string;
}

export interface Constituency {
  id: number;
  name: string;
  code: string;
  county_id: number;
  population?: number;
  created_at: string;
}

export interface Ward {
  id: number;
  name: string;
  code: string;
  constituency_id: number;
  population?: number;
  created_at: string;
}

export interface GovernmentLevel {
  id: number;
  name: string;
  code: string;
  description?: string;
  created_at: string;
}

// Fetch all officials with optional filters
export async function getAllOfficials(
  options?: {
    limit?: number;
    offset?: number;
    isActive?: boolean;
  }
): Promise<OfficialWithRelations[]> {
  const supabase = await createServerClient();
  
  let query = supabase
    .from('officials')
    .select(
      `*,
      positions(id, title, code, level, description),
      political_parties(id, name, code, abbreviation, color_code),
      counties(id, name, code, region, capital),
      constituencies(id, name, code),
      wards(id, name, code)`
    );

  if (options?.isActive !== undefined) {
    query = query.eq('is_active', options.isActive);
  }

  query = query.order('full_name', { ascending: true });

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching officials:', error);
    return [];
  }

  return data || [];
}

// Fetch official by ID
export async function getOfficialById(id: string): Promise<OfficialWithRelations | null> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('officials')
    .select(
      `*,
      positions(id, title, code, level, description),
      political_parties(id, name, code, abbreviation, color_code),
      counties(id, name, code, region, capital, population),
      constituencies(id, name, code),
      wards(id, name, code)`
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching official:', error);
    return null;
  }

  return data;
}

// Fetch officials by position
export async function getOfficialsByPosition(
  positionCode: string,
  options?: { limit?: number; offset?: number }
): Promise<OfficialWithRelations[]> {
  const supabase = await createServerClient();
  
  let query = supabase
    .from('officials')
    .select(
      `*,
      positions(id, title, code, level, description),
      political_parties(id, name, code, abbreviation, color_code),
      counties(id, name, code, region),
      constituencies(id, name, code),
      wards(id, name, code)`
    )
    .eq('positions.code', positionCode)
    .eq('is_active', true)
    .order('full_name', { ascending: true });

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching officials by position:', error);
    return [];
  }

  return data || [];
}

// Fetch officials by county
export async function getOfficialsByCounty(
  countyCode: string,
  options?: { limit?: number; offset?: number }
): Promise<OfficialWithRelations[]> {
  const supabase = await createServerClient();
  
  let query = supabase
    .from('officials')
    .select(
      `*,
      positions(id, title, code, level, description),
      political_parties(id, name, code, abbreviation, color_code),
      counties(id, name, code, region),
      constituencies(id, name, code),
      wards(id, name, code)`
    )
    .eq('counties.code', countyCode)
    .eq('is_active', true)
    .order('positions.rank_order', { ascending: true });

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching officials by county:', error);
    return [];
  }

  return data || [];
}

// Fetch officials by political party
export async function getOfficialsByParty(
  partyCode: string,
  options?: { limit?: number; offset?: number }
): Promise<OfficialWithRelations[]> {
  const supabase = await createServerClient();
  
  let query = supabase
    .from('officials')
    .select(
      `*,
      positions(id, title, code, level, description),
      political_parties(id, name, code, abbreviation, color_code),
      counties(id, name, code, region),
      constituencies(id, name, code),
      wards(id, name, code)`
    )
    .eq('political_parties.code', partyCode)
    .eq('is_active', true)
    .order('positions.rank_order', { ascending: true });

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching officials by party:', error);
    return [];
  }

  return data || [];
}

// Search officials by name, title, or bio
export async function searchOfficials(
  query: string,
  options?: { limit?: number; offset?: number }
): Promise<OfficialWithRelations[]> {
  const supabase = await createServerClient();
  
  let qb = supabase
    .from('officials')
    .select(
      `*,
      positions(id, title, code, level, description),
      political_parties(id, name, code, abbreviation, color_code),
      counties(id, name, code, region),
      constituencies(id, name, code),
      wards(id, name, code)`
    )
    .eq('is_active', true)
    .or(`full_name.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%,positions.title.ilike.%${query}%,bio.ilike.%${query}%`)
    .order('full_name', { ascending: true });

  if (options?.limit) {
    qb = qb.limit(options.limit);
  }
  if (options?.offset) {
    qb = qb.range(options.offset, (options.offset + (options.limit || 10)) - 1);
  }

  const { data, error } = await qb;

  if (error) {
    console.error('Error searching officials:', error);
    return [];
  }

  return data || [];
}

// Get all positions
export async function getAllPositions(): Promise<Position[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('positions')
    .select('*')
    .order('rank_order', { ascending: true });

  if (error) {
    console.error('Error fetching positions:', error);
    return [];
  }

  return data || [];
}

// Get all counties
export async function getAllCounties(): Promise<County[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('counties')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching counties:', error);
    return [];
  }

  return data || [];
}

// Get all political parties
export async function getAllParties(): Promise<PoliticalParty[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('political_parties')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching parties:', error);
    return [];
  }

  return data || [];
}

// Get constituencies by county
export async function getConstituenciesByCounty(countyCode: string): Promise<Constituency[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('constituencies')
    .select('*')
    .eq('counties.code', countyCode)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching constituencies:', error);
    return [];
  }

  return data || [];
}

// Get all government levels
export async function getGovernmentLevels(): Promise<GovernmentLevel[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('government_levels')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching government levels:', error);
    return [];
  }

  return data || [];
}

// Get count of officials for pagination
export async function getOfficialsCount(filters?: {
  positionCode?: string;
  countyCode?: string;
  partyCode?: string;
  searchQuery?: string;
}): Promise<number> {
  const supabase = await createServerClient();
  
  let query = supabase
    .from('officials')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  if (filters?.positionCode) {
    query = query.eq('positions.code', filters.positionCode);
  }
  if (filters?.countyCode) {
    query = query.eq('counties.code', filters.countyCode);
  }
  if (filters?.partyCode) {
    query = query.eq('political_parties.code', filters.partyCode);
  }
  if (filters?.searchQuery) {
    query = query.or(
      `full_name.ilike.%${filters.searchQuery}%,first_name.ilike.%${filters.searchQuery}%,last_name.ilike.%${filters.searchQuery}%`
    );
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error counting officials:', error);
    return 0;
  }

  return count || 0;
}
