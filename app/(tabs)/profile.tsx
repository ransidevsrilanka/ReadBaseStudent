import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { TierBadge } from '@/components/ui/TierBadge';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

export default function ProfileScreen() {
  const { profile, enrollment, signOut, loading } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleSignOut = async () => {
    showAlert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  // Show loading state
  if (loading) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </Screen>
    );
  }

  // Show minimal profile with logout if data is missing
  if (!profile || !enrollment) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <MaterialIcons name="person-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyText}>Profile data unavailable</Text>
          <Text style={styles.emptySubtext}>You can still sign out</Text>
        </View>
        <View style={styles.footer}>
          <Button title="Sign Out" onPress={handleSignOut} variant="outline" fullWidth />
        </View>
      </Screen>
    );
  }

  const expiryDate = enrollment.expires_at
    ? new Date(enrollment.expires_at).toLocaleDateString()
    : 'Lifetime';

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <MaterialIcons name="person" size={48} color={colors.textInverse} />
        </View>
        <Text style={styles.name}>{profile.full_name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Tier</Text>
            <TierBadge tier={enrollment.tier} />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Expires</Text>
            <Text style={styles.value}>{expiryDate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <Pressable style={styles.actionItem}>
          <MaterialIcons name="help-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.actionText}>Help & Support</Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
        </Pressable>
        <Pressable style={styles.actionItem}>
          <MaterialIcons name="info-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.actionText}>About</Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Button title="Sign Out" onPress={handleSignOut} variant="outline" fullWidth />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  name: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  value: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.success,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  actionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  footer: {
    marginTop: 'auto',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
