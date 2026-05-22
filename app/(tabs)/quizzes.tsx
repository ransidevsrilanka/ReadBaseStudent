import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/services/supabase';
import { spacing, typography, borderRadius } from '@/constants/theme';

interface Quiz {
  id: string;
  name: string;
  question_count: number;
  time_limit: number;
  pass_percentage: number;
  topic_name: string;
  subject_name: string;
  min_tier: string;
}

export default function QuizzesTab() {
  const { colors } = useTheme();
  const { enrollment, userSubjects } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (enrollment) loadQuizzes();
  }, [enrollment]);

  const loadQuizzes = async () => {
    if (!enrollment || !userSubjects) { setLoading(false); return; }
    try {
      setLoading(true);
      const subjectCodes = [
        userSubjects.subject_1_code,
        userSubjects.subject_2_code,
        userSubjects.subject_3_code,
      ].filter(Boolean);

      const gradesToFetch = enrollment.grade === 'al_combo'
        ? ['al_grade12', 'al_grade13']
        : [enrollment.grade];

      const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name')
        .in('grade', gradesToFetch)
        .in('subject_code', subjectCodes)
        .eq('is_active', true);

      if (!subjects?.length) { setQuizzes([]); setLoading(false); return; }

      const subjectIds = subjects.map(s => s.id);
      const { data: topics } = await supabase
        .from('topics')
        .select('id, name, subject_id')
        .in('subject_id', subjectIds)
        .eq('is_active', true);

      if (!topics?.length) { setQuizzes([]); setLoading(false); return; }

      const topicIds = topics.map(t => t.id);
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('id, name, question_count, time_limit, pass_percentage, topic_id, min_tier')
        .in('topic_id', topicIds)
        .eq('is_active', true);

      if (!quizData?.length) { setQuizzes([]); setLoading(false); return; }

      const mapped = quizData.map(q => {
        const topic = topics.find(t => t.id === q.topic_id);
        const subject = subjects.find(s => s.id === topic?.subject_id);
        return {
          id: q.id,
          name: q.name,
          question_count: q.question_count,
          time_limit: q.time_limit,
          pass_percentage: q.pass_percentage,
          topic_name: topic?.name ?? '',
          subject_name: subject?.name ?? '',
          min_tier: q.min_tier,
        };
      });

      setQuizzes(mapped);
    } catch (e) {
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const isTierLocked = (minTier: string) => {
    const hierarchy: Record<string, number> = { starter: 1, standard: 2, lifetime: 3 };
    const userLevel = hierarchy[enrollment?.tier ?? 'starter'] ?? 1;
    const required = hierarchy[minTier] ?? 1;
    return userLevel < required;
  };

  const s = createStyles(colors);

  const renderQuiz = ({ item }: { item: Quiz }) => {
    const locked = isTierLocked(item.min_tier);
    return (
      <Pressable
        style={({ pressed }) => [s.quizCard, pressed && s.cardPressed, locked && s.cardLocked]}
        onPress={() => !locked && router.push(`/quiz/${item.id}`)}
      >
        <View style={s.quizLeft}>
          <View style={[s.quizIcon, locked && s.iconLocked]}>
            <MaterialIcons
              name={locked ? 'lock' : 'quiz'}
              size={22}
              color={locked ? colors.textTertiary : colors.primary}
            />
          </View>
          <View style={s.quizInfo}>
            <Text style={[s.quizName, locked && s.textLocked]}>{item.name}</Text>
            <Text style={s.quizMeta}>{item.subject_name}</Text>
          </View>
        </View>
        <View style={s.quizStats}>
          <View style={s.stat}>
            <MaterialIcons name="help-outline" size={14} color={colors.textTertiary} />
            <Text style={s.statText}>{item.question_count}Q</Text>
          </View>
          {item.time_limit > 0 && (
            <View style={s.stat}>
              <MaterialIcons name="timer" size={14} color={colors.textTertiary} />
              <Text style={s.statText}>{item.time_limit}m</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.screenTitle}>Quizzes</Text>
        <Text style={s.screenSubtitle}>Test your knowledge</Text>
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : quizzes.length === 0 ? (
        <View style={s.centered}>
          <MaterialIcons name="quiz" size={56} color={colors.textTertiary} />
          <Text style={s.emptyTitle}>No quizzes available</Text>
          <Text style={s.emptySubtitle}>
            Quizzes will appear here once they are added to your enrolled subjects.
          </Text>
        </View>
      ) : (
        <FlatList
          data={quizzes}
          renderItem={renderQuiz}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  screenSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
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
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardPressed: { opacity: 0.75 },
  cardLocked: { opacity: 0.5 },
  quizLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  quizIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.iconBg1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLocked: { backgroundColor: colors.surface2 ?? colors.border },
  quizInfo: { flex: 1 },
  quizName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  textLocked: { color: colors.textTertiary },
  quizMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  quizStats: {
    alignItems: 'flex-end',
    gap: spacing.xs / 2,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
});
