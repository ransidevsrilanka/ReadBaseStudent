import { View, Text, StyleSheet, Pressable, ScrollView, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { TierBadge } from '@/components/ui/TierBadge';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { GRADE_LABELS, STREAM_LABELS, MEDIUM_LABELS } from '@/constants/config';
import { authService } from '@/services/auth';

export default function AccountScreen() {
  const { colors } = useTheme();
  const { enrollment, profile, userSubjects } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    try {
      await authService.signOut();
      router.replace('/login');
    } catch (e) {
      router.replace('/login');
    }
  };

  const creditsDisplay = () => {
    if (!enrollment) return null;
    const tierCredits = { starter: '0', standard: '1,000', lifetime: '10,000' };
    return tierCredits[enrollment.tier as keyof typeof tierCredits] ?? '0';
  };

  const s = createStyles(colors);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.screenTitle}>Account</Text>
        </View>

        {/* Profile Card */}
        <View style={s.profileCard}>
          <View style={s.avatarRing}>
            <View style={s.avatar}>
              <MaterialIcons name="person" size={36} color={colors.primary} />
            </View>
          </View>
          <Text style={s.profileName}>{profile?.full_name || 'Student'}</Text>
          <Text style={s.profileEmail}>{profile?.email}</Text>
          {enrollment && (
            <View style={s.tierRow}>
              <TierBadge tier={enrollment.tier} size="medium" />
            </View>
          )}
        </View>

        {/* Enrollment Stats */}
        {enrollment && (
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <MaterialIcons name="bolt" size={20} color={colors.primary} />
              <Text style={s.statValue}>{creditsDisplay()}</Text>
              <Text style={s.statLabel}>AI Credits/mo</Text>
            </View>
            <View style={s.statCard}>
              <MaterialIcons name="event" size={20} color={colors.success} />
              <Text style={s.statValue}>
                {enrollment.expires_at
                  ? new Date(enrollment.expires_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                  : '∞'}
              </Text>
              <Text style={s.statLabel}>
                {enrollment.expires_at ? 'Expires' : 'Lifetime'}
              </Text>
            </View>
            <View style={s.statCard}>
              <MaterialIcons name="school" size={20} color={colors.accent} />
              <Text style={s.statValue}>
                {enrollment.grade === 'al_combo' ? 'G12+13' : enrollment.grade.replace('al_grade', 'G').replace('ol_grade', 'G')}
              </Text>
              <Text style={s.statLabel}>Grade</Text>
            </View>
          </View>
        )}

        {/* Enrollment Details */}
        {enrollment && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Enrollment</Text>
            <View style={s.infoCard}>
              <InfoRow
                icon="school"
                label="Grade"
                value={GRADE_LABELS[enrollment.grade as keyof typeof GRADE_LABELS] ?? enrollment.grade}
                colors={colors}
              />
              {enrollment.stream && (
                <InfoRow
                  icon="category"
                  label="Stream"
                  value={STREAM_LABELS[enrollment.stream as keyof typeof STREAM_LABELS] ?? enrollment.stream}
                  colors={colors}
                />
              )}
              <InfoRow
                icon="language"
                label="Medium"
                value={MEDIUM_LABELS[enrollment.medium as keyof typeof MEDIUM_LABELS] ?? enrollment.medium}
                colors={colors}
              />
            </View>
          </View>
        )}

        {/* Quick Links */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Quick Links</Text>
          <View style={s.infoCard}>
            <ActionRow
              icon="print"
              label="Print Requests"
              onPress={() => router.push('/print-request')}
              colors={colors}
            />
            <View style={s.divider} />
            <ActionRow
              icon="open-in-browser"
              label="Upgrade Plan"
              sublabel="Opens notebase.tech"
              onPress={() => {}}
              colors={colors}
            />
          </View>
        </View>

        {/* Sign Out */}
        <View style={s.section}>
          <Pressable
            style={({ pressed }) => [s.logoutButton, pressed && s.logoutPressed]}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={20} color={colors.error} />
            <Text style={s.logoutText}>Sign Out</Text>
          </Pressable>
          <Text style={s.logoutNote}>
            Signing out will clear your local vault cache.
          </Text>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, colors }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm }}>
      <MaterialIcons name={icon} size={18} color={colors.textTertiary} />
      <Text style={{ flex: 1, fontSize: typography.fontSize.sm, color: colors.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: typography.fontSize.sm, fontWeight: '600', color: colors.text }}>{value}</Text>
    </View>
  );
}

function ActionRow({ icon, label, sublabel, onPress, colors }: any) {
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        opacity: pressed ? 0.7 : 1,
      })}
      onPress={onPress}
    >
      <MaterialIcons name={icon} size={18} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: typography.fontSize.sm, color: colors.text }}>{label}</Text>
        {sublabel && (
          <Text style={{ fontSize: typography.fontSize.xs, color: colors.textTertiary }}>{sublabel}</Text>
        )}
      </View>
      <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
    </Pressable>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  screenTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  profileCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primary + '50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.iconBg1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  tierRow: { marginTop: spacing.sm },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.error + '12',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  logoutPressed: { opacity: 0.7 },
  logoutText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
  logoutNote: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
