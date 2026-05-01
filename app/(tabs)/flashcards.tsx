import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/services/supabase';
import { spacing, typography, borderRadius } from '@/constants/theme';

interface FlashcardSet {
  id: string;
  name: string;
  card_count: number;
  topic_name: string;
  subject_name: string;
  due_count?: number;
}

export default function FlashcardsTab() {
  const { colors } = useTheme();
  const { enrollment, userSubjects } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (enrollment) loadFlashcardSets();
  }, [enrollment]);

  const loadFlashcardSets = async () => {
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

      if (!subjects?.length) { setSets([]); setLoading(false); return; }

      const subjectIds = subjects.map(s => s.id);
      const { data: topics } = await supabase
        .from('topics')
        .select('id, name, subject_id')
        .in('subject_id', subjectIds)
        .eq('is_active', true);

      if (!topics?.length) { setSets([]); setLoading(false); return; }

      const topicIds = topics.map(t => t.id);
      const { data: flashcardSets } = await supabase
        .from('flashcard_sets')
        .select('id, name, topic_id')
        .in('topic_id', topicIds)
        .eq('is_active', true);

      if (!flashcardSets?.length) { setSets([]); setLoading(false); return; }

      // Count cards per set
      const setsWithCounts = await Promise.all(
        flashcardSets.map(async (set) => {
          const { count } = await supabase
            .from('flashcards')
            .select('*', { count: 'exact', head: true })
            .eq('flashcard_set_id', set.id);

          const topic = topics.find(t => t.id === set.topic_id);
          const subject = subjects.find(s => s.id === topic?.subject_id);

          return {
            id: set.id,
            name: set.name,
            card_count: count ?? 0,
            topic_name: topic?.name ?? '',
            subject_name: subject?.name ?? '',
          };
        })
      );

      setSets(setsWithCounts.filter(s => s.card_count > 0));
    } catch (e) {
      setSets([]);
    } finally {
      setLoading(false);
    }
  };

  const s = createStyles(colors);

  const renderSet = ({ item }: { item: FlashcardSet }) => (
    <Pressable
      style={({ pressed }) => [s.setCard, pressed && s.cardPressed]}
      onPress={() => router.push(`/flashcards/${item.id}`)}
    >
      <View style={s.setIconWrap}>
        <MaterialIcons name="style" size={24} color={colors.primary} />
      </View>
      <View style={s.setInfo}>
        <Text style={s.setName}>{item.name}</Text>
        <Text style={s.setMeta}>{item.subject_name} · {item.topic_name}</Text>
      </View>
      <View style={s.setRight}>
        <Text style={s.cardCount}>{item.card_count}</Text>
        <Text style={s.cardCountLabel}>cards</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Text style={s.screenTitle}>Flashcards</Text>
        <Text style={s.screenSubtitle}>Spaced repetition learning</Text>
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : sets.length === 0 ? (
        <View style={s.centered}>
          <MaterialIcons name="style" size={56} color={colors.textTertiary} />
          <Text style={s.emptyTitle}>No flashcard sets yet</Text>
          <Text style={s.emptySubtitle}>
            Flashcard sets will appear here once your teachers add them to your subjects.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sets}
          renderItem={renderSet}
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
  setCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardPressed: { opacity: 0.75 },
  setIconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.iconBg1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setInfo: { flex: 1 },
  setName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  setMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  setRight: { alignItems: 'center' },
  cardCount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  cardCountLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
});
