import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  type: string;
  features: string[];
  category: string;
  popular?: boolean;
  badge?: string;
}

const MembershipScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('basic');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [activeMembership, setActiveMembership] = useState<any>(null);

  // Full plans data matching web's pricingPlansData.js
  const membershipPlans: MembershipPlan[] = [
    // BASIC PLANS
    {
      id: 'basic-monthly',
      name: 'Gói Cơ Bản Hàng Tháng',
      price: 399000,
      duration: 30,
      type: 'Basic',
      category: 'basic',
      badge: 'Tiết kiệm',
      features: [
        'Tập luyện tại 01 CLB đã chọn',
        'Chỉ sử dụng khu vực tập luyện chính',
        'Giờ tập: 08:00 - 22:00 hàng ngày',
        'Tủ đồ tiêu chuẩn trong thời gian tập',
        'Nước uống miễn phí',
        'Hỗ trợ hướng dẫn ban đầu',
      ],
    },
    {
      id: 'basic-quarterly',
      name: 'Gói Cơ Bản 3 Tháng',
      price: 1089000,
      duration: 90,
      type: 'Basic',
      category: 'basic',
      popular: true,
      badge: 'Phổ biến',
      features: [
        'Tập luyện tại 01 CLB đã chọn',
        'Chỉ sử dụng khu vực tập luyện chính',
        'Giờ tập: 08:00 - 22:00 hàng ngày',
        'Tủ đồ tiêu chuẩn trong thời gian tập',
        'Nước uống miễn phí',
        '01 buổi tư vấn dinh dưỡng cơ bản',
        'Khăn tập tiêu chuẩn',
      ],
    },
    {
      id: 'basic-annual',
      name: 'Gói Cơ Bản 12 Tháng',
      price: 3999000,
      duration: 365,
      type: 'Basic',
      category: 'basic',
      badge: 'Tiết kiệm 20%',
      features: [
        'Tập luyện tại 01 CLB đã chọn',
        'Chỉ sử dụng khu vực tập luyện chính',
        'Giờ tập: 08:00 - 22:00 hàng ngày',
        'Tủ đồ tiêu chuẩn trong thời gian tập',
        'Nước uống miễn phí',
        '02 buổi tư vấn dinh dưỡng cơ bản',
        'Khăn tập tiêu chuẩn',
        'Đánh giá thể chất 2 lần/năm',
      ],
    },
    {
      id: 'basic-offpeak',
      name: 'Gói Cơ Bản Giờ Thấp Điểm',
      price: 299000,
      duration: 30,
      type: 'Basic',
      category: 'basic',
      badge: 'Siêu tiết kiệm',
      features: [
        'Tập luyện tại 01 CLB đã chọn',
        'Chỉ được tập từ 10:00 - 16:00 các ngày trong tuần',
        'Không được sử dụng vào ngày cuối tuần và ngày lễ',
        'Chỉ sử dụng khu vực tập luyện chính',
        'Tủ đồ tiêu chuẩn trong thời gian tập',
        'Nước uống miễn phí',
      ],
    },
    // STANDARD PLANS
    {
      id: 'standard-monthly',
      name: 'Gói Tiêu Chuẩn Hàng Tháng',
      price: 699000,
      duration: 30,
      type: 'Standard',
      category: 'standard',
      popular: true,
      badge: 'Phổ biến',
      features: [
        'Tập luyện tại 01 CLB đã chọn',
        'Tham gia Yoga và Group X tại CLB đã chọn',
        'Giờ tập: 06:00 - 23:00 hàng ngày',
        'Sử dụng dịch vụ thư giãn (sauna, steambath)',
        'Tủ đồ cao cấp trong thời gian tập',
        'Nước uống và khăn tập miễn phí',
        '01 buổi định hướng luyện tập và tư vấn dinh dưỡng',
      ],
    },
    {
      id: 'standard-quarterly',
      name: 'Gói Tiêu Chuẩn 3 Tháng',
      price: 1899000,
      duration: 90,
      type: 'Standard',
      category: 'standard',
      badge: 'Tiết kiệm 10%',
      features: [
        'Tập luyện tại 01 CLB đã chọn',
        'Tham gia Yoga và Group X tại CLB đã chọn',
        'Giờ tập: 06:00 - 23:00 hàng ngày',
        'Sử dụng dịch vụ thư giãn (sauna, steambath)',
        'Tủ đồ cao cấp trong thời gian tập',
        'Nước uống và khăn tập miễn phí',
        '02 buổi định hướng luyện tập với PT',
        'Đánh giá thể chất 1 lần/quý',
        'Giảm 10% dịch vụ Spa',
      ],
    },
    {
      id: 'standard-annual',
      name: 'Gói Tiêu Chuẩn 12 Tháng',
      price: 6999000,
      duration: 365,
      type: 'Standard',
      category: 'standard',
      badge: 'Tiết kiệm 15%',
      features: [
        'Tập luyện tại 02 CLB bất kỳ',
        'Tham gia Yoga và Group X tại cả 2 CLB đã chọn',
        'Giờ tập: 06:00 - 23:00 hàng ngày',
        'Sử dụng dịch vụ thư giãn (sauna, steambath)',
        'Tủ đồ cố định tại CLB chính',
        'Nước uống và khăn tập miễn phí',
        '04 buổi định hướng luyện tập với PT',
        'Đánh giá thể chất 2 lần/năm',
        'Giảm 15% dịch vụ Spa',
        '01 người thân được giảm 10% khi đăng ký cùng',
      ],
    },
    {
      id: 'standard-weekend',
      name: 'Gói Tiêu Chuẩn Cuối Tuần',
      price: 399000,
      duration: 30,
      type: 'Standard',
      category: 'standard',
      badge: 'Dành cho dân văn phòng',
      features: [
        'Tập luyện tại 01 CLB đã chọn',
        'Chỉ được sử dụng vào Thứ 7 và Chủ Nhật',
        'Giờ tập: 06:00 - 23:00 ngày cuối tuần',
        'Tham gia Yoga và Group X vào cuối tuần',
        'Sử dụng dịch vụ thư giãn (sauna, steambath)',
        'Tủ đồ cao cấp trong thời gian tập',
        'Nước uống và khăn tập miễn phí',
      ],
    },
    // VIP PLANS
    {
      id: 'vip-monthly',
      name: 'Gói VIP Hàng Tháng',
      price: 1499000,
      duration: 30,
      type: 'VIP',
      category: 'vip',
      popular: true,
      badge: 'Trải nghiệm VIP',
      features: [
        'Tập luyện tại tất cả CLB trong hệ thống',
        'Tham gia Yoga và Group X tại tất cả CLB',
        'Giờ tập: không giới hạn 24/7',
        'Sử dụng không giới hạn dịch vụ thư giãn',
        'Tủ đồ VIP cố định tại CLB chính',
        'Nước uống và khăn tập cao cấp miễn phí',
        '02 buổi tập với huấn luyện viên cá nhân mỗi tháng',
        'Ưu tiên đặt lịch các lớp tập đặc biệt',
        'Giảm 15% dịch vụ Spa và massage',
      ],
    },
    {
      id: 'vip-quarterly',
      name: 'Gói VIP 3 Tháng',
      price: 3999000,
      duration: 90,
      type: 'VIP',
      category: 'vip',
      badge: 'Tiết kiệm 10%',
      features: [
        'Tập luyện tại tất cả CLB trong hệ thống',
        'Tham gia Yoga và Group X tại tất cả CLB',
        'Giờ tập: không giới hạn 24/7',
        'Sử dụng không giới hạn dịch vụ thư giãn',
        'Tủ đồ VIP cố định tại CLB chính',
        'Nước uống và khăn tập cao cấp miễn phí',
        '06 buổi tập với huấn luyện viên cá nhân (2 buổi/tháng)',
        'Ưu tiên đặt lịch các lớp tập đặc biệt',
        'Giảm 20% dịch vụ Spa và massage',
        'Đánh giá thể chất và dinh dưỡng chuyên sâu 1 lần/quý',
        'Gửi xe VIP',
      ],
    },
    {
      id: 'vip-annual',
      name: 'Gói VIP 12 Tháng',
      price: 14999000,
      duration: 365,
      type: 'VIP',
      category: 'vip',
      badge: 'Tiết kiệm 15%',
      features: [
        'Tập luyện tại tất cả CLB trong hệ thống',
        'Tham gia Yoga và Group X tại tất cả CLB',
        'Giờ tập: không giới hạn 24/7',
        'Sử dụng không giới hạn dịch vụ thư giãn',
        'Tủ đồ VIP cố định tại CLB chính',
        'Phòng thay đồ riêng tại CLB chính',
        'Nước uống và khăn tập cao cấp miễn phí',
        '24 buổi tập với huấn luyện viên cá nhân (2 buổi/tháng)',
        'Ưu tiên đặt lịch các lớp tập đặc biệt',
        'Giảm 25% dịch vụ Spa và massage',
        'Đánh giá thể chất và dinh dưỡng chuyên sâu 1 lần/quý',
        'Gửi xe VIP và dịch vụ đưa đón trong bán kính 5km',
        'Được mang 1 người thân tập cùng 2 lần/tháng',
      ],
    },
    {
      id: 'vip-platinum',
      name: 'Gói Platinum 12 Tháng',
      price: 24999000,
      duration: 365,
      type: 'Platinum',
      category: 'vip',
      badge: 'Cao cấp nhất',
      features: [
        'Tất cả quyền lợi của gói VIP 12 Tháng',
        'Phòng tập riêng theo yêu cầu (2 giờ/tuần)',
        'Huấn luyện viên cá nhân độc quyền (3 buổi/tuần)',
        'Tư vấn dinh dưỡng và chế độ ăn uống cá nhân hóa',
        'Đánh giá thể chất và sinh học phân tử 2 lần/năm',
        'Gửi xe VIP và dịch vụ đưa đón không giới hạn bán kính',
        'Được mang 2 người thân tập cùng 4 lần/tháng',
        'Tặng 10 buổi tập cho người thân/bạn bè',
        'Ưu tiên tham gia các sự kiện độc quyền của CLB',
        'Tư vấn sức khỏe toàn diện với bác sĩ thể thao 1 lần/quý',
      ],
    },
  ];

  useEffect(() => {
    fetchActiveMembership();
  }, []);

  const fetchActiveMembership = async () => {
    try {
      const userId = (user as any)?._id || (user as any)?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await apiService.get(`/memberships/user/${userId}`);
      if (response && Array.isArray(response) && response.length > 0) {
        // Lọc membership đã được xác nhận (active)
        const active = response.find((m: any) => m.status === 'active' && m.paymentStatus === true);
        setActiveMembership(active || null);
      }
    } catch (error) {
      console.error('Error fetching membership:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic':
        return '#3b82f6';
      case 'standard':
        return '#10b981';
      case 'vip':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  const getDurationText = (duration: number) => {
    if (duration === 30) return '1 tháng';
    if (duration === 90) return '3 tháng';
    if (duration === 180) return '6 tháng';
    if (duration === 365) return '1 năm';
    return `${duration} ngày`;
  };

  const handlePurchase = async (plan: MembershipPlan) => {
    if (!user) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để đăng ký gói thành viên');
      return;
    }

    Alert.alert(
      'Thêm vào giỏ hàng',
      `Thêm "${plan.name}" vào giỏ hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thêm vào giỏ hàng',
          onPress: async () => {
            try {
              setPurchasing(plan.id);
              
              const userId = (user as any)?._id || (user as any)?.id;
              const startDate = new Date();
              const endDate = new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000);

              // Tạo membership pending (chưa thanh toán)
              await apiService.post('/memberships', {
                userId,
                type: plan.type,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                price: plan.price,
                status: 'pending_payment',
                paymentStatus: false,
              });

              Alert.alert(
                'Đã thêm vào giỏ hàng',
                'Gói tập đã được thêm vào giỏ hàng. Vào giỏ hàng để thanh toán.',
                [
                  { text: 'Tiếp tục xem', style: 'cancel' },
                  { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('Cart') },
                ]
              );
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể thêm vào giỏ hàng');
            } finally {
              setPurchasing(null);
            }
          },
        },
      ]
    );
  };

  const handlePaymentSuccess = async () => {
    if (!selectedPlan || !user) return;

    try {
      setPurchasing(selectedPlan.id);
      
      const userId = (user as any)?._id || (user as any)?.id;
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + selectedPlan.duration * 24 * 60 * 60 * 1000);

      await apiService.post('/memberships', {
        userId,
        type: selectedPlan.type,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        price: selectedPlan.price,
      });

      Alert.alert(
        'Thành công!',
        'Đăng ký gói thành viên thành công! Gói sẽ được kích hoạt sau khi xác nhận thanh toán.'
      );
      
      // Navigate to profile to see membership
      navigation.navigate('Profile');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đăng ký gói thành viên');
    } finally {
      setPurchasing(null);
    }
  };

  const filteredPlans = membershipPlans.filter(
    (plan) => plan.category === selectedCategory
  );

  const renderPlanCard = (plan: MembershipPlan) => {
    const color = getCategoryColor(plan.category);
    const isPurchasing = purchasing === plan.id;

    return (
      <View key={plan.id} style={[styles.planCard, plan.popular && styles.popularCard]}>
        {plan.popular && (
          <View style={[styles.popularBadge, { backgroundColor: color }]}>
            <Text style={styles.popularBadgeText}>⭐ {plan.badge || 'Phổ biến'}</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={[styles.planType, { color }]}>{plan.type}</Text>
        </View>

        <View style={[styles.priceContainer, { backgroundColor: color }]}>
          <Text style={styles.priceText}>
            {plan.price.toLocaleString('vi-VN')}đ
          </Text>
          <Text style={styles.durationText}>{getDurationText(plan.duration)}</Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Quyền lợi:</Text>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.purchaseButton, { backgroundColor: color }]}
          onPress={() => handlePurchase(plan)}
          disabled={isPurchasing}
        >
          {isPurchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.purchaseButtonText}>Đăng ký ngay</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Đang tải gói thành viên...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {activeMembership ? (
        // Show active membership
        <ScrollView>
          <View style={styles.activeMembershipContainer}>
            <LinearGradient
              colors={['#581c87', '#1e40af']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activeMembershipCard}
            >
              <Text style={styles.activeMembershipBadge}>✓ GÓI ĐANG KÍCH HOẠT</Text>
              <Text style={styles.activeMembershipType}>{activeMembership.type}</Text>
              <Text style={styles.activeMembershipDates}>
                {new Date(activeMembership.startDate).toLocaleDateString('vi-VN')} - {new Date(activeMembership.endDate).toLocaleDateString('vi-VN')}
              </Text>
              
              <View style={styles.activeMembershipStatus}>
                <Text style={styles.activeMembershipStatusLabel}>Trạng thái:</Text>
                <View style={styles.activeStatusBadge}>
                  <Text style={styles.activeStatusText}>Đang hoạt động</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.upgradeSection}>
              <Text style={styles.upgradeSectionIcon}>💎</Text>
              <Text style={styles.upgradeSectionTitle}>Muốn nâng cấp gói?</Text>
              <Text style={styles.upgradeSectionText}>
                Liên hệ lễ tân để được tư vấn và nâng cấp lên gói cao cấp hơn
              </Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactItem}>📞 Hotline: 1900-xxxx</Text>
                <Text style={styles.contactItem}>📧 Email: support@gym.vn</Text>
                <Text style={styles.contactItem}>🏢 Hoặc đến quầy lễ tân tại CLB</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        // Show membership plans
        <>
          {/* Category Filter */}
          <View style={styles.categoryContainer}>
            {[
              { key: 'basic', label: '🏃 Cơ bản' },
              { key: 'standard', label: '💪 Tiêu chuẩn' },
              { key: 'vip', label: '👑 VIP' },
            ].map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat.key && styles.categoryButtonActive,
                  selectedCategory === cat.key && {
                    backgroundColor: getCategoryColor(cat.key),
                  },
                ]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === cat.key && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {filteredPlans.map((plan) => renderPlanCard(plan))}
          </ScrollView>
        </>
      )}

      {/* Payment Modal */}
      {selectedPlan && user && (
        <PaymentModal
          visible={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          onSuccess={handlePaymentSuccess}
          itemType="membership"
          itemId={selectedPlan.id}
          itemName={selectedPlan.name}
          amount={selectedPlan.price}
          userId={(user as any)?._id || (user as any)?.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  header: {
    padding: 16,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  categoryContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'transparent',
    marginTop: 10,
    gap: 10,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#1e1b4b',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryButtonActive: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  planCard: {
    backgroundColor: '#1e1b4b',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  popularCard: {
    borderWidth: 2,
    borderColor: '#f59e0b',
    shadowColor: '#f59e0b',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    marginBottom: 15,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  planType: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceContainer: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  priceText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  durationText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  featureIcon: {
    fontSize: 16,
    color: '#10b981',
    marginRight: 10,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
    lineHeight: 20,
  },
  purchaseButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeMembershipContainer: {
    padding: 16,
    paddingTop: 48,
  },
  activeMembershipCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  activeMembershipBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  activeMembershipType: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  activeMembershipDates: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  activeMembershipStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeMembershipStatusLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeStatusBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  upgradeSection: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  upgradeSectionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  upgradeSectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  upgradeSectionText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  contactInfo: {
    width: '100%',
    gap: 12,
  },
  contactItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ec4899',
  },
});

export default MembershipScreen;
