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
      if (!subjectIds || subjectIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const subjectPromises = subjectIds.map((id) =>
          contentService.getSubjectById(id)
        );
        
        const subjectsData = await Promise.all(subjectPromises);
        setSubjects(subjectsData.filter(Boolean));
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [subjectIds.join(',')]);

  return { subjects, loading, error };
}
