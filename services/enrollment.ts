import { supabase } from './supabase';

export const enrollmentService = {
  async getActiveEnrollment(userId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getUserEnrollment(userId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getUserProfile(userId: string) {
    // Try 'user_id' first, fall back to 'id' (matches auth.users.id)
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if ((error || !data)) {
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      data = result.data;
      error = result.error;
    }
    
    if (error) throw error;
    return data;
  },

  async getUserSubjects(userId: string, enrollmentId: string) {
    const { data, error } = await supabase
      .from('user_subjects')
      .select('*')
      .eq('user_id', userId)
      .eq('enrollment_id', enrollmentId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },
};
