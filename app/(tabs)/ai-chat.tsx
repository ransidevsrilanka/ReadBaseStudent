import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/layout/Screen';
import { useAuth } from '@/hooks/useAuth';
import { aiService } from '@/services/ai';
import { useAlert } from '@/template';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { AI_CREDIT_LIMITS } from '@/constants/config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { icon: 'lightbulb', text: 'Explain this topic', prompt: 'Can you explain ' },
  { icon: 'quiz', text: 'Practice questions', prompt: 'Give me practice questions about ' },
  { icon: 'tips-and-updates', text: 'Study tips', prompt: 'Give me study tips for ' },
  { icon: 'bookmark', text: 'Summary', prompt: 'Summarize the key points about ' },
];

export default function AIChatScreen() {
  const { user, enrollment, userSubjects } = useAuth();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [creditsLimit, setCreditsLimit] = useState(100);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (enrollment && user) {
      loadChatHistory();
      loadCredits();
    }
  }, [enrollment, user]);

  const loadChatHistory = async () => {
    if (!user) return;
    
    try {
      setLoadingHistory(true);
      const history = await aiService.getChatHistory(user.id);
      const formattedMessages = history.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.message_text,
        timestamp: new Date(msg.created_at),
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadCredits = async () => {
    if (!user || !enrollment) return;
    
    try {
      const creditsData = await aiService.getAICredits(user.id, enrollment.id);
      if (creditsData) {
        setCreditsUsed(creditsData.credits_used);
        setCreditsLimit(creditsData.credits_limit);
      } else {
        setCreditsLimit(AI_CREDIT_LIMITS[enrollment.tier as keyof typeof AI_CREDIT_LIMITS]);
      }
    } catch (error) {
      console.error('Error loading credits:', error);
    }
  };

  const getUserSubjectsContext = () => {
    if (!userSubjects) return '';
    
    const subjects = [
      userSubjects.subject_1_name,
      userSubjects.subject_2_name,
      userSubjects.subject_3_name,
    ].filter(Boolean);
    
    return subjects.length > 0 
      ? `My enrolled subjects are: ${subjects.join(', ')}.` 
      : '';
  };

  const handleSend = async () => {
    if (!inputText.trim() || !enrollment || loading) return;

    const creditsRemaining = creditsLimit - creditsUsed;
    const usagePercent = (creditsUsed / creditsLimit) * 100;

    // Warning at 80% usage
    if (usagePercent >= 80 && usagePercent < 100) {
      showAlert(
        'Credit Warning',
        `You have used ${creditsUsed} of ${creditsLimit} AI credits this month (${Math.round(usagePercent)}%). Credits reset monthly.`
      );
    }

    if (creditsRemaining <= 0) {
      showAlert(
        'No Credits Remaining',
        'You have used all your AI credits for this month. Credits will reset next month or upgrade your tier for more credits.'
      );
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Add subject context to the message
      const contextualMessage = `${getUserSubjectsContext()} ${inputText.trim()}`;
      
      console.log('AI Chat - Sending message:', contextualMessage);
      console.log('AI Chat - Enrollment ID:', enrollment.id);
      
      const response = await aiService.sendMessage(contextualMessage, enrollment.id);
      
      console.log('AI Chat - Response:', response);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCreditsUsed(creditsLimit - response.creditsRemaining);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('AI Chat - Error:', error);
      console.error('AI Chat - Error details:', JSON.stringify(error, null, 2));
      const errorMessage = error?.message || error?.error?.message || 'Failed to send message. Please try again.';
      showAlert('Error', errorMessage + ' (Check console for details)');
      // Remove the user message if send failed
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInputText(prompt);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.assistantMessage]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
            {item.content}
          </Text>
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (!enrollment || !user) {
    return (
      <Screen>
        <View style={styles.emptyState}>
          <MaterialIcons name="smart-toy" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyText}>Please log in to use AI Tutor</Text>
        </View>
      </Screen>
    );
  }

  const creditsRemaining = creditsLimit - creditsUsed;
  const usagePercent = (creditsUsed / creditsLimit) * 100;
  const isLowCredits = usagePercent >= 80;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Credits Bar */}
      <View style={styles.creditsBar}>
        <View style={styles.creditsInfo}>
          <MaterialIcons name="bolt" size={20} color={isLowCredits ? colors.warning : colors.primary} />
          <Text style={[styles.creditsText, isLowCredits && styles.creditsWarning]}>
            {creditsRemaining} / {creditsLimit} credits
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${usagePercent}%` },
              isLowCredits && styles.progressBarWarning
            ]} 
          />
        </View>
      </View>

      {/* Messages List */}
      {loadingHistory ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="chat" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyText}>Start a conversation</Text>
          <Text style={styles.emptySubtext}>Ask me anything about your subjects!</Text>
          
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((action, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.quickActionButton,
                  pressed && styles.quickActionPressed,
                ]}
                onPress={() => handleQuickAction(action.prompt)}
              >
                <MaterialIcons name={action.icon as any} size={20} color={colors.primary} />
                <Text style={styles.quickActionText}>{action.text}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask a question..."
            placeholderTextColor={colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!loading && creditsRemaining > 0}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              pressed && styles.sendButtonPressed,
              (!inputText.trim() || loading || creditsRemaining <= 0) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading || creditsRemaining <= 0}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <MaterialIcons name="send" size={24} color={colors.textInverse} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  creditsBar: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  creditsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  creditsText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  creditsWarning: {
    color: colors.warning,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressBarWarning: {
    backgroundColor: colors.warning,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
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
  quickActions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
    width: '100%',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionPressed: {
    opacity: 0.7,
  },
  quickActionText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  messagesList: {
    padding: spacing.md,
    gap: spacing.md,
  },
  messageContainer: {
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.fontSize.base * 1.5,
  },
  userText: {
    color: colors.textInverse,
  },
  assistantText: {
    color: colors.text,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  assistantTimestamp: {
    color: colors.textTertiary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.inactive,
  },
});
