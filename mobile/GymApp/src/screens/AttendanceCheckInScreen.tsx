import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ClassSession {
  sessionNumber: number;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  attendees?: string[];
}

const AttendanceCheckInScreen = ({ route, navigation }: any) => {
  const { classId, className } = route.params;
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState<number | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/attendances/class/${classId}/sessions`);
      setSessions(response as ClassSession[]);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách buổi học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckIn = async (sessionNumber: number) => {
    const userId = (user as any)?._id || (user as any)?.id;
    if (!userId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      return;
    }

    Alert.alert(
      'Xác nhận điểm danh',
      `Bạn có chắc muốn điểm danh buổi ${sessionNumber}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Điểm danh',
          onPress: async () => {
            try {
              setCheckingIn(sessionNumber);
              
              await apiService.post('/attendance/mark', {
                userId,
                classId,
                sessionNumber,
                isPresent: true,
                notes: '',
              });

              Alert.alert('Thành công', 'Điểm danh thành công!');
              fetchSessions(); // Refresh để cập nhật trạng thái
            } catch (error: any) {
              console.error('Check-in error:', error);
              Alert.alert(
                'Lỗi',
                error.message || 'Không thể điểm danh. Vui lòng thử lại.'
              );
            } finally {
              setCheckingIn(null);
            }
          },
        },
      ]
    );
  };

  const isCheckedIn = (session: ClassSession) => {
    const userId = (user as any)?._id || (user as any)?.id;
    return session.attendees?.includes(userId);
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#007AFF';
    }
  };

  const getSessionStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Sắp diễn ra';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải danh sách buổi học...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Điểm danh</Text>
          <Text style={styles.headerSubtitle}>{className}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsIcon}>ℹ️</Text>
        <View style={styles.instructionsTextContainer}>
          <Text style={styles.instructionsTitle}>Hướng dẫn điểm danh</Text>
          <Text style={styles.instructionsText}>
            • Nhấn "Điểm danh" để xác nhận tham gia buổi học{'\n'}
            • Chỉ điểm danh được trong ngày học{'\n'}
            • Không thể hủy sau khi đã điểm danh
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>Chưa có buổi học nào</Text>
          </View>
        ) : (
          sessions.map((session) => {
            const checkedIn = isCheckedIn(session);
            const statusColor = getSessionStatusColor(session.status);
            const canCheckIn = session.status === 'scheduled' && !checkedIn;

            return (
              <View key={session.sessionNumber} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionNumberContainer}>
                    <Text style={styles.sessionNumberLabel}>Buổi</Text>
                    <Text style={styles.sessionNumber}>{session.sessionNumber}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusBadgeText}>
                      {getSessionStatusText(session.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.sessionInfo}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📅</Text>
                    <Text style={styles.infoText}>{formatDate(session.date)}</Text>
                  </View>
                  
                  {checkedIn && (
                    <View style={styles.checkedInBadge}>
                      <Text style={styles.checkedInIcon}>✓</Text>
                      <Text style={styles.checkedInText}>Đã điểm danh</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.checkInButton,
                    !canCheckIn && styles.checkInButtonDisabled,
                    checkedIn && styles.checkInButtonSuccess,
                  ]}
                  onPress={() => handleCheckIn(session.sessionNumber)}
                  disabled={!canCheckIn || checkingIn === session.sessionNumber}
                >
                  {checkingIn === session.sessionNumber ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.checkInButtonText}>
                      {checkedIn
                        ? '✓ Đã điểm danh'
                        : session.status === 'cancelled'
                        ? 'Buổi học đã hủy'
                        : session.status === 'completed'
                        ? 'Buổi học đã kết thúc'
                        : 'Điểm danh ngay'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
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
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 28,
    color: '#007AFF',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  instructionsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  instructionsTextContainer: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 20,
  },
  scrollContent: {
    padding: 15,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sessionNumberContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  sessionNumberLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  sessionNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sessionInfo: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
  },
  checkedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  checkedInIcon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 6,
  },
  checkedInText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  checkInButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkInButtonDisabled: {
    backgroundColor: '#ccc',
  },
  checkInButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  checkInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default AttendanceCheckInScreen;
