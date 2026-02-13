import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming, 
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const supabaseModule = require('@/services/supabase.web');
const { supabase } = supabaseModule;

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.xl * 2;

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  image_url?: string;
}

interface FlashcardProgress {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_at: string;
}

export default function FlashcardsScreen() {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ mastered: 0, learning: 0, new: 0 });

  const isFlipped = useSharedValue(false);
  const rotateY = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (topicId) {
      loadFlashcards();
      loadStats();
    }
  }, [topicId]);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      
      const { data: sets, error: setsError } = await supabase
        .from('flashcard_sets')
        .select('*, flashcards(*)')
        .eq('topic_id', topicId)
        .eq('is_active', true);

      if (setsError) throw setsError;

      const allCards = sets?.flatMap((set: any) => set.flashcards) || [];
      setFlashcards(allCards);
    } catch (error: any) {
      showAlert('Error', error?.message || 'Failed to load flashcards');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('flashcard_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const mastered = data?.filter((p: any) => p.ease_factor >= 2.5 && p.repetitions >= 3).length || 0;
      const learning = data?.filter((p: any) => p.ease_factor < 2.5 || p.repetitions < 3).length || 0;
      const newCards = flashcards.length - (mastered + learning);

      setStats({ mastered, learning, new: Math.max(0, newCards) });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const flipCard = () => {
    isFlipped.value = !isFlipped.value;
    rotateY.value = withSpring(isFlipped.value ? 180 : 0);
  };

  const updateProgress = async (quality: number) => {
    if (!user || currentIndex >= flashcards.length) return;

    const card = flashcards[currentIndex];

    try {
      // Fetch current progress or create new
      const { data: existing } = await supabase
        .from('flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('flashcard_id', card.id)
        .single();

      // SM-2 Algorithm
      let easeFactor = existing?.ease_factor || 2.5;
      let interval = existing?.interval_days || 1;
      let repetitions = existing?.repetitions || 0;

      if (quality >= 3) {
        if (repetitions === 0) {
          interval = 1;
        } else if (repetitions === 1) {
          interval = 6;
        } else {
          interval = Math.round(interval * easeFactor);
        }
        repetitions += 1;
      } else {
        repetitions = 0;
        interval = 1;
      }

      easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + interval);

      // Upsert progress
      await supabase.from('flashcard_progress').upsert({
        user_id: user.id,
        flashcard_id: card.id,
        ease_factor: easeFactor,
        interval_days: interval,
        repetitions,
        next_review_at: nextReview.toISOString(),
      });

      loadStats();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleEasy = () => {
    updateProgress(5);
    nextCard();
  };

  const handleGood = () => {
    updateProgress(4);
    nextCard();
  };

  const handleHard = () => {
    updateProgress(2);
    nextCard();
  };

  const handleAgain = () => {
    updateProgress(0);
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      translateX.value = withTiming(-CARD_WIDTH, { duration: 200 }, () => {
        runOnJS(setCurrentIndex)(currentIndex + 1);
        translateX.value = 0;
        isFlipped.value = false;
        rotateY.value = 0;
      });
    } else {
      showAlert('Complete!', 'You have reviewed all flashcards in this topic.');
      router.back();
    }
  };

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${rotateY.value}deg` },
      { translateX: translateX.value },
    ],
    backfaceVisibility: 'hidden',
  }));

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${rotateY.value - 180}deg` },
      { translateX: translateX.value },
    ],
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  }));

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, headerTitle: 'Flashcards' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  if (flashcards.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, headerTitle: 'Flashcards' }} />
        <Screen>
          <View style={styles.emptyState}>
            <MaterialIcons name="style" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No flashcards available</Text>
            <Button title="Go Back" onPress={() => router.back()} />
          </View>
        </Screen>
      </>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: `Flashcards (${currentIndex + 1}/${flashcards.length})` }} />
      <Screen>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: colors.success + '20' }]}>
            <Text style={styles.statNumber}>{stats.mastered}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.warning + '20' }]}>
            <Text style={styles.statNumber}>{stats.learning}</Text>
            <Text style={styles.statLabel}>Learning</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.info + '20' }]}>
            <Text style={styles.statNumber}>{stats.new}</Text>
            <Text style={styles.statLabel}>New</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {/* Card */}
        <View style={styles.cardContainer}>
          <Pressable onPress={flipCard} style={styles.cardPressable}>
            {/* Front */}
            <Animated.View style={[styles.card, frontAnimatedStyle]}>
              <Text style={styles.cardLabel}>Question</Text>
              <Text style={styles.cardText}>{currentCard.front_text}</Text>
              <View style={styles.tapHint}>
                <MaterialIcons name="touch-app" size={20} color={colors.textTertiary} />
                <Text style={styles.tapHintText}>Tap to flip</Text>
              </View>
            </Animated.View>

            {/* Back */}
            <Animated.View style={[styles.card, backAnimatedStyle]}>
              <Text style={styles.cardLabel}>Answer</Text>
              <Text style={styles.cardText}>{currentCard.back_text}</Text>
              <View style={styles.tapHint}>
                <MaterialIcons name="touch-app" size={20} color={colors.textTertiary} />
                <Text style={styles.tapHintText}>Tap to flip</Text>
              </View>
            </Animated.View>
          </Pressable>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.againButton,
              pressed && styles.actionPressed,
            ]}
            onPress={handleAgain}
          >
            <MaterialIcons name="refresh" size={24} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>Again</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.hardButton,
              pressed && styles.actionPressed,
            ]}
            onPress={handleHard}
          >
            <MaterialIcons name="trending-down" size={24} color={colors.warning} />
            <Text style={[styles.actionText, { color: colors.warning }]}>Hard</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.goodButton,
              pressed && styles.actionPressed,
            ]}
            onPress={handleGood}
          >
            <MaterialIcons name="check" size={24} color={colors.info} />
            <Text style={[styles.actionText, { color: colors.info }]}>Good</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.easyButton,
              pressed && styles.actionPressed,
            ]}
            onPress={handleEasy}
          >
            <MaterialIcons name="done-all" size={24} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.success }]}>Easy</Text>
          </Pressable>
        </View>
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
    gap: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  cardPressable: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.2,
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  cardLabel: {
    position: 'absolute',
    top: spacing.lg,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: typography.fontSize.xxl * 1.4,
  },
  tapHint: {
    position: 'absolute',
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tapHintText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  actionPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  againButton: {
    borderColor: colors.error,
    backgroundColor: colors.error + '10',
  },
  hardButton: {
    borderColor: colors.warning,
    backgroundColor: colors.warning + '10',
  },
  goodButton: {
    borderColor: colors.info,
    backgroundColor: colors.info + '10',
  },
  easyButton: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
