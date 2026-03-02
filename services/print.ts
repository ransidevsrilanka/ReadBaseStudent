import { supabase } from './supabase';
import { PRINT_REQUEST_PREFIX } from '@/constants/config';

interface PrintItem {
  type: 'topic' | 'model_paper';
  topicId?: string;
  noteId?: string;
  title: string;
  pageCount: number;
  pricePerPage: number;
  subtotal: number;
}

interface PrintRequestData {
  subjectId: string;
  subjectName: string;
  printType: 'notes' | 'model_papers' | 'both';
  topicIds: string[];
  selectedPaperIds?: string[];
  selectedPaperTitles?: string[];
  fullName: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: 'bank_transfer' | 'cod' | 'online';
  estimatedPages: number;
  estimatedPrice: number;
  deliveryFee: number;
  totalAmount: number;
}

export const printService = {
  /**
   * Calculate print price for selected content
   */
  async calculatePrice(
    topicIds: string[],
    selectedPaperIds?: string[],
    printType: 'notes' | 'model_papers' | 'both' = 'notes'
  ) {
    console.log('printService - Calculating price:', { topicIds, selectedPaperIds, printType });

    const { data, error } = await supabase.functions.invoke('calculate-print-price', {
      body: {
        topic_ids: topicIds,
        selected_paper_ids: selectedPaperIds || [],
        print_type: printType,
      },
    });

    if (error) {
      console.error('printService - Error calculating price:', error);
      throw error;
    }

    return data as {
      totalPages: number;
      pricePerPage: number;
      subtotal: number;
      deliveryFee: number;
      totalAmount: number;
    };
  },

  /**
   * Get print settings (pricing config)
   */
  async getPrintSettings() {
    const { data, error } = await supabase
      .from('print_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('printService - Error fetching print settings:', error);
      throw error;
    }

    return data;
  },

  /**
   * Submit a print request
   */
  async submitPrintRequest(
    userId: string,
    enrollmentId: string,
    requestData: PrintRequestData,
    items: PrintItem[]
  ) {
    // Generate unique request number
    const requestNumber = PRINT_REQUEST_PREFIX + Math.floor(10000 + Math.random() * 90000);

    console.log('printService - Submitting print request:', { userId, requestNumber, requestData });

    // Insert print request
    const { data: printRequest, error: requestError } = await supabase
      .from('print_requests')
      .insert({
        user_id: userId,
        enrollment_id: enrollmentId,
        subject_id: requestData.subjectId,
        subject_name: requestData.subjectName,
        print_type: requestData.printType,
        topic_ids: requestData.topicIds,
        selected_paper_ids: requestData.selectedPaperIds || [],
        selected_paper_titles: requestData.selectedPaperTitles || [],
        full_name: requestData.fullName,
        phone: requestData.phone,
        address: requestData.address,
        city: requestData.city,
        payment_method: requestData.paymentMethod,
        estimated_pages: requestData.estimatedPages,
        estimated_price: requestData.estimatedPrice,
        delivery_fee: requestData.deliveryFee,
        total_amount: requestData.totalAmount,
        request_number: requestNumber,
        status: 'pending',
      })
      .select()
      .single();

    if (requestError) {
      console.error('printService - Error creating print request:', requestError);
      throw requestError;
    }

    // Insert print request items
    const itemsData = items.map(item => ({
      request_id: printRequest.id,
      item_type: item.type,
      topic_id: item.topicId || null,
      note_id: item.noteId || null,
      title: item.title,
      page_count: item.pageCount,
      price_per_page: item.pricePerPage,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from('print_request_items')
      .insert(itemsData);

    if (itemsError) {
      console.error('printService - Error inserting print request items:', itemsError);
      throw itemsError;
    }

    return {
      requestId: printRequest.id,
      requestNumber,
    };
  },

  /**
   * Get user's print requests
   */
  async getUserPrintRequests(userId: string) {
    const { data, error } = await supabase
      .from('print_requests')
      .select('*, print_request_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('printService - Error fetching print requests:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Get a single print request by ID
   */
  async getPrintRequestById(requestId: string) {
    const { data, error } = await supabase
      .from('print_requests')
      .select('*, print_request_items(*)')
      .eq('id', requestId)
      .single();

    if (error) {
      console.error('printService - Error fetching print request:', error);
      throw error;
    }

    return data;
  },
};
