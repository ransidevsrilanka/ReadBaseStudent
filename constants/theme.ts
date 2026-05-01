// THE VAULT — "DEEP SPACE" DESIGN SYSTEM
// Version 3.0 — Notebase LK Premium Study Companion

export const colors = {
  // ─── Deep Space Core ───
  background: '#080B14',   // Main background — deep space black
  surface: '#0D1117',      // Elevated cards and panels
  surface2: '#161B27',     // Secondary elevated elements

  // ─── Borders ───
  border: '#1F2937',        // Subtle card borders
  borderActive: '#38BDF8',  // Active/selected border (brand)
  divider: '#1F2937',

  // ─── Brand ───
  primary: '#38BDF8',       // Sky blue — primary accent
  primaryLight: '#7DD3FC',  // Lighter blue for highlights and glows
  primaryDark: '#0EA5E9',   // Darker blue for pressed states
  brandBlue: '#38BDF8',
  brandBright: '#7DD3FC',

  // ─── Premium Accent (Gold for Platinum) ───
  accent: '#F59E0B',        // Gold/amber for premium actions
  accentLight: '#FCD34D',
  accentDark: '#D97706',

  // Legacy purple (kept for backward compat)
  purple: 'hsl(262, 83%, 57%)',
  purpleLight: 'hsl(262, 83%, 70%)',
  purpleDark: 'hsl(262, 83%, 45%)',

  // ─── Tier Colors ───
  silver: '#94A3B8',
  gold: '#F59E0B',
  platinum: '#7DD3FC',      // Brand bright for Platinum

  // ─── Semantic ───
  success: '#10B981',       // Green — pass, done, active
  successLight: '#34D399',
  warning: '#F59E0B',       // Amber — pending, low credits
  warningLight: '#FCD34D',
  error: '#EF4444',         // Red — fail, expired, blocked
  errorLight: '#FCA5A5',
  info: '#38BDF8',

  // ─── Text Hierarchy ───
  text: '#E2E8F0',          // High-contrast headings/labels
  textSecondary: '#94A3B8', // Standard readable body text
  textTertiary: '#64748B',  // Muted / disabled text
  textInverse: '#080B14',   // Dark text on light backgrounds

  // ─── Glassmorphism ───
  glass: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassHover: 'rgba(255, 255, 255, 0.06)',
  cardGlass: 'rgba(13, 17, 23, 0.7)',

  // ─── Card ───
  card: '#0D1117',
  cardBorder: '#1F2937',

  // ─── Icon Backgrounds (brand-tinted glass) ───
  iconBg1: 'rgba(56, 189, 248, 0.12)',   // Brand blue tint
  iconBg2: 'rgba(16, 185, 129, 0.12)',   // Success tint
  iconBg3: 'rgba(245, 158, 11, 0.12)',   // Gold tint
  iconBg4: 'rgba(239, 68, 68, 0.12)',    // Error tint

  // ─── Glow Effects ───
  glowBlue: 'rgba(56, 189, 248, 0.24)',    // Brand blue glow (blur 40-60px)
  glowGold: 'rgba(245, 158, 11, 0.24)',
  glowSuccess: 'rgba(16, 185, 129, 0.24)',

  // ─── State Colors ───
  active: '#10B981',
  inactive: '#374151',
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
    // Headings: Space Grotesk (semibold/bold)
    heading: 'SpaceGrotesk-Bold',
    headingMedium: 'SpaceGrotesk-Medium',
    headingSemibold: 'SpaceGrotesk-SemiBold',

    // Body: Inter (regular/medium)
    body: 'Inter-Regular',
    bodyMedium: 'Inter-Medium',

    // Monospace: JetBrains Mono (AI chat, code)
    mono: 'Courier', // fallback until JetBrains Mono loaded

    // Legacy support
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,      // Caption
    sm: 14,      // Secondary / body small
    base: 16,    // Body
    lg: 20,      // Section headings / card titles
    xl: 24,      // Screen subtitles
    xxl: 28,     // Screen titles
    xxxl: 36,    // Hero / display
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,   // Headings (-0.02em approx)
    normal: 0,
    wide: 0.5,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glowBlue: {
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  glowGold: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
};

// Glassmorphism helper values
export const glassmorphism = {
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.08)',
  // Use BlurView (expo-blur) with intensity={12} tint="dark" for backdrop blur
};

// Animation durations
export const animations = {
  fast: 100,
  normal: 250,   // Entry animations
  slow: 400,
};
