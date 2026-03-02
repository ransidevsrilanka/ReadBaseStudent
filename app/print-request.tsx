import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { contentService } from '@/services/content';
import { printService } from '@/services/print';
import { useAlert } from '@/template';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

interface Subject {
  id: string;
  name: string;
  subject_code: string;
}

interface Topic {
  id: string;
  name: string;
}

interface SelectedItem {
  id: string;
  type: 'topic' | 'model_paper';
  title: string;
  pageCount: number;
  topicId?: string;
  noteId?: string;
}

const STEPS = ['Select Content', 'Review Price', 'Delivery Info', 'Payment'];

export default function PrintRequestScreen() {
  const { user, enrollment, userSubjects } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  
  // Price data
  const [totalPages, setTotalPages] = useState(0);
  const [pricePerPage, setPricePerPage] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  
  // Delivery details
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  
  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cod' | 'online'>('cod');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (enrollment?.full_name) setFullName(enrollment.full_name);
    if (enrollment?.phone) setPhone(enrollment.phone);
  }, [enrollment]);

  useEffect(() => {
    loadSubjects();
  }, [enrollment, userSubjects]);

  const loadSubjects = async () => {
    if (!enrollment || !userSubjects) {
      console.log('Print Request - Missing enrollment or userSubjects');
      setSubjects([]);
      setLoadingSubjects(false);
      return;
    }

    try {
      setLoadingSubjects(true);
      console.log('Print Request - Loading subjects for:', { enrollment, userSubjects });
      
      const subjectCodes = [
        { code: userSubjects.subject_1_code, medium: userSubjects.subject_1_medium },
        { code: userSubjects.subject_2_code, medium: userSubjects.subject_2_medium },
        { code: userSubjects.subject_3_code, medium: userSubjects.subject_3_medium },
      ].filter(s => s.code);

      console.log('Print Request - Subject codes:', subjectCodes);

      const fetchedSubjects = await contentService.getEnrolledSubjects(
        enrollment.grade,
        enrollment.medium,
        subjectCodes
      );

      console.log('Print Request - Fetched subjects:', fetchedSubjects);
      setSubjects(fetchedSubjects);
    } catch (error) {
      console.error('Print Request - Error loading subjects:', error);
      showAlert('Error', 'Failed to load subjects. Please try again.');
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSubjectSelect = async (subject: Subject) => {
    setSelectedSubject(subject);
    setLoading(true);

    try {
      const topicsData = await contentService.getTopicsForSubject(subject.id);
      setTopics(topicsData || []);
    } catch (error) {
      console.error('Error loading topics:', error);
      showAlert('Error', 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (item: SelectedItem) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleNextStep = async () => {
    if (currentStep === 0) {
      if (!selectedSubject || selectedItems.length === 0) {
        showAlert('Selection Required', 'Please select a subject and at least one topic.');
        return;
      }
      
      setLoading(true);
      try {
        const topicIds = selectedItems
          .filter(item => item.type === 'topic')
          .map(item => item.topicId!)
          .filter(Boolean);
        
        const paperIds = selectedItems
          .filter(item => item.type === 'model_paper')
          .map(item => item.noteId!)
          .filter(Boolean);

        const printType = topicIds.length > 0 && paperIds.length > 0 
          ? 'both' 
          : topicIds.length > 0 
            ? 'notes' 
            : 'model_papers';

        const priceData = await printService.calculatePrice(topicIds, paperIds, printType);
        
        setTotalPages(priceData.totalPages);
        setPricePerPage(priceData.pricePerPage);
        setSubtotal(priceData.subtotal);
        setDeliveryFee(priceData.deliveryFee);
        setTotalAmount(priceData.totalAmount);

        if (enrollment?.grade === 'al_combo' && !enrollment?.combo_first_print_used) {
          const discountAmount = Math.round(priceData.subtotal * 0.1);
          setDiscount(discountAmount);
          setTotalAmount(priceData.subtotal - discountAmount);
        }
        
        setCurrentStep(1);
      } catch (error) {
        console.error('Error calculating price:', error);
        showAlert('Error', 'Failed to calculate price. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!fullName || !phone || !address || !city) {
        showAlert('Details Required', 'Please fill in all delivery details.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      await handleSubmit();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user || !enrollment || !selectedSubject) return;

    setSubmitting(true);

    try {
      const topicIds = selectedItems.filter(item => item.type === 'topic').map(item => item.topicId!).filter(Boolean);
      const paperIds = selectedItems.filter(item => item.type === 'model_paper').map(item => item.noteId!).filter(Boolean);
      const paperTitles = selectedItems.filter(item => item.type === 'model_paper').map(item => item.title);

      const printType = topicIds.length > 0 && paperIds.length > 0 ? 'both' : topicIds.length > 0 ? 'notes' : 'model_papers';

      const requestData = {
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        printType,
        topicIds,
        selectedPaperIds: paperIds,
        selectedPaperTitles: paperTitles,
        fullName,
        phone,
        address,
        city,
        paymentMethod,
        estimatedPages: totalPages,
        estimatedPrice: subtotal,
        deliveryFee: discount > 0 ? 0 : deliveryFee,
        totalAmount,
      };

      const items = selectedItems.map(item => ({
        type: item.type,
        topicId: item.topicId,
        noteId: item.noteId,
        title: item.title,
        pageCount: item.pageCount,
        pricePerPage,
        subtotal: item.pageCount * pricePerPage,
      }));

      const result = await printService.submitPrintRequest(user.id, enrollment.id, requestData, items);

      showAlert(
        'Request Submitted',
        `Your print request ${result.requestNumber} has been submitted successfully.`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/inbox') }]
      );
    } catch (error) {
      console.error('Error submitting print request:', error);
      showAlert('Error', 'Failed to submit print request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, index) => (
        <View key={index} style={styles.stepItem}>
          <View style={[styles.stepCircle, index <= currentStep && styles.stepCircleActive]}>
            {index < currentStep ? (
              <MaterialIcons name="check" size={16} color={colors.textInverse} />
            ) : (
              <Text style={[styles.stepNumber, index <= currentStep && styles.stepNumberActive]}>
                {index + 1}
              </Text>
            )}
          </View>
          <Text style={[styles.stepLabel, index === currentStep && styles.stepLabelActive]}>
            {step}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Select Study Materials to Print</Text>
      
      {!selectedSubject ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose a Subject</Text>
          {loadingSubjects ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading subjects...</Text>
            </View>
          ) : subjects.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="school" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No subjects available</Text>
              <Text style={styles.emptySubtext}>Please contact support if this is an error</Text>
            </View>
          ) : (
            subjects.map(subject => (
              <Pressable
                key={subject.id}
                style={({ pressed }) => [styles.subjectCard, pressed && styles.cardPressed]}
                onPress={() => handleSubjectSelect(subject)}
              >
                <MaterialIcons name="menu-book" size={24} color={colors.primary} />
                <Text style={styles.subjectName}>{subject.name}</Text>
                <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
              </Pressable>
            ))
          )}
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.selectedSubjectBar}>
            <View style={styles.selectedSubjectInfo}>
              <MaterialIcons name="menu-book" size={20} color={colors.primary} />
              <Text style={styles.selectedSubjectName}>{selectedSubject.name}</Text>
            </View>
            <Pressable onPress={() => {
              setSelectedSubject(null);
              setTopics([]);
              setSelectedItems([]);
            }}>
              <MaterialIcons name="close" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading topics...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Select Topics</Text>
              <Text style={styles.sectionSubtitle}>
                All notes within selected topics will be printed
              </Text>
              
              {topics.map(topic => {
                const isSelected = selectedItems.some(item => item.type === 'topic' && item.topicId === topic.id);
                
                return (
                  <Pressable
                    key={topic.id}
                    style={({ pressed }) => [
                      styles.itemCard,
                      isSelected && styles.itemCardSelected,
                      pressed && styles.cardPressed,
                    ]}
                    onPress={() => toggleItem({
                      id: topic.id,
                      type: 'topic',
                      title: topic.name,
                      pageCount: 0,
                      topicId: topic.id,
                    })}
                  >
                    <View style={styles.checkbox}>
                      {isSelected && <MaterialIcons name="check" size={16} color={colors.primary} />}
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemTitle}>{topic.name}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </>
          )}
        </View>
      )}

      {selectedItems.length > 0 && (
        <View style={styles.selectionSummary}>
          <MaterialIcons name="check-circle" size={20} color={colors.success} />
          <Text style={styles.selectionText}>
            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Review Your Order</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Selected Items</Text>
        {selectedItems.map((item, index) => (
          <View key={item.id} style={styles.reviewItem}>
            <MaterialIcons 
              name={item.type === 'topic' ? 'folder' : 'description'} 
              size={20} 
              color={colors.textSecondary} 
            />
            <Text style={styles.reviewItemText}>{item.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.priceSection}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total Pages</Text>
          <Text style={styles.priceValue}>{totalPages}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Price per Page</Text>
          <Text style={styles.priceValue}>LKR {pricePerPage}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>LKR {subtotal.toLocaleString()}</Text>
        </View>
        
        {discount > 0 && (
          <View style={[styles.priceRow, styles.discountRow]}>
            <View style={styles.discountLabel}>
              <MaterialIcons name="local-offer" size={16} color={colors.success} />
              <Text style={[styles.priceLabel, { color: colors.success }]}>
                First Print Discount (10%)
              </Text>
            </View>
            <Text style={[styles.priceValue, { color: colors.success }]}>
              -LKR {discount.toLocaleString()}
            </Text>
          </View>
        )}
        
        <View style={styles.priceRow}>
          <View style={styles.deliveryLabel}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            {discount > 0 && (
              <Text style={styles.freeShippingBadge}>FREE</Text>
            )}
          </View>
          <Text style={[styles.priceValue, discount > 0 && styles.strikethrough]}>
            LKR {deliveryFee.toLocaleString()}
          </Text>
        </View>

        <View style={styles.divider} />
        
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>LKR {totalAmount.toLocaleString()}</Text>
        </View>
      </View>

      {discount > 0 && (
        <View style={styles.perkBanner}>
          <MaterialIcons name="workspace-premium" size={24} color={colors.accent} />
          <View style={styles.perkText}>
            <Text style={styles.perkTitle}>Combo First-Print Perk Applied!</Text>
            <Text style={styles.perkSubtitle}>10% discount + free delivery</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Delivery Information</Text>

      <View style={styles.section}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={styles.inputLabel}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="07XXXXXXXX"
          placeholderTextColor={colors.textTertiary}
          keyboardType="phone-pad"
        />

        <Text style={styles.inputLabel}>Delivery Address *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={address}
          onChangeText={setAddress}
          placeholder="Street address, apartment/unit"
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.inputLabel}>City *</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="Enter your city"
          placeholderTextColor={colors.textTertiary}
        />
      </View>
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Choose Payment Method</Text>

      <View style={styles.section}>
        <Pressable
          style={({ pressed }) => [
            styles.paymentOption,
            paymentMethod === 'cod' && styles.paymentOptionSelected,
            pressed && styles.cardPressed,
          ]}
          onPress={() => setPaymentMethod('cod')}
        >
          <View style={styles.radioOuter}>
            {paymentMethod === 'cod' && <View style={styles.radioInner} />}
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Cash on Delivery</Text>
            <Text style={styles.paymentSubtitle}>Pay when you receive the printouts</Text>
            {discount === 0 && (
              <Text style={styles.paymentNote}>+ LKR 100 COD fee</Text>
            )}
          </View>
          <MaterialIcons name="local-shipping" size={24} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.paymentOption,
            paymentMethod === 'bank_transfer' && styles.paymentOptionSelected,
            pressed && styles.cardPressed,
          ]}
          onPress={() => setPaymentMethod('bank_transfer')}
        >
          <View style={styles.radioOuter}>
            {paymentMethod === 'bank_transfer' && <View style={styles.radioInner} />}
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Bank Transfer</Text>
            <Text style={styles.paymentSubtitle}>Bank details via inbox</Text>
          </View>
          <MaterialIcons name="account-balance" size={24} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.paymentOption,
            paymentMethod === 'online' && styles.paymentOptionSelected,
            pressed && styles.cardPressed,
          ]}
          onPress={() => setPaymentMethod('online')}
        >
          <View style={styles.radioOuter}>
            {paymentMethod === 'online' && <View style={styles.radioInner} />}
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>PayHere (Card/Mobile)</Text>
            <Text style={styles.paymentSubtitle}>Pay securely online</Text>
            <Text style={styles.paymentNote}>Visa, MasterCard, Mobile Banking</Text>
          </View>
          <MaterialIcons name="credit-card" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.orderSummary}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subject</Text>
          <Text style={styles.summaryValue}>{selectedSubject?.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items</Text>
          <Text style={styles.summaryValue}>{selectedItems.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Pages</Text>
          <Text style={styles.summaryValue}>{totalPages}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryTotal}>Total Amount</Text>
          <Text style={styles.summaryTotalValue}>LKR {totalAmount.toLocaleString()}</Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          headerTitle: 'Request Print',
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }} 
      />
      
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {renderStepIndicator()}

        <View style={styles.content}>
          {currentStep === 0 && renderStep1()}
          {currentStep === 1 && renderStep2()}
          {currentStep === 2 && renderStep3()}
          {currentStep === 3 && renderStep4()}
        </View>

        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.navButton,
                styles.backButton,
                pressed && styles.navButtonPressed,
              ]}
              onPress={handlePreviousStep}
            >
              <MaterialIcons name="arrow-back" size={20} color={colors.text} />
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          )}
          
          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              styles.nextButton,
              currentStep === 0 && styles.nextButtonFull,
              pressed && styles.navButtonPressed,
              (loading || submitting) && styles.navButtonDisabled,
            ]}
            onPress={handleNextStep}
            disabled={loading || submitting}
          >
            {loading || submitting ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {currentStep === 3 ? 'Submit Request' : 'Continue'}
                </Text>
                {currentStep < 3 && (
                  <MaterialIcons name="arrow-forward" size={20} color={colors.textInverse} />
                )}
              </>
            )}
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepItem: {
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.inactive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textTertiary,
  },
  stepNumberActive: {
    color: colors.textInverse,
  },
  stepLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    padding: spacing.md,
  },
  stepTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.sm,
  },
  cardPressed: {
    opacity: 0.7,
  },
  subjectName: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  selectedSubjectBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    marginBottom: spacing.lg,
  },
  selectedSubjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectedSubjectName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.sm,
  },
  itemCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  selectionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.success + '15',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  selectionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.success,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  reviewItemText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  priceSection: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountRow: {
    backgroundColor: colors.success + '08',
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  discountLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  deliveryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  freeShippingBadge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  priceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  totalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  perkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.accent + '15',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent + '40',
    marginTop: spacing.md,
  },
  perkText: {
    flex: 1,
  },
  perkTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent,
    marginBottom: spacing.xs / 2,
  },
  perkSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.sm,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  paymentSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  paymentNote: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs / 2,
  },
  orderSummary: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  summaryTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  summaryTotal: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  summaryTotalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  backButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  nextButton: {
    flex: 2,
    backgroundColor: colors.primary,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textInverse,
  },
  navButtonPressed: {
    opacity: 0.8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
});
