import { useState, useEffect } from 'react';
import { contentService } from '@/services/content';
import type { Database } from '@/services/supabase';

type Subject = Database['subjects'];

export function useSubjects(subjectIds: string[]) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      console.log('useSubjects - Received subject IDs:', subjectIds);
      console.log('useSubjects - IDs type check:', subjectIds.map(id => ({ id, type: typeof id, value: id })));
      
      if (!subjectIds || subjectIds.length === 0) {
        console.log('useSubjects - No subject IDs provided');
        setSubjects([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Use batch query instead of individual queries
        const subjectsData = await contentService.getSubjectsByIds(subjectIds);
        
        console.log('useSubjects - Fetched subjects:', subjectsData);
        console.log('useSubjects - Subject count:', subjectsData.length);
        
        setSubjects(subjectsData);
      } catch (err) {
        console.error('useSubjects - Error:', err);
        console.error('useSubjects - Error details:', JSON.stringify(err, null, 2));
        setError(err instanceof Error ? err.message : 'Failed to load subjects');
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [subjectIds.join(',')]);

  console.log('useSubjects - Current state:', { subjectsCount: subjects.length, loading, error });

  return { subjects, loading, error };
}
