import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { TIER_NAMES } from '@/constants/config';

interface TierBadgeProps {
  tier: 'starter' | 'standard' | 'lifetime';
  size?: 'small' | 'medium' | 'large';
}

const tierColors = {
  starter: colors.silver,
  standard: colors.gold,
  lifetime: colors.platinum,
};

const tierIcons = {
  starter: 'workspace-premium' as const,
  standard: 'workspace-premium' as const,
  lifetime: 'workspace-premium' as const,
};

export function TierBadge({ tier, size = 'medium' }: TierBadgeProps) {
  const iconSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;
  const fontSize = size === 'small' ? typography.fontSize.xs : size === 'large' ? typography.fontSize.base : typography.fontSize.sm;

  return (
    <View style={[styles.container, { backgroundColor: `${tierColors[tier]}20` }]}>
      <MaterialIcons name={tierIcons[tier]} size={iconSize} color={tierColors[tier]} />
      <Text style={[styles.text, { color: tierColors[tier], fontSize }]}>
        {TIER_NAMES[tier]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
  },
});
