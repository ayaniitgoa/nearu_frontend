import { supabase } from '@/lib/supabase';

export const coachService = {
  // Get all approved coaches for a city (with batches)
  async getCoachesByCity(city) {
    const { data, error } = await supabase
      .from('coaches')
      .select(`
        *,
        batches (*)
      `)
      .eq('city', city)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get single coach by ID (with batches)
  async getCoachById(id) {
    const { data, error } = await supabase
      .from('coaches')
      .select(`
        *,
        batches (*)
      `)
      .eq('id', id)
      .eq('is_approved', true)
      .single();

    if (error) throw error;
    return data;
  },

  // Get single coach by ID (for admin - no approval filter)
  async getCoachByIdAdmin(id) {
    const { data, error } = await supabase
      .from('coaches')
      .select(`
        *,
        batches (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get coaches by category
  async getCoachesByCategory(city, category) {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('city', city)
      .eq('category', category)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Search coaches
  async searchCoaches(city, query) {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('city', city)
      .eq('is_approved', true)
      .ilike('name', `%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create new coach (for owners)
  async createCoach(coach) {
    const { data, error } = await supabase
      .from('coaches')
      .insert([{ ...coach, is_approved: false }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update coach (for owners)
  async updateCoach(id, updates) {
    const { data, error } = await supabase
      .from('coaches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete coach (for owners)
  async deleteCoach(id) {
    const { error } = await supabase
      .from('coaches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get coaches by owner
  async getCoachesByOwner(ownerId) {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get all coaches (for admin)
  async getAllCoaches() {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Approve/disapprove coach (for admin)
  async updateApprovalStatus(id, isApproved) {
    const { data, error } = await supabase
      .from('coaches')
      .update({ is_approved: isApproved })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

