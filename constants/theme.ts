export const colors = {
  // Primary Brand
  primary: '#6B46C1',
  primaryLight: '#9F7AEA',
  primaryDark: '#553C9A',
  
  // Accent
  accent: '#4299E1',
  accentLight: '#63B3ED',
  
  // Tier Colors
  silver: '#94A3B8',
  gold: '#F59E0B',
  platinum: '#8B5CF6',
  
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceLight: '#FAFBFC',
  card: '#FFFFFF',
  
  // Text
  text: '#1A202C',
  textSecondary: '#718096',
  textTertiary: '#A0AEC0',
  textInverse: '#FFFFFF',
  
  // Semantic
  success: '#48BB78',
  warning: '#ED8936',
  warningLight: '#FED7AA',
  warningDark: '#C05621',
  error: '#F56565',
  info: '#4299E1',
  
  // Borders & Dividers
  border: '#E2E8F0',
  divider: '#EDF2F7',
  
  // Status
  active: '#48BB78',
  inactive: '#CBD5E0',
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
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
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
