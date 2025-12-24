    import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../services/api';

interface AttendanceRecord {
  _id: string;
  date: string;
  sessionNumber: number;
  status: 'present' | 'absent';
  classInfo?: {
    _id: string;
    name: string;
    instructor: string;
  };
}

interface ClassGroup {
  classId: string;
  className: string;
  instructor: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  sessions: AttendanceRecord[];
}

interface AttendanceResponse {
  attendance?: AttendanceRecord[];
  totalSessions?: number;
}

const AttendanceHistoryScreen = ({ route, navigation }: any) => {
  const { classId, className } = route.params || {};
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalSessions, setTotalSessions] = useState(12);

  const fetchAttendanceHistory = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = classId
        ? `/attendance/my-history/${classId}`
        : '/attendance/my-history';
      
      console.log('📍 Fetching attendance history from:', endpoint);
      const response = await apiService.get<AttendanceResponse | AttendanceRecord[]>(endpoint);
      console.log('✅ Attendance history response:', response);
      
      if (classId && response && typeof response === 'object' && 'attendance' in response) {
        // Specific class view
        const sessions = response.totalSessions || 12;
        console.log('🔢 Total sessions from backend:', sessions);
        console.log('📋 Attendance records:', response.attendance?.length || 0);
        
        setAttendanceHistory(response.attendance || []);
        setTotalSessions(Math.min(sessions, 20)); // Giới hạn tối đa 20 buổi để tránh lỗi
      } else {
        // All classes view
        const records = Array.isArray(response) ? response : [];
        console.log('📊 Total records:', records.length);
        setAttendanceHistory(records);
        
        // Group by class khi hiển thị tất cả lớp
        const grouped = groupByClass(records);
        setClassGroups(grouped);
      }
      
    } catch (error) {
      console.error('❌ Error fetching attendance history:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử điểm danh');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [classId]);

  // Auto-refresh khi màn hình được focus (quay lại từ màn hình khác)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Screen focused - refreshing data');
      fetchAttendanceHistory();
      
      // Auto-refresh mỗi 15 giây khi màn hình đang active
      const interval = setInterval(() => {
        console.log('⏰ Auto-refreshing attendance data...');
        fetchAttendanceHistory();
      }, 15000); // 15 giây
      
      return () => {
        console.log('🛑 Screen unfocused - clearing interval');
        clearInterval(interval);
      };
    }, [fetchAttendanceHistory])
  );

  const groupByClass = (records: AttendanceRecord[]): ClassGroup[] => {
    const groupMap: { [key: string]: ClassGroup } = {};
    
    console.log('📊 Grouping records:', records.length);
    console.log('📋 First record sample:', JSON.stringify(records[0], null, 2));
    
    records.forEach(record => {
      console.log('Processing record:', {
        _id: record._id,
        date: record.date,
        status: record.status,
        classInfo: record.classInfo
      });
      
      if (!record.classInfo) {
        console.log('⚠️ Record missing classInfo:', record._id);
        return;
      }
      
      const recordClassId = record.classInfo._id;
      const recordClassName = record.classInfo.name || 'Lớp học';
      const instructor = record.classInfo.instructor || 'Chưa có HLV';
      
      console.log('🏫 Class details:', { classId: recordClassId, className: recordClassName, instructor });
      
      if (!groupMap[recordClassId]) {
        groupMap[recordClassId] = {
          classId: recordClassId,
          className: recordClassName,
          instructor: instructor,
          totalSessions: 0,
          presentCount: 0,
          absentCount: 0,
          sessions: [],
        };
        console.log('✨ Created new class group:', recordClassId, recordClassName, instructor);
      }
      
      groupMap[recordClassId].sessions.push(record);
      groupMap[recordClassId].totalSessions++;
      
      if (record.status === 'present') {
        groupMap[recordClassId].presentCount++;
      } else {
        groupMap[recordClassId].absentCount++;
      }
    });
    
    const result = Object.values(groupMap);
    console.log('✅ Grouped into', result.length, 'classes');
    result.forEach(cls => {
      console.log(`  - ${cls.className}: ${cls.totalSessions} sessions`);
    });
    
    return result;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendanceHistory();
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleClassPress = (classItem: ClassGroup) => {
    // Navigate to detail screen with classId
    navigation.push('AttendanceHistory', {
      classId: classItem.classId,
      className: classItem.className,
    });
  };

  const generateFullSessionList = () => {
    const sessions = [];
    const attendanceMap = new Map();
    
    // Map existing attendance records
    attendanceHistory.forEach(record => {
      if (record.sessionNumber) {
        attendanceMap.set(record.sessionNumber, record);
      }
    });
    
    // Tính khoảng cách giữa các buổi (mặc định 3.5 ngày = 2 buổi/tuần)
    let avgDaysBetweenSessions = 3.5;
    let firstSessionDate = null;
    
    if (attendanceHistory.length >= 2) {
      const sortedAttendance = [...attendanceHistory]
        .filter(a => a.sessionNumber && a.date)
        .sort((a, b) => a.sessionNumber - b.sessionNumber);
      
      if (sortedAttendance.length >= 2) {
        const first = new Date(sortedAttendance[0].date);
        const last = new Date(sortedAttendance[sortedAttendance.length - 1].date);
        const daysDiff = (last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24);
        const sessionsDiff = sortedAttendance[sortedAttendance.length - 1].sessionNumber - sortedAttendance[0].sessionNumber;
        
        if (sessionsDiff > 0) {
          avgDaysBetweenSessions = daysDiff / sessionsDiff;
        }
        firstSessionDate = first;
      }
    } else if (attendanceHistory.length === 1) {
      firstSessionDate = new Date(attendanceHistory[0].date);
    }
    
    // Nếu không có buổi nào, dùng ngày hiện tại
    if (!firstSessionDate) {
      firstSessionDate = new Date();
    }
    
    // Generate all sessions
    for (let i = 1; i <= totalSessions; i++) {
      const attendance = attendanceMap.get(i);
      
      // Tính ngày dự kiến cho buổi này
      let estimatedDate = new Date(firstSessionDate);
      if (attendance && attendance.date) {
        estimatedDate = new Date(attendance.date);
      } else {
        // Tính ngày dự kiến dựa trên buổi đầu + khoảng cách
        const daysToAdd = (i - 1) * avgDaysBetweenSessions;
        estimatedDate = new Date(firstSessionDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      }
      
      sessions.push({
        sessionNumber: i,
        attendance: attendance || null,
        estimatedDate: estimatedDate,
      });
    }
    
    return sessions;
  };

  const renderSessionItem = (item: any) => {
    const { sessionNumber, attendance, estimatedDate } = item;
    
    if (!attendance) {
      // Chưa điểm danh - hiển thị ngày dự kiến
      const date = new Date(estimatedDate);
      const dayOfWeek = date.toLocaleDateString('vi-VN', { weekday: 'long' });
      const dateStr = formatDateShort(estimatedDate);
      const isPast = date < new Date();
      
      return (
        <View style={styles.sessionItem} key={`session-${sessionNumber}`}>
          <View style={styles.sessionLeft}>
            <Text style={styles.sessionDate}>📅 Buổi {sessionNumber} - {dayOfWeek}</Text>
            <Text style={styles.sessionTime}>{dateStr} {isPast ? '(Đã qua)' : '(Dự kiến)'}</Text>
          </View>
          <View style={[styles.sessionStatus, { backgroundColor: '#f3f4f6' }]}>
            <Text style={[styles.sessionStatusText, { color: '#9ca3af' }]}>
              ⏳ Chưa điểm danh
            </Text>
          </View>
        </View>
      );
    }

    // Đã điểm danh
    const isPresent = attendance.status === 'present';
    const statusColor = isPresent ? '#10b981' : '#ef4444';
    const statusBg = isPresent ? '#d1fae5' : '#fee2e2';
    const statusIcon = isPresent ? '✓' : '✗';
    const statusText = isPresent ? 'Có mặt' : 'Vắng';

    const date = new Date(attendance.date);
    const dayOfWeek = date.toLocaleDateString('vi-VN', { weekday: 'long' });
    const dateStr = formatDateShort(attendance.date);

    return (
      <View style={styles.sessionItem} key={`session-${sessionNumber}`}>
        <View style={styles.sessionLeft}>
          <Text style={styles.sessionDate}>📅 Buổi {sessionNumber} - {dayOfWeek}</Text>
          <Text style={styles.sessionTime}>{dateStr}</Text>
          {attendance.classInfo && (
            <Text style={styles.sessionClass}>📚 {attendance.classInfo.name}</Text>
          )}
        </View>
        <View style={[styles.sessionStatus, { backgroundColor: statusBg }]}>
          <Text style={[styles.sessionStatusText, { color: statusColor }]}>
            {statusIcon} {statusText}
          </Text>
        </View>
      </View>
    );
  };

  const renderClassItem = ({ item }: { item: ClassGroup }) => {
    const attendanceRate = item.totalSessions > 0 
      ? ((item.presentCount / item.totalSessions) * 100).toFixed(0)
      : 0;
    
    console.log('📋 Rendering class item:', {
      className: item.className,
      instructor: item.instructor,
      classId: item.classId
    });
    
    return (
      <TouchableOpacity
        style={styles.classCard}
        onPress={() => handleClassPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.classHeader}>
          <View style={styles.classHeaderLeft}>
            <View style={styles.classNameRow}>
              <Text style={styles.classIcon}>📚</Text>
              <Text style={styles.className}>{item.className || 'Lớp học'}</Text>
            </View>
            <View style={styles.instructorRow}>
              <Text style={styles.instructorIcon}>👨‍🏫</Text>
              <Text style={styles.instructorName}>{item.instructor || 'Chưa có giảng viên'}</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={24} color="#9CA3AF" />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tổng buổi</Text>
            <Text style={styles.statValue}>{item.totalSessions}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Có mặt</Text>
            <Text style={[styles.statValue, { color: '#10b981' }]}>{item.presentCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Vắng</Text>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>{item.absentCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tỷ lệ</Text>
            <Text style={[styles.statValue, { color: '#3b82f6' }]}>{attendanceRate}%</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render detail view when classId is provided
  if (classId) {
    const fullSessions = generateFullSessionList();
    
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#581c87', '#1e40af']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{className || 'Chi tiết điểm danh'}</Text>
        </LinearGradient>

        <View style={styles.detailHeader}>
          <Text style={styles.detailHeaderText}>
            Tổng: {totalSessions} buổi | Có mặt: {attendanceHistory.filter(r => r.status === 'present').length} | Vắng: <Text style={styles.absentCount}>{attendanceHistory.filter(r => r.status === 'absent').length}</Text>
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Tất cả buổi học ({fullSessions.length} buổi)</Text>

        <FlatList
          data={fullSessions}
          renderItem={({ item }) => renderSessionItem(item)}
          keyExtractor={(item) => `session-${item.sessionNumber}`}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
          }
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Đang tải lịch sử điểm danh...</Text>
      </View>
    );
  }

  // Render list of classes
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#581c87', '#1e40af']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Lịch sử điểm danh</Text>
      </LinearGradient>

      <FlatList
        data={classGroups}
        renderItem={renderClassItem}
        keyExtractor={(item) => item.classId}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="document-text-outline" size={80} color="#9CA3AF" />
            <Text style={styles.emptyText}>Chưa có lịch sử điểm danh</Text>
            <Text style={styles.emptySubtext}>
              Bạn sẽ thấy thông tin điểm danh sau khi tham gia lớp học
            </Text>
          </View>
        }
      />
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
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  detailHeader: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailHeaderText: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    padding: 16,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  classHeaderLeft: {
    flex: 1,
  },
  classNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  classIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructorIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  instructorName: {
    fontSize: 14,
    color: '#666',
  },
  classMetaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  classMeta: {
    fontSize: 14,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  statsText: {
    fontSize: 14,
    color: '#666',
  },
  absentCount: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  sessionLeft: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  sessionClass: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '500',
    marginTop: 4,
  },
  sessionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sessionStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default AttendanceHistoryScreen;
