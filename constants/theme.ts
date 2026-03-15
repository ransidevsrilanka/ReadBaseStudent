// THE VAULT DESIGN SYSTEM — Premium Security Aesthetic
export const colors = {
  // Vault Core (Deep Space)
  background: '#0a0a04', // Vault-Dark — Main background
  surface: '#121210', // Vault-Surface — Elevated panels
  surfaceLight: '#1a1a18', // Lighter variant for hover states
  
  // Premium Accents
  gold: 'hsl(45, 93%, 47%)', // #EAB308 — Platinum/Premium UI
  goldLight: 'hsl(45, 93%, 60%)',
  goldDark: 'hsl(45, 93%, 35%)',
  
  purple: 'hsl(262, 83%, 57%)', // #8B5CF6 — Standard branding
  purpleLight: 'hsl(262, 83%, 70%)',
  purpleDark: 'hsl(262, 83%, 45%)',
  
  // Primary & Accent (Mapped for compatibility)
  primary: 'hsl(262, 83%, 57%)', // Purple as default primary
  primaryLight: 'hsl(262, 83%, 70%)',
  primaryDark: 'hsl(262, 83%, 45%)',
  
  accent: 'hsl(45, 93%, 47%)', // Gold as accent
  accentLight: 'hsl(45, 93%, 60%)',
  
  // Tier Colors
  silver: '#94A3B8',
  platinum: 'hsl(45, 93%, 47%)', // Gold for Platinum tier
  
  // Semantic Colors
  success: 'hsl(142, 76%, 36%)', // #22C55E — Success/Glow
  successLight: 'hsl(142, 76%, 50%)',
  warning: '#F59E0B',
  warningLight: '#FED7AA',
  warningDark: '#C05621',
  error: '#EF4444',
  errorLight: '#FCA5A5',
  info: 'hsl(262, 83%, 57%)', // Purple
  
  // Text Hierarchy
  text: '#ffffff', // Primary text
  textSecondary: '#a1a1aa', // Muted text (zinc-400)
  textTertiary: '#71717a', // Subtle text (zinc-500)
  textInverse: '#0a0a04', // Dark text on light backgrounds
  
  // Glassmorphism Support
  glass: 'rgba(255, 255, 255, 0.05)', // Semi-transparent white
  glassBorder: 'rgba(255, 255, 255, 0.1)', // 1px border for glass cards
  glassHover: 'rgba(255, 255, 255, 0.08)',
  
  // Borders & Dividers
  border: 'rgba(255, 255, 255, 0.1)',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',
  divider: 'rgba(255, 255, 255, 0.08)',
  
  // Card Variants
  card: '#121210', // Same as surface
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  cardGlass: 'rgba(18, 18, 16, 0.7)', // Semi-transparent card with blur
  
  // Icon backgrounds (Glass effect)
  iconBg1: 'rgba(139, 92, 246, 0.15)', // Purple with 15% opacity
  iconBg2: 'rgba(34, 197, 94, 0.15)', // Success with 15% opacity
  iconBg3: 'rgba(234, 179, 8, 0.15)', // Gold with 15% opacity
  
  // Glow Effects (for radial gradients)
  glowPurple: 'rgba(139, 92, 246, 0.3)',
  glowGold: 'rgba(234, 179, 8, 0.3)',
  glowSuccess: 'rgba(34, 197, 94, 0.3)',
  
  // Status
  active: 'hsl(142, 76%, 36%)',
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
    // Headings: Plus Jakarta Sans (ExtraBold for premium feel)
    heading: 'PlusJakartaSans-Bold', // Use Bold as closest to ExtraBold
    headingRegular: 'PlusJakartaSans-Regular',
    headingMedium: 'PlusJakartaSans-Medium',
    headingSemibold: 'PlusJakartaSans-SemiBold',
    headingBold: 'PlusJakartaSans-Bold',
    
    // Body: Inter (fallback to system for now, will load Inter fonts later)
    body: 'System', // TODO: Load Inter font family
    
    // Math/Code: JetBrains Mono (fallback to monospace)
    mono: 'Courier', // TODO: Load JetBrains Mono
    
    // Legacy support (map to Plus Jakarta Sans)
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
    extrabold: '800' as const, // For premium headings
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.02, // -0.02em for headings (Vault aesthetic)
    normal: 0,
    wide: 0.02,
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
  glow: {
    // Glow effect for premium elements
    shadowColor: 'hsl(45, 93%, 47%)', // Gold glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  glowPurple: {
    shadowColor: 'hsl(262, 83%, 57%)', // Purple glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
};

// Glassmorphism helper
export const glassmorphism = {
  background: 'rgba(18, 18, 16, 0.7)', // Semi-transparent surface
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  // Note: backdrop-filter blur not directly supported in RN, use BlurView component
};

// Animation durations (for micro-animations)
export const animations = {
  fast: 200,
  normal: 400, // Default for scale-in, slide-up
  slow: 600,
};
