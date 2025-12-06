import { supabase } from '@/lib/supabase';

export const enquiryService = {
  // Create enquiry
  async createEnquiry(enquiry) {
    const { data, error } = await supabase
      .from('enquiries')
      .insert([enquiry])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get enquiries for a coach
  async getEnquiriesByCoach(coachId) {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get enquiries by owner (all coaches owned by user)
  async getEnquiriesByOwner(ownerId) {
    // First get all coach IDs for this owner
    const { data: coaches, error: coachesError } = await supabase
      .from('coaches')
      .select('id')
      .eq('owner_id', ownerId);

    if (coachesError) throw coachesError;

    if (!coaches || coaches.length === 0) return [];

    const coachIds = coaches.map(c => c.id);

    // Then get all enquiries for these coaches
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .in('coach_id', coachIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

