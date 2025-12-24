import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../services/api';

interface AttendanceDetailScreenProps {
  navigation: any;
  route: any;
}

interface AttendanceRecord {
  _id: string;
  userId: {
    _id: string;
    fullName?: string;
    username?: string;
    email?: string;
  };
  isPresent: boolean;
  sessionDate: string;
  sessionNumber?: number;
  isLocked?: boolean;
  markedAt?: string;
}

const AttendanceDetailScreen: React.FC<AttendanceDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { classId, className, date, sessionNumber } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [editedStatus, setEditedStatus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchAttendanceDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAttendanceDetails = async () => {
    try {
      setLoading(true);
      
      // Parse date directly without timezone conversion
      const dateStr = date.split('T')[0]; // Just get YYYY-MM-DD part
      
      console.log('=== FETCHING ATTENDANCE DETAILS ===');
      console.log('Class ID:', classId);
      console.log('Class Name:', className);
      console.log('Target Date (from params - RAW):', date);
      console.log('Target Date (formatted):', dateStr);

      // Fetch ALL enrollments for this class
      const enrollmentsResponse = await apiService.get(`/classes/${classId}/enrollments`);
      const enrollments = enrollmentsResponse as any[];
      
      console.log('Total enrollments:', enrollments.length);

      // Fetch attendance records for this class
      const response = await apiService.get(`/attendance/class/${classId}`);
      const allRecords = response as AttendanceRecord[];
      
      console.log('Total attendance records:', allRecords.length);

      // Filter records for this specific date
      const dateRecords = allRecords.filter((record: AttendanceRecord) => {
        const recordDate = record.sessionDate.split('T')[0];
        return recordDate === dateStr;
      });
      
      console.log('Filtered records for date:', dateRecords.length);

      // Create a complete list: all enrollments with their attendance status
      const completeRecords: AttendanceRecord[] = enrollments.map((enrollment) => {
        const userId = enrollment.user?._id || enrollment.userId?._id;
        const userName = enrollment.user?.fullName || enrollment.userId?.fullName || 'Unknown';
        
        // Find existing attendance record for this student
        const existingRecord = dateRecords.find((record) => {
          const recordUserId = record.userId?._id || record.userId;
          return recordUserId === userId;
        });
        
        if (existingRecord) {
          // Return existing record
          return existingRecord;
        } else {
          // Create a placeholder record for students without attendance
          return {
            _id: `placeholder-${userId}`,
            userId: {
              _id: userId,
              fullName: userName,
              email: enrollment.user?.email || enrollment.userId?.email,
            },
            isPresent: false,
            sessionDate: date,
            isLocked: false,
          };
        }
      });

      console.log('Complete records (with placeholders):', completeRecords.length);

      setAttendanceRecords(completeRecords);
      
      // Initialize edited status from current records
      const statusMap: { [key: string]: boolean } = {};
      completeRecords.forEach((record) => {
        statusMap[record._id] = record.isPresent;
      });
      setEditedStatus(statusMap);
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching attendance details:', error);
      setLoading(false);
      Alert.alert('Lỗi', 'Không thể tải chi tiết điểm danh');
    }
  };

  const formatDate = (dateString: string) => {
    // Parse date as YYYY-MM-DD (no timezone conversion)
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const getStudentName = (student: AttendanceRecord['userId']) => {
    return student.fullName || student.username || student.email || 'Học viên';
  };

  const toggleAttendance = (recordId: string) => {
    setEditedStatus((prev) => ({
      ...prev,
      [recordId]: !prev[recordId],
    }));
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      
      // Find records that have been changed
      const updates = attendanceRecords.filter((record) => {
        return editedStatus[record._id] !== record.isPresent;
      });

      if (updates.length === 0) {
        Alert.alert('Thông báo', 'Không có thay đổi nào để lưu');
        setSaving(false);
        return;
      }

      console.log('Updates to save:', updates);

      // Save each update
      let successCount = 0;
      let errorCount = 0;
      
      for (const record of updates) {
        try {
          const isPlaceholder = record._id.startsWith('placeholder-');
          
          if (isPlaceholder) {
            // This is a new record, use POST to create it
            console.log('Creating new attendance record for:', record.userId._id);
            
            // Need to get sessionNumber from the date
            const dateStr = date.split('T')[0];
            
            await apiService.post('/attendance/mark', {
              classId: classId,
              userId: record.userId._id,
              sessionNumber: sessionNumber || 1,
              sessionDate: dateStr,
              isPresent: editedStatus[record._id],
              notes: '',
            });
          } else {
            // This is an existing record, use PUT to update
            console.log('Updating existing attendance record:', record._id);
            
            await apiService.put(`/attendance/${record._id}`, {
              isPresent: editedStatus[record._id],
            });
          }
          
          successCount++;
        } catch (err: any) {
          console.error('Error saving attendance:', err);
          console.error('Error message:', err?.message);
          errorCount++;
        }
      }

      if (successCount > 0) {
        Alert.alert(
          'Thành công', 
          `Đã cập nhật ${successCount} điểm danh${errorCount > 0 ? ` (${errorCount} lỗi)` : ''}`,
          [{ text: 'OK', onPress: () => fetchAttendanceDetails() }]
        );
      } else {
        Alert.alert('Lỗi', 'Không thể cập nhật điểm danh');
      }
      
      setSaving(false);
    } catch (error: any) {
      console.error('Error saving changes:', error);
      setSaving(false);
      Alert.alert('Lỗi', error?.message || 'Không thể lưu thay đổi');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Đang tải chi tiết điểm danh...</Text>
      </View>
    );
  }

  // Calculate stats from current editedStatus
  const currentPresentCount = Object.values(editedStatus).filter((status) => status === true).length;
  const currentAbsentCount = Object.values(editedStatus).filter((status) => status === false).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#581c87', '#1e40af', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Chi tiết điểm danh</Text>
          <Text style={styles.headerSubtitle}>{className}</Text>
          <Text style={styles.headerDate}>{formatDate(date)}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>📊 Thống kê điểm danh</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{attendanceRecords.length}</Text>
              <Text style={styles.statLabel}>Tổng số</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxSuccess]}>
              <Text style={[styles.statNumber, styles.statNumberSuccess]}>
                {currentPresentCount}
              </Text>
              <Text style={[styles.statLabel, styles.statLabelSuccess]}>Có mặt</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxDanger]}>
              <Text style={[styles.statNumber, styles.statNumberDanger]}>
                {currentAbsentCount}
              </Text>
              <Text style={[styles.statLabel, styles.statLabelDanger]}>Vắng mặt</Text>
            </View>
          </View>

          {attendanceRecords.length > 0 && (
            <View style={styles.percentageBar}>
              <View
                style={[
                  styles.percentageFill,
                  {
                    width: `${(currentPresentCount / attendanceRecords.length) * 100}%`,
                  },
                ]}
              />
            </View>
          )}
          <Text style={styles.percentageText}>
            Tỷ lệ tham dự:{' '}
            {attendanceRecords.length > 0
              ? Math.round((currentPresentCount / attendanceRecords.length) * 100)
              : 0}
            %
          </Text>
        </View>

        {/* All Students with Edit Controls */}
        {attendanceRecords.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>👥</Text>
              <Text style={styles.sectionTitle}>
                Danh sách học viên ({attendanceRecords.length})
              </Text>
            </View>
            {attendanceRecords.map((record, index) => {
              const isPresent = editedStatus[record._id];
              const hasChanged = isPresent !== record.isPresent;
              const isRecordLocked = record.isLocked;
              
              return (
                <View 
                  key={record._id} 
                  style={[
                    styles.studentCard,
                    isPresent ? styles.studentCardPresent : styles.studentCardAbsent,
                    hasChanged && !isRecordLocked && styles.studentCardChanged
                  ]}
                >
                  <View style={[
                    styles.studentNumber,
                    isPresent ? styles.studentNumberPresent : styles.studentNumberAbsent
                  ]}>
                    <Text style={styles.studentNumberText}>{index + 1}</Text>
                  </View>
                  
                  <View style={styles.studentInfo}>
                    <View style={styles.studentNameRow}>
                      <Text style={styles.studentName}>
                        {getStudentName(record.userId)}
                      </Text>
                      {hasChanged && <Text style={styles.changedBadge}>✎ Đã sửa</Text>}
                    </View>
                    <Text style={styles.studentMeta}>
                      Buổi {record.sessionNumber || sessionNumber || 1}
                    </Text>
                  </View>

                  {/* Luôn hiển thị buttons - cho phép chỉnh sửa */}
                  <View style={styles.attendanceButtons}>
                    <TouchableOpacity
                      style={[
                        styles.attendanceButton,
                        styles.presentButton,
                        isPresent && styles.presentActive
                      ]}
                      onPress={() => {
                        if (!isPresent) {
                          toggleAttendance(record._id);
                        }
                      }}
                    >
                      <Text style={[
                        styles.buttonText,
                        isPresent && styles.buttonTextActive
                      ]}>
                        ✓
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.attendanceButton,
                        styles.absentButton,
                        !isPresent && styles.absentActive
                      ]}
                      onPress={() => {
                        if (isPresent) {
                          toggleAttendance(record._id);
                        }
                      }}
                    >
                      <Text style={[
                        styles.buttonText,
                        !isPresent && styles.buttonTextActive
                      ]}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {attendanceRecords.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateText}>Chưa có dữ liệu điểm danh</Text>
            <Text style={styles.emptyStateSubtext}>
              Chưa có học viên nào được điểm danh cho buổi học này
            </Text>
          </View>
        )}

        {/* Action Buttons - luôn hiển thị */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, saving && styles.actionButtonDisabled]}
            onPress={saveChanges}
            disabled={saving}
          >
            <Text style={styles.actionButtonText}>
              {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
              ← Quay lại
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  headerDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statBoxSuccess: {
    backgroundColor: '#d4edda',
  },
  statBoxDanger: {
    backgroundColor: '#f8d7da',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statNumberSuccess: {
    color: '#28a745',
  },
  statNumberDanger: {
    color: '#dc3545',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statLabelSuccess: {
    color: '#155724',
  },
  statLabelDanger: {
    color: '#721c24',
  },
  percentageBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  percentageFill: {
    height: '100%',
    backgroundColor: '#28a745',
  },
  percentageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#ccc',
  },
  studentCardPresent: {
    backgroundColor: 'rgba(40, 167, 69, 0.05)',
    borderLeftColor: '#28a745',
  },
  studentCardAbsent: {
    backgroundColor: 'rgba(220, 53, 69, 0.05)',
    borderLeftColor: '#dc3545',
  },
  studentCardChanged: {
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  studentNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentNumberPresent: {
    backgroundColor: '#28a745',
  },
  studentNumberAbsent: {
    backgroundColor: '#dc3545',
  },
  studentNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  studentInfo: {
    flex: 1,
  },
  studentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  changedBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffc107',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  studentMeta: {
    fontSize: 13,
    color: '#666',
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  attendanceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  presentButton: {
    borderColor: '#28a745',
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
  },
  presentActive: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  absentButton: {
    borderColor: '#dc3545',
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
  },
  absentActive: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
  },
  buttonTextActive: {
    color: '#fff',
  },
  statusBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#d4edda',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgeAbsent: {
    backgroundColor: '#f8d7da',
  },
  statusBadgeText: {
    fontSize: 16,
    color: '#28a745',
  },
  statusBadgeTextAbsent: {
    color: '#dc3545',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  actions: {
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  actionButtonTextSecondary: {
    color: '#4CAF50',
  },
  lockedBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6c757d',
    backgroundColor: 'rgba(108, 117, 125, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lockedStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockedStatus: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  lockedStatusPresent: {
    backgroundColor: 'rgba(40, 167, 69, 0.15)',
    borderWidth: 2,
    borderColor: '#28a745',
  },
  lockedStatusAbsent: {
    backgroundColor: 'rgba(220, 53, 69, 0.15)',
    borderWidth: 2,
    borderColor: '#dc3545',
  },
  lockedStatusText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#28a745',
  },
  lockedStatusTextAbsent: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  lockedMessage: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6c757d',
  },
  lockedMessageIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  lockedMessageText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
});

export default AttendanceDetailScreen;
