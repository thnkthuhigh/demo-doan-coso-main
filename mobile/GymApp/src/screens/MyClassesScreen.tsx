import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';

interface EnrolledClass {
  _id: string;
  classId: {
    _id: string;
    name: string;
    instructor: string;
    schedule: string;
    scheduleTime?: string;
    capacity: number;
    duration?: string;
    location?: string;
    startDate?: string;
  };
  enrolledAt: string;
  status: string;
}

const MyClassesScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<EnrolledClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyClasses = useCallback(async () => {
    try {
      const userId = (user as any)?._id || (user as any)?.id;
      const userRole = (user as any)?.role;
      
      if (!userId) return;

      console.log('User role:', userRole);
      console.log('User ID:', userId);

      // Helper function to format schedule
      const formatSchedule = (schedule: any): { days: string; time: string } => {
        const defaultResult = { days: 'Chưa có lịch', time: '' };
        
        if (!schedule) return defaultResult;
        if (typeof schedule === 'string') {
          // Try to parse string format like "T2 08:00-09:00, T4 08:00-09:00"
          const parts = schedule.split(',').map(s => s.trim());
          const days = parts.map(p => p.split(' ')[0]).join(', ');
          const firstTime = parts[0]?.split(' ')[1] || '';
          return { days, time: firstTime };
        }
        
        if (Array.isArray(schedule) && schedule.length > 0) {
          const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          const days = schedule.map((s: any) => {
            return typeof s.dayOfWeek === 'number' ? dayNames[s.dayOfWeek] : s.dayOfWeek;
          }).join(', ');
          
          const firstSchedule = schedule[0];
          const time = `${firstSchedule.startTime || ''}-${firstSchedule.endTime || ''}`;
          
          return { days, time };
        }
        
        if (typeof schedule === 'object' && schedule.dayOfWeek) {
          const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          const day = typeof schedule.dayOfWeek === 'number' ? dayNames[schedule.dayOfWeek] : schedule.dayOfWeek;
          const time = `${schedule.startTime || ''}-${schedule.endTime || ''}`;
          return { days: day, time };
        }
        
        return defaultResult;
      };

      // Nếu là trainer/instructor, lấy lớp đang dạy
      if (userRole === 'trainer' || userRole === 'instructor') {
        const response: any = await apiService.get(`/classes/instructor/${userId}`);
        console.log('Instructor classes:', response);
        
        const instructorClasses = Array.isArray(response)
          ? response.map((item: any) => {
              const scheduleFormatted = formatSchedule(item.schedule);
              return {
                _id: item._id,
                classId: {
                  _id: item._id,
                  name: item.className || item.name,
                  instructor: item.instructorName || 'Bạn',
                  schedule: scheduleFormatted.days,
                  scheduleTime: scheduleFormatted.time,
                  capacity: item.capacity || 20,
                  duration: item.duration || 'Chưa xác định',
                  location: item.location || 'Phòng tập chính',
                  startDate: item.startDate,
                },
                enrolledAt: item.createdAt || new Date().toISOString(),
                status: 'active',
              };
            })
          : [];
        
        setClasses(instructorClasses as EnrolledClass[]);
      } else {
        // Nếu là học viên, lấy lớp đã thanh toán
        const response: any = await apiService.get(`/classes/user/${userId}`);
        
        const paidClasses = Array.isArray(response) 
          ? response
              .filter((item: any) => item.paymentStatus === true)
              .map((item: any) => {
                const scheduleFormatted = formatSchedule(item.schedule);
                return {
                  _id: item._id,
                  classId: {
                    _id: item.classId || item._id,
                    name: item.className || item.name,
                    instructor: item.instructorName || 'Chưa có HLV',
                    schedule: scheduleFormatted.days,
                    scheduleTime: scheduleFormatted.time,
                    capacity: item.capacity || 20,
                    duration: item.duration || 'Chưa xác định',
                    location: item.location || 'Phòng tập chính',
                    startDate: item.startDate,
                  },
                  enrolledAt: item.enrolledAt || new Date().toISOString(),
                  status: 'active',
                };
              })
          : [];
        
        console.log('Paid classes:', paidClasses);
        setClasses(paidClasses as EnrolledClass[]);
      }
    } catch (error) {
      console.error('Error fetching my classes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyClasses();
  }, [fetchMyClasses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyClasses();
  };

  const handleViewDetails = (classId: string) => {
    navigation.navigate('ClassDetail', { classId });
  };

  const renderClassCard = (enrollment: EnrolledClass, index: number) => {
    const classData = enrollment.classId;
    if (!classData) return null;

    // Tạo mảng màu cho các lớp học với nhiều màu khác biệt
    const cardColors = [
      { bg: '#4f46e5', light: '#e0e7ff' }, // Indigo
      { bg: '#f59e0b', light: '#fef3c7' }, // Orange  
      { bg: '#8b5cf6', light: '#ede9fe' }, // Purple
      { bg: '#10b981', light: '#d1fae5' }, // Green
      { bg: '#ef4444', light: '#fee2e2' }, // Red
      { bg: '#06b6d4', light: '#cffafe' }, // Cyan
      { bg: '#ec4899', light: '#fce7f3' }, // Pink
      { bg: '#14b8a6', light: '#ccfbf1' }, // Teal
    ];
    
    // Sử dụng index để mỗi lớp trong danh sách có màu khác nhau
    const colorIndex = index % cardColors.length;
    const colorScheme = cardColors[colorIndex];

    return (
      <View key={enrollment._id} style={[styles.classCard, { backgroundColor: colorScheme.bg }]}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.className}>{classData.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: colorScheme.light }]}>
              <Text style={[styles.statusText, { color: colorScheme.bg }]}>
                {enrollment.status === 'active' ? 'Đang học' : 'Hoàn thành'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👨‍🏫</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Giảng viên</Text>
              <Text style={styles.infoText}>{classData.instructor}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Lịch học</Text>
              <Text style={styles.infoText}>{classData.schedule}</Text>
              {classData.scheduleTime && (
                <Text style={styles.infoTime}>{classData.scheduleTime}</Text>
              )}
            </View>
          </View>

          {classData.location && (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Địa điểm</Text>
                <Text style={styles.infoText}>{classData.location}</Text>
              </View>
            </View>
          )}

          {classData.startDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🗓️</Text>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Ngày bắt đầu</Text>
                <Text style={styles.infoText}>
                  {new Date(classData.startDate).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👥</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Sức chứa</Text>
              <Text style={styles.infoText}>{classData.capacity} người</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.viewButtonFull}
            onPress={() => handleViewDetails(classData._id)}
          >
            <Text style={styles.viewButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Đang tải lớp học...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lớp Của Tôi</Text>
        <Text style={styles.headerSubtitle}>
          {classes.length} lớp đã đăng ký
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {classes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>Chưa đăng ký lớp nào</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Main', { screen: 'Classes' })}
            >
              <Text style={styles.browseButtonText}>Khám phá lớp học</Text>
            </TouchableOpacity>
          </View>
        ) : (
          classes.map(renderClassCard)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  classCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  className: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  cardBody: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 2,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoTime: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  checkInButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  checkInButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewButtonFull: {
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyClassesScreen;
