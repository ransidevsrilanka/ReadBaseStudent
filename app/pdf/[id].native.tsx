import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Pdf from 'react-native-pdf';
import { pdfService } from '@/services/pdf';
import { useAuth } from '@/hooks/useAuth';
import { useAlert } from '@/template';
import { colors, spacing, typography } from '@/constants/theme';

export default function PDFViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { enrollment } = useAuth();
  const { showAlert } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [canDownload, setCanDownload] = useState(false);
  const [watermark, setWatermark] = useState<string>('');
  const [noteTitle, setNoteTitle] = useState<string>('Note');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
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

    try {
      await pdfService.logDownload(id);
      showAlert('Download Started', 'The PDF is being downloaded to your device.');
    } catch (err) {
      showAlert('Download Failed', 'Unable to download PDF at this time.');
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

        {/* PDF Viewer */}
        <Pdf
          source={{ uri: signedUrl, cache: true }}
          style={styles.pdf}
          onLoadComplete={(numberOfPages) => {
            setTotalPages(numberOfPages);
          }}
          onPageChanged={(page) => {
            setCurrentPage(page);
          }}
          onError={(error) => {
            console.error('PDF Error:', error);
            setError('Failed to render PDF');
          }}
          trustAllCerts={false}
          enablePaging
          horizontal={false}
        />

        {/* Page Counter */}
        <View style={styles.pageCounter}>
          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>
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
  pdf: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageCounter: {
    position: 'absolute',
    bottom: spacing.lg,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
  },
  pageText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textInverse,
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
});
