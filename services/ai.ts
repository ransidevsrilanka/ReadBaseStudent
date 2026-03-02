import { supabase } from './supabase';
import { AI_CREDIT_LIMITS, COMBO_FIRST_MONTH_BONUS } from '@/constants/config';

export const aiService = {
  /**
   * Get AI credits for current month
   * Returns credit data or null if not found (will be auto-created on first use)
   */
  async getAICredits(userId: string, enrollmentId: string) {
    const monthYear = new Date().toISOString().slice(0, 7);
    
    const { data, error } = await supabase
      .from('ai_credits')
      .select('*')
      .eq('user_id', userId)
      .eq('enrollment_id', enrollmentId)
      .eq('month_year', monthYear)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Calculate credit limit for a tier
   * Includes combo bonus if applicable
   */
  calculateCreditLimit(tier: string, isCombo: boolean, isFirstMonth: boolean = false): number {
    const baseLimit = AI_CREDIT_LIMITS[tier as keyof typeof AI_CREDIT_LIMITS] || 0;
    const comboBonus = isCombo && isFirstMonth ? COMBO_FIRST_MONTH_BONUS : 0;
    return baseLimit + comboBonus;
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
