import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../services/api';

interface ClassItem {
  _id: string;
  name?: string;  // Mobile format
  className?: string;  // Admin format
  description: string;
  instructor?: {
    _id?: string;
    fullName?: string;
  };
  instructorName?: string;  // Admin format
  schedule: {
    dayOfWeek: string | number;
    startTime: string;
    endTime: string;
  }[];
  capacity?: number;  // Mobile format
  maxMembers?: number;  // Admin format
  enrolled?: number;  // Mobile format
  currentMembers?: number;  // Admin format
  price: number;
  serviceId?: {
    _id: string;
    name: string;
  } | string;  // Can be populated or just ID
  serviceName?: string;  // Admin format
  service?: any;  // Admin format populated
  status?: string;
  location?: string;
  totalSessions?: number;
}

interface Service {
  _id: string;
  name: string;
}

const ClassesScreen = ({ navigation, route }: any) => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [userEnrollments, setUserEnrollments] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled'>('all');

  // Handle navigation params for service filter
  useEffect(() => {
    if (route?.params?.selectedService) {
      console.log('📍 Received service filter:', route.params.selectedService, route.params.serviceName);
      setSelectedService(route.params.selectedService);
      setActiveTab('all');
      // Reset search and price filters when coming from service selection
      setSearchQuery('');
      setPriceFilter('all');
      // Clear the params after using them to prevent re-triggering
      navigation.setParams({ selectedService: undefined, serviceName: undefined });
    }
  }, [route?.params?.selectedService, navigation]);

  useEffect(() => {
    fetchClasses();
    fetchServices();
    fetchUserEnrollments();
  }, []);

  const fetchUserEnrollments = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      
      const userData = JSON.parse(userStr);
      const userId = userData._id || userData.id;
      if (!userId) return;

      // Fetch user enrollments and payments in parallel
      const [enrollmentsData, paymentsData] = await Promise.all([
        apiService.get(`/classes/user/${userId}`).catch(() => []),
        apiService.get('/payments/user').catch(() => [])
      ]);

      setUserEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);

      // Find pending payments and extract class IDs
      const pending = new Set<string>();
      if (Array.isArray(paymentsData)) {
        paymentsData
          .filter((p: any) => p.status === 'pending')
          .forEach((p: any) => {
            if (p.registrationIds && Array.isArray(p.registrationIds)) {
              p.registrationIds.forEach((id: string) => pending.add(id));
            }
          });
      }
      setPendingPayments(pending);
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await apiService.get<ClassItem[]>('/classes');
      setClasses(response || []);
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await apiService.get<Service[]>('/services');
      setServices(response);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
    fetchUserEnrollments();
  };

  // Helper functions to handle both formats
  const getClassName = (cls: ClassItem) => cls.name || cls.className || 'Lớp học';
  const getInstructorName = (cls: ClassItem) => cls.instructor?.fullName || cls.instructorName || 'Chưa có HLV';
  const getCapacity = (cls: ClassItem) => cls.capacity || cls.maxMembers || 0;
  const getEnrolled = (cls: ClassItem) => cls.enrolled || cls.currentMembers || 0;
  const getServiceId = (cls: ClassItem) => {
    // Handle all possible formats
    if (typeof cls.serviceId === 'string') return cls.serviceId;
    if (typeof cls.serviceId === 'object' && cls.serviceId?._id) return cls.serviceId._id;
    if (typeof cls.service === 'string') return cls.service;
    if (typeof cls.service === 'object' && cls.service?._id) return cls.service._id;
    return '';
  };
  const getServiceName = (cls: ClassItem) => {
    if (typeof cls.serviceId === 'object' && cls.serviceId?.name) return cls.serviceId.name;
    if (cls.service?.name) return cls.service.name;
    return cls.serviceName || 'Dịch vụ';
  };

  const getEnrollmentStatus = (classId: string) => {
    // Check if user has enrollment for this class
    const enrollment = userEnrollments.find((e: any) => {
      const enrollClassId = e.class?._id || e.classId || e._id;
      return enrollClassId === classId;
    });

    if (!enrollment) return null;

    // Check if this enrollment has pending payment
    const hasPendingPayment = pendingPayments.has(enrollment._id);

    return {
      enrollmentId: enrollment._id,
      isPaid: enrollment.paymentStatus === true,
      isPending: hasPendingPayment,
      status: hasPendingPayment ? 'pending' : (enrollment.paymentStatus ? 'paid' : 'unpaid')
    };
  };

  // Count only paid enrollments (not pending, not unpaid)
  const paidEnrollmentsCount = useMemo(() => {
    return userEnrollments.filter((e: any) => {
      const isPaid = e.paymentStatus === true;
      const isPending = pendingPayments.has(e._id);
      return isPaid && !isPending;
    }).length;
  }, [userEnrollments, pendingPayments]);

  const filteredClasses = useMemo(() => {
    let filtered = classes;

    // Filter by tab
    if (activeTab === 'enrolled') {
      // Only show enrolled classes that are paid (not pending, not unpaid)
      const paidEnrolledClassIds = userEnrollments
        .filter((e: any) => {
          // Check if enrollment is paid
          const isPaid = e.paymentStatus === true;
          // Check if it's not pending payment
          const isPending = pendingPayments.has(e._id);
          // Only include if paid and not pending
          return isPaid && !isPending;
        })
        .map((e: any) => {
          return e.class?._id || e.classId || e._id;
        });
      
      filtered = filtered.filter((cls) => paidEnrolledClassIds.includes(cls._id));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cls) =>
          getClassName(cls).toLowerCase().includes(query) ||
          cls.description?.toLowerCase().includes(query) ||
          getInstructorName(cls).toLowerCase().includes(query)
      );
    }

    if (selectedService) {
      filtered = filtered.filter((cls) => {
        const classServiceId = getServiceId(cls);
        return classServiceId === selectedService;
      });
    }

    if (priceFilter !== 'all') {
      if (priceFilter === 'free') {
        filtered = filtered.filter((cls) => cls.price === 0);
      } else if (priceFilter === 'under500') {
        filtered = filtered.filter((cls) => cls.price > 0 && cls.price < 500000);
      } else if (priceFilter === 'above500') {
        filtered = filtered.filter((cls) => cls.price >= 500000);
      }
    }

    return filtered;
  }, [classes, searchQuery, selectedService, priceFilter, activeTab, userEnrollments, pendingPayments]);

  const getDayName = (day: string | number) => {
    // If day is number (0-6), convert to Vietnamese day name
    if (typeof day === 'number') {
      const numDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return numDays[day] || day.toString();
    }
    // If day is string, try to match
    const days: { [key: string]: string } = {
      'Monday': 'T2',
      'Tuesday': 'T3',
      'Wednesday': 'T4',
      'Thursday': 'T5',
      'Friday': 'T6',
      'Saturday': 'T7',
      'Sunday': 'CN',
    };
    return days[day] || day;
  };

  const renderClassItem = ({ item }: { item: ClassItem }) => {
    const capacity = getCapacity(item);
    const enrolled = getEnrolled(item);
    const availableSlots = capacity - enrolled;
    const isAlmostFull = availableSlots <= 5;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ClassDetail', { classId: item._id })}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#3b82f6', '#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.classCard}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.className}>{getClassName(item)}</Text>
              <Text style={styles.serviceName}>📚 {getServiceName(item)}</Text>
            </View>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.priceTag}
            >
              <Text style={styles.priceText}>{item.price.toLocaleString('vi-VN')}đ</Text>
            </LinearGradient>
          </View>

          <View style={styles.instructorSection}>
            <Text style={styles.icon}>👨‍🏫</Text>
            <Text style={styles.instructorName}>{getInstructorName(item)}</Text>
          </View>

          <View style={styles.scheduleSection}>
            <Text style={styles.sectionTitle}>📅 Lịch học:</Text>
            <View style={styles.scheduleList}>
              {item.schedule && item.schedule.length > 0 ? (
                item.schedule.map((sch, index) => (
                  <View key={index} style={styles.scheduleItem}>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayBadgeText}>{getDayName(sch.dayOfWeek)}</Text>
                    </View>
                    <Text style={styles.timeText}>
                      ⏰ {sch.startTime} - {sch.endTime}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noSchedule}>Chưa có lịch</Text>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.capacitySection}>
              <Text style={styles.icon}>👥</Text>
              <Text style={styles.capacityText}>
                {item.enrolled}/{item.capacity} học viên
              </Text>
            </View>
            {(() => {
              const enrollStatus = getEnrollmentStatus(item._id);
              if (enrollStatus?.isPending) {
                return (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>⏳ Chờ xác nhận</Text>
                  </View>
                );
              }
              if (enrollStatus?.isPaid) {
                return (
                  <View style={styles.paidBadge}>
                    <Text style={styles.paidText}>✓ Đã thanh toán</Text>
                  </View>
                );
              }
              if (enrollStatus?.status === 'unpaid') {
                return (
                  <View style={styles.unpaidBadge}>
                    <Text style={styles.unpaidText}>💳 Chưa thanh toán</Text>
                  </View>
                );
              }
              if (isAlmostFull) {
                return (
                  <View style={styles.warningBadge}>
                    <Text style={styles.warningText}>⚠️ Sắp đầy</Text>
                  </View>
                );
              }
              return null;
            })()}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Đang tải danh sách lớp học...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'enrolled' && styles.tabActive]}
          onPress={() => setActiveTab('enrolled')}
        >
          <Text style={[styles.tabText, activeTab === 'enrolled' && styles.tabTextActive]}>
            Lớp của tôi ({paidEnrollmentsCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm lớp học..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters - Fixed position */}
      <View style={styles.filtersWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            style={[styles.filterChip, selectedService === null && styles.filterChipActive]}
            onPress={() => setSelectedService(null)}
          >
            <Text style={[styles.filterChipText, selectedService === null && styles.filterChipTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {services.map((service) => (
            <TouchableOpacity
              key={service._id}
              style={[styles.filterChip, selectedService === service._id && styles.filterChipActive]}
              onPress={() => setSelectedService(service._id)}
            >
              <Text style={[styles.filterChipText, selectedService === service._id && styles.filterChipTextActive]}>
                {service.name}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={styles.filterDivider} />
          <TouchableOpacity
            style={[styles.filterChip, priceFilter === 'all' && styles.filterChipActive]}
            onPress={() => setPriceFilter('all')}
          >
            <Text style={[styles.filterChipText, priceFilter === 'all' && styles.filterChipTextActive]}>
              💰 Tất cả giá
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, priceFilter === 'free' && styles.filterChipActive]}
            onPress={() => setPriceFilter('free')}
          >
            <Text style={[styles.filterChipText, priceFilter === 'free' && styles.filterChipTextActive]}>
              Miễn phí
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, priceFilter === 'under500' && styles.filterChipActive]}
            onPress={() => setPriceFilter('under500')}
          >
            <Text style={[styles.filterChipText, priceFilter === 'under500' && styles.filterChipTextActive]}>
              {'< 500k'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, priceFilter === 'above500' && styles.filterChipActive]}
            onPress={() => setPriceFilter('above500')}
          >
            <Text style={[styles.filterChipText, priceFilter === 'above500' && styles.filterChipTextActive]}>
              {'>= 500k'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            🎯 Tìm thấy {filteredClasses.length} lớp học
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredClasses}
        renderItem={renderClassItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#ec4899"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'enrolled' ? 'Bạn chưa đăng ký lớp nào' : 'Chưa có lớp học nào'}
            </Text>
            <Text style={styles.emptySubtext}>Kéo xuống để làm mới</Text>
          </View>
        }
      />
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
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e1b4b',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#ec4899',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  tabTextActive: {
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  classCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  className: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  priceTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  priceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  instructorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  instructorName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scheduleSection: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  scheduleList: {
    gap: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  dayBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  dayBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  timeText: {
    fontSize: 15,
    color: '#fff',
  },
  noSchedule: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  capacitySection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacityText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  warningBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pendingText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  paidBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  paidText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  unpaidBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unpaidText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  clearIcon: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.6)',
    padding: 6,
  },
  filtersWrapper: {
    backgroundColor: '#0f172a',
    paddingBottom: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filtersContent: {
    paddingRight: 16,
    alignItems: 'center',
  },
  filterChip: {
    backgroundColor: '#1e1b4b',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 22,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  filterChipText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  filterDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 10,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  resultsText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
});

export default ClassesScreen;
