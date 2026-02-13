import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@/constants/config';

export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export type Database = {
  enrollments: {
    id: string;
    user_id: string;
    tier: 'starter' | 'standard' | 'lifetime';
    grade: string;
    stream: string;
    medium: string;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
  };
  profiles: {
    user_id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    created_at: string;
  };
  subjects: {
    id: string;
    name: string;
    grade: string;
    stream: string;
    streams: string[];
    medium: string;
    subject_code: string;
    is_active: boolean;
  };
  topics: {
    id: string;
    subject_id: string;
    name: string;
    sort_order: number;
    is_active: boolean;
  };
  notes: {
    id: string;
    topic_id: string;
    title: string;
    file_url: string;
    min_tier: 'starter' | 'standard' | 'lifetime';
    page_count: number;
    storage_provider: 'supabase' | 'external';
    external_file_id: string | null;
    is_active: boolean;
    created_at: string;
  };
  user_subjects: {
    id: string;
    user_id: string;
    enrollment_id: string;
    subject_1: string;
    subject_2: string;
    subject_3: string;
    subject_1_code: string;
    subject_2_code: string;
    subject_3_code: string;
    subject_1_medium: string | null;
    subject_2_medium: string | null;
    subject_3_medium: string | null;
    is_locked: boolean;
  };
  ai_credits: {
    id: string;
    user_id: string;
    enrollment_id: string;
    credits_limit: number;
    credits_used: number;
    month_year: string;
    is_suspended: boolean;
  };
  messages: {
    id: string;
    recipient_user_id: string | null;
    recipient_type: 'student' | 'creator' | 'admin' | 'broadcast';
    subject: string;
    body: string;
    is_read: boolean;
    read_at: string | null;
    notification_type: 'success' | 'warning' | 'info' | 'error';
    created_at: string;
  };
  quizzes: {
    id: string;
    topic_id: string;
    title: string;
    question_count: number;
    time_limit_minutes: number;
    pass_percentage: number;
    min_tier: 'starter' | 'standard' | 'lifetime';
    question_ids: string[];
    is_active: boolean;
  };
  flashcard_sets: {
    id: string;
    topic_id: string;
    title: string;
    card_count: number;
    is_active: boolean;
  };
};
