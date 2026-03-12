export const colors = {
  // Primary Brand
  primary: '#0ea5e9', // Cyan/Sky Blue
  primaryLight: '#38bdf8',
  primaryDark: '#0284c7',
  
  // Accent
  accent: '#10B981', // Green accent
  accentLight: '#34D399',
  accentBlue: '#3B82F6',
  
  // Tier Colors
  silver: '#94A3B8',
  gold: '#F59E0B',
  platinum: '#0ea5e9', // Match primary cyan
  
  // Dark Theme Backgrounds
  background: '#020617', // Deep blue-black
  surface: '#0f172a', // Slightly lighter dark blue
  surfaceLight: '#1e293b',
  card: '#0f172a',
  cardBorder: '#1e293b',
  
  // Text (Dark Theme)
  text: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textTertiary: '#737373',
  textInverse: '#0A0A0A',
  
  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  warningLight: '#FED7AA',
  warningDark: '#C05621',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Borders & Dividers
  border: '#1e293b',
  divider: '#0f172a',
  
  // Icon backgrounds (for colored icon containers)
  iconBg1: '#0ea5e915', // Cyan with 15% opacity
  iconBg2: '#10B98115', // Green with 15% opacity
  iconBg3: '#F59E0B15', // Gold with 15% opacity
  
  // Status
  active: '#10B981',
  inactive: '#404040',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  fontFamily: {
    regular: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    semibold: 'PlusJakartaSans-SemiBold',
    bold: 'PlusJakartaSans-Bold',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 28,
    xxxl: 36,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
