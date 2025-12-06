import { supabase } from '@/lib/supabase';

export const batchService = {
  // Get batches for a coach
  async getBatchesByCoach(coachId) {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('coach_id', coachId)
      .order('cost', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get single batch by ID
  async getBatchById(id) {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create batch (for owners)
  async createBatch(batch) {
    const { data, error } = await supabase
      .from('batches')
      .insert([batch])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update batch (for owners)
  async updateBatch(id, updates) {
    const { data, error } = await supabase
      .from('batches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete batch (for owners)
  async deleteBatch(id) {
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

