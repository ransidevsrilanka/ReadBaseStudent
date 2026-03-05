import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TierBadge } from '@/components/ui/TierBadge';
import { useAuth } from '@/hooks/useAuth';
import { contentService } from '@/services/content';
import { aiService } from '@/services/ai';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { GRADE_LABELS, STREAM_LABELS, MEDIUM_LABELS } from '@/constants/config';

interface Subject {
  id: string;
  name: string;
  subject_code: string;
  grade: string;
  medium: string;
}

const QUICK_ACTIONS = [
  { id: 'ai-chat', label: 'AI Tutor', icon: 'auto-awesome', route: '/(tabs)/ai-chat', color: '#8B5CF6' },
  { id: 'notes', label: 'My Notes', icon: 'description', route: null, color: '#3B82F6' },
  { id: 'quizzes', label: 'Quizzes', icon: 'quiz', route: null, color: '#10B981' },
  { id: 'flashcards', label: 'Flashcards', icon: 'style', route: null, color: '#F59E0B' },
  { id: 'print', label: 'Print Request', icon: 'print', route: '/print-request', color: '#EC4899' },
  { id: 'progress', label: 'Progress', icon: 'insights', route: null, color: '#6366F1' },
];

export default function DashboardScreen() {
  const { colors } = useTheme();
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
      <View style={[styles(colors).container, { paddingTop: insets.top }]}>
        <View style={styles(colors).emptyState}>
          <Text style={styles(colors).emptyText}>No active enrollment found</Text>
        </View>
      </View>
    );
  }

  const creditsRemaining = aiCredits.limit - aiCredits.used;
  const creditsPercent = (creditsRemaining / aiCredits.limit) * 100;

  return (
    <View style={[styles(colors).container, { paddingTop: insets.top }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles(colors).scrollContent}
      >
        {/* Header */}
        <View style={styles(colors).header}>
          <View>
            <Text style={styles(colors).greetingText}>Good day,</Text>
            <Text style={styles(colors).nameText}>{profile.full_name?.split(' ')[0] || 'Student'}</Text>
          </View>
          <View style={styles(colors).headerIcons}>
            <Pressable style={styles(colors).iconButton}>
              <MaterialIcons name="notifications-none" size={24} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Balance Card (Subscription Info) */}
        <LinearGradient
          colors={[colors.cardGradientStart, colors.cardGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles(colors).balanceCard}
        >
          <View style={styles(colors).balanceHeader}>
            <View style={styles(colors).tierBadgeContainer}>
              <TierBadge tier={enrollment.tier} size="small" />
              {enrollment.grade === 'al_combo' && (
                <View style={styles(colors).comboBadge}>
                  <MaterialIcons name="workspace-premium" size={12} color="#FCD34D" />
                  <Text style={styles(colors).comboText}>All-Access</Text>
                </View>
              )}
            </View>
            <Pressable style={styles(colors).visibilityButton}>
              <MaterialIcons name="visibility" size={20} color="rgba(255,255,255,0.8)" />
            </Pressable>
          </View>

          <Text style={styles(colors).balanceLabel}>Subscription Status</Text>
          <Text style={styles(colors).balanceValue}>
            {enrollment.expires_at 
              ? `Valid until ${new Date(enrollment.expires_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
              : 'Lifetime Access'
            }
          </Text>

          <View style={styles(colors).balanceActions}>
            <Pressable style={styles(colors).actionButton}>
              <MaterialIcons name="credit-card" size={18} color="rgba(255,255,255,0.9)" />
              <Text style={styles(colors).actionButtonText}>Upgrade</Text>
            </Pressable>
            <Pressable style={styles(colors).actionButton}>
              <MaterialIcons name="auto-awesome" size={18} color="rgba(255,255,255,0.9)" />
              <Text style={styles(colors).actionButtonText}>{creditsRemaining} Credits</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Info Banner */}
        <View style={styles(colors).infoBanner}>
          <View style={styles(colors).infoContent}>
            <MaterialIcons name="school" size={24} color={colors.primary} />
            <View style={styles(colors).infoText}>
              <Text style={styles(colors).infoTitle}>
                {GRADE_LABELS[enrollment.grade as keyof typeof GRADE_LABELS]}
              </Text>
              <Text style={styles(colors).infoSubtitle}>
                {STREAM_LABELS[enrollment.stream as keyof typeof STREAM_LABELS]} · {MEDIUM_LABELS[enrollment.medium as keyof typeof MEDIUM_LABELS]}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles(colors).quickActionsSection}>
          <View style={styles(colors).quickActionsGrid}>
            {QUICK_ACTIONS.map(action => (
              <Pressable
                key={action.id}
                style={({ pressed }) => [
                  styles(colors).quickActionItem,
                  pressed && styles(colors).quickActionPressed,
                ]}
                onPress={() => action.route && router.push(action.route as any)}
              >
                <View style={[styles(colors).quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <MaterialIcons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles(colors).quickActionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* My Subjects */}
        <View style={styles(colors).subjectsSection}>
          <View style={styles(colors).sectionHeader}>
            <Text style={styles(colors).sectionTitle}>My Subjects</Text>
            <Pressable>
              <Text style={styles(colors).seeAllText}>See All</Text>
            </Pressable>
          </View>

          {loadingSubjects ? (
            <View style={styles(colors).loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : subjects.length === 0 ? (
            <View style={styles(colors).emptySubjects}>
              <MaterialIcons name="school" size={32} color={colors.textTertiary} />
              <Text style={styles(colors).emptyText}>No subjects found</Text>
            </View>
          ) : (
            <View style={styles(colors).subjectsList}>
              {subjects.map((subject, index) => (
                <Pressable
                  key={subject.id}
                  style={({ pressed }) => [
                    styles(colors).subjectItem,
                    pressed && styles(colors).subjectPressed,
                  ]}
                  onPress={() => router.push(`/subject/${subject.id}`)}
                >
                  <View style={styles(colors).subjectIcon}>
                    <MaterialIcons name="menu-book" size={20} color={colors.primary} />
                  </View>
                  <View style={styles(colors).subjectInfo}>
                    <Text style={styles(colors).subjectName}>{subject.name}</Text>
                    <Text style={styles(colors).subjectMeta}>
                      {subject.subject_code} · {subject.medium}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greetingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  nameText: {
    fontSize: typography.fontSize.xl + 2,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    minHeight: 180,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  tierBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  comboBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 4,
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderRadius: borderRadius.sm,
  },
  comboText: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.semibold,
    color: '#FCD34D',
  },
  visibilityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.lg,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.full,
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  infoBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs / 4,
  },
  infoSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  quickActionsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickActionItem: {
    width: '22%',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickActionPressed: {
    opacity: 0.7,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    textAlign: 'center',
  },
  subjectsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptySubjects: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  subjectsList: {
    gap: spacing.xs,
  },
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subjectPressed: {
    opacity: 0.7,
  },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.iconBg1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs / 4,
  },
  subjectMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
