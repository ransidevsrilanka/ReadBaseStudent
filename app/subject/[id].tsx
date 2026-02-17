import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, FlatList } from 'react-native';
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
}

export default function SubjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { enrollment } = useAuth();
  const [subject, setSubject] = useState<any>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjectAndNotes();
  }, [id]);

  const loadSubjectAndNotes = async () => {
    try {
      setLoading(true);
      
      // Get subject by ID using content service
      const subjectData = await contentService.getSubjectById(id);

      if (!subjectData) {
        console.error('Subject not found');
        setNotes([]);
        return;
      }

      setSubject(subjectData);

      // Get topics for this subject using content service
      const topics = await contentService.getTopicsForSubject(subjectData.id);

      if (!topics || topics.length === 0) {
        console.log('No topics found for subject');
        setNotes([]);
        return;
      }

      // Get notes for all topics
      const allNotes = await Promise.all(
        topics.map(topic => contentService.getNotesForTopic(topic.id))
      );

      // Flatten and sort notes by creation date
      const flattenedNotes = allNotes
        .flat()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotes(flattenedNotes);
    } catch (error) {
      console.error('Error loading subject and notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const renderNote = ({ item }: { item: Note }) => (
    <Pressable
      style={({ pressed }) => [
        styles.noteItem,
        pressed && styles.noteItemPressed,
      ]}
      onPress={() => router.push(`/pdf/${item.id}`)}
    >
      <View style={styles.noteIcon}>
        <MaterialIcons name="picture-as-pdf" size={24} color={colors.error} />
      </View>
      <View style={styles.noteContent}>
        <Text style={styles.noteTitle}>{item.title}</Text>
        <Text style={styles.noteSubtitle}>{item.page_count} pages</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
    </Pressable>
  );

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
              <Text style={styles.subtitle}>{notes.length} documents</Text>
            </View>
            
            {notes.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="folder-open" size={64} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No documents found</Text>
              </View>
            ) : (
              <FlatList
                data={notes}
                renderItem={renderNote}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
              />
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
    paddingBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    gap: spacing.md,
  },
  noteItemPressed: {
    opacity: 0.7,
    backgroundColor: colors.surfaceLight,
  },
  noteIcon: {
    width: 48,
    height: 48,
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
    fontWeight: typography.fontWeight.semibold,
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
