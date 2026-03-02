import { supabase } from './supabase';
import { sessionService } from './session';

export const authService = {
  /**
   * Sign in with email and password
   * Automatically registers device session
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Register device session
    if (data.user) {
      try {
        await sessionService.registerSession(data.user.id);
      } catch (sessionError) {
        console.error('Failed to register session:', sessionError);
        // Don't block login if session registration fails
      }
    }
    
    return data;
  },

  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Sign out and clean up session
   */
  async signOut() {
    // Get session ID before logging out
    try {
      const sessionId = await sessionService.getSessionId();
      await sessionService.deleteSession(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
      // Continue with sign out even if session cleanup fails
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  /**
   * Check if current session is still valid (no conflicts with other devices)
   */
  async checkSessionValidity(userId: string): Promise<boolean> {
    try {
      const sessionId = await sessionService.getSessionId();
      return !(await sessionService.checkSessionConflict(userId, sessionId));
    } catch (error) {
      console.error('Failed to check session validity:', error);
      return true; // Assume valid if check fails
    }
  },
};
