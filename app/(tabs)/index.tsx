import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { TierBadge } from '@/components/ui/TierBadge';
import { useAuth } from '@/hooks/useAuth';
import { useSubjects } from '@/hooks/useSubjects';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { GRADE_LABELS, STREAM_LABELS, MEDIUM_LABELS, TIER_DISPLAY_NAMES, AI_CREDIT_LIMITS } from '@/constants/config';
import { aiService } from '@/services/ai';

export default function DashboardScreen() {
  const { enrollment, userSubjects, profile, user } = useAuth();
  const router = useRouter();
  const [aiCredits, setAiCredits] = useState({ used: 0, limit: 100 });

  // Debug user subjects data
  console.log('Dashboard - userSubjects:', userSubjects);
  
  const subjectIds = userSubjects
    ? [userSubjects.subject_1, userSubjects.subject_2, userSubjects.subject_3].filter(Boolean)
    : [];

  console.log('Dashboard - Extracted subject IDs:', subjectIds);
  console.log('Dashboard - Subject IDs details:', {
    subject_1: userSubjects?.subject_1,
    subject_2: userSubjects?.subject_2,
    subject_3: userSubjects?.subject_3,
  });

  const { subjects, loading, error } = useSubjects(subjectIds);
  
  console.log('Dashboard - Subjects loaded:', subjects);
  console.log('Dashboard - Loading state:', loading);
  console.log('Dashboard - Error state:', error);

  useEffect(() => {
    if (user && enrollment) {
      loadAICredits();
    }
  }, [user, enrollment]);

  const loadAICredits = async () => {
    if (!user || !enrollment) return;
    try {
      const creditsData = await aiService.getAICredits(user.id, enrollment.id);
      if (creditsData) {
        setAiCredits({ used: creditsData.credits_used, limit: creditsData.credits_limit });
      } else {
        setAiCredits({ used: 0, limit: AI_CREDIT_LIMITS[enrollment.tier as keyof typeof AI_CREDIT_LIMITS] });
      }
    } catch (error) {
      console.error('Error loading AI credits:', error);
    }
  };

  if (!enrollment || !profile) {
    return (
      <Screen>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No active enrollment found</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.label}>DASHBOARD</Text>
            <Text style={styles.greeting}>Welcome back, {profile.full_name}</Text>
          </View>
        </View>

        {/* Info Cards Grid */}
        <View style={styles.infoGrid}>
          {/* Subjects Count */}
          <View style={styles.infoCard}>
            <MaterialIcons name="school" size={24} color={colors.primary} />
            <Text style={styles.infoValue}>{subjects.length}</Text>
            <Text style={styles.infoLabel}>SUBJECTS</Text>
          </View>

          {/* Stream */}
          <View style={styles.infoCard}>
            <MaterialIcons name="category" size={24} color={colors.primary} />
            <Text style={styles.infoValue}>{STREAM_LABELS[enrollment.stream as keyof typeof STREAM_LABELS]?.split(' ')[0] || enrollment.stream}</Text>
            <Text style={styles.infoLabel}>STREAM</Text>
          </View>

          {/* Medium */}
          <View style={styles.infoCard}>
            <MaterialIcons name="language" size={24} color={colors.primary} />
            <Text style={styles.infoValue}>{MEDIUM_LABELS[enrollment.medium as keyof typeof MEDIUM_LABELS]}</Text>
            <Text style={styles.infoLabel}>MEDIUM</Text>
          </View>

          {/* AI Credits */}
          <View style={[styles.infoCard, styles.aiCreditsCard]}>
            <MaterialIcons name="auto-awesome" size={24} color={colors.accent} />
            <Text style={[styles.infoValue, { color: colors.accent }]}>{aiCredits.limit - aiCredits.used}</Text>
            <Text style={styles.infoLabel}>AI CREDITS</Text>
          </View>
        </View>

        {/* Subscription Card */}
        <Pressable style={styles.subscriptionCard}>
          <View style={styles.subscriptionIcon}>
            <MaterialIcons name="card-membership" size={24} color={colors.info} />
          </View>
          <View style={styles.subscriptionContent}>
            <Text style={styles.subscriptionTitle}>Subscription Active</Text>
            <Text style={styles.subscriptionSubtitle}>
              {enrollment.expires_at 
                ? `Expires ${new Date(enrollment.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                : 'Lifetime Access'
              }
            </Text>
          </View>
          <TierBadge tier={enrollment.tier} size="small" />
        </Pressable>

        {/* Your Subjects Section */}
        <View style={styles.subjectsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Subjects</Text>
            <Text style={styles.sectionSubtitle}>{GRADE_LABELS[enrollment.grade as keyof typeof GRADE_LABELS]} • {STREAM_LABELS[enrollment.stream as keyof typeof STREAM_LABELS]}</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : subjects.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="school" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No subjects found</Text>
              <Text style={styles.emptySubtext}>
                {error || 'Please contact support if you believe this is an error.'}
              </Text>
              {userSubjects && (
                <View style={styles.debugInfo}>
                  <Text style={styles.debugText}>Debug Info:</Text>
                  <Text style={styles.debugText}>Subject IDs: {JSON.stringify(subjectIds)}</Text>
                  <Text style={styles.debugText}>Subject Names: {userSubjects.subject_1_name}, {userSubjects.subject_2_name}, {userSubjects.subject_3_name}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.subjectsList}>
              {subjects.map((subject, index) => (
                <Pressable
                  key={subject.id}
                  style={({ pressed }) => [
                    styles.subjectItem,
                    pressed && styles.subjectItemPressed,
                  ]}
                  onPress={() => router.push(`/subject/${subject.id}`)}
                >
                  <View style={styles.subjectIcon}>
                    <MaterialIcons name="menu-book" size={24} color={colors.textSecondary} />
                  </View>
                  <View style={styles.subjectContent}>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                    <Text style={styles.subjectSubtitle}>View topics and notes</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  greeting: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    lineHeight: typography.fontSize.xxl * 1.3,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  aiCreditsCard: {
    borderColor: colors.accent + '40',
    backgroundColor: colors.accent + '08',
  },
  infoValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.info + '40',
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  subscriptionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.info + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionContent: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  subscriptionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  subscriptionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  subjectsSection: {
    marginTop: spacing.md,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  subjectsList: {
    gap: spacing.xs,
  },
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    gap: spacing.md,
  },
  subjectItemPressed: {
    opacity: 0.7,
    backgroundColor: colors.surfaceLight,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectContent: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  subjectName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  subjectSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  debugInfo: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
  },
  debugText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: spacing.xs,
  },
});
