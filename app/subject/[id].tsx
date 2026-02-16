import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { Platform } from 'react-native';

const supabaseModule = Platform.OS === 'web' 
  ? require('@/services/supabase.web')
  : require('@/services/supabase.native');

const { supabase } = supabaseModule;

interface Note {
  id: string;
  title: string;
  page_count: number;
  min_tier: string;
  created_at: string;
}

export default function SubjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { enrollment } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const subjectName = decodeURIComponent(id);

  useEffect(() => {
    loadNotes();
  }, [id]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      
      // Get subject by name
      const { data: subject, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .ilike('name', subjectName)
        .single();

      if (subjectError || !subject) {
        console.error('Subject not found:', subjectError);
        setNotes([]);
        return;
      }

      // Get topics for this subject
      const { data: topics, error: topicsError } = await supabase
        .from('topics')
        .select('id')
        .eq('subject_id', subject.id)
        .eq('is_active', true);

      if (topicsError || !topics || topics.length === 0) {
        console.error('No topics found:', topicsError);
        setNotes([]);
        return;
      }

      const topicIds = topics.map(t => t.id);

      // Get notes for these topics
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .in('topic_id', topicIds)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (notesError) {
        console.error('Error loading notes:', notesError);
        setNotes([]);
        return;
      }

      setNotes(notesData || []);
    } catch (error) {
      console.error('Error:', error);
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
          headerTitle: subjectName,
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
