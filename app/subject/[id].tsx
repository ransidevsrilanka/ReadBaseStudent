import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { TopicItem } from '@/components/feature/TopicItem';
import { useTopics } from '@/hooks/useTopics';
import { colors, spacing, typography } from '@/constants/theme';

export default function SubjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { topics, loading } = useTopics(id);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Topics' }} />
      <Screen>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : topics.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No topics available yet</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {topics.map((topic) => (
              <TopicItem
                key={topic.id}
                name={topic.name}
                noteCount={0}
                quizCount={0}
                flashcardCount={0}
                onPress={() => router.push(`/topic/${topic.id}`)}
              />
            ))}
          </View>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  list: {
    gap: spacing.md,
  },
});
