import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TierBadge } from '@/components/ui/TierBadge';
import { useAuth } from '@/hooks/useAuth';
import { contentService } from '@/services/content';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { GRADE_LABELS, STREAM_LABELS, MEDIUM_LABELS } from '@/constants/config';
import { aiService } from '@/services/ai';

interface Subject {
  id: string;
  name: string;
  subject_code: string;
  grade: string;
  medium: string;
}

export default function DashboardScreen() {
  const { enrollment, userSubjects, profile, user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [aiCredits, setAiCredits] = useState({ used: 0, limit: 100 });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    if (user && enrollment) {
      loadAICredits();
      loadSubjects();
    }
  }, [user, enrollment, userSubjects]);

  const loadSubjects = async () => {
    if (!enrollment || !userSubjects) {
      setSubjects([]);
      setLoadingSubjects(false);
      return;
    }

    try {
      setLoadingSubjects(true);
      
      const subjectCodes = [
        { code: userSubjects.subject_1_code, medium: userSubjects.subject_1_medium },
        { code: userSubjects.subject_2_code, medium: userSubjects.subject_2_medium },
        { code: userSubjects.subject_3_code, medium: userSubjects.subject_3_medium },
      ].filter(s => s.code);

      const fetchedSubjects = await contentService.getEnrolledSubjects(
        enrollment.grade,
        enrollment.medium,
        subjectCodes
      );

      setSubjects(fetchedSubjects);
    } catch (error) {
      console.error('Dashboard - Error loading subjects:', error);
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const loadAICredits = async () => {
    if (!user || !enrollment) return;
    try {
      const creditsData = await aiService.getAICredits(user.id, enrollment.id);
      if (creditsData) {
        setAiCredits({ used: creditsData.credits_used, limit: creditsData.credits_limit });
      } else {
        const isCombo = enrollment.grade === 'al_combo';
        const limit = aiService.calculateCreditLimit(enrollment.tier, isCombo, true);
        setAiCredits({ used: 0, limit });
      }
    } catch (error) {
      console.error('Error loading AI credits:', error);
    }
  };

  if (!enrollment || !profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No active enrollment found</Text>
        </View>
      </View>
    );
  }

  const creditsRemaining = aiCredits.limit - aiCredits.used;
  const creditsPercent = (creditsRemaining / aiCredits.limit) * 100;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Header with Gradient */}
        <LinearGradient
          colors={['#7C3AED', '#5B21B6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroTop}>
              <View style={styles.heroText}>
                <Text style={styles.heroGreeting}>Welcome back,</Text>
                <Text style={styles.heroName}>{profile.full_name}</Text>
                {enrollment.grade === 'al_combo' && (
                  <View style={styles.comboBadge}>
                    <MaterialIcons name="workspace-premium" size={14} color="#FCD34D" />
                    <Text style={styles.comboText}>All-Access Pass</Text>
                  </View>
                )}
              </View>
              <View style={styles.tierBadgeContainer}>
                <TierBadge tier={enrollment.tier} size="small" />
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <MaterialIcons name="school" size={20} color="rgba(255,255,255,0.9)" />
                <Text style={styles.statValue}>{subjects.length}</Text>
                <Text style={styles.statLabel}>Subjects</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialIcons name="auto-awesome" size={20} color="#FCD34D" />
                <Text style={styles.statValue}>{creditsRemaining}</Text>
                <Text style={styles.statLabel}>AI Credits</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Info Cards */}
        <View style={styles.quickInfoSection}>
          <View style={styles.quickInfoCard}>
            <View style={styles.quickInfoIcon}>
              <MaterialIcons name="category" size={20} color={colors.primary} />
            </View>
            <View style={styles.quickInfoText}>
              <Text style={styles.quickInfoLabel}>Stream</Text>
              <Text style={styles.quickInfoValue}>
                {STREAM_LABELS[enrollment.stream as keyof typeof STREAM_LABELS] || enrollment.stream}
              </Text>
            </View>
          </View>

          <View style={styles.quickInfoCard}>
            <View style={styles.quickInfoIcon}>
              <MaterialIcons name="language" size={20} color={colors.primary} />
            </View>
            <View style={styles.quickInfoText}>
              <Text style={styles.quickInfoLabel}>Medium</Text>
              <Text style={styles.quickInfoValue}>
                {MEDIUM_LABELS[enrollment.medium as keyof typeof MEDIUM_LABELS]}
              </Text>
            </View>
          </View>
        </View>

        {/* Subscription Status */}
        <View style={styles.subscriptionCard}>
          <LinearGradient
            colors={['rgba(124, 58, 237, 0.1)', 'rgba(91, 33, 182, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.subscriptionGradient}
          >
            <View style={styles.subscriptionContent}>
              <View style={styles.subscriptionLeft}>
                <View style={styles.subscriptionIconWrapper}>
                  <MaterialIcons name="verified-user" size={24} color={colors.success} />
                </View>
                <View>
                  <Text style={styles.subscriptionTitle}>Active Subscription</Text>
                  <Text style={styles.subscriptionExpiry}>
                    {enrollment.expires_at 
                      ? `Valid until ${new Date(enrollment.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : 'Lifetime Access'
                    }
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
            </View>
          </LinearGradient>
        </View>

        {/* Your Subjects */}
        <View style={styles.subjectsSection}>
          <Text style={styles.sectionTitle}>Your Subjects</Text>
          <Text style={styles.sectionSubtitle}>
            {GRADE_LABELS[enrollment.grade as keyof typeof GRADE_LABELS]}
          </Text>

          {loadingSubjects ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : subjects.length === 0 ? (
            <View style={styles.emptySubjects}>
              <MaterialIcons name="school" size={64} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No subjects found</Text>
              <Text style={styles.emptySubtext}>Please contact support if this is an error.</Text>
            </View>
          ) : (
            <View style={styles.subjectCards}>
              {subjects.map((subject, index) => (
                <Pressable
                  key={subject.id}
                  style={({ pressed }) => [
                    styles.subjectCard,
                    pressed && styles.subjectCardPressed,
                  ]}
                  onPress={() => router.push(`/subject/${subject.id}`)}
                >
                  <LinearGradient
                    colors={
                      index % 3 === 0
                        ? ['rgba(124, 58, 237, 0.15)', 'rgba(124, 58, 237, 0.05)']
                        : index % 3 === 1
                        ? ['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.05)']
                        : ['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.subjectGradient}
                  >
                    <View style={styles.subjectCardHeader}>
                      <View style={[
                        styles.subjectIconWrapper,
                        { backgroundColor: 
                          index % 3 === 0 
                            ? 'rgba(124, 58, 237, 0.2)' 
                            : index % 3 === 1 
                            ? 'rgba(59, 130, 246, 0.2)' 
                            : 'rgba(16, 185, 129, 0.2)'
                        }
                      ]}>
                        <MaterialIcons 
                          name="menu-book" 
                          size={28} 
                          color={
                            index % 3 === 0 
                              ? '#7C3AED' 
                              : index % 3 === 1 
                              ? '#3B82F6' 
                              : '#10B981'
                          } 
                        />
                      </View>
                      <MaterialIcons name="arrow-forward" size={20} color={colors.textSecondary} />
                    </View>
                    
                    <Text style={styles.subjectName}>{subject.name}</Text>
                    
                    <View style={styles.subjectMeta}>
                      <View style={styles.metaItem}>
                        <MaterialIcons name="bookmark" size={14} color={colors.textTertiary} />
                        <Text style={styles.metaText}>{subject.subject_code}</Text>
                      </View>
                      <View style={styles.metaDivider} />
                      <View style={styles.metaItem}>
                        <MaterialIcons name="language" size={14} color={colors.textTertiary} />
                        <Text style={styles.metaText}>{subject.medium}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  heroGradient: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  heroContent: {
    padding: spacing.xl,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  heroText: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xs / 2,
  },
  heroName: {
    fontSize: typography.fontSize.xxl + 2,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  comboBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  comboText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: '#FCD34D',
    letterSpacing: 0.5,
  },
  tierBadgeContainer: {
    marginLeft: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
  },
  quickInfoSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  quickInfoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    gap: spacing.sm,
  },
  quickInfoIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickInfoText: {
    flex: 1,
  },
  quickInfoLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginBottom: spacing.xs / 4,
  },
  quickInfoValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  subscriptionCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  subscriptionGradient: {
    padding: spacing.lg,
  },
  subscriptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscriptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  subscriptionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  subscriptionExpiry: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  subjectsSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
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
    marginBottom: spacing.lg,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptySubjects: {
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
  subjectCards: {
    gap: spacing.md,
  },
  subjectCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  subjectCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  subjectGradient: {
    padding: spacing.lg,
  },
  subjectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  subjectIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: typography.fontSize.lg * 1.4,
  },
  subjectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.divider,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
