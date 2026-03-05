import { View, Text, StyleSheet, Pressable, Switch, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { TierBadge } from '@/components/ui/TierBadge';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { GRADE_LABELS, STREAM_LABELS, MEDIUM_LABELS } from '@/constants/config';

export default function ProfileScreen() {
  const { colors, mode, toggleTheme } = useTheme();
  const { enrollment, profile, forceLogout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await forceLogout();
    router.replace('/login');
  };

  const styles = createStyles(colors);

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <MaterialIcons name="person" size={40} color={colors.primary} />
              </View>
            </View>
            
            <Text style={styles.profileName}>{profile?.full_name || 'Student'}</Text>
            <Text style={styles.profileEmail}>{profile?.email}</Text>
            
            {enrollment && (
              <View style={styles.tierBadgeWrapper}>
                <TierBadge tier={enrollment.tier} size="medium" />
              </View>
            )}
          </View>

          {/* Enrollment Info */}
          {enrollment && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Enrollment Details</Text>
              
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <MaterialIcons name="school" size={20} color={colors.textSecondary} />
                  <Text style={styles.infoLabel}>Grade</Text>
                  <Text style={styles.infoValue}>
                    {GRADE_LABELS[enrollment.grade as keyof typeof GRADE_LABELS]}
                  </Text>
                </View>

                {enrollment.stream && (
                  <View style={styles.infoRow}>
                    <MaterialIcons name="category" size={20} color={colors.textSecondary} />
                    <Text style={styles.infoLabel}>Stream</Text>
                    <Text style={styles.infoValue}>
                      {STREAM_LABELS[enrollment.stream as keyof typeof STREAM_LABELS]}
                    </Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <MaterialIcons name="language" size={20} color={colors.textSecondary} />
                  <Text style={styles.infoLabel}>Medium</Text>
                  <Text style={styles.infoValue}>
                    {MEDIUM_LABELS[enrollment.medium as keyof typeof MEDIUM_LABELS]}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <MaterialIcons name="event" size={20} color={colors.textSecondary} />
                  <Text style={styles.infoLabel}>Valid Until</Text>
                  <Text style={styles.infoValue}>
                    {enrollment.expires_at 
                      ? new Date(enrollment.expires_at).toLocaleDateString()
                      : 'Lifetime'
                    }
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <MaterialIcons name="dark-mode" size={20} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                </View>
                <Switch
                  value={mode === 'dark'}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.textInverse}
                />
              </View>

              <View style={styles.divider} />

              <Pressable 
                style={({ pressed }) => [
                  styles.settingRow,
                  pressed && styles.settingPressed,
                ]}
              >
                <View style={styles.settingInfo}>
                  <MaterialIcons name="notifications" size={20} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>Notifications</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable 
                style={({ pressed }) => [
                  styles.settingRow,
                  pressed && styles.settingPressed,
                ]}
              >
                <View style={styles.settingInfo}>
                  <MaterialIcons name="security" size={20} color={colors.textSecondary} />
                  <Text style={styles.settingLabel}>Privacy & Security</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
              </Pressable>
            </View>
          </View>

          {/* Logout */}
          <View style={styles.section}>
            <Pressable
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutPressed,
              ]}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={20} color={colors.error} />
              <Text style={styles.logoutText}>Log Out</Text>
            </Pressable>
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </View>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  profileCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.iconBg1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  tierBadgeWrapper: {
    marginTop: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoLabel: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  settingsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingPressed: {
    opacity: 0.7,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error + '40',
  },
  logoutPressed: {
    opacity: 0.7,
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
});
