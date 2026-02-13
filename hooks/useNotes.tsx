import { useState, useEffect } from 'react';
import { contentService } from '@/services/content';

interface Note {
  id: string;
  topic_id: string;
  title: string;
  file_url: string;
  min_tier: 'starter' | 'standard' | 'lifetime';
  page_count: number;
  storage_provider: 'supabase' | 'external';
  is_active: boolean;
  created_at: string;
}

export function useNotes(topicId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!topicId) {
      setLoading(false);
      return;
    }

    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await contentService.getNotesForTopic(topicId);
        setNotes(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load notes');
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [topicId]);

  return { notes, loading, error };
}
