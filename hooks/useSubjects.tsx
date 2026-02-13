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
      console.log('useSubjects - Subject IDs:', subjectIds);
      
      if (!subjectIds || subjectIds.length === 0) {
        console.log('useSubjects - No subject IDs, skipping fetch');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('useSubjects - Fetching subjects for IDs:', subjectIds);
        
        const subjectPromises = subjectIds.map((id) => {
          console.log('useSubjects - Fetching subject:', id);
          return contentService.getSubjectById(id);
        });
        
        const subjectsData = await Promise.all(subjectPromises);
        console.log('useSubjects - Subjects data:', subjectsData);
        
        setSubjects(subjectsData.filter(Boolean));
      } catch (err) {
        console.error('Error fetching subjects:', err);
        console.error('Error details:', JSON.stringify(err, null, 2));
        setError('Failed to load subjects');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [subjectIds.join(',')]);

  return { subjects, loading, error };
}
