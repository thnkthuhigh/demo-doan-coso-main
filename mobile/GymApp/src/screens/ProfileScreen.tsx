import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import apiService from '../services/api';

interface Membership {
  _id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  paymentStatus?: boolean;
}

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loadingMembership, setLoadingMembership] = useState(true);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);

  const fetchMembership = useCallback(async () => {
    try {
      const userId = (user as any)?._id || (user as any)?.id;
      if (!userId) {
        setLoadingMembership(false);
        return;
      }

      // Fetch memberships and payments in parallel
      const [membershipsResponse, paymentsData] = await Promise.all([
        apiService.get(`/memberships/user/${userId}`),
        apiService.get('/payments/user').catch(() => [])
      ]);

      if (membershipsResponse && Array.isArray(membershipsResponse) && membershipsResponse.length > 0) {
        const activeMembership = membershipsResponse[0];
        setMembership(activeMembership);

        // Check if this membership has pending payment
        const payments = Array.isArray(paymentsData) ? paymentsData : [];
        const hasPending = payments.some((p: any) => 
          p.status === 'pending' && 
          p.registrationIds && 
          p.registrationIds.includes(activeMembership._id)
        );
        setHasPendingPayment(hasPending);
      } else {
        setMembership(null);
        setHasPendingPayment(false);
      }
    } catch (error: any) {
      // Silently handle 404 or no membership case
      const status = error?.response?.status;
      if (status === 404 || status === 400) {
        // User has no membership - this is ok
        setMembership(null);
        setHasPendingPayment(false);
      } else {
        console.error('Error fetching membership:', error);
      }
    } finally {
      setLoadingMembership(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  // Get avatar URL - handle both string and object formats
  const getAvatarUrl = () => {
    const avatar = (user as any)?.avatar || (user as any)?.profilePicture;
    if (!avatar) return null;
    
    // If avatar is a string, return it
    if (typeof avatar === 'string') return avatar;
    
    // If avatar is an object with url property
    if (typeof avatar === 'object' && avatar.url) return avatar.url;
    
    return null;
  };

  const userAvatar = getAvatarUrl();

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#581c87', '#1e40af']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.avatarContainer}>
          {userAvatar ? (
            <Image
              source={{ uri: userAvatar }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {((user as any)?.fullName || user?.name)?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{(user as any)?.fullName || user?.name || 'Người dùng'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        {user?.role === 'trainer' && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>👨‍🏫 Huấn luyện viên</Text>
          </View>
        )}
      </LinearGradient>

      {/* Membership Card - hide for trainers */}
      {user?.role !== 'trainer' && (
        <>
          {loadingMembership ? (
            <View style={styles.membershipLoading}>
              <ActivityIndicator color="#ec4899" />
            </View>
          ) : membership ? (
        <>
          {hasPendingPayment ? (
            <View style={styles.pendingMembershipCard}>
              <View style={styles.pendingHeader}>
                <Icon name="time-outline" size={32} color="#f59e0b" />
                <View style={styles.pendingTextContainer}>
                  <Text style={styles.pendingTitle}>Đang chờ xác nhận thanh toán</Text>
                  <Text style={styles.pendingType}>Gói {membership.type}</Text>
                </View>
              </View>
              <View style={styles.pendingDates}>
                <Text style={styles.pendingDateText}>
                  Thời hạn: {new Date(membership.startDate).toLocaleDateString('vi-VN')} - {new Date(membership.endDate).toLocaleDateString('vi-VN')}
                </Text>
              </View>
              <View style={styles.pendingInfo}>
                <Icon name="information-circle-outline" size={16} color="#92400e" />
                <Text style={styles.pendingInfoText}>
                  Admin sẽ xác nhận sau khi nhận thanh toán. Kiểm tra trạng thái tại màn hình Lịch sử.
                </Text>
              </View>
            </View>
          ) : membership.paymentStatus === true ? (
            <LinearGradient
              colors={['#ec4899', '#ef4444', '#f97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.membershipCard}
            >
              <View style={styles.membershipHeader}>
                <View style={styles.membershipIconContainer}>
                  <Icon name="card" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.membershipInfo}>
                  <Text style={styles.membershipType}>{membership.type}</Text>
                  <View style={styles.membershipStatusContainer}>
                    {membership.status === 'active' && (
                      <Icon name="checkmark-circle" size={16} color="#FFFFFF" />
                    )}
                    <Text style={styles.membershipStatus}>
                      {membership.status === 'active' ? 'Đang hoạt động' : membership.status === 'pending_payment' ? 'Chờ thanh toán' : 'Hết hạn'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.membershipDates}>
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>Bắt đầu:</Text>
                  <Text style={styles.dateValue}>
                    {new Date(membership.startDate).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>Hết hạn:</Text>
                  <Text style={styles.dateValue}>
                    {new Date(membership.endDate).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.unpaidMembershipCard}>
              <View style={styles.unpaidHeader}>
                <Icon name="alert-circle-outline" size={32} color="#dc2626" />
                <View style={styles.unpaidTextContainer}>
                  <Text style={styles.unpaidTitle}>Chưa thanh toán</Text>
                  <Text style={styles.unpaidType}>Gói {membership.type}</Text>
                </View>
              </View>
              <Text style={styles.unpaidInfo}>
                Vui lòng thanh toán từ giỏ hàng để kích hoạt gói thành viên
              </Text>
              <TouchableOpacity
                style={styles.goToCartButton}
                onPress={() => navigation.navigate('Cart')}
              >
                <Text style={styles.goToCartButtonText}>Đi đến giỏ hàng</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      ) : (
        <View style={styles.noMembershipCard}>
          <Icon name="card-outline" size={48} color="#9CA3AF" />
          <Text style={styles.noMembershipText}>Chưa có gói thành viên</Text>
          <Text style={styles.noMembershipSubtext}>
            Đăng ký ngay để trải nghiệm!
          </Text>
        </View>
      )}
        </>
      )}

      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <View style={styles.menuIconContainer}>
            <Icon name="person" size={22} color="#581c87" />
          </View>
          <Text style={styles.menuText}>Chỉnh sửa hồ sơ</Text>
          <Icon name="chevron-forward" size={22} color="#9CA3AF" />
        </TouchableOpacity>

        {/* User-only menu items - hide for trainers */}
        {user?.role !== 'trainer' && (
          <>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('MyClasses')}
            >
              <View style={styles.menuIconContainer}>
                <Icon name="school" size={22} color="#3b82f6" />
              </View>
              <Text style={styles.menuText}>Lớp của tôi</Text>
              <Icon name="chevron-forward" size={22} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('AttendanceHistory')}
            >
              <View style={styles.menuIconContainer}>
                <Icon name="clipboard" size={22} color="#06b6d4" />
              </View>
              <Text style={styles.menuText}>Lịch sử điểm danh</Text>
              <Icon name="chevron-forward" size={22} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('Cart')}
            >
              <View style={styles.menuIconContainer}>
                <Icon name="cart" size={22} color="#10b981" />
              </View>
              <Text style={styles.menuText}>Giỏ hàng</Text>
              <Icon name="chevron-forward" size={22} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('BodyMetrics')}
            >
              <View style={styles.menuIconContainer}>
                <Icon name="fitness" size={22} color="#ec4899" />
              </View>
              <Text style={styles.menuText}>Số đo cơ thể</Text>
              <Icon name="chevron-forward" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ChatList')}
        >
          <View style={styles.menuIconContainer}>
            <Icon name="chatbubbles" size={22} color="#06b6d4" />
          </View>
          <Text style={styles.menuText}>Tin nhắn & Hỗ trợ</Text>
          <Icon name="chevron-forward" size={22} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Notifications')}
        >
          <View style={styles.menuIconContainer}>
            <Icon name="notifications" size={22} color="#ef4444" />
            <View style={styles.iconBadge}>
              <Text style={styles.iconBadgeText}>3</Text>
            </View>
          </View>
          <Text style={styles.menuText}>Thông báo</Text>
          <Icon name="chevron-forward" size={22} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('History')}
        >
          <View style={styles.menuIconContainer}>
            <Icon name="time" size={22} color="#6366f1" />
          </View>
          <Text style={styles.menuText}>Lịch sử</Text>
          <Icon name="chevron-forward" size={22} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Membership')}
        >
          <View style={styles.menuIconContainer}>
            <Icon name="diamond" size={22} color="#a855f7" />
          </View>
          <Text style={styles.menuText}>Gói thành viên</Text>
          <Icon name="chevron-forward" size={22} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <View style={styles.menuIconContainer}>
            <Icon name="lock-closed" size={22} color="#64748b" />
          </View>
          <Text style={styles.menuText}>Đổi mật khẩu</Text>
          <Icon name="chevron-forward" size={22} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={styles.menuIconContainer}>
            <Icon name="settings" size={22} color="#475569" />
          </View>
          <Text style={styles.menuText}>Cài đặt</Text>
          <Icon name="chevron-forward" size={22} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <View style={styles.menuIconContainer}>
            <Icon name="information-circle" size={22} color="#0ea5e9" />
          </View>
          <Text style={styles.menuText}>Về chúng tôi</Text>
          <Icon name="chevron-forward" size={22} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleLogout}>
        <LinearGradient
          colors={['#ef4444', '#dc2626']}
          style={styles.logoutButton}
        >
          <Icon name="log-out" size={22} color="#FFFFFF" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  roleBadge: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(217, 70, 239, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(217, 70, 239, 0.4)',
  },
  roleBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fbbf24',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: '#1e1b4b',
    marginTop: 20,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  menuArrow: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  iconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e1b4b',
  },
  iconBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutButton: {
    margin: 20,
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  membershipLoading: {
    padding: 20,
    alignItems: 'center',
  },
  membershipCard: {
    margin: 16,
    marginTop: 16,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  membershipIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  membershipIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  membershipInfo: {
    flex: 1,
  },
  membershipType: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  membershipStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  membershipStatus: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
    opacity: 0.9,
  },
  membershipDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 6,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  noMembershipCard: {
    backgroundColor: '#1e1b4b',
    margin: 16,
    marginTop: 16,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  pendingMembershipCard: {
    backgroundColor: '#fef3c7',
    margin: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fbbf24',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pendingTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
  },
  pendingType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#b45309',
  },
  pendingDates: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  pendingDateText: {
    fontSize: 14,
    color: '#78350f',
    fontWeight: '600',
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    padding: 12,
    borderRadius: 8,
  },
  pendingInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    marginLeft: 8,
    lineHeight: 18,
  },
  unpaidMembershipCard: {
    backgroundColor: '#fee2e2',
    margin: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fca5a5',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  unpaidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  unpaidTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  unpaidTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 4,
  },
  unpaidType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  unpaidInfo: {
    fontSize: 14,
    color: '#7f1d1d',
    marginBottom: 16,
    lineHeight: 20,
  },
  goToCartButton: {
    backgroundColor: '#dc2626',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  goToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noMembershipCard_old: {
    backgroundColor: '#1e1b4b',
    margin: 16,
    marginTop: -40,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  noMembershipIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  noMembershipText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  noMembershipSubtext: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  notificationBadgeSmall: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 8,
  },
  notificationBadgeSmallText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
