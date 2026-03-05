import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  colors: typeof lightColors;
}

const lightColors = {
  // Backgrounds
  background: '#F5F5F7',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Primary brand
  primary: '#7C3AED',
  primaryLight: '#9F7AEA',
  primaryDark: '#5B21B6',
  
  // Accent
  accent: '#EC4899',
  accentLight: '#F472B6',
  
  // Text
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // UI Elements
  border: '#E5E7EB',
  divider: '#F3F4F6',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Card backgrounds
  cardGradientStart: '#7C3AED',
  cardGradientEnd: '#5B21B6',
  
  // Icon backgrounds
  iconBg1: '#F3E8FF',
  iconBg2: '#E0E7FF',
  iconBg3: '#DBEAFE',
  iconBg4: '#D1FAE5',
};

const darkColors = {
  // Backgrounds
  background: '#0A0A0F',
  surface: '#12121A',
  card: '#1A1A24',
  
  // Primary brand
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#6D28D9',
  
  // Accent
  accent: '#F472B6',
  accentLight: '#F9A8D4',
  
  // Text
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  textInverse: '#1F2937',
  
  // Status
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  // UI Elements
  border: '#2D2D3D',
  divider: '#1F1F2E',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Card backgrounds
  cardGradientStart: '#7C3AED',
  cardGradientEnd: '#5B21B6',
  
  // Icon backgrounds
  iconBg1: 'rgba(124, 58, 237, 0.2)',
  iconBg2: 'rgba(99, 102, 241, 0.2)',
  iconBg3: 'rgba(59, 130, 246, 0.2)',
  iconBg4: 'rgba(16, 185, 129, 0.2)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setMode(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    try {
      await AsyncStorage.setItem('theme', newMode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = mode === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
