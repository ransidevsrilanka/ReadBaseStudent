import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { SubjectCard } from '@/components/feature/SubjectCard';
import { TierBadge } from '@/components/ui/TierBadge';
import { useAuth } from '@/hooks/useAuth';
import { useSubjects } from '@/hooks/useSubjects';
import { colors, spacing, typography } from '@/constants/theme';
import { GRADE_LABELS, STREAM_LABELS, MEDIUM_LABELS } from '@/constants/config';

export default function DashboardScreen() {
  const { enrollment, userSubjects, profile } = useAuth();
  const router = useRouter();

  const subjectIds = userSubjects
    ? [userSubjects.subject_1, userSubjects.subject_2, userSubjects.subject_3].filter(Boolean)
    : [];

  const { subjects, loading } = useSubjects(subjectIds);

  // Debug logging
  console.log('Dashboard - userSubjects:', userSubjects);
  console.log('Dashboard - subjectIds:', subjectIds);
  console.log('Dashboard - subjects:', subjects);
  console.log('Dashboard - loading:', loading);

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
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {profile.full_name}</Text>
          <Text style={styles.subtitle}>
            {GRADE_LABELS[enrollment.grade as keyof typeof GRADE_LABELS]} • {' '}
            {STREAM_LABELS[enrollment.stream as keyof typeof STREAM_LABELS]} • {' '}
            {MEDIUM_LABELS[enrollment.medium as keyof typeof MEDIUM_LABELS]}
          </Text>
        </View>
        <TierBadge tier={enrollment.tier} size="large" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Subjects</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : subjects.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="school" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No subjects found</Text>
            <Text style={styles.emptySubtext}>
              {userSubjects 
                ? `Your subject IDs: ${subjectIds.filter(Boolean).join(', ')}\n\nPlease contact support if you believe this is an error.`
                : 'No user subjects data available. Please complete your enrollment.'}
            </Text>
          </View>
        ) : (
          <View style={styles.subjectsGrid}>
            {subjects.map((subject, index) => (
              <SubjectCard
                key={subject.id}
                name={subject.name}
                code={
                  userSubjects?.[`subject_${index + 1}_code` as 'subject_1_code' | 'subject_2_code' | 'subject_3_code'] ||
                  subject.subject_code
                }
                onPress={() => router.push(`/subject/${subject.id}`)}
              />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  subjectsGrid: {
    gap: spacing.md,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
