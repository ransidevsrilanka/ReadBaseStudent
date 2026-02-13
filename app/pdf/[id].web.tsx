import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { pdfService } from '@/services/pdf';
import { useAlert } from '@/template';
import { colors, spacing, typography } from '@/constants/theme';

export default function PDFViewerWebScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { showAlert } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [canDownload, setCanDownload] = useState(false);
  const [watermark, setWatermark] = useState<string>('');
  const [noteTitle, setNoteTitle] = useState<string>('Note');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPDFAccess = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await pdfService.getNotePDFAccess(id);
        
        setSignedUrl(data.signedUrl);
        setCanDownload(data.canDownload);
        setWatermark(data.watermark);
        setNoteTitle(data.noteTitle);
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to load PDF';
        setError(errorMessage);
        showAlert('Access Denied', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPDFAccess();
  }, [id]);

  const handleDownload = async () => {
    if (!canDownload) {
      showAlert(
        'Download Unavailable',
        'PDF downloads are only available for Gold and Platinum tier members.'
      );
      return;
    }

    if (signedUrl) {
      // Open in new tab for download
      window.open(signedUrl, '_blank');
      await pdfService.logDownload(id);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, headerTitle: 'Loading...' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading PDF...</Text>
        </View>
      </>
    );
  }

  if (error || !signedUrl) {
    return (
      <>
        <Stack.Screen options={{ headerShown: true, headerTitle: 'Error' }} />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error || 'PDF not available'}</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          headerTitle: noteTitle,
          headerRight: () => (
            <Pressable onPress={handleDownload} style={styles.downloadButton}>
              <MaterialIcons 
                name="download" 
                size={24} 
                color={canDownload ? colors.primary : colors.textTertiary} 
              />
            </Pressable>
          ),
        }} 
      />
      
      <View style={styles.container}>
        {/* Watermark Banner */}
        <View style={styles.watermarkBanner}>
          <MaterialIcons name="security" size={16} color={colors.textSecondary} />
          <Text style={styles.watermarkText} numberOfLines={1}>
            {watermark}
          </Text>
        </View>

        {/* PDF Viewer using iframe for web */}
        <View style={styles.iframeContainer}>
          {Platform.OS === 'web' && (
            <iframe
              src={signedUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: colors.background,
              } as any}
              title={noteTitle}
            />
          )}
        </View>

        {/* Security Notice */}
        {!canDownload && (
          <View style={styles.securityNotice}>
            <MaterialIcons name="info" size={16} color={colors.warning} />
            <Text style={styles.securityText}>
              Upgrade to Gold or Platinum to download PDFs
            </Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
  },
  watermarkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  watermarkText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  downloadButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.warningLight,
    borderTopWidth: 1,
    borderTopColor: colors.warning,
  },
  securityText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.warningDark,
  },
  iframeContainer: {
    flex: 1,
    position: 'relative',
    width: '100%',
  },
});
