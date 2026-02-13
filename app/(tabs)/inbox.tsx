import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { colors, spacing, typography } from '@/constants/theme';

export default function InboxScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <MaterialIcons name="inbox" size={64} color={colors.primary} />
        <Text style={styles.title}>Inbox</Text>
        <Text style={styles.subtitle}>
          Messages and notifications will appear here
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
