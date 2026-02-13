import { useState, useEffect } from 'react';
import { contentService } from '@/services/content';
import type { Database } from '@/services/supabase';

type Topic = Database['topics'];

export function useTopics(subjectId: string | null) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!subjectId) {
        setTopics([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const data = await contentService.getTopicsForSubject(subjectId);
        setTopics(data);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError('Failed to load topics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [subjectId]);

  return { topics, loading, error };
}
