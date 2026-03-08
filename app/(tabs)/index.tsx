import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const [aiCredits, setAiCredits] = useState({ used: 0, limit: 0 });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [shouldRedirectToUpgrade, setShouldRedirectToUpgrade] = useState(false);

  useEffect(() => {
    if (enrollment && enrollment.tier !== 'lifetime') {
      setShouldRedirectToUpgrade(true);
      return;
    }
    if (user && enrollment) {
      loadAICredits();
      loadSubjects();
    }
  }, [user, enrollment, userSubjects]);

  // Redirect non-Platinum users (after all hooks are called)
  if (shouldRedirectToUpgrade) {
    return <Redirect href="/upgrade" />;
  }

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
  const creditsPercent = aiCredits.limit > 0 ? (creditsRemaining / aiCredits.limit) * 100 : 0;

  return (
    <View style={[styles(colors).container, { paddingTop: insets.top }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles(colors).scrollContent}
      >
        {/* Header with Compact Credits */}
        <View style={styles(colors).header}>
          <View style={styles(colors).headerLeft}>
            <Text style={styles(colors).greetingText}>Good day,</Text>
            <Text style={styles(colors).nameText}>{profile.full_name?.split(' ')[0] || 'Student'}</Text>
          </View>
          
          <View style={styles(colors).headerRight}>
            <View style={styles(colors).creditsCompact}>
              <MaterialIcons name="auto-awesome" size={16} color={colors.primary} />
              <View>
                <Text style={styles(colors).creditsValue}>{creditsRemaining.toLocaleString()}</Text>
                <Text style={styles(colors).creditsLabel}>AI Credits</Text>
              </View>
            </View>
            <Pressable style={styles(colors).iconButton}>
              <MaterialIcons name="notifications-none" size={24} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Enrollment Info Cards */}
        <View style={styles(colors).infoCards}>
          <View style={styles(colors).infoCard}>
            <MaterialIcons name="school" size={20} color={colors.primary} />
            <View style={styles(colors).infoCardContent}>
              <Text style={styles(colors).infoCardLabel}>Grade & Stream</Text>
              <Text style={styles(colors).infoCardValue}>
                {GRADE_LABELS[enrollment.grade as keyof typeof GRADE_LABELS]}
              </Text>
              {enrollment.stream && (
                <Text style={styles(colors).infoCardSubtext}>
                  {STREAM_LABELS[enrollment.stream as keyof typeof STREAM_LABELS]}
                </Text>
              )}
            </View>
          </View>

          <View style={styles(colors).infoCard}>
            <MaterialIcons name="language" size={20} color={colors.accent} />
            <View style={styles(colors).infoCardContent}>
              <Text style={styles(colors).infoCardLabel}>Medium</Text>
              <Text style={styles(colors).infoCardValue}>
                {MEDIUM_LABELS[enrollment.medium as keyof typeof MEDIUM_LABELS]}
              </Text>
            </View>
          </View>

          <View style={styles(colors).infoCard}>
            <MaterialIcons name="event" size={20} color={colors.success} />
            <View style={styles(colors).infoCardContent}>
              <Text style={styles(colors).infoCardLabel}>Valid Until</Text>
              <Text style={styles(colors).infoCardValue}>
                {enrollment.expires_at 
                  ? new Date(enrollment.expires_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : 'Lifetime'
                }
              </Text>
            </View>
          </View>
        </View>

        {/* AI Credits Progress Bar */}
        <View style={styles(colors).creditsSection}>
          <View style={styles(colors).creditsSectionHeader}>
            <Text style={styles(colors).creditsSectionTitle}>AI Tutor Credits</Text>
            <Text style={styles(colors).creditsSectionValue}>
              {creditsRemaining.toLocaleString()} / {aiCredits.limit.toLocaleString()}
            </Text>
          </View>
          <View style={styles(colors).progressBarContainer}>
            <View style={styles(colors).progressBarBg}>
              <View style={[styles(colors).progressBarFill, { width: `${creditsPercent}%` }]} />
            </View>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles(colors).quickActionsSection}>
          <Text style={styles(colors).sectionTitle}>Quick Actions</Text>
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
              {subjects.map((subject) => (
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
  headerLeft: {
    flex: 1,
  },
  greetingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  nameText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  creditsCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  creditsValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  creditsLabel: {
    fontSize: typography.fontSize.xs - 1,
    color: colors.textTertiary,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCards: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 4,
  },
  infoCardValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  infoCardSubtext: {
    fontSize: typography.fontSize.xs - 1,
    color: colors.textTertiary,
    marginTop: spacing.xs / 4,
  },
  creditsSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  creditsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  creditsSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  creditsSectionValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  progressBarContainer: {
    marginTop: spacing.xs,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  quickActionsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  quickActionItem: {
    width: '30%',
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
