import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface SubjectCardProps {
  name: string;
  code: string;
  onPress: () => void;
}

const subjectColors = [
  '#6B46C1',
  '#4299E1',
  '#48BB78',
  '#ED8936',
  '#F56565',
  '#9F7AEA',
];

export function SubjectCard({ name, code, onPress }: SubjectCardProps) {
  const colorIndex = code.charCodeAt(0) % subjectColors.length;
  const bgColor = subjectColors[colorIndex];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: bgColor },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="menu-book" size={32} color={colors.textInverse} />
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{code}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {name}
        </Text>
        <View style={styles.footer}>
          <MaterialIcons name="arrow-forward" size={20} color={colors.textInverse} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    minHeight: 160,
    justifyContent: 'space-between',
    ...shadows.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textInverse,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.fontSize.lg * typography.lineHeight.tight,
  },
  footer: {
    alignSelf: 'flex-start',
  },
});
