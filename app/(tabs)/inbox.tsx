import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { useAuth } from '@/hooks/useAuth';
import { printService } from '@/services/print';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

const STATUS_COLORS = {
  pending: colors.warning,
  approved: colors.info,
  shipped: colors.primary,
  delivered: colors.success,
  rejected: colors.error,
} as const;

const STATUS_LABELS = {
  pending: 'Pending Review',
  approved: 'Approved',
  shipped: 'Shipped',
  delivered: 'Delivered',
  rejected: 'Rejected',
} as const;

export default function InboxScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [printRequests, setPrintRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPrintRequests();
    }
  }, [user]);

  const loadPrintRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const requests = await printService.getUserPrintRequests(user.id);
      setPrintRequests(requests);
    } catch (error) {
      console.error('Error loading print requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderPrintRequest = (request: any) => {
    const statusColor = STATUS_COLORS[request.status as keyof typeof STATUS_COLORS] || colors.textSecondary;
    const statusLabel = STATUS_LABELS[request.status as keyof typeof STATUS_LABELS] || request.status;

    return (
      <View key={request.id} style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.requestInfo}>
            <Text style={styles.requestNumber}>{request.request_number}</Text>
            <Text style={styles.requestDate}>{formatDate(request.created_at)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15', borderColor: statusColor + '40' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.requestBody}>
          <View style={styles.requestRow}>
            <MaterialIcons name="menu-book" size={20} color={colors.textSecondary} />
            <Text style={styles.requestSubject}>{request.subject_name}</Text>
          </View>

          <View style={styles.requestRow}>
            <MaterialIcons name="description" size={20} color={colors.textSecondary} />
            <Text style={styles.requestDetail}>
              {request.estimated_pages} pages · {request.print_type.replace('_', ' ')}
            </Text>
          </View>

          <View style={styles.requestRow}>
            <MaterialIcons name="payments" size={20} color={colors.textSecondary} />
            <Text style={styles.requestDetail}>
              LKR {request.total_amount.toLocaleString()} · {request.payment_method.replace('_', ' ')}
            </Text>
          </View>

          {request.tracking_number && (
            <View style={styles.requestRow}>
              <MaterialIcons name="local-shipping" size={20} color={colors.primary} />
              <Text style={[styles.requestDetail, { color: colors.primary }]}>
                Tracking: {request.tracking_number}
              </Text>
            </View>
          )}

          {request.rejection_reason && (
            <View style={[styles.requestRow, styles.rejectionRow]}>
              <MaterialIcons name="error" size={20} color={colors.error} />
              <Text style={[styles.requestDetail, { color: colors.error }]}>
                {request.rejection_reason}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <Screen>
        <View style={styles.emptyState}>
          <MaterialIcons name="inbox" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyText}>Please log in to view your inbox</Text>
        </View>
      </Screen>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <Text style={styles.headerSubtitle}>Print Requests & Messages</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : printRequests.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="inbox" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyText}>No print requests yet</Text>
          <Text style={styles.emptySubtext}>
            Request printed study materials from your subjects
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {printRequests.map(renderPrintRequest)}
        </ScrollView>
      )}

      {/* Future: Add "Request Print" button */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  requestCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  requestInfo: {
    gap: spacing.xs / 2,
  },
  requestNumber: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  requestDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  requestBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rejectionRow: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.error + '08',
    borderRadius: borderRadius.sm,
  },
  requestSubject: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    flex: 1,
  },
  requestDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
});
