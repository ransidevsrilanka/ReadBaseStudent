import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { contentService } from '@/services/content';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { GRADE_LABELS, STREAM_LABELS } from '@/constants/config';

interface Subject {
  id: string;
  name: string;
  subject_code: string;
  grade: string;
  medium: string;
}

// Distinct colors per subject slot (cycles if needed)
const SUBJECT_ACCENTS = ['#38BDF8', '#10B981', '#F59E0B'];

export default function SubjectsScreen() {
  const { colors } = useTheme();
  const { enrollment, userSubjects, user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && enrollment && userSubjects) {
      loadSubjects();
    } else if (user && enrollment && !userSubjects) {
      setLoading(false);
    }
  }, [user, enrollment, userSubjects]);

  const loadSubjects = async () => {
    if (!enrollment || !userSubjects) return;
    try {
      setLoading(true);
      const subjectCodes = [
        { code: userSubjects.subject_1_code, medium: userSubjects.subject_1_medium },
        { code: userSubjects.subject_2_code, medium: userSubjects.subject_2_medium },
        { code: userSubjects.subject_3_code, medium: userSubjects.subject_3_medium },
      ].filter(s => s.code);

      const fetched = await contentService.getEnrolledSubjects(
        enrollment.grade,
        enrollment.medium,
        subjectCodes
      );
      setSubjects(fetched);
    } catch (e) {
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const s = createStyles(colors);

  const gradeLabel = enrollment
    ? GRADE_LABELS[enrollment.grade as keyof typeof GRADE_LABELS] ?? enrollment.grade
    : '';
  const streamLabel = enrollment?.stream
    ? STREAM_LABELS[enrollment.stream as keyof typeof STREAM_LABELS] ?? enrollment.stream
    : '';

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.screenTitle}>My Subjects</Text>
          {enrollment && (
            <Text style={s.screenSubtitle}>
              {gradeLabel}{streamLabel ? ` · ${streamLabel}` : ''}
            </Text>
          )}
        </View>
        <Pressable
          style={s.printBtn}
          onPress={() => router.push('/print-request')}
        >
          <MaterialIcons name="print" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* Subject Cards — 3 cards, no vertical scroll */}
      <View style={s.cardsArea}>
        {loading ? (
          <View style={s.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : subjects.length === 0 ? (
          <View style={s.centered}>
            <MaterialIcons name="school" size={48} color={colors.textTertiary} />
            <Text style={s.emptyTitle}>No subjects found</Text>
            <Text style={s.emptySubtitle}>
              Subject selection may not be confirmed yet.
            </Text>
          </View>
        ) : (
          subjects.map((subject, idx) => {
            const accent = SUBJECT_ACCENTS[idx % SUBJECT_ACCENTS.length];
            return (
              <Pressable
                key={subject.id}
                style={({ pressed }) => [
                  s.subjectCard,
                  { borderLeftColor: accent, borderLeftWidth: 3 },
                  pressed && s.cardPressed,
                ]}
                onPress={() => router.push(`/subject/${subject.id}`)}
              >
                {/* Icon */}
                <View style={[s.cardIcon, { backgroundColor: accent + '18' }]}>
                  <MaterialIcons name="menu-book" size={28} color={accent} />
                </View>

                {/* Info */}
                <View style={s.cardInfo}>
                  <Text style={s.cardTitle}>{subject.name}</Text>
                  <Text style={s.cardMeta}>
                    {subject.subject_code} · {subject.medium === 'english' ? 'English' : 'Sinhala'}
                  </Text>
                </View>

                {/* Arrow */}
                <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
              </Pressable>
            );
          })
        )}
      </View>

      {/* Bottom info strip */}
      {enrollment && !loading && (
        <View style={s.bottomStrip}>
          <View style={s.stripItem}>
            <MaterialIcons name="verified" size={16} color={colors.primary} />
            <Text style={s.stripText}>
              {enrollment.tier === 'lifetime'
                ? 'Platinum'
                : enrollment.tier === 'standard'
                ? 'Gold'
                : 'Silver'}{' '}
              Plan
            </Text>
          </View>
          <View style={s.stripDot} />
          <View style={s.stripItem}>
            <MaterialIcons name="event-available" size={16} color={colors.success} />
            <Text style={s.stripText}>
              {enrollment.expires_at
                ? `Expires ${new Date(enrollment.expires_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                : 'Lifetime Access'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  screenSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs / 2,
  },
  printBtn: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.md,
  },
  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  cardMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  bottomStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  stripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stripText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  stripDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
});
