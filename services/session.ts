import { supabase } from './supabase';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_ID_KEY = 'readbase_session_id';

/**
 * Generate a unique session ID for this device
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Get device information
 */
function getDeviceInfo() {
  return {
    platform: Platform.OS,
    model: Device.modelName || 'Unknown',
    os: Platform.Version?.toString() || 'Unknown',
    brand: Device.brand || 'Unknown',
  };
}

export const sessionService = {
  /**
   * Get or create a session ID for this device
   */
  async getSessionId(): Promise<string> {
    let sessionId = await AsyncStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = generateSessionId();
      await AsyncStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  },

  /**
   * Register a new device session on login
   */
  async registerSession(userId: string): Promise<string> {
    const sessionId = await this.getSessionId();
    const deviceInfo = getDeviceInfo();

    console.log('sessionService - Registering session:', { userId, sessionId, deviceInfo });

    const { error } = await supabase.from('device_sessions').insert({
      user_id: userId,
      session_id: sessionId,
      device_info: JSON.stringify(deviceInfo),
      last_active_at: new Date().toISOString(),
    });

    if (error) {
      console.error('sessionService - Error registering session:', error);
      throw error;
    }

    return sessionId;
  },

  /**
   * Send heartbeat to keep session alive
   */
  async updateHeartbeat(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('device_sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('session_id', sessionId);

    if (error) {
      console.error('sessionService - Error updating heartbeat:', error);
    }
  },

  /**
   * Check if there are conflicting active sessions
   * Returns true if another device has logged in recently
   */
  async checkSessionConflict(userId: string, mySessionId: string): Promise<boolean> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('device_sessions')
      .select('session_id, last_active_at')
      .eq('user_id', userId)
      .gte('last_active_at', fiveMinutesAgo)
      .neq('session_id', mySessionId);

    if (error) {
      console.error('sessionService - Error checking session conflict:', error);
      return false;
    }

    // If there's any other active session, we have a conflict
    return data && data.length > 0;
  },

  /**
   * Delete session on logout
   */
  async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('device_sessions')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      console.error('sessionService - Error deleting session:', error);
    }

    // Clear local session ID
    await AsyncStorage.removeItem(SESSION_ID_KEY);
  },

  /**
   * Clear all sessions for a user (force logout everywhere)
   */
  async clearAllSessions(userId: string): Promise<void> {
    const { error } = await supabase
      .from('device_sessions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('sessionService - Error clearing all sessions:', error);
      throw error;
    }
  },
};
