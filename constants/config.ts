export const SUPABASE_CONFIG = {
  url: 'https://csqqorcnrwkkwpfbravh.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzcXFvcmNucndra3dwZmJyYXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMjUwODQsImV4cCI6MjA4MjkwMTA4NH0.0908kEp96dAM6trGwpmpVScJYBYdpegJ5ztLSB4Wj1E',
};

export const TIER_NAMES = {
  starter: 'Silver',
  standard: 'Gold',
  lifetime: 'Platinum',
} as const;

export const TIER_HIERARCHY = {
  starter: 1,
  standard: 2,
  lifetime: 3,
} as const;

export const GRADE_LABELS = {
  al_grade12: 'Grade 12 (A/L 1st Year)',
  al_grade13: 'Grade 13 (A/L 2nd Year)',
  ol_grade10: 'Grade 10 (O/L)',
  ol_grade11: 'Grade 11 (O/L)',
} as const;

export const STREAM_LABELS = {
  maths: 'Physical Science',
  bio: 'Biological Science',
  commerce: 'Commerce',
  arts: 'Arts',
  technology: 'Technology',
} as const;

export const MEDIUM_LABELS = {
  english: 'English',
  sinhala: 'Sinhala',
} as const;

export const AI_CREDIT_LIMITS = {
  starter: 100,
  standard: 300,
  lifetime: 500,
} as const;
