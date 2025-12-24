import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import ReviewModal from '../components/ReviewModal';

interface ClassDetail {
  _id: string;
  name: string;
  description: string;
  instructor: {
    _id: string;
    fullName: string;
    email: string;
  };
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
  capacity: number;
  enrolled: number;
  price: number;
  duration: number;
  location: string;
  serviceId: {
    _id: string;
    name: string;
    description: string;
  };
}

const ClassDetailScreen = ({ route, navigation }: any) => {
  const { classId } = route.params;
  const { user } = useAuth();
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<{
    isPaid: boolean;
    isPending: boolean;
    enrollmentId?: string;
  } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    fetchClassDetail();
    fetchReviews();
    if (user) {
      checkEnrollment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const response: any = await apiService.get(`/reviews/class/${classId}`);
      setReviews(response.reviews || []);
      setAverageRating(response.averageRating || 0);
      setTotalReviews(response.totalReviews || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    try {
      await apiService.post('/reviews', {
        classId,
        rating,
        comment,
      });
      await fetchReviews();
    } catch (error: any) {
      throw new Error(error.message || 'Đánh giá thất bại');
    }
  };

  const fetchClassDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<ClassDetail>(`/classes/${classId}`);
      setClassDetail(response);
    } catch (error) {
      console.error('Error fetching class detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin lớp học');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const userId = (user as any)?._id || (user as any)?.id;
      if (!userId) return;
      
      // Fetch enrollments and payments
      const [enrollmentsData, paymentsData] = await Promise.all([
        apiService.get(`/classes/user/${userId}`),
        apiService.get('/payments/user').catch(() => [])
      ]);
      
      const enrolledClasses = enrollmentsData as any[];
      const enrollment = enrolledClasses.find((c: any) => c._id === classId || c.class?._id === classId || c.classId === classId);
      
      if (enrollment) {
        setIsEnrolled(true);
        
        // Check if this enrollment has pending payment
        const payments = Array.isArray(paymentsData) ? paymentsData : [];
        const hasPendingPayment = payments.some((p: any) => 
          p.status === 'pending' && 
          p.registrationIds && 
          p.registrationIds.includes(enrollment._id)
        );
        
        setEnrollmentStatus({
          isPaid: enrollment.paymentStatus === true,
          isPending: hasPendingPayment,
          enrollmentId: enrollment._id
        });
      } else {
        setIsEnrolled(false);
        setEnrollmentStatus(null);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để đăng ký lớp học');
      return;
    }

    if (isEnrolled) {
      Alert.alert('Thông báo', 'Bạn đã đăng ký lớp học này rồi');
      return;
    }

    if (classDetail && classDetail.enrolled >= classDetail.capacity) {
      Alert.alert('Thông báo', 'Lớp học đã đầy');
      return;
    }

    // Nếu là lớp miễn phí, đăng ký trực tiếp
    if (classDetail && classDetail.price === 0) {
      Alert.alert(
        'Xác nhận đăng ký',
        `Bạn có chắc muốn đăng ký lớp "${classDetail?.name}"?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đăng ký',
            onPress: async () => {
              try {
                setEnrolling(true);
                const userId = (user as any)?._id || (user as any)?.id;
                await apiService.post('/classes/enroll', {
                  classId: classId,
                  userId: userId,
                });
                Alert.alert('Thành công', 'Đăng ký lớp học thành công!');
                setIsEnrolled(true);
                fetchClassDetail();
              } catch (error: any) {
                Alert.alert(
                  'Lỗi',
                  error.message || 'Không thể đăng ký lớp học'
                );
              } finally {
                setEnrolling(false);
              }
            },
          },
        ]
      );
    } else {
      // Lớp có phí - thêm vào giỏ hàng
      Alert.alert(
        'Thêm vào giỏ hàng',
        `Thêm "${classDetail?.name}" vào giỏ hàng?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Thêm vào giỏ hàng',
            onPress: async () => {
              try {
                setEnrolling(true);
                const userId = (user as any)?._id || (user as any)?.id;
                await apiService.post('/classes/enroll', {
                  classId: classId,
                  userId: userId,
                });
                Alert.alert(
                  'Đã thêm vào giỏ hàng',
                  'Lớp học đã được thêm vào giỏ hàng. Vào giỏ hàng để thanh toán.',
                  [
                    { text: 'Tiếp tục xem', style: 'cancel' },
                    { text: 'Xem giỏ hàng', onPress: () => navigation.navigate('Cart') },
                  ]
                );
                fetchClassDetail();
              } catch (error: any) {
                Alert.alert('Lỗi', error.message || 'Không thể thêm vào giỏ hàng');
              } finally {
                setEnrolling(false);
              }
            },
          },
        ]
      );
    }
  };

  const handlePaymentSuccess = async () => {
    // Sau khi thanh toán thành công, tự động enroll
    try {
      setEnrolling(true);
      const userId = (user as any)?._id || (user as any)?.id;
      await apiService.post('/classes/enroll', {
        classId: classId,
        userId: userId,
      });
      setIsEnrolled(true);
      fetchClassDetail();
      Alert.alert('Thành công', 'Đăng ký lớp học thành công!');
    } catch (error: any) {
      console.error('Error enrolling after payment:', error);
      // Đã thanh toán nhưng chưa enroll - user cần liên hệ admin
      Alert.alert(
        'Thông báo',
        'Đơn hàng đã được tạo. Vui lòng liên hệ admin để hoàn tất đăng ký.'
      );
    } finally {
      setEnrolling(false);
    }
  };

  const getDayName = (day: string) => {
    const days: { [key: string]: string } = {
      'Monday': 'Thứ 2',
      'Tuesday': 'Thứ 3',
      'Wednesday': 'Thứ 4',
      'Thursday': 'Thứ 5',
      'Friday': 'Thứ 6',
      'Saturday': 'Thứ 7',
      'Sunday': 'Chủ nhật',
    };
    return days[day] || day;
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    try {
      // Parse times (format: "HH:MM")
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      // Convert to minutes
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      // Calculate duration
      return endMinutes - startMinutes;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 60; // Default fallback
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!classDetail) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy lớp học</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const availableSlots = classDetail.capacity - classDetail.enrolled;
  const isAlmostFull = availableSlots <= 5;
  const isFull = availableSlots <= 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backIcon}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIconText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{classDetail.name}</Text>
        </View>

        {/* Service Badge */}
        <View style={styles.serviceBadge}>
          <Text style={styles.serviceBadgeText}>
            📚 {classDetail.serviceId?.name || 'Dịch vụ'}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Mô tả</Text>
          <Text style={styles.description}>
            {classDetail.description || 'Chưa có mô tả'}
          </Text>
        </View>

        {/* Instructor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👨‍🏫 Huấn luyện viên</Text>
          <View style={styles.instructorCard}>
            <Text style={styles.instructorName}>{classDetail.instructor?.fullName || 'Chưa có HLV'}</Text>
            {classDetail.instructor?.email && (
              <Text style={styles.instructorEmail}>📧 {classDetail.instructor.email}</Text>
            )}
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Lịch học</Text>
          {classDetail.schedule && classDetail.schedule.length > 0 ? (
            classDetail.schedule.map((sch, index) => {
              const duration = calculateDuration(sch.startTime, sch.endTime);
              return (
                <View key={index} style={styles.scheduleCard}>
                  <View style={styles.scheduleLeft}>
                    <Text style={styles.dayName}>{getDayName(sch.dayOfWeek)}</Text>
                  </View>
                  <View style={styles.scheduleRight}>
                    <Text style={styles.scheduleTime}>
                      ⏰ {sch.startTime} - {sch.endTime}
                    </Text>
                    <Text style={styles.scheduleDuration}>
                      ⏱️ {duration} phút
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.noSchedule}>Chưa có lịch học</Text>
          )}
        </View>

        {/* Location */}
        {classDetail.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Địa điểm</Text>
            <Text style={styles.location}>{classDetail.location}</Text>
          </View>
        )}

        {/* Capacity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Sức chứa</Text>
          <View style={styles.capacityCard}>
            <View style={styles.capacityRow}>
              <Text style={styles.capacityLabel}>Đã đăng ký:</Text>
              <Text style={styles.capacityValue}>{classDetail.enrolled} học viên</Text>
            </View>
            <View style={styles.capacityRow}>
              <Text style={styles.capacityLabel}>Tổng sức chứa:</Text>
              <Text style={styles.capacityValue}>{classDetail.capacity} học viên</Text>
            </View>
            <View style={styles.capacityRow}>
              <Text style={styles.capacityLabel}>Còn trống:</Text>
              <Text style={[
                styles.capacityValue,
                isAlmostFull && styles.warningText,
                isFull && styles.dangerText,
              ]}>
                {availableSlots} chỗ
              </Text>
            </View>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Học phí</Text>
          <Text style={styles.priceValue}>
            {classDetail.price.toLocaleString('vi-VN')}đ
          </Text>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>⭐ Đánh giá</Text>
            {isEnrolled && (
              <TouchableOpacity
                style={styles.addReviewButton}
                onPress={() => setShowReviewModal(true)}
              >
                <Text style={styles.addReviewButtonText}>+ Đánh giá</Text>
              </TouchableOpacity>
            )}
          </View>

          {totalReviews > 0 && (
            <View style={styles.ratingOverview}>
              <View style={styles.ratingLeft}>
                <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
                <Text style={styles.ratingStars}>{'⭐'.repeat(Math.round(averageRating))}</Text>
                <Text style={styles.ratingCount}>{totalReviews} đánh giá</Text>
              </View>
            </View>
          )}

          {loadingReviews ? (
            // eslint-disable-next-line react-native/no-inline-styles
            <ActivityIndicator color="#4CAF50" style={{ marginTop: 20 }} />
          ) : reviews.length > 0 ? (
            reviews.slice(0, 3).map((review) => (
              <View key={review._id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.user?.name || 'Anonymous'}</Text>
                  <Text style={styles.reviewRating}>{'⭐'.repeat(review.rating)}</Text>
                </View>
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noReviews}>Chưa có đánh giá nào</Text>
          )}
        </View>
      </ScrollView>

      {/* Enroll Button */}
      <View style={styles.footer}>
        {enrollmentStatus?.isPending ? (
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>⏳</Text>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Đang chờ xác nhận thanh toán</Text>
              <Text style={styles.statusSubtitle}>
                Admin sẽ xác nhận sau khi nhận thanh toán. Kiểm tra trạng thái tại màn hình Lịch sử.
              </Text>
            </View>
          </View>
        ) : enrollmentStatus?.isPaid ? (
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>✅</Text>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Đã thanh toán thành công</Text>
              <Text style={styles.statusSubtitle}>
                Bạn đã là thành viên chính thức của lớp học này
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.enrollButton,
              (isEnrolled || isFull || enrolling) && styles.enrollButtonDisabled,
            ]}
            onPress={handleEnroll}
            disabled={isEnrolled || isFull || enrolling}
          >
            {enrolling ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.enrollButtonText}>
                {isEnrolled ? '✓ Đã đăng ký' : isFull ? 'Đã đầy' : 'Đăng ký ngay'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Payment Modal */}
      {classDetail && user && (
        <PaymentModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          itemType="class"
          itemId={classDetail._id}
          itemName={classDetail.name}
          amount={classDetail.price}
          userId={(user as any)?._id || (user as any)?.id}
        />
      )}

      {/* Review Modal */}
      {classDetail && (
        <ReviewModal
          visible={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleSubmitReview}
          itemName={classDetail.name}
          itemType="class"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 48,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: {
    marginRight: 15,
  },
  backIconText: {
    fontSize: 28,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  serviceBadge: {
    backgroundColor: '#007AFF',
    padding: 15,
    alignItems: 'center',
  },
  serviceBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  instructorCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  instructorEmail: {
    fontSize: 14,
    color: '#666',
  },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  scheduleLeft: {
    marginRight: 15,
    justifyContent: 'center',
  },
  dayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  scheduleRight: {
    flex: 1,
  },
  scheduleTime: {
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
  },
  scheduleDuration: {
    fontSize: 14,
    color: '#666',
  },
  noSchedule: {
    fontSize: 15,
    color: '#999',
    fontStyle: 'italic',
  },
  location: {
    fontSize: 15,
    color: '#666',
  },
  capacityCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  capacityLabel: {
    fontSize: 15,
    color: '#666',
  },
  capacityValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  warningText: {
    color: '#FF9500',
  },
  dangerText: {
    color: '#FF3B30',
  },
  priceSection: {
    backgroundColor: '#4CAF50',
    padding: 20,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  enrollButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  enrollButtonDisabled: {
    backgroundColor: '#ccc',
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusContainer: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  statusIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#0c4a6e',
    lineHeight: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addReviewButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addReviewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  ratingOverview: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  ratingLeft: {
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  ratingStars: {
    fontSize: 20,
    marginVertical: 4,
  },
  ratingCount: {
    fontSize: 14,
    color: '#666',
  },
  reviewItem: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  reviewRating: {
    fontSize: 14,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  noReviews: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 12,
  },
});

export default ClassDetailScreen;
