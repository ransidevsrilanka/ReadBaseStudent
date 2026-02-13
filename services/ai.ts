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
    console.log('aiService - Sending message:', { message, enrollmentId });
    
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { message, enrollmentId },
    });
    
    console.log('aiService - Response data:', data);
    console.log('aiService - Response error:', error);
    
    if (error) {
      console.error('aiService - Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    // Handle different response formats
    if (data && typeof data === 'object') {
      // If the response is wrapped in a data property
      const responseData = data.data || data;
      
      return {
        reply: responseData.reply || responseData.message || 'No response from AI',
        creditsUsed: responseData.creditsUsed || 0,
        creditsRemaining: responseData.creditsRemaining || 0,
      };
    }
    
    throw new Error('Invalid response format from AI service');
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
