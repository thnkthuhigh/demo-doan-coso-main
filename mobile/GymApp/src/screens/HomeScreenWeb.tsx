import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

interface Stats {
  enrolledClasses: number;
  attendanceCount: number;
  membership: any;
}

const HomeScreenWeb = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = React.useState(false);
  const [stats, setStats] = useState<Stats>({
    enrolledClasses: 0,
    attendanceCount: 0,
    membership: null,
  });

  const fetchStats = useCallback(async () => {
    try {
      const userId = (user as any)?._id || (user as any)?.id;
      if (!userId) return;

      let classes: any[] = [];
      try {
        const result = await apiService.get(`/classes/user/${userId}`);
        classes = result as any[];
      } catch {
        console.log('No enrolled classes');
      }
      
      let membership: any[] = [];
      try {
        const result = await apiService.get(`/memberships/user/${userId}`);
        membership = result as any[];
      } catch {
        console.log('No membership');
      }

      setStats({
        enrolledClasses: Array.isArray(classes) ? classes.length : 0,
        attendanceCount: 0,
        membership: Array.isArray(membership) && membership.length > 0 ? membership[0] : null,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStats().finally(() => setRefreshing(false));
  }, [fetchStats]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor="#ec4899"
        />
      }
    >
      {/* HERO SECTION - GIỐNG 100% WEB */}
      <LinearGradient
        colors={['#581c87', '#1e40af', '#4c1d95']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        {/* Floating Decorations */}
        <View style={[styles.floatingDecor, styles.decor1]} />
        <View style={[styles.floatingDecor, styles.decor2]} />
        <View style={[styles.floatingDecor, styles.decor3]} />
        <View style={[styles.floatingDecor, styles.decor4]} />

        {/* Top Right Icons */}
        <View style={styles.topRightIcons}>
          {/* Cart Icon */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <LinearGradient
              colors={['#3b82f6', '#6366f1']}
              style={styles.iconGradient}
            >
              <Icon name="cart" size={22} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Notification Bell */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <LinearGradient
              colors={['#ec4899', '#ef4444']}
              style={styles.iconGradient}
            >
              <Icon name="notifications" size={22} color="#FFFFFF" />
              <View style={styles.iconBadge}>
                <Text style={styles.iconBadgeText}>3</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Hero Content */}
        <View style={styles.heroContent}>
          {/* Crown Icon */}
          <View style={styles.crownContainer}>
            <Icon name="trophy" size={48} color="#FFD700" />
          </View>

          {/* Main Title */}
          <Text style={styles.heroTitle}>ROYAL FITNESS</Text>
          <View style={styles.heroTitleShadow}>
            <Text style={styles.heroTitleShadowText}>ROYAL FITNESS</Text>
          </View>

          {/* Subtitle */}
          <Text style={styles.heroSubtitle1}>
            Bắt đầu hành trình hoàn thiện bản thân
          </Text>
          <View style={styles.heroSubtitle2Container}>
            <Text style={styles.heroSubtitle2}>
              Nơi ước mơ trở thành hiện thực
            </Text>
            <Icon name="star" size={18} color="#FFD700" style={styles.sparkleIcon} />
          </View>

          {/* CTA Buttons */}
          <View style={styles.heroCTAContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Services')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#ec4899', '#ef4444', '#f97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaPrimary}
              >
                <Icon name="flash" size={20} color="#FFFFFF" />
                <Text style={styles.ctaText}>KHÁM PHÁ NGAY</Text>
                <Icon name="arrow-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Membership')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6', '#6366f1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaSecondary}
              >
                <Icon name="diamond" size={20} color="#FFFFFF" />
                <Text style={styles.ctaText}>GÓI VIP</Text>
                <Icon name="arrow-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.enrolledClasses}</Text>
              <Text style={styles.statLabel}>Lớp học</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.attendanceCount}</Text>
              <Text style={styles.statLabel}>Buổi tập</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.membership ? '✓' : '○'}</Text>
              <Text style={styles.statLabel}>Premium</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* FEATURES SECTION - GIỐNG WEB */}
      <View style={styles.featuresSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💎 ĐẶC ĐIỂM NỔI BẬT</Text>
          <Text style={styles.sectionSubtitle}>Premium Features</Text>
        </View>

        <View style={styles.featureGrid}>
          {/* Feature 1 */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('Services')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#ec4899', '#ef4444', '#dc2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featureGradient}
            >
              <View style={styles.featureIconBox}>
                <Text style={styles.featureIcon}>💎</Text>
              </View>
              <Text style={styles.featureTitle}>Dịch Vụ Cao Cấp</Text>
              <Text style={styles.featureSubheading}>Premium Service</Text>
              <Text style={styles.featureDesc}>
                Trải nghiệm tối thượng với cơ sở vật chất hiện đại và không gian sang trọng
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Feature 2 */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('Classes')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#3b82f6', '#6366f1', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featureGradient}
            >
              <View style={styles.featureIconBox}>
                <Text style={styles.featureIcon}>🚀</Text>
              </View>
              <Text style={styles.featureTitle}>HLV Chuyên Nghiệp</Text>
              <Text style={styles.featureSubheading}>Expert Trainers</Text>
              <Text style={styles.featureDesc}>
                Đội ngũ huấn luyện viên giàu kinh nghiệm và tận tâm
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Feature 3 */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('Calendar')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#10b981', '#059669', '#047857']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featureGradient}
            >
              <View style={styles.featureIconBox}>
                <Text style={styles.featureIcon}>🔥</Text>
              </View>
              <Text style={styles.featureTitle}>Lịch Trình Linh Hoạt</Text>
              <Text style={styles.featureSubheading}>Flexible Schedule</Text>
              <Text style={styles.featureDesc}>
                Hệ thống lớp học đa dạng với thời gian linh hoạt
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Feature 4 */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('Statistics')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#f59e0b', '#ea580c', '#dc2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featureGradient}
            >
              <View style={styles.featureIconBox}>
                <Text style={styles.featureIcon}>💫</Text>
              </View>
              <Text style={styles.featureTitle}>Chất Lượng</Text>
              <Text style={styles.featureSubheading}>Certified Quality</Text>
              <Text style={styles.featureDesc}>
                Được đánh giá cao bởi cộng đồng và chuyên gia
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* QUICK ACTIONS SECTION */}
      <View style={styles.quickSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⚡ TÍNH NĂNG NHANH</Text>
          <Text style={styles.sectionSubtitle}>Quick Access</Text>
        </View>

        <View style={styles.quickGrid}>
          {[
            { icon: '📅', label: 'Lịch tập', screen: 'Calendar', colors: ['#f093fb', '#f5576c'] },
            { icon: '🗺️', label: 'Tìm Gym', screen: 'GymFinder', colors: ['#43e97b', '#38f9d7'] },
            { icon: '📊', label: 'Lịch sử', screen: 'History', colors: ['#fa709a', '#fee140'] },
            { icon: '💬', label: 'Chat', screen: 'ChatList', colors: ['#a18cd1', '#fbc2eb'] },
            { icon: '📏', label: 'Số đo', screen: 'BodyMetrics', colors: ['#ffecd2', '#fcb69f'] },

          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickCard}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={item.colors}
                style={styles.quickGradient}
              >
                <Text style={styles.quickIcon}>{item.icon}</Text>
              </LinearGradient>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* QR SCAN CTA - GIỐNG WEB */}
      <View style={styles.qrSection}>
        <TouchableOpacity
          onPress={() => navigation.navigate('QRScanner')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#ec4899', '#ef4444', '#f97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.qrCTA}
          >
            <View style={styles.qrIconCircle}>
              <Text style={styles.qrIconBig}>📷</Text>
            </View>
            <View style={styles.qrTextContainer}>
              <Text style={styles.qrTitle}>ĐIỂM DANH NHANH</Text>
              <Text style={styles.qrSubtitle}>Quét mã QR để check-in ngay</Text>
            </View>
            <Text style={styles.qrArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ACTIVITY SECTION - TESTIMONIAL STYLE */}
      <View style={styles.activitySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏆 HOẠT ĐỘNG CỦA BẠN</Text>
          <Text style={styles.sectionSubtitle}>Your Progress</Text>
        </View>

        {stats.enrolledClasses > 0 ? (
          <LinearGradient
            colors={['#fbbf24', '#f59e0b', '#ea580c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.activityCard}
          >
            <View style={styles.activityBadge}>
              <Text style={styles.activityBadgeIcon}>🔥</Text>
            </View>
            <Text style={styles.activityText}>
              Tuyệt vời! Bạn đang tham gia{' '}
              <Text style={styles.activityHighlight}>{stats.enrolledClasses}</Text>{' '}
              lớp học
            </Text>
            <Text style={styles.activitySubtext}>
              Tiếp tục phấn đấu để đạt mục tiêu! 💪
            </Text>
          </LinearGradient>
        ) : (
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeIcon}>👋</Text>
            <Text style={styles.welcomeTitle}>Chào Mừng Đến ROYAL FITNESS!</Text>
            <Text style={styles.welcomeText}>
              Bắt đầu hành trình hoàn thiện bản thân cùng chúng tôi
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Classes')}
            >
              <LinearGradient
                colors={['#ec4899', '#ef4444']}
                style={styles.welcomeButton}
              >
                <Text style={styles.welcomeButtonText}>Khám Phá Ngay →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Very dark blue-gray như web
  },
  
  // Hero Section
  heroSection: {
    minHeight: 500,
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  floatingDecor: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.4,
  },
  decor1: {
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    backgroundColor: '#ec4899',
  },
  decor2: {
    top: 100,
    right: 80,
    width: 150,
    height: 150,
    backgroundColor: '#3b82f6',
  },
  decor3: {
    bottom: 80,
    left: 80,
    width: 120,
    height: 120,
    backgroundColor: '#10b981',
  },
  decor4: {
    top: '50%',
    left: '50%',
    width: 100,
    height: 100,
    backgroundColor: '#f59e0b',
  },
  topRightIcons: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {},
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  iconText: {
    fontSize: 24,
  },
  iconBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  iconBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  bellBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  crownContainer: {
    marginBottom: 16,
  },
  crownIcon: {
    fontSize: 48,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 16,
    marginBottom: 8,
  },
  heroTitleShadow: {
    position: 'absolute',
    top: 68,
    opacity: 0.1,
  },
  heroTitleShadowText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
  },
  heroSubtitle1: {
    fontSize: 20,
    color: '#93c5fd', // cyan-300
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  heroSubtitle2Container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  heroSubtitle2: {
    fontSize: 20,
    color: '#fbcfe8', // pink-300
    textAlign: 'center',
    fontWeight: '600',
  },
  sparkleIcon: {
    marginTop: 2,
  },
  heroCTAContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  ctaArrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Features Section
  featuresSection: {
    padding: 24,
    backgroundColor: '#1e1b4b', // Dark purple
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featureGradient: {
    padding: 20,
    minHeight: 220,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  featureIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 36,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  featureSubheading: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '600',
  },
  featureDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 19,
  },

  // Quick Actions
  quickSection: {
    padding: 24,
    backgroundColor: '#0f172a',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickCard: {
    width: (width - 72) / 3,
    alignItems: 'center',
  },
  quickGradient: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quickIcon: {
    fontSize: 36,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
  },

  // QR Section
  qrSection: {
    padding: 24,
    backgroundColor: '#1e1b4b',
  },
  qrCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  qrIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  qrIconBig: {
    fontSize: 36,
  },
  qrTextContainer: {
    flex: 1,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  qrSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  qrArrow: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },

  // Activity Section
  activitySection: {
    padding: 24,
    backgroundColor: '#0f172a',
  },
  activityCard: {
    padding: 24,
    borderRadius: 20,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  activityBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityBadgeIcon: {
    fontSize: 32,
  },
  activityText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  activityHighlight: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  activitySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  welcomeCard: {
    backgroundColor: '#1e293b',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  welcomeIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  welcomeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  welcomeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default HomeScreenWeb;
