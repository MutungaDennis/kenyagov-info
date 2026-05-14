import { createClient } from './server';

export interface Leader {
  id: string;
  name: string;
  title: string;
  category: string;
  sub_category: string | null;
  county: string | null;
  constituency: string | null;
  organization: string | null;
  description: string;
  image: string | null;
  link: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaderCategory {
  id: number;
  name: string;
  value: string;
  created_at: string;
}

export async function getAllLeaders(): Promise<Leader[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('leaders')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching leaders:', error);
    return [];
  }

  return data || [];
}

export async function getLeaderById(id: string): Promise<Leader | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('leaders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching leader:', error);
    return null;
  }

  return data;
}

export async function getLeadersByCategory(category: string): Promise<Leader[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('leaders')
    .select('*')
    .eq('category', category)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching leaders by category:', error);
    return [];
  }

  return data || [];
}

export async function getLeaderCategories(): Promise<LeaderCategory[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('leader_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export async function searchLeaders(query: string): Promise<Leader[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('leaders')
    .select('*')
    .or(`name.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%,organization.ilike.%${query}%`)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error searching leaders:', error);
    return [];
  }

  return data || [];
}
