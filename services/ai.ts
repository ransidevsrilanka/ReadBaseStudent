import { Platform } from 'react-native';

const supabaseModule = Platform.OS === 'web' 
  ? require('./supabase.web')
  : require('./supabase.native');

const { supabase } = supabaseModule;

export const aiService = {
  async getAICredits(userId: string, enrollmentId: string) {
    const monthYear = new Date().toISOString().slice(0, 7);
    
    const { data, error } = await supabase
      .from('ai_credits')
      .select('*')
      .eq('user_id', userId)
      .eq('enrollment_id', enrollmentId)
      .eq('month_year', monthYear)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async sendMessage(message: string, enrollmentId: string) {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { message, enrollmentId },
    });
    
    if (error) throw error;
    return data as {
      reply: string;
      creditsUsed: number;
      creditsRemaining: number;
    };
  },

  async getChatHistory(userId: string) {
    const { data, error } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50);
    
    if (error) throw error;
    return data || [];
  },
};
