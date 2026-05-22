import { supabase } from './supabase';

export const contentService = {
  /**
   * Fetches subjects based on enrollment data and selected subject codes
   * Properly handles grade, medium, and per-subject medium overrides
   */
  async getEnrolledSubjects(
    enrollmentGrade: string,
    enrollmentMedium: string,
    subjectCodes: { code: string; medium?: string }[]
  ) {
    console.log('contentService - Fetching enrolled subjects:', {
      enrollmentGrade,
      enrollmentMedium,
      subjectCodes,
    });

    if (!subjectCodes || subjectCodes.length === 0) {
      return [];
    }

    const codes = subjectCodes.map(s => s.code).filter(Boolean);
    if (codes.length === 0) {
      return [];
    }

    // For combo grade, fetch from both al_grade12 and al_grade13
    const grades = enrollmentGrade === 'al_combo' 
      ? ['al_grade12', 'al_grade13'] 
      : [enrollmentGrade];

    console.log('contentService - Querying grades:', grades);

    // Build queries for each unique medium
    const mediumsToQuery = new Set<string>();
    
    subjectCodes.forEach(s => {
      // Use per-subject medium override if available, else enrollment medium
      const medium = s.medium || enrollmentMedium;
      mediumsToQuery.add(medium);
    });

    console.log('contentService - Mediums to query:', Array.from(mediumsToQuery));

    // Fetch subjects for all grade/medium combinations
    const promises = Array.from(mediumsToQuery).flatMap(medium =>
      grades.map(grade =>
        supabase
          .from('subjects')
          .select('*')
          .eq('grade', grade)
          .eq('medium', medium)
          .in('subject_code', codes)
          .eq('is_active', true)
      )
    );

    const results = await Promise.all(promises);
    
    // Combine all results
    const allSubjects = results.flatMap(r => r.data || []);
    
    console.log('contentService - Raw subjects found:', allSubjects.length);

    // Match subjects to requested codes with proper medium
    const matchedSubjects = subjectCodes
      .map(({ code, medium }) => {
        const targetMedium = medium || enrollmentMedium;
        return allSubjects.find(
          s => s.subject_code === code && s.medium === targetMedium
        );
      })
      .filter(Boolean);

    console.log('contentService - Matched subjects:', matchedSubjects.length);
    
    return matchedSubjects;
  },

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
