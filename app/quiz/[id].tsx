import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSequence } from 'react-native-reanimated';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const supabaseModule = require('@/services/supabase.web');
const { supabase } = supabaseModule;

interface Question {
  id: string;
  question_text: string;
  question_type: 'MCQ' | 'True/False';
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface Quiz {
  id: string;
  topic_id: string;
  title: string;
  question_count: number;
  time_limit_minutes: number;
  pass_percentage: number;
}

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  const progressValue = useSharedValue(0);

  useEffect(() => {
    if (id) {
      loadQuiz();
    }
  }, [id]);

  useEffect(() => {
    if (timeRemaining > 0 && !isCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, isCompleted]);

  useEffect(() => {
    const progress = questions.length > 0 ? (currentQuestionIndex + 1) / questions.length : 0;
    progressValue.value = withTiming(progress, { duration: 300 });
  }, [currentQuestionIndex, questions.length]);

  const loadQuiz = async () => {
    try {
      setLoading(true);

      // Load quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData);

      // Load random questions
      const { data: questionsData, error: questionsError } = await supabase
        .rpc('get_random_questions', {
          p_topic_id: quizData.topic_id,
          p_count: quizData.question_count,
          p_min_tier: 'starter',
        });

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
      setTimeRemaining(quizData.time_limit_minutes * 60);
    } catch (error: any) {
      showAlert('Error', error?.message || 'Failed to load quiz');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });

    const finalScore = (correctCount / questions.length) * 100;
    const passed = finalScore >= (quiz?.pass_percentage || 50);

    setScore(finalScore);
    setIsCompleted(true);
    setShowResults(true);

    // Save attempt to database
    if (user && quiz) {
      try {
        await supabase.from('quiz_attempts').insert({
          user_id: user.id,
          quiz_id: quiz.id,
          answers: selectedAnswers,
          score: Math.round(finalScore),
          total_questions: questions.length,
          passed,
          time_taken_seconds: (quiz.time_limit_minutes * 60) - timeRemaining,
          completed_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error saving quiz attempt:', error);
      }
    }
  };

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, headerTitle: 'Loading...' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, headerTitle: 'Quiz' }} />
        <Screen>
          <View style={styles.emptyState}>
            <MaterialIcons name="quiz" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyText}>Quiz not available</Text>
            <Button title="Go Back" onPress={() => router.back()} />
          </View>
        </Screen>
      </>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestion?.id];
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timePercent = (timeRemaining / (quiz.time_limit_minutes * 60)) * 100;
  const isTimeLow = timePercent < 20;

  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: quiz.title }} />
      <Screen>
        {/* Timer and Progress */}
        <View style={styles.header}>
          <View style={[styles.timerContainer, isTimeLow && styles.timerWarning]}>
            <MaterialIcons 
              name="timer" 
              size={20} 
              color={isTimeLow ? colors.error : colors.primary} 
            />
            <Text style={[styles.timerText, isTimeLow && styles.timerTextWarning]}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Text>
          </View>
          
          <Text style={styles.questionCounter}>
            {currentQuestionIndex + 1} / {questions.length}
          </Text>
        </View>

        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
        </View>

        {/* Question */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.questionText}>{currentQuestion.question_text}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              
              return (
                <Pressable
                  key={index}
                  style={({ pressed }) => [
                    styles.optionButton,
                    isSelected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => handleSelectAnswer(option)}
                >
                  <View style={[
                    styles.optionRadio,
                    isSelected && styles.optionRadioSelected,
                  ]}>
                    {isSelected && <View style={styles.optionRadioDot} />}
                  </View>
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Navigation */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <MaterialIcons 
              name="chevron-left" 
              size={24} 
              color={currentQuestionIndex === 0 ? colors.textTertiary : colors.primary} 
            />
            <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
              Previous
            </Text>
          </Pressable>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              title="Submit Quiz"
              onPress={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== questions.length}
              fullWidth={false}
              style={styles.submitButton}
            />
          ) : (
            <Pressable
              style={[styles.navButton, !selectedAnswer && styles.navButtonDisabled]}
              onPress={handleNext}
              disabled={!selectedAnswer}
            >
              <Text style={[styles.navButtonText, !selectedAnswer && styles.navButtonTextDisabled]}>
                Next
              </Text>
              <MaterialIcons 
                name="chevron-right" 
                size={24} 
                color={!selectedAnswer ? colors.textTertiary : colors.primary} 
              />
            </Pressable>
          )}
        </View>

        {/* Results Modal */}
        <Modal
          visible={showResults}
          animationType="slide"
          transparent
          onRequestClose={() => setShowResults(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <MaterialIcons 
                name={score >= (quiz.pass_percentage || 50) ? 'check-circle' : 'cancel'} 
                size={80} 
                color={score >= (quiz.pass_percentage || 50) ? colors.success : colors.error} 
              />
              
              <Text style={styles.modalTitle}>
                {score >= (quiz.pass_percentage || 50) ? 'Congratulations!' : 'Keep Practicing!'}
              </Text>
              
              <Text style={styles.scoreText}>{Math.round(score)}%</Text>
              
              <Text style={styles.modalSubtitle}>
                You got {questions.filter(q => selectedAnswers[q.id] === q.correct_answer).length} out of {questions.length} correct
              </Text>

              <View style={styles.modalButtons}>
                <Button
                  title="Review Answers"
                  variant="outline"
                  onPress={() => {
                    setShowResults(false);
                    setCurrentQuestionIndex(0);
                  }}
                  fullWidth
                />
                <Button
                  title="Try Again"
                  onPress={() => router.back()}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  timerWarning: {
    borderColor: colors.error,
  },
  timerText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  timerTextWarning: {
    color: colors.error,
  },
  questionCounter: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  questionText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.fontSize.xl * 1.4,
    marginBottom: spacing.xl,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioSelected: {
    borderColor: colors.primary,
  },
  optionRadioDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    lineHeight: typography.fontSize.base * 1.5,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  navButtonTextDisabled: {
    color: colors.textTertiary,
  },
  submitButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: typography.fontSize.xxxl * 1.5,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  modalSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalButtons: {
    width: '100%',
    gap: spacing.md,
  },
});
