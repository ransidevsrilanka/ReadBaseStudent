import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { TierBadge } from '@/components/ui/TierBadge';
import { useAuth } from '@/hooks/useAuth';
import { spacing, typography, borderRadius } from '@/constants/theme';

export default function UpgradeScreen() {
  const { colors } = useTheme();
  const { enrollment } = useAuth();
  const insets = useSafeAreaInsets();

  const handleUpgrade = () => {
    Linking.openURL('https://notebase.tech/dashboard');
  };

  const styles = createStyles(colors);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[colors.primary + '40', colors.primaryDark + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconBg}
            >
              <MaterialIcons name="workspace-premium" size={64} color={colors.primary} />
            </LinearGradient>
          </View>

          {/* Current Tier Badge */}
          {enrollment && (
            <View style={styles.currentTierContainer}>
              <Text style={styles.currentTierLabel}>Your Current Plan</Text>
              <TierBadge tier={enrollment.tier} size="medium" />
            </View>
          )}

          {/* Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.title}>Platinum Access Required</Text>
            <Text style={styles.subtitle}>
              The ReadBase mobile app is exclusively available for Platinum members. Upgrade your plan to access premium study materials on the go.
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>Access all study materials</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>10,000 AI tutor credits/month</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>Download PDFs for offline access</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>Request physical printouts</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>Valid until your exam</Text>
            </View>
          </View>

          {/* Upgrade Button */}
          <Pressable
            style={({ pressed }) => [
              styles.upgradeButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleUpgrade}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <MaterialIcons name="arrow-upward" size={20} color={colors.textInverse} />
              <Text style={styles.upgradeButtonText}>Upgrade to Platinum</Text>
            </LinearGradient>
          </Pressable>

          {/* Footer */}
          <Text style={styles.footerText}>
            You'll be redirected to notebase.tech to complete your upgrade
          </Text>
        </View>
      </View>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentTierContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  currentTierLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.6,
    paddingHorizontal: spacing.md,
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    flex: 1,
  },
  upgradeButton: {
    width: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 56,
  },
  upgradeButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
