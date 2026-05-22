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
  al_combo: 'All-Access (G12 + G13)',
  ol_grade10: 'Grade 10 (O/L)',
  ol_grade11: 'Grade 11 (O/L)',
} as const;

export const STREAM_LABELS = {
  maths: 'Physical Science',
  biology: 'Biological Science',
  commerce: 'Commerce',
  arts: 'Arts',
  technology: 'Technology',
} as const;

export const MEDIUM_LABELS = {
  english: 'English',
  sinhala: 'Sinhala',
} as const;

// Updated AI credit limits based on ReadBase platform spec
export const AI_CREDIT_LIMITS = {
  starter: 0,      // Silver - NO AI access
  standard: 1000,  // Gold - 1,000 credits/month
  lifetime: 10000, // Platinum - 10,000 credits/month
} as const;

// Combo users get +2,000 credits (first month only)
export const COMBO_FIRST_MONTH_BONUS = 2000;

// Session management
export const SESSION_HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes
export const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Print request settings
export const PRINT_REQUEST_PREFIX = 'PR';
