import { createClient } from './server';

export interface Entity {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  county: string | null;
  region: string | null;
  image_url: string | null;
  website_url: string | null;
  headquarters: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

export async function getEntitiesByCategory(category: string): Promise<Entity[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching entities by category:', error);
    return [];
  }

  return data || [];
}

export async function getEntityBySlug(slug: string): Promise<Entity | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching entity:', error);
    return null;
  }

  return data;
}

export async function getEntitiesByCounty(county: string): Promise<Entity[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('county', county)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching entities by county:', error);
    return [];
  }

  return data || [];
}

export async function searchEntities(query: string): Promise<Entity[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error searching entities:', error);
    return [];
  }

  return data || [];
}

export async function createEntity(entity: Omit<Entity, 'id' | 'created_at' | 'updated_at'>): Promise<Entity | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('entities')
    .insert([entity])
    .select()
    .single();

  if (error) {
    console.error('Error creating entity:', error);
    return null;
  }

  return data;
}

export async function updateEntity(id: string, updates: Partial<Entity>): Promise<Entity | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('entities')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating entity:', error);
    return null;
  }

  return data;
}

export async function deleteEntity(id: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('entities')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting entity:', error);
    return false;
  }

  return true;
}
