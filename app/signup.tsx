import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing, typography } from '@/constants/theme';

export default function SignupScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <MaterialIcons name="person-add" size={64} color={colors.primary} />
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>
          Account registration will be available soon
        </Text>
        <Text style={styles.comingSoon}>Coming Soon</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  comingSoon: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.lg,
  },
});
