import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { useAuth } from '@/hooks/useAuth';
import { contentService } from '@/services/content';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

interface Note {
  id: string;
  title: string;
  page_count: number;
  min_tier: string;
  created_at: string;
}

interface Topic {
  id: string;
  name: string;
  description?: string;
  notes: Note[];
}

export default function SubjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { enrollment } = useAuth();
  const [subject, setSubject] = useState<any>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjectAndTopics();
  }, [id]);

  const loadSubjectAndTopics = async () => {
    try {
      setLoading(true);
      
      // Get subject by ID using content service
      const subjectData = await contentService.getSubjectById(id);

      if (!subjectData) {
        console.error('Subject not found');
        setTopics([]);
        return;
      }

      setSubject(subjectData);

      // Get topics for this subject using content service
      const topicsData = await contentService.getTopicsForSubject(subjectData.id);

      if (!topicsData || topicsData.length === 0) {
        console.log('No topics found for subject');
        setTopics([]);
        return;
      }

      // Get notes for each topic
      const topicsWithNotes = await Promise.all(
        topicsData.map(async (topic) => {
          const notes = await contentService.getNotesForTopic(topic.id);
          return {
            ...topic,
            notes: notes || [],
          };
        })
      );

      setTopics(topicsWithNotes);
      
      // Auto-expand first topic if it has notes
      if (topicsWithNotes.length > 0 && topicsWithNotes[0].notes.length > 0) {
        setExpandedTopics(new Set([topicsWithNotes[0].id]));
      }
    } catch (error) {
      console.error('Error loading subject and topics:', error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const renderTopic = (topic: Topic) => {
    const isExpanded = expandedTopics.has(topic.id);
    const noteCount = topic.notes.length;

    return (
      <View key={topic.id} style={styles.topicContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.topicHeader,
            pressed && styles.topicHeaderPressed,
          ]}
          onPress={() => toggleTopic(topic.id)}
        >
          <View style={styles.topicHeaderLeft}>
            <MaterialIcons 
              name={isExpanded ? 'folder-open' : 'folder'} 
              size={24} 
              color={colors.primary} 
            />
            <View style={styles.topicHeaderText}>
              <Text style={styles.topicName}>{topic.name}</Text>
              <Text style={styles.topicCount}>{noteCount} document{noteCount !== 1 ? 's' : ''}</Text>
            </View>
          </View>
          <MaterialIcons 
            name={isExpanded ? 'expand-less' : 'expand-more'} 
            size={24} 
            color={colors.textSecondary} 
          />
        </Pressable>

        {isExpanded && (
          <View style={styles.notesContainer}>
            {topic.notes.length === 0 ? (
              <View style={styles.emptyNotes}>
                <Text style={styles.emptyNotesText}>No documents in this topic</Text>
              </View>
            ) : (
              topic.notes.map((note) => (
                <Pressable
                  key={note.id}
                  style={({ pressed }) => [
                    styles.noteItem,
                    pressed && styles.noteItemPressed,
                  ]}
                  onPress={() => router.push(`/pdf/${note.id}`)}
                >
                  <View style={styles.noteIcon}>
                    <MaterialIcons name="picture-as-pdf" size={20} color={colors.error} />
                  </View>
                  <View style={styles.noteContent}>
                    <Text style={styles.noteTitle}>{note.title}</Text>
                    <Text style={styles.noteSubtitle}>{note.page_count} pages</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={colors.textTertiary} />
                </Pressable>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  const totalNotes = topics.reduce((sum, topic) => sum + topic.notes.length, 0);

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          headerTitle: subject?.name || 'Subject',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }} 
      />
      <Screen scrollable={false}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.subtitle}>
                {topics.length} topic{topics.length !== 1 ? 's' : ''} · {totalNotes} document{totalNotes !== 1 ? 's' : ''}
              </Text>
            </View>
            
            {topics.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="folder-open" size={64} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No topics found</Text>
              </View>
            ) : (
              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {topics.map(renderTopic)}
              </ScrollView>
            )}
          </>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  topicContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  topicHeaderPressed: {
    backgroundColor: colors.surfaceLight,
  },
  topicHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  topicHeaderText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  topicName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  topicCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  notesContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.surface,
  },
  emptyNotes: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyNotesText: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingLeft: spacing.xl,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  noteItemPressed: {
    backgroundColor: colors.surfaceLight,
  },
  noteIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteContent: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  noteTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  noteSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
});
