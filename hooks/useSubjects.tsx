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
        
        const subjectPromises = subjectIds.map(async (id) => {
          console.log('useSubjects - Fetching subject:', id);
          try {
            return await contentService.getSubjectById(id);
          } catch (err) {
            console.error('useSubjects - Error fetching subject', id, ':', err);
            return null;
          }
        });
        
        const subjectsData = await Promise.all(subjectPromises);
        console.log('useSubjects - Raw subjects data:', subjectsData);
        
        const validSubjects = subjectsData.filter(Boolean);
        console.log('useSubjects - Valid subjects:', validSubjects);
        
        setSubjects(validSubjects);
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
