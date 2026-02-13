import { View, ScrollView, StyleSheet, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';
import { useState, useEffect } from 'react';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: boolean;
}

export function Screen({ children, scrollable = true, padding = true }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const updateDimensions = () => setDimensions(Dimensions.get('window'));
    updateDimensions();
    
    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription?.remove();
  }, []);

  const containerStyle = {
    paddingTop: insets.top,
    paddingBottom: Math.max(1, dimensions.height * 0.01),
    flex: 1,
  };

  if (scrollable) {
    return (
      <View style={[styles.container, containerStyle]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            padding && styles.padding,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle, padding && styles.padding]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  padding: {
    padding: spacing.md,
  },
});
