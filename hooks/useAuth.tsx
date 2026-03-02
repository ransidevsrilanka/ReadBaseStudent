import { useState, useEffect, useRef } from 'react';
import { authService } from '@/services/auth';
import { enrollmentService } from '@/services/enrollment';
import { sessionService } from '@/services/session';
import { supabase } from '@/services/supabase';
import { SESSION_HEARTBEAT_INTERVAL } from '@/constants/config';
import { AppState } from 'react-native';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/services/supabase';

type Enrollment = Database['enrollments'];
type Profile = Database['profiles'];
type UserSubjects = Database['user_subjects'];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userSubjects, setUserSubjects] = useState<UserSubjects | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionConflict, setSessionConflict] = useState(false);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const appStateSubscription = useRef<any>(null);

  const fetchUserData = async (currentUser: User) => {
    try {
      console.log('useAuth - Fetching data for user:', currentUser.id);
      
      const [enrollmentData, profileData] = await Promise.all([
        enrollmentService.getUserEnrollment(currentUser.id),
        enrollmentService.getUserProfile(currentUser.id),
      ]);

      console.log('useAuth - Enrollment:', enrollmentData);
      console.log('useAuth - Profile:', profileData);

      setEnrollment(enrollmentData);
      setProfile(profileData);

      if (enrollmentData) {
        const subjectsData = await enrollmentService.getUserSubjects(
          currentUser.id,
          enrollmentData.id
        );
        console.log('useAuth - User subjects:', subjectsData);
        setUserSubjects(subjectsData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    }
  };

  /**
   * Start heartbeat to keep session alive
   */
  const startHeartbeat = async () => {
    // Clear any existing interval
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }

    // Send initial heartbeat
    try {
      const sessionId = await sessionService.getSessionId();
      await sessionService.updateHeartbeat(sessionId);
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }

    // Set up recurring heartbeat
    heartbeatInterval.current = setInterval(async () => {
      try {
        const sessionId = await sessionService.getSessionId();
        await sessionService.updateHeartbeat(sessionId);
      } catch (error) {
        console.error('Failed to send heartbeat:', error);
      }
    }, SESSION_HEARTBEAT_INTERVAL);
  };

  /**
   * Stop heartbeat
   */
  const stopHeartbeat = () => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  };

  /**
   * Check for session conflicts
   */
  const checkSession = async (userId: string) => {
    try {
      const isValid = await authService.checkSessionValidity(userId);
      if (!isValid) {
        console.warn('Session conflict detected - another device is active');
        setSessionConflict(true);
        stopHeartbeat();
      }
    } catch (error) {
      console.error('Failed to check session:', error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          await fetchUserData(currentUser);
          await startHeartbeat();
          await checkSession(currentUser.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          await fetchUserData(currentUser);
          await startHeartbeat();
          setSessionConflict(false);
        } else {
          setEnrollment(null);
          setProfile(null);
          setUserSubjects(null);
          stopHeartbeat();
        }
        
        setLoading(false);
      }
    );

    // Listen for app state changes (foreground/background)
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active' && user) {
        // App came to foreground - check session
        await checkSession(user.id);
      }
    };

    appStateSubscription.current = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      authListener.subscription.unsubscribe();
      stopHeartbeat();
      if (appStateSubscription.current) {
        appStateSubscription.current.remove();
      }
    };
  }, []);

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  const forceLogout = async () => {
    await authService.signOut();
  };

  return {
    user,
    enrollment,
    profile,
    userSubjects,
    loading,
    sessionConflict,
    refreshUserData,
    forceLogout,
    signIn: authService.signIn,
    signUp: authService.signUp,
    signOut: authService.signOut,
  };
}
