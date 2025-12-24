import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';

interface TrainerClass {
  _id: string;
  className: string;
  serviceName: string;
  currentMembers: number;
  maxMembers: number;
  schedule: {
    dayOfWeek: string | number;
    startTime: string;
    endTime: string;
  }[];
  totalSessions: number;
  currentSession: number;
  status: string;
}

const TrainerClassesScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<TrainerClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTrainerClasses();
  }, []);

  const fetchTrainerClasses = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/classes/instructor/my-classes');
      setClasses(response || []);
    } catch (error) {
      console.error('Error fetching trainer classes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrainerClasses();
  };

  const getDayName = (day: string | number) => {
    if (typeof day === 'number') {
      const numDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return numDays[day] || day.toString();
    }
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

  const getColorByIndex = (index: number) => {
    const colors = [
      ['#4f46e5', '#4338ca'], // Indigo
      ['#f59e0b', '#d97706'], // Orange
      ['#8b5cf6', '#7c3aed'], // Purple
      ['#10b981', '#059669'], // Green
      ['#ef4444', '#dc2626'], // Red
      ['#06b6d4', '#0891b2'], // Cyan
      ['#ec4899', '#db2777'], // Pink
      ['#14b8a6', '#0d9488'], // Teal
    ];
    return colors[index % colors.length];
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'Đang diễn ra';
      case 'upcoming':
        return 'Sắp diễn ra';
      case 'completed':
        return 'Đã kết thúc';
      default:
        return status;
    }
  };

  const renderClassItem = ({ item, index }: { item: TrainerClass; index: number }) => {
    const progressPercent = (item.currentSession / item.totalSessions) * 100;
    const memberPercent = (item.currentMembers / item.maxMembers) * 100;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('AttendanceManagement', { classId: item._id, className: item.className })}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={getColorByIndex(index)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.classCard}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.className}>{item.className}</Text>
              <Text style={styles.serviceName}>📚 {item.serviceName}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
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

          <View style={styles.progressSection}>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Tiến độ buổi học</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {item.currentSession}/{item.totalSessions} buổi
              </Text>
            </View>

            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Học viên</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${memberPercent}%`, backgroundColor: '#ec4899' }]} />
              </View>
              <Text style={styles.progressText}>
                {item.currentMembers}/{item.maxMembers} người
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AttendanceManagement', { classId: item._id, className: item.className })}
          >
            <Text style={styles.actionButtonText}>📝 Điểm danh</Text>
          </TouchableOpacity>
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


      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ec4899" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>Chưa có lớp học nào</Text>
            <Text style={styles.emptySubtext}>Bạn chưa được phân công lớp học</Text>
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
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
    color: '#fff',
    marginBottom: 6,
  },
  serviceName: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  scheduleSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
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
  progressSection: {
    marginBottom: 16,
    gap: 12,
  },
  progressItem: {
    gap: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
});

export default TrainerClassesScreen;
