import { Platform } from 'react-native';

const supabaseModule = Platform.OS === 'web' 
  ? require('./supabase.web')
  : require('./supabase.native');

const { supabase } = supabaseModule;

export interface PDFAccessResponse {
  signedUrl: string;
  canDownload: boolean;
  watermark: string;
  noteTitle: string;
}

export const pdfService = {
  /**
   * Get signed URL and access permissions for a PDF note
   * Handles tier-based access control server-side
   */
  async getNotePDFAccess(noteId: string): Promise<PDFAccessResponse> {
    const { data, error } = await supabase.functions.invoke('serve-pdf', {
      body: { noteId },
    });
    
    if (error) {
      throw new Error(error.message || 'Failed to access PDF');
    }
    
    return data;
  },

  /**
   * Log PDF download attempt
   */
  async logDownload(noteId: string) {
    const { error } = await supabase
      .from('download_logs')
      .insert({
        note_id: noteId,
        downloaded_at: new Date().toISOString(),
      });
    
    if (error) {
      console.error('Failed to log download:', error);
    }
  },
};
