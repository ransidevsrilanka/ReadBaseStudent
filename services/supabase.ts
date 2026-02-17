import { Platform } from 'react-native';

// Platform-specific Supabase client
// This file provides a unified export that all other files can import from
const supabaseModule = Platform.OS === 'web' 
  ? require('./supabase.web')
  : require('./supabase.native');

export const { supabase } = supabaseModule;
export type Database = typeof supabaseModule.Database;
