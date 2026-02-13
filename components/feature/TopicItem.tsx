import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface TopicItemProps {
  name: string;
  noteCount: number;
  quizCount: number;
  flashcardCount: number;
  onPress: () => void;
}

export function TopicItem({
  name,
  noteCount,
  quizCount,
  flashcardCount,
  onPress,
}: TopicItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name="folder" size={24} color={colors.primary} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {name}
        </Text>
        <View style={styles.stats}>
          {noteCount > 0 && (
            <View style={styles.stat}>
              <MaterialIcons name="description" size={14} color={colors.textSecondary} />
              <Text style={styles.statText}>{noteCount} notes</Text>
            </View>
          )}
          {quizCount > 0 && (
            <View style={styles.stat}>
              <MaterialIcons name="quiz" size={14} color={colors.textSecondary} />
              <Text style={styles.statText}>{quizCount} quizzes</Text>
            </View>
          )}
          {flashcardCount > 0 && (
            <View style={styles.stat}>
              <MaterialIcons name="style" size={14} color={colors.textSecondary} />
              <Text style={styles.statText}>{flashcardCount} sets</Text>
            </View>
          )}
        </View>
      </View>
      
      <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: colors.surface,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
});
