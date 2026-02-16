import { Platform } from 'react-native';

const supabaseModule = Platform.OS === 'web' 
  ? require('./supabase.web')
  : require('./supabase.native');

const { supabase } = supabaseModule;

export const contentService = {
  async getSubjectsByIds(subjectIds: string[]) {
    console.log('contentService - Fetching subjects by IDs:', subjectIds);
    
    if (!subjectIds || subjectIds.length === 0) {
      console.log('contentService - No subject IDs provided');
      return [];
    }
    
    // Filter out null/undefined IDs
    const validIds = subjectIds.filter(id => id && id.trim());
    console.log('contentService - Valid IDs after filtering:', validIds);
    
    if (validIds.length === 0) {
      console.log('contentService - No valid IDs after filtering');
      return [];
    }
    
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .in('id', validIds);
    
    console.log('contentService - Query response:', { data, error });
    console.log('contentService - Number of subjects found:', data?.length || 0);
    
    if (error) {
      console.error('contentService - Error fetching subjects:', error);
      throw error;
    }
    
    return data || [];
  },

  async getSubjectById(subjectId: string) {
    console.log('contentService - Fetching subject by ID:', subjectId);
    
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .maybeSingle();
    
    console.log('contentService - Subject data:', data);
    console.log('contentService - Subject error:', error);
    
    if (error && error.code !== 'PGRST116') throw error;
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
