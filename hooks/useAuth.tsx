import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { authService } from '@/services/auth';
import { enrollmentService } from '@/services/enrollment';
import type { User } from '@supabase/supabase-js';

const supabaseModule = Platform.OS === 'web' 
  ? require('@/services/supabase.web')
  : require('@/services/supabase.native');

const { supabase } = supabaseModule;

type Database = typeof supabaseModule.Database;
type Enrollment = Database['enrollments'];
type Profile = Database['profiles'];
type UserSubjects = Database['user_subjects'];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userSubjects, setUserSubjects] = useState<UserSubjects | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          await fetchUserData(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          await fetchUserData(currentUser);
        } else {
          setEnrollment(null);
          setProfile(null);
          setUserSubjects(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  return {
    user,
    enrollment,
    profile,
    userSubjects,
    loading,
    refreshUserData,
    signIn: authService.signIn,
    signUp: authService.signUp,
    signOut: authService.signOut,
  };
}
