import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { NoteItem } from '@/components/feature/NoteItem';
import { useNotes } from '@/hooks/useNotes';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { TIER_HIERARCHY } from '@/constants/config';

export default function TopicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { notes, loading } = useNotes(id);
  const { enrollment } = useAuth();

  const userTierLevel = enrollment ? TIER_HIERARCHY[enrollment.tier as keyof typeof TIER_HIERARCHY] : 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: 'Study Materials' }} />
      <Screen>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>PDF Notes</Text>
          <Text style={styles.sectionSubtitle}>
            Tap any note to view. Some content requires higher tier access.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : notes.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="description" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No notes available yet</Text>
            <Text style={styles.emptySubtext}>Check back soon for new content</Text>
          </View>
        ) : (
          <View style={styles.notesList}>
            {notes.map((note) => {
              const noteTierLevel = TIER_HIERARCHY[note.min_tier as keyof typeof TIER_HIERARCHY];
              const hasAccess = userTierLevel >= noteTierLevel;

              return (
                <View key={note.id}>
                  <NoteItem
                    title={note.title}
                    pageCount={note.page_count}
                    minTier={note.min_tier}
                    storageProvider={note.storage_provider}
                    onPress={() => {
                      if (hasAccess) {
                        router.push(`/pdf/${note.id}`);
                      }
                    }}
                  />
                  {!hasAccess && (
                    <View style={styles.lockedBanner}>
                      <MaterialIcons name="lock" size={16} color={colors.warning} />
                      <Text style={styles.lockedText}>
                        Requires higher tier to access
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.comingSoonSection}>
          <Pressable 
            style={styles.featureCard}
            onPress={() => router.push(`/quiz/${id}`)}
          >
            <MaterialIcons name="quiz" size={32} color={colors.primary} />
            <Text style={styles.featureTitle}>Take Quiz</Text>
            <Text style={styles.featureSubtitle}>Test your knowledge</Text>
          </Pressable>
          <Pressable 
            style={styles.featureCard}
            onPress={() => router.push(`/flashcards/${id}`)}
          >
            <MaterialIcons name="style" size={32} color={colors.primary} />
            <Text style={styles.featureTitle}>Flashcards</Text>
            <Text style={styles.featureSubtitle}>Study with cards</Text>
          </Pressable>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * 1.5,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  notesList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.warningLight,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },
  lockedText: {
    fontSize: typography.fontSize.xs,
    color: colors.warningDark,
    fontWeight: typography.fontWeight.medium,
  },
  comingSoonSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  featureTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  featureSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});
