import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Clipboard,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';

interface CartItem {
  _id: string;
  name: string;
  serviceName?: string;
  instructorName?: string;
  description?: string;
  price: number;
  schedule?: any[];
  location?: string;
  type: 'class' | 'service' | 'membership';
}

const BANK_INFO = {
  bankName: 'Vietcombank',
  accountNumber: '1234567890',
  accountName: 'NGUYEN VAN A',
};

const CartScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [processing, setProcessing] = useState(false);

  const fetchCartItems = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      
      // Thêm timeout cho API calls
      const timeout = (ms: number) => new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), ms)
      );
      
      const fetchWithTimeout = (promise: Promise<any>) => 
        Promise.race([promise, timeout(10000)]);
      
      // Lấy lớp học, dịch vụ, gói tập và payments với timeout
      const [classesData, servicesData, membershipsData, paymentsData] = await Promise.all([
        fetchWithTimeout(apiService.get(`/classes/user/${user._id}`)).catch(() => []),
        fetchWithTimeout(apiService.get(`/services/user/${user._id}`)).catch(() => []),
        fetchWithTimeout(apiService.get(`/memberships/user/${user._id}`)).catch(() => []),
        fetchWithTimeout(apiService.get('/payments/user')).catch(() => [])
      ]);
      
      // Lọc các payment đang pending hoặc completed
      const activePayments = Array.isArray(paymentsData)
        ? paymentsData.filter((p: any) => p.status === 'pending' || p.status === 'completed')
        : [];
      
      // Tạo Set chứa các registrationId đang có payment active
      const activePaymentIds = new Set(
        activePayments.flatMap((p: any) => p.registrationIds || [])
      );
      
      // Hàm kiểm tra item có thể thanh toán không
      const canPayItem = (itemId: string, paymentStatus: boolean) => {
        // Nếu đã thanh toán thành công thì không hiện trong giỏ
        if (paymentStatus) return false;
        // Nếu đang có payment pending/completed thì không hiện trong giỏ
        if (activePaymentIds.has(itemId)) return false;
        return true;
      };
      
      // Lọc các lớp có thể thanh toán (chưa thanh toán và không có payment pending)
      const unpaidClasses = Array.isArray(classesData) 
        ? classesData
            .filter((item: any) => canPayItem(item._id, item.paymentStatus))
            .map((item: any) => ({
              ...item,
              type: 'class'
            }))
        : [];
      
      // Lọc các dịch vụ có thể thanh toán
      const unpaidServices = Array.isArray(servicesData)
        ? servicesData
            .filter((item: any) => canPayItem(item._id, item.paymentStatus))
            .map((item: any) => ({
              ...item,
              type: 'service'
            }))
        : [];
      
      // Lọc các gói tập có thể thanh toán
      const unpaidMemberships = Array.isArray(membershipsData)
        ? membershipsData
            .filter((item: any) => canPayItem(item._id, item.paymentStatus))
            .map((item: any) => ({
              _id: item._id,
              name: `Gói ${item.type}`,
              price: item.price,
              description: `${item.type} - ${new Date(item.startDate).toLocaleDateString('vi-VN')} đến ${new Date(item.endDate).toLocaleDateString('vi-VN')}`,
              type: 'membership'
            }))
        : [];
      
      // Kết hợp cả ba
      setCartItems([...unpaidClasses, ...unpaidServices, ...unpaidMemberships]);
    } catch (error) {
      console.error('Error fetching cart:', error);
      Alert.alert('Lỗi', 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useFocusEffect(
    useCallback(() => {
      fetchCartItems();
    }, [fetchCartItems])
  );

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const calculateTotal = () => {
    return cartItems
      .filter(item => selectedItems[item._id])
      .reduce((sum, item) => sum + item.price, 0);
  };

  const handleCheckout = () => {
    const selected = cartItems.filter(item => selectedItems[item._id]);
    
    if (selected.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một mục để thanh toán');
      return;
    }

    if (!user?._id) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
      return;
    }

    setShowPaymentModal(true);
  };

  const handleSelectPaymentMethod = (method: 'Chuyển khoản' | 'Tiền mặt') => {
    if (method === 'Tiền mặt') {
      handleCashPayment();
    } else {
      setPaymentStep(2);
    }
  };

  const handleCashPayment = async () => {
    try {
      setProcessing(true);
      const selected = cartItems.filter(item => selectedItems[item._id]);
      const registrationIds = selected.map(item => item._id);
      
      const paymentData = {
        userId: user?._id,
        amount: calculateTotal(),
        method: 'Tiền mặt',
        status: 'pending',
        description: `Thanh toán giỏ hàng (${selected.length} mục)`,
        registrationIds,
        paymentType: 'mixed',
      };

      await apiService.post('/payments', paymentData);
      
      Alert.alert(
        'Thành công',
        'Đơn hàng của bạn đã được tạo với trạng thái "Chờ xác nhận". Vui lòng thanh toán tiền mặt tại quầy trong vòng 24h. Kiểm tra trạng thái tại màn hình Lịch sử.',
        [{ text: 'OK', onPress: () => {
          setShowPaymentModal(false);
          setPaymentStep(1);
          setSelectedItems({});
          fetchCartItems();
        }}]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo đơn hàng');
    } finally {
      setProcessing(false);
    }
  };

  const handleBankTransfer = async () => {
    try {
      setProcessing(true);
      const selected = cartItems.filter(item => selectedItems[item._id]);
      const registrationIds = selected.map(item => item._id);
      
      // Determine payment type based on cart items
      let paymentType = 'class'; // Default
      const hasClass = selected.some(item => item.type === 'class');
      const hasMembership = selected.some(item => item.type === 'membership');
      const hasService = selected.some(item => item.type === 'service');
      
      if (hasMembership && hasClass) {
        paymentType = 'membership_and_class';
      } else if (hasMembership) {
        paymentType = 'membership';
      } else if (hasService) {
        paymentType = 'personal_training';
      } else {
        paymentType = 'class';
      }
      
      const paymentData = {
        userId: user?._id,
        amount: calculateTotal(),
        method: 'Chuyển khoản',
        status: 'pending',
        description: `Thanh toán giỏ hàng (${selected.length} mục)`,
        registrationIds,
        paymentType,
      };

      await apiService.post('/payments', paymentData);
      
      Alert.alert(
        'Thành công',
        'Đơn hàng đã được tạo với trạng thái "Chờ xác nhận". Vui lòng chuyển khoản theo thông tin đã cung cấp. Admin sẽ xác nhận sau khi nhận thanh toán. Kiểm tra trạng thái tại màn hình Lịch sử.',
        [{ text: 'OK', onPress: () => {
          setShowPaymentModal(false);
          setPaymentStep(1);
          setSelectedItems({});
          fetchCartItems();
        }}]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo đơn hàng');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Đã sao chép', `${label} đã được sao chép`);
  };

  const getTransferContent = () => {
    const selected = cartItems.filter(item => selectedItems[item._id]);
    const classCount = selected.filter(item => item.type === 'class').length;
    const serviceCount = selected.filter(item => item.type === 'service').length;
    const membershipCount = selected.filter(item => item.type === 'membership').length;
    
    if (classCount > 0 && serviceCount === 0 && membershipCount === 0) return 'GIOHANG LOPHOC';
    if (serviceCount > 0 && classCount === 0 && membershipCount === 0) return 'GIOHANG DICHVU';
    if (membershipCount > 0 && classCount === 0 && serviceCount === 0) return 'GIOHANG GOITAP';
    return 'GIOHANG MIXED';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <LinearGradient
          colors={['#581c87', '#1e40af']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.loadingHeader}
        >
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
        </LinearGradient>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Icon name="cart-outline" size={80} color="#9CA3AF" />
        </View>
        <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
        <Text style={styles.emptyText}>Bạn chưa có lớp học nào trong giỏ hàng</Text>
        <TouchableOpacity 
          style={styles.browseButton}
          onPress={() => navigation.navigate('Main', { screen: 'Classes' })}
        >
          <Text style={styles.browseButtonText}>Xem lớp học</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#581c87', '#1e40af']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Icon name="cart" size={24} color="#FFFFFF" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
        </View>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Cart Items */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.map((item) => (
          <TouchableOpacity
            key={item._id}
            style={styles.cartItem}
            onPress={() => toggleItemSelection(item._id)}
            activeOpacity={0.7}
          >
            <View style={styles.checkbox}>
              {selectedItems[item._id] ? (
                <Icon name="checkbox" size={28} color="#10b981" />
              ) : (
                <Icon name="square-outline" size={28} color="#9CA3AF" />
              )}
            </View>
            
            <View style={styles.itemContent}>
              <View style={styles.itemTypeTag}>
                <Text style={styles.itemTypeText}>
                  {item.type === 'class' && '📚 Lớp học'}
                  {item.type === 'service' && '💎 Dịch vụ'}
                  {item.type === 'membership' && '👑 Gói tập'}
                </Text>
              </View>
              <Text style={styles.itemName}>{item.name}</Text>
              
              {item.type === 'class' ? (
                <>
                  {item.serviceName && (
                    <Text style={styles.itemService}>{item.serviceName}</Text>
                  )}
                  {item.instructorName && (
                    <View style={styles.itemRow}>
                      <Icon name="person" size={16} color="#9CA3AF" />
                      <Text style={styles.itemInstructor}>{item.instructorName}</Text>
                    </View>
                  )}
                  {item.location && (
                    <View style={styles.itemRow}>
                      <Icon name="location" size={16} color="#9CA3AF" />
                      <Text style={styles.itemLocation}>{item.location}</Text>
                    </View>
                  )}
                </>
              ) : (
                <>
                  {item.description && (
                    <Text style={styles.itemService} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </>
              )}
              
              <View style={styles.priceTag}>
                <Text style={styles.itemPrice}>
                  {item.price.toLocaleString('vi-VN')}đ
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer - Total and Checkout */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalAmount}>
            {calculateTotal().toLocaleString('vi-VN')}đ
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={Object.values(selectedItems).every(v => !v)}
        >
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={[
              styles.checkoutButton,
              Object.values(selectedItems).every(v => !v) && styles.checkoutButtonDisabled
            ]}
          >
            <Text style={styles.checkoutButtonText}>
              Thanh toán ({Object.values(selectedItems).filter(Boolean).length})
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {paymentStep === 1 && 'Chọn phương thức thanh toán'}
                {paymentStep === 2 && 'Thông tin chuyển khoản'}
              </Text>
              <TouchableOpacity onPress={() => { setShowPaymentModal(false); setPaymentStep(1); }} disabled={processing}>
                <Icon name="close" size={28} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {paymentStep === 1 && (
                <View>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderInfoTitle}>Thông tin đơn hàng</Text>
                    {cartItems.filter(item => selectedItems[item._id]).map((item, index) => (
                      <View key={index} style={styles.modalItemRow}>
                        <Text style={styles.itemTypeIcon}>
                          {item.type === 'class' && '📚'}
                          {item.type === 'service' && '💎'}
                          {item.type === 'membership' && '👑'}
                        </Text>
                        <Text style={styles.itemNameText} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.itemPriceText}>{item.price.toLocaleString('vi-VN')}đ</Text>
                      </View>
                    ))}
                    <View style={[styles.orderInfoRow, styles.totalRow]}>
                      <Text style={styles.orderInfoLabel}>Tổng tiền:</Text>
                      <Text style={styles.orderInfoTotal}>{calculateTotal().toLocaleString('vi-VN')}đ</Text>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>

                  <TouchableOpacity
                    style={styles.methodCard}
                    onPress={() => handleSelectPaymentMethod('Chuyển khoản')}
                    disabled={processing}
                  >
                    <View style={[styles.methodIcon, styles.bankIconBg]}>
                      <Icon name="card" size={28} color="#2196F3" />
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodName}>Chuyển khoản ngân hàng</Text>
                      <Text style={styles.methodDesc}>Chuyển khoản qua Vietcombank</Text>
                    </View>
                    <Icon name="arrow-forward" size={24} color="#007AFF" />
                  </TouchableOpacity>
                </View>
              )}

              {paymentStep === 2 && (
                <View>
                  <View style={styles.bankInfoCard}>
                    <Text style={styles.bankInfoTitle}>Thông tin chuyển khoản</Text>
                    
                    {[
                      { label: 'Ngân hàng:', value: BANK_INFO.bankName },
                      { label: 'Số tài khoản:', value: BANK_INFO.accountNumber },
                      { label: 'Chủ tài khoản:', value: BANK_INFO.accountName },
                      { label: 'Số tiền:', value: `${calculateTotal().toLocaleString('vi-VN')}đ`, isAmount: true },
                      { label: 'Nội dung:', value: getTransferContent() },
                    ].map((info, index) => (
                      <View key={index} style={styles.bankInfoItem}>
                        <Text style={styles.bankInfoLabel}>{info.label}</Text>
                        <View style={styles.bankInfoValueContainer}>
                          <Text style={[styles.bankInfoValue, info.isAmount && styles.amountText]}>
                            {info.value}
                          </Text>
                          <TouchableOpacity onPress={() => copyToClipboard(info.value, info.label)}>
                            <Icon name="clipboard-outline" size={20} color="#FF6B35" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>

                  <View style={styles.noteCard}>
                    <View style={styles.noteTitleContainer}>
                      <Icon name="warning" size={16} color="#856404" />
                      <Text style={styles.noteTitle}>Lưu ý quan trọng</Text>
                    </View>
                    <Text style={styles.noteText}>• Vui lòng chuyển khoản đúng số tiền và nội dung</Text>
                    <Text style={styles.noteText}>• Đơn hàng sẽ được xác nhận sau khi nhận thanh toán</Text>
                    <Text style={styles.noteText}>• Liên hệ hotline nếu có vấn đề</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.confirmButton, processing && styles.confirmButtonDisabled]}
                    onPress={handleBankTransfer}
                    disabled={processing}
                  >
                    {processing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Xác nhận đã chuyển khoản</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setPaymentStep(1)}
                    disabled={processing}
                  >
                    <Text style={styles.backButtonText}>← Quay lại</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  emptyIconContainer: {
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.medium,
  },
  browseButtonText: {
    color: COLORS.surface,
    fontSize: TYPOGRAPHY.body,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 48,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerIcon: {
    marginRight: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.surface,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 8,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 22,
  },
  itemService: {
    fontSize: 14,
    color: '#06b6d4',
    marginBottom: 8,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  itemInstructor: {
    fontSize: 13,
    color: '#6b7280',
  },
  itemLocation: {
    fontSize: 13,
    color: '#6b7280',
  },
  priceTag: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f59e0b',
  },
  itemTypeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#10b981',
  },
  checkoutButton: {
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutButtonDisabled: {
    opacity: 0.4,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  modalBody: {
    padding: 20,
    paddingBottom: 40,
  },
  orderInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  orderInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderInfoTotal: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
  },
  itemTypeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  itemNameText: {
    flex: 1,
    fontSize: 13,
    color: '#555',
  },
  itemPriceText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankIconBg: {
    backgroundColor: '#E3F2FD',
  },
  cashIconBg: {
    backgroundColor: '#E8F5E9',
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  methodDesc: {
    fontSize: 13,
    color: '#666',
  },
  bankInfoCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  bankInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  bankInfoItem: {
    marginBottom: 15,
  },
  bankInfoLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  bankInfoValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  bankInfoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  amountText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noteCard: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  noteTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
  },
  noteText: {
    fontSize: 13,
    color: '#856404',
    marginBottom: 5,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CartScreen;
