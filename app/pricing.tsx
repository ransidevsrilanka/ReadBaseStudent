import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/theme';

interface PricingPlan {
  id: string;
  name: string;
  tier: 'starter' | 'standard' | 'lifetime';
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'silver',
    name: 'Silver',
    tier: 'starter',
    price: '1,500',
    period: 'per month',
    description: 'Essential study materials',
    features: [
      'Access to basic study notes',
      'View PDFs online only',
      'Email support',
      'Community forum access',
    ],
    ctaText: 'Choose Silver',
  },
  {
    id: 'gold',
    name: 'Gold',
    tier: 'standard',
    price: '3,500',
    period: 'per month',
    description: 'Advanced learning tools',
    features: [
      'All Silver features',
      '1,000 AI tutor credits/month',
      'Download PDFs for offline',
      'Interactive quizzes',
      'Progress tracking',
      'Priority email support',
    ],
    popular: true,
    ctaText: 'Choose Gold',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    tier: 'lifetime',
    price: '15,000',
    period: 'until exam',
    description: 'Complete premium experience',
    features: [
      'All Gold features',
      '10,000 AI tutor credits/month',
      'Unlimited PDF downloads',
      'Print request service',
      'Offline vault (50 PDFs)',
      'Spaced repetition flashcards',
      'Priority support + WhatsApp',
      'Exclusive mobile app access',
    ],
    ctaText: 'Choose Platinum',
  },
];

export default function PricingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<string | null>('platinum');

  const handlePurchase = (planId: string) => {
    // Redirect to website for payment
    Linking.openURL(`https://notebase.tech/pricing?plan=${planId}`);
  };

  const styles = createStyles(colors);

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          headerTitle: 'Choose Your Plan',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }} 
      />
      
      <View style={[styles.container, { paddingTop: 0 }]}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Unlock The Vault</Text>
            <Text style={styles.subtitle}>
              Choose the perfect plan for your study journey
            </Text>
          </View>

          {/* Pricing Cards */}
          <View style={styles.plansContainer}>
            {PRICING_PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const isPlatinum = plan.tier === 'lifetime';
              
              return (
                <Pressable
                  key={plan.id}
                  style={({ pressed }) => [
                    styles.planCard,
                    isSelected && styles.planCardSelected,
                    pressed && styles.planCardPressed,
                  ]}
                  onPress={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>MOST POPULAR</Text>
                    </View>
                  )}

                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.currency}>LKR</Text>
                      <Text style={styles.price}>{plan.price}</Text>
                    </View>
                    <Text style={styles.period}>{plan.period}</Text>
                    <Text style={styles.description}>{plan.description}</Text>
                  </View>

                  <View style={styles.featuresContainer}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <MaterialIcons 
                          name="check-circle" 
                          size={18} 
                          color={isPlatinum ? colors.accent : colors.primary} 
                        />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.ctaButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => handlePurchase(plan.id)}
                  >
                    {isPlatinum ? (
                      <LinearGradient
                        colors={[colors.accent, colors.accentLight]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientButton}
                      >
                        <MaterialIcons name="workspace-premium" size={20} color={colors.textInverse} />
                        <Text style={styles.ctaButtonTextInverse}>{plan.ctaText}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.outlineButton}>
                        <Text style={styles.ctaButtonText}>{plan.ctaText}</Text>
                      </View>
                    )}
                  </Pressable>
                </Pressable>
              );
            })}
          </View>

          {/* FAQ Section */}
          <View style={styles.faqSection}>
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
            
            <View style={styles.faqItem}>
              <MaterialIcons name="help-outline" size={20} color={colors.primary} />
              <View style={styles.faqContent}>
                <Text style={styles.faqQuestion}>Can I upgrade my plan later?</Text>
                <Text style={styles.faqAnswer}>
                  Yes! You can upgrade to a higher tier anytime from your dashboard.
                </Text>
              </View>
            </View>

            <View style={styles.faqItem}>
              <MaterialIcons name="help-outline" size={20} color={colors.primary} />
              <View style={styles.faqContent}>
                <Text style={styles.faqQuestion}>What payment methods do you accept?</Text>
                <Text style={styles.faqAnswer}>
                  We accept credit/debit cards, bank transfers, and mobile payments via PayHere.
                </Text>
              </View>
            </View>

            <View style={styles.faqItem}>
              <MaterialIcons name="help-outline" size={20} color={colors.primary} />
              <View style={styles.faqContent}>
                <Text style={styles.faqQuestion}>Is there a free trial?</Text>
                <Text style={styles.faqAnswer}>
                  Currently, we don't offer a free trial, but you can start with the Silver plan and upgrade anytime.
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Need help choosing? Contact us at{' '}
              <Text style={styles.footerLink}>support@notebase.tech</Text>
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  plansContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  planCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.xl,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: colors.primary,
  },
  planCardPressed: {
    opacity: 0.9,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  popularText: {
    fontSize: typography.fontSize.xs - 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.textInverse,
    letterSpacing: 0.5,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  planName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  currency: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  price: {
    fontSize: 36,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  period: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  featuresContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  featureText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: typography.fontSize.base * 1.5,
  },
  ctaButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
  },
  outlineButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
  },
  ctaButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  ctaButtonTextInverse: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  faqSection: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  faqTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  faqItem: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  faqContent: {
    flex: 1,
    gap: spacing.xs,
  },
  faqQuestion: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  faqAnswer: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * 1.5,
  },
  footer: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * 1.5,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});
