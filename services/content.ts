import { Platform } from 'react-native';

const supabaseModule = Platform.OS === 'web' 
  ? require('./supabase.web')
  : require('./supabase.native');

const { supabase } = supabaseModule;

export const contentService = {
  async getSubjectById(subjectId: string) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getTopicsForSubject(subjectId: string) {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('is_active', true)
      .order('sort_order');
    
    if (error) throw error;
    return data || [];
  },

  async getNotesForTopic(topicId: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('topic_id', topicId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getQuizzesForTopic(topicId: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('topic_id', topicId)
      .eq('is_active', true);
    
    if (error) throw error;
    return data || [];
  },

  async getFlashcardSetsForTopic(topicId: string) {
    const { data, error } = await supabase
      .from('flashcard_sets')
      .select('*, flashcards(*)')
      .eq('topic_id', topicId)
      .eq('is_active', true);
    
    if (error) throw error;
    return data || [];
  },

  async servePdf(noteId: string) {
    const { data, error } = await supabase.functions.invoke('serve-pdf', {
      body: { noteId },
    });
    
    if (error) throw error;
    return data as {
      signedUrl: string;
      canDownload: boolean;
      watermark: string;
      noteTitle: string;
    };
  },
};
