import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TierBadge } from '@/components/ui/TierBadge';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

interface NoteItemProps {
  title: string;
  pageCount: number;
  minTier: 'starter' | 'standard' | 'lifetime';
  storageProvider: 'supabase' | 'external';
  onPress: () => void;
}

export function NoteItem({ title, pageCount, minTier, storageProvider, onPress }: NoteItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name="picture-as-pdf" size={32} color={colors.error} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        <View style={styles.metadata}>
          <View style={styles.metaItem}>
            <MaterialIcons name="description" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>{pageCount} pages</Text>
          </View>
          
          {storageProvider === 'external' && (
            <View style={styles.metaItem}>
              <MaterialIcons name="cloud" size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>Cloud</Text>
            </View>
          )}
        </View>
        
        <View style={styles.footer}>
          <TierBadge tier={minTier} size="small" />
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
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
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
    lineHeight: typography.fontSize.base * 1.3,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: spacing.xs,
  },
});
