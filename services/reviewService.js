import { supabase } from '@/lib/supabase';

export const reviewService = {
  // Create review
  async createReview(review) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get reviews for a coach
  async getReviewsByCoach(coachId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get average rating for a coach
  async getAverageRating(coachId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('coach_id', coachId);

    if (error) throw error;
    if (!data || data.length === 0) return 0;

    const sum = data.reduce((acc, review) => acc + review.rating, 0);
    return sum / data.length;
  },
};

