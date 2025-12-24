import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../services/api';

interface Student {
  _id: string;
  user?: {
    _id: string;
    fullName: string;
    email: string;
  };
  userId?: {
    _id: string;
    fullName: string;
    email: string;
  };
  attendanceRecords?: {
    date: string;
    status: 'present' | 'absent';
    sessionDate: string;
    isLocked?: boolean;
    isPresent?: boolean;
    checkinTime?: Date | null;
  }[];
}

interface ClassSchedule {
  dayOfWeek: number; // 0 = CN, 1 = T2, etc.
  startTime: string;
  endTime: string;
}

interface ClassInfo {
  _id: string;
  className: string;
  schedule: ClassSchedule[];
  startDate: string;
  endDate: string;
  totalSessions: number;
  currentSession: number;
}

const AttendanceManagementScreen = ({ route, navigation: _navigation }: any) => {
  const { classId, className } = route.params;
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); // Sẽ được set sau khi load class info
  const [attendanceStatus, setAttendanceStatus] = useState<{ [key: string]: 'present' | 'absent' }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sessionNumber, setSessionNumber] = useState(1);
  const [totalSessions, setTotalSessions] = useState(12);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [sessionDates, setSessionDates] = useState<string[]>([]);
  const [attendedSessions, setAttendedSessions] = useState<Set<string>>(new Set());
  const [isSessionLocked, setIsSessionLocked] = useState(false);

  // Tính toán các ngày có buổi học dựa trên lịch của lớp
  const calculateSessionDates = (classData: ClassInfo) => {
    const dates: string[] = [];
    
    // Parse dates as LOCAL dates, not UTC
    const [startYear, startMonth, startDay] = classData.startDate.split('T')[0].split('-').map(Number);
    const [endYear, endMonth, endDay] = classData.endDate.split('T')[0].split('-').map(Number);
    
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);
    
    console.log('=== CALCULATING SESSION DATES ===');
    console.log('Start Date:', startDate.toDateString());
    console.log('End Date:', endDate.toDateString());
    console.log('Total Sessions:', classData.totalSessions);
    console.log('Schedule:', classData.schedule);
    
    // Lấy các dayOfWeek từ schedule
    const scheduleDays = classData.schedule.map(s => s.dayOfWeek);
    console.log('Schedule Days (0=CN, 1=T2, 2=T3...):', scheduleDays);
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate && dates.length < classData.totalSessions) {
      const dayOfWeek = currentDate.getDay();
      
      // Nếu ngày này nằm trong schedule
      if (scheduleDays.includes(dayOfWeek)) {
        // Format YYYY-MM-DD manually to avoid timezone issues
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        dates.push(dateStr);
        console.log(`Session #${dates.length}: ${dateStr} (${['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][dayOfWeek]})`);
      }
      
      // Tiến thêm 1 ngày
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log('Total calculated sessions:', dates.length);
    console.log('==================================');
    
    return dates;
  };

  // Lấy thông tin lớp học và các buổi đã điểm danh
  const fetchClassInfo = async () => {
    try {
      const response = await apiService.get<ClassInfo>(`/classes/${classId}/details`);
      setClassInfo(response);
      setTotalSessions(response.totalSessions);
      
      // Tính toán các ngày có buổi học
      const dates = calculateSessionDates(response);
      setSessionDates(dates);
      
      // Fetch attendance records trước để biết buổi nào đã điểm danh
      const attendedDates = await fetchAttendanceRecords(dates);
      
      // Tìm buổi đầu tiên chưa điểm danh hoặc buổi đầu tiên
      let targetDate = dates[0]; // Mặc định là buổi đầu tiên
      let targetSessionNumber = 1;
      
      for (let i = 0; i < dates.length; i++) {
        if (!attendedDates.has(dates[i])) {
          // Tìm thấy buổi chưa điểm danh
          targetDate = dates[i];
          targetSessionNumber = i + 1;
          break;
        }
      }
      
      // Nếu tất cả đã điểm danh, chọn buổi cuối
      if (attendedDates.size === dates.length) {
        targetDate = dates[dates.length - 1];
        targetSessionNumber = dates.length;
      }
      
      console.log('📅 Selected session date:', targetDate);
      console.log('📊 Session number:', targetSessionNumber);
      
      setSelectedDate(targetDate);
      setSessionNumber(targetSessionNumber);
      
    } catch (error) {
      console.error('Error fetching class info:', error);
      // Fallback to today if error
      setSelectedDate(new Date().toISOString().split('T')[0]);
    }
  };

  // Lấy danh sách các buổi đã điểm danh
  const fetchAttendanceRecords = async (dates: string[]): Promise<Set<string>> => {
    try {
      // Gọi API để lấy attendance của lớp
      const response = await apiService.get(`/attendance/class/${classId}`);
      
      // Tạo Set các ngày đã có attendance record
      const attendedDates = new Set<string>();
      if (Array.isArray(response)) {
        response.forEach((record: any) => {
          const date = record.date?.split('T')[0] || record.sessionDate?.split('T')[0];
          if (date && dates.includes(date)) {
            attendedDates.add(date);
          }
        });
      }
      
      setAttendedSessions(attendedDates);
      console.log('Attended sessions:', Array.from(attendedDates));
      return attendedDates;
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      // Không báo lỗi nếu không fetch được
      return new Set<string>();
    }
  };

  // Generate last 30 days for picker - REPLACED with actual class session dates
  const getSessionDates = () => {
    return sessionDates;
  };

  useEffect(() => {
    const initializeScreen = async () => {
      await fetchClassInfo(); // Load class info và chọn ngày trước
      // fetchClassStudents sẽ được gọi sau khi selectedDate được set
    };
    initializeScreen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gọi fetchClassStudents khi selectedDate thay đổi
  useEffect(() => {
    if (selectedDate) {
      console.log('📅 Selected date changed:', selectedDate);
      fetchClassStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchClassStudents = async () => {
    try {
      setLoading(true);
      console.log('\n========== FETCHING ENROLLMENTS ==========');
      console.log('🔍 Class ID:', classId);
      console.log('🔍 Class Name:', className);
      console.log('📍 Full URL:', `/classes/${classId}/enrollments`);
      
      // Check token
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token length:', token?.length || 0);
      
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('👤 User ID:', user._id);
        console.log('👤 User Role:', user.role);
        console.log('👤 User Name:', user.fullName);
      }
      
      // apiService.get already returns response.data
      console.log('📡 Calling API...');
      const enrollments = await apiService.get<any[]>(`/classes/${classId}/enrollments`);
      
      console.log('✅ API Response received');
      console.log('📊 Response type:', Array.isArray(enrollments) ? 'Array' : typeof enrollments);
      console.log('📏 Response length:', enrollments?.length || 0);
      console.log('📦 Raw response:', JSON.stringify(enrollments, null, 2));
      
      // Ensure enrollments is an array
      const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
      
      if (enrollmentsArray.length === 0) {
        console.warn('⚠️ No enrollments found!');
        console.warn('⚠️ Possible reasons:');
        console.warn('   1. No students enrolled in this class');
        console.warn('   2. All enrollments have paymentStatus != "paid"');
        console.warn('   3. User does not have permission to view this class');
        console.warn('   4. Class ID is incorrect');
      }
      
      // Filter only enrolled students with user data
      const enrolledStudents = enrollmentsArray.filter(
        (enrollment: any) => {
          console.log('🔍 Checking enrollment:', enrollment._id);
          console.log('   - Has user field:', !!enrollment.user);
          console.log('   - Has userId field:', !!enrollment.userId);
          
          if (enrollment.user) {
            console.log('   - user._id:', enrollment.user._id);
            console.log('   - user.fullName:', enrollment.user.fullName);
          }
          
          if (enrollment.userId) {
            console.log('   - userId._id:', enrollment.userId._id);
            console.log('   - userId.fullName:', enrollment.userId.fullName);
          }
          
          const hasUser = enrollment.user && enrollment.user._id;
          const hasUserId = enrollment.userId && enrollment.userId._id;
          
          if (!hasUser && !hasUserId) {
            console.warn('⚠️ Enrollment without valid user data:', enrollment._id);
            return false;
          }
          
          return true;
        }
      );
      
      console.log('👥 Total enrollments:', enrollmentsArray.length);
      console.log('👥 Valid students:', enrolledStudents.length);
      
      if (enrolledStudents.length > 0) {
        console.log('👤 First student:', JSON.stringify(enrolledStudents[0], null, 2));
      }
      
      // Check if session is locked by fetching attendance records
      let allLocked = false;
      const todayAttendance: { [key: string]: 'present' | 'absent' } = {};
      
      try {
        const attendanceRecords = await apiService.get<any[]>(`/attendance/class/${classId}`);
        const dateStr = selectedDate;
        
        console.log('📋 Attendance records:', attendanceRecords);
        
        // Filter records for selected date
        const dateRecords = (attendanceRecords || []).filter((record: any) => {
          const recordDate = record.sessionDate?.split('T')[0];
          return recordDate === dateStr;
        });
        
        console.log('📅 Records for date', dateStr, ':', dateRecords.length);
        
        // Check if all records are locked
        allLocked = dateRecords.length > 0 && dateRecords.every((record: any) => record.isLocked);
        
        // Map attendance records vào students
        enrolledStudents.forEach((student: Student) => {
          const userId = student.user?._id || student.userId?._id;
          
          // Tìm attendance record cho student này
          const attendanceRecord = dateRecords.find((record: any) => 
            record.userId?._id === userId || record.userId === userId
          );
          
          if (attendanceRecord) {
            console.log(`📝 Found attendance for ${student.user?.fullName || student.userId?.fullName}:`, {
              isPresent: attendanceRecord.isPresent,
              isLocked: attendanceRecord.isLocked
            });
            
            // Thêm attendance record vào student object
            if (!student.attendanceRecords) {
              student.attendanceRecords = [];
            }
            
            student.attendanceRecords.push({
              date: attendanceRecord.sessionDate,
              status: attendanceRecord.isPresent ? 'present' : 'absent',
              sessionDate: attendanceRecord.sessionDate,
              isLocked: attendanceRecord.isLocked,
              isPresent: attendanceRecord.isPresent,
              checkinTime: attendanceRecord.checkinTime
            });
            
            // Load vào state nếu chưa locked
            if (!attendanceRecord.isLocked) {
              todayAttendance[student._id] = attendanceRecord.isPresent ? 'present' : 'absent';
            }
          }
        });
        
        console.log('🔒 Session locked status:', allLocked);
      } catch (err) {
        console.log('Could not fetch attendance lock status:', err);
        allLocked = false;
      }
      
      setStudents(enrolledStudents);
      setIsSessionLocked(allLocked);
      setAttendanceStatus(todayAttendance);
      
      console.log('✅ Successfully loaded', enrolledStudents.length, 'students');
      console.log('==========================================\n');
      
    } catch (error: any) {
      console.error('\n========== ERROR DETAILS ==========');
      console.error('❌ Error type:', error.constructor.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      if (error.response) {
        console.error('📡 Response status:', error.response.status);
        console.error('📡 Response statusText:', error.response.statusText);
        console.error('📡 Response data:', JSON.stringify(error.response.data, null, 2));
        console.error('📡 Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('📡 Request was made but no response received');
        console.error('📡 Request:', error.request);
      } else {
        console.error('📡 Error setting up request:', error.message);
      }
      
      console.error('===================================\n');
      
      let errorMessage = 'Không thể tải danh sách học viên';
      
      if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền xem lớp này. Vui lòng kiểm tra lại tài khoản.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy lớp học. Vui lòng thử lại.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Lỗi khi lấy danh sách học viên',
        errorMessage + '\n\nVui lòng kiểm tra console log để biết chi tiết.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClassStudents();
  };

  const saveAllAttendance = async () => {
    try {
      // Kiểm tra user role
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('=== USER INFO ===');
        console.log('User:', user.fullName);
        console.log('Email:', user.email);
        console.log('Role:', user.role);
        console.log('Token exists:', !!token);
      }
      
      console.log('=== SAVING ATTENDANCE ===');
      console.log('Selected date:', selectedDate);
      console.log('Session number:', sessionNumber);
      console.log('Attendance status:', attendanceStatus);
      console.log('Students count:', students.length);
      console.log('Is session locked:', isSessionLocked);
      
      // Kiểm tra có dữ liệu không
      if (!selectedDate) {
        Alert.alert('Lỗi', 'Chưa chọn ngày điểm danh');
        return;
      }
      
      if (students.length === 0) {
        Alert.alert('Lỗi', 'Không có học viên nào trong lớp');
        return;
      }
      
      // Nếu session đã khóa thì không cho lưu
      if (isSessionLocked) {
        Alert.alert('Thông báo', 'Buổi học này đã khóa');
        return;
      }
      
      // Kiểm tra xem có ai được chọn điểm danh không
      if (Object.keys(attendanceStatus).length === 0) {
        Alert.alert('Thông báo', 'Vui lòng chọn trạng thái điểm danh cho ít nhất một học viên');
        return;
      }
      
      // Get list of attendance to save with userId - BỎ QUA records đã locked
      const attendanceData = Object.entries(attendanceStatus).map(([enrollmentId, status]) => {
        // Find the student by enrollment ID
        const student = students.find(s => s._id === enrollmentId);
        const userId = student?.user?._id || student?.userId?._id;
        
        // Check if this student's attendance is already locked
        const existingRecord = student?.attendanceRecords?.find(
          (record: any) => record.sessionDate?.split('T')[0] === selectedDate
        );
        
        if (existingRecord?.isLocked) {
          console.log(`Skipping locked attendance for enrollment ${enrollmentId}`);
          return null;
        }
        
        console.log(`Enrollment ${enrollmentId} -> User ${userId}`);
        
        if (!userId) {
          console.warn(`No userId found for enrollment ${enrollmentId}`);
          return null;
        }
        
        // Validate sessionDate
        if (!selectedDate) {
          console.error('No selectedDate available');
          return null;
        }
        
        const attendanceRecord = {
          classId,
          userId,
          sessionNumber,
          sessionDate: selectedDate, // Format: YYYY-MM-DD
          isPresent: status === 'present',
          notes: '',
        };
        
        console.log('Created attendance record:', attendanceRecord);
        
        return attendanceRecord;
      }).filter(item => item !== null);

      if (attendanceData.length === 0) {
        Alert.alert('Thông báo', 'Tất cả học viên đã được điểm danh và khóa');
        return;
      }

      console.log('Sending attendance data:', attendanceData);
      console.log('Number of records to save:', attendanceData.length);

      // Send individual requests since batch endpoint expects different format
      let successCount = 0;
      let errorCount = 0;
      let errorMessages: string[] = [];
      
      for (const attendance of attendanceData) {
        try {
          console.log('Sending request for:', attendance);
          const response = await apiService.post('/attendance/mark', attendance);
          console.log('Response:', response);
          successCount++;
        } catch (error: any) {
          console.error('❌ Error marking attendance:', error);
          console.error('   Error message:', error?.message);
          console.error('   Error response:', error?.response?.data);
          errorMessages.push(error?.message || 'Unknown error');
          errorCount++;
        }
      }

      console.log(`✅ Success: ${successCount}, ❌ Errors: ${errorCount}`);

      if (successCount === 0) {
        // Tất cả đều thất bại
        Alert.alert(
          'Lỗi', 
          `Không thể lưu điểm danh.\n\n${errorMessages.join('\n')}`
        );
        return;
      }

      if (successCount > 0) {
        // Khóa session sau khi lưu thành công
        console.log('🔒 Attempting to lock session...');
        console.log('   classId:', classId);
        console.log('   sessionDate:', selectedDate);
        
        try {
          const lockResponse = await apiService.post('/attendance/lock-session', {
            classId,
            sessionDate: selectedDate,
          });
          console.log('✅ Session locked successfully:', lockResponse);
          
          // Set locked state ngay lập tức
          setIsSessionLocked(true);
          
        } catch (lockErr: any) {
          console.error('❌ Error locking session:', lockErr);
          console.error('   Error message:', lockErr?.message);
          console.error('   Error response:', lockErr?.response?.data);
        }
        
        Alert.alert(
          'Thành công', 
          `Đã lưu và khóa điểm danh cho ${successCount} học viên${errorCount > 0 ? ` (${errorCount} lỗi)` : ''}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reload data để cập nhật UI
                fetchClassStudents();
              }
            }
          ]
        );
      } else {
        Alert.alert('Lỗi', 'Không thể lưu điểm danh');
      }
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      Alert.alert('Lỗi', error?.message || 'Không thể lưu điểm danh');
    }
  };

  const filteredStudents = students.filter((student) => {
    const userName = student.user?.fullName || student.userId?.fullName || '';
    return userName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderStudentItem = ({ item }: { item: Student }) => {
    // Check if this student has a locked attendance record for this date
    const existingRecord = item.attendanceRecords?.find(
      (record: any) => record.sessionDate?.split('T')[0] === selectedDate
    );
    
    const isRecordLocked = existingRecord?.isLocked;
    
    // If locked, use existing record data, otherwise use state
    let isPresent, isAbsent, hasStatus;
    
    if (isSessionLocked || isRecordLocked) {
      // Use data from existing record
      isPresent = existingRecord?.isPresent === true;
      // Nếu không có data hoặc isPresent = false thì coi là vắng
      isAbsent = existingRecord?.isPresent === false || !existingRecord?.isPresent;
      hasStatus = true; // Luôn có status (hoặc có mặt hoặc vắng)
    } else {
      // Use data from state
      const status = attendanceStatus[item._id];
      isPresent = status === 'present';
      isAbsent = status === 'absent';
      // Nếu chưa chọn gì, hiển thị UI như vắng nhưng không có status thật
      if (!status) {
        isAbsent = true; // Hiển thị UI vắng
        hasStatus = false; // Nhưng không count
      } else {
        hasStatus = true;
      }
    }
    
    const userName = item.user?.fullName || item.userId?.fullName || 'Unknown';
    const userEmail = item.user?.email || item.userId?.email || '';

    return (
      <View style={[
        styles.studentCard,
        isPresent && styles.studentCardPresent,
        isAbsent && styles.studentCardAbsent
      ]}>
        {/* Status indicator on the left */}
        {hasStatus && (
          <View style={[
            styles.statusIndicator,
            isPresent && styles.statusIndicatorPresent,
            isAbsent && styles.statusIndicatorAbsent
          ]} />
        )}
        
        <View style={styles.studentInfo}>
          <View style={styles.studentNameRow}>
            <View style={styles.nameWithIcon}>
              <Text style={styles.userIcon}>👤</Text>
              <Text style={styles.studentName} numberOfLines={1}>{userName}</Text>
            </View>
            {isPresent && <Text style={styles.statusEmoji}>✅</Text>}
            {isAbsent && <Text style={styles.statusEmoji}>❌</Text>}
            {(isSessionLocked || isRecordLocked) && (
              <View style={styles.lockedBadgeContainer}>
                <Text style={styles.lockedBadge}>🔒</Text>
              </View>
            )}
          </View>
          <Text style={styles.studentEmail} numberOfLines={1}>{userEmail}</Text>
        </View>

        {isSessionLocked || isRecordLocked ? (
          // Hiển thị trạng thái khi đã khóa (read-only)
          <View style={styles.lockedStatusContainer}>
            {isPresent && (
              <View style={[styles.lockedStatus, styles.lockedStatusPresent]}>
                <Text style={styles.lockedStatusIcon}>✓</Text>
                <Text style={styles.lockedStatusText}>Có mặt</Text>
              </View>
            )}
            {isAbsent && (
              <View style={[styles.lockedStatus, styles.lockedStatusAbsent]}>
                <Text style={styles.lockedStatusIconAbsent}>✕</Text>
                <Text style={styles.lockedStatusTextAbsent}>Vắng</Text>
              </View>
            )}
            {!hasStatus && (
              <View style={[styles.lockedStatus, styles.lockedStatusDefault]}>
                <Text style={styles.lockedStatusIconDefault}>⊘</Text>
                <Text style={styles.lockedStatusTextDefault}>Chưa điểm danh</Text>
              </View>
            )}
          </View>
        ) : (
          // Hiển thị buttons khi chưa khóa (có thể chỉnh sửa)
          <View style={styles.attendanceButtons}>
            <TouchableOpacity
              style={[
                styles.attendanceButton, 
                styles.presentButton, 
                isPresent && styles.presentActive
              ]}
              onPress={() => {
                if (isPresent) {
                  // Bỏ chọn nếu đã chọn
                  setAttendanceStatus((prev) => {
                    const newStatus = { ...prev };
                    delete newStatus[item._id];
                    return newStatus;
                  });
                } else {
                  // Chọn có mặt
                  setAttendanceStatus((prev) => ({
                    ...prev,
                    [item._id]: 'present',
                  }));
                }
              }}
            >
              <Text style={[styles.buttonText, isPresent && styles.buttonTextActive]}>
                {isPresent ? '✓' : ''} Có mặt
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.attendanceButton, 
                styles.absentButton, 
                isAbsent && styles.absentActive
              ]}
              onPress={() => {
                if (isAbsent) {
                  // Bỏ chọn nếu đã chọn
                  setAttendanceStatus((prev) => {
                    const newStatus = { ...prev };
                    delete newStatus[item._id];
                    return newStatus;
                  });
                } else {
                  // Chọn vắng
                  setAttendanceStatus((prev) => ({
                    ...prev,
                    [item._id]: 'absent',
                  }));
                }
              }}
            >
              <Text style={[styles.buttonText, isAbsent && styles.buttonTextActive]}>
                {isAbsent ? '✕' : ''} Vắng
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Đang tải danh sách học viên...</Text>
      </View>
    );
  }

  // Count từ cả state và locked records
  let presentCount = 0;
  let absentCount = 0;
  
  filteredStudents.forEach((student) => {
    const existingRecord = student.attendanceRecords?.find(
      (record: any) => record.sessionDate?.split('T')[0] === selectedDate
    );
    
    if (existingRecord?.isLocked) {
      // Nếu đã locked, count từ record
      if (existingRecord.isPresent === true) {
        presentCount++;
      } else if (existingRecord.isPresent === false) {
        absentCount++;
      }
    } else {
      // Nếu chưa locked, count từ state
      const status = attendanceStatus[student._id];
      if (status === 'present') {
        presentCount++;
      } else if (status === 'absent') {
        absentCount++;
      }
    }
  });

  // Check if có học viên nào chưa locked không
  const hasUnlockedStudents = filteredStudents.some((student) => {
    const existingRecord = student.attendanceRecords?.find(
      (record: any) => record.sessionDate?.split('T')[0] === selectedDate
    );
    return !existingRecord?.isLocked;
  });

  // Check if có bất kỳ học viên nào đã bị locked (buổi đã điểm danh)
  const hasAnyLockedStudent = filteredStudents.some((student) => {
    const existingRecord = student.attendanceRecords?.find(
      (record: any) => record.sessionDate?.split('T')[0] === selectedDate
    );
    return existingRecord?.isLocked === true;
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#581c87', '#1e40af']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>📝 Điểm danh</Text>
        <Text style={styles.headerSubtitle}>{className}</Text>
        
        {/* Date Selector */}
        <TouchableOpacity 
          style={styles.dateSelectorButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateSelectorIcon}>📅</Text>
          <View>
            <Text style={styles.dateSelectorLabel}>Ngày điểm danh:</Text>
            <Text style={styles.dateSelectorDate}>{selectedDate}</Text>
          </View>
          <Text style={styles.dateSelectorArrow}>▼</Text>
        </TouchableOpacity>

        {/* Session Info */}
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionText}>Buổi {sessionNumber}/{totalSessions}</Text>
        </View>
      </LinearGradient>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngày điểm danh</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.dateList}>
              {getSessionDates().map((date, index) => {
                const dateObj = new Date(date);
                const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                const dayName = dayNames[dateObj.getDay()];
                const isSelected = date === selectedDate;
                const isToday = date === new Date().toISOString().split('T')[0];
                const sessionNum = index + 1;
                const isPast = new Date(date) < new Date(new Date().toISOString().split('T')[0]);
                const isAttended = attendedSessions.has(date);
                
                // Lấy thời gian từ schedule
                let timeString = '';
                if (classInfo) {
                  const dayOfWeek = dateObj.getDay();
                  const scheduleItem = classInfo.schedule.find(s => s.dayOfWeek === dayOfWeek);
                  if (scheduleItem) {
                    timeString = `${scheduleItem.startTime} - ${scheduleItem.endTime}`;
                  }
                }
                
                return (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.dateItem, 
                      isSelected && styles.dateItemSelected,
                      isAttended && !isSelected && styles.dateItemAttended,
                      !isPast && !isToday && styles.dateItemFuture
                    ]}
                    onPress={() => {
                      setSelectedDate(date);
                      setSessionNumber(sessionNum);
                      setShowDatePicker(false);
                      fetchClassStudents();
                    }}
                  >
                    <View style={styles.dateItemLeft}>
                      <View style={[
                        styles.sessionBadge,
                        isAttended && styles.sessionBadgeAttended,
                        isSelected && styles.sessionBadgeSelected
                      ]}>
                        <Text style={[
                          styles.sessionBadgeText, 
                          isAttended && styles.sessionBadgeTextAttended,
                          isSelected && styles.sessionBadgeTextSelected
                        ]}>
                          #{sessionNum}
                        </Text>
                      </View>
                      <View>
                        <View style={styles.dateItemRow}>
                          <Text style={[styles.dateItemDay, isSelected && styles.dateItemTextSelected]}>
                            {dayName}
                          </Text>
                          <Text style={[styles.dateItemDate, isSelected && styles.dateItemTextSelected]}>
                            {date}
                          </Text>
                        </View>
                        {timeString && (
                          <Text style={[styles.dateItemTime, isSelected && styles.dateItemTimeSelected]}>
                            ⏰ {timeString}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.dateItemRight}>
                      {isAttended && !isSelected && (
                        <View style={styles.attendedBadge}>
                          <Text style={styles.attendedIcon}>✓</Text>
                          <Text style={styles.attendedText}>Đã điểm danh</Text>
                        </View>
                      )}
                      {isToday && !isAttended && (
                        <View style={styles.todayBadge}>
                          <Text style={styles.todayText}>Hôm nay</Text>
                        </View>
                      )}
                      {!isPast && !isToday && !isAttended && (
                        <View style={styles.futureBadge}>
                          <Text style={styles.futureText}>Sắp tới</Text>
                        </View>
                      )}
                      {isSelected && <Text style={styles.checkMark}>▶</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{students.length}</Text>
          <Text style={styles.summaryLabel}>Tổng số</Text>
        </View>
        <View style={[styles.summaryItem, styles.presentSummary]}>
          <Text style={styles.summaryNumber}>{presentCount}</Text>
          <Text style={styles.summaryLabel}>Có mặt</Text>
        </View>
        <View style={[styles.summaryItem, styles.absentSummary]}>
          <Text style={styles.summaryNumber}>{absentCount}</Text>
          <Text style={styles.summaryLabel}>Vắng</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm học viên..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
        />
      </View>

      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ec4899" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>Chưa có học viên nào</Text>
          </View>
        }
      />

      {!isSessionLocked && !hasAnyLockedStudent && hasUnlockedStudents && filteredStudents.length > 0 && (
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveAllAttendance}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#ec4899', '#d946ef']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>💾 Lưu điểm danh</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {(isSessionLocked || hasAnyLockedStudent || !hasUnlockedStudents) && filteredStudents.length > 0 && (
        <View style={styles.lockedMessageContainer}>
          <Text style={styles.lockedMessageIcon}>🔒</Text>
          <Text style={styles.lockedMessageText}>
            Buổi học này đã hoàn thành điểm danh
          </Text>
        </View>
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
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
  },
  header: {
    padding: 16,
    paddingTop: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  dateSelectorButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  dateSelectorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  dateSelectorLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  dateSelectorDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  dateSelectorArrow: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 'auto',
  },
  sessionInfo: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  sessionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fce7f3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e1b4b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  modalClose: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '300',
  },
  dateList: {
    padding: 16,
  },
  dateItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateItemSelected: {
    backgroundColor: '#ec4899',
  },
  dateItemAttended: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  dateItemFuture: {
    opacity: 0.6,
  },
  dateItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dateItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sessionBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  sessionBadgeAttended: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  sessionBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sessionBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a78bfa',
  },
  sessionBadgeTextAttended: {
    color: '#10b981',
  },
  sessionBadgeTextSelected: {
    color: '#fff',
  },
  dateItemDay: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    width: 30,
  },
  dateItemDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  dateItemTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  dateItemTimeSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dateItemTextSelected: {
    color: '#fff',
  },
  dateItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  todayText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },
  attendedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attendedIcon: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '700',
  },
  attendedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },
  futureBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  futureText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6',
  },
  checkMark: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#1e1b4b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  presentSummary: {
    backgroundColor: '#065f46',
  },
  absentSummary: {
    backgroundColor: '#991b1b',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  studentCard: {
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    position: 'relative',
  },
  studentCardPresent: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderLeftColor: '#10b981',
  },
  studentCardAbsent: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftColor: '#ef4444',
  },
  statusIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  statusIndicatorPresent: {
    backgroundColor: '#10b981',
  },
  statusIndicatorAbsent: {
    backgroundColor: '#ef4444',
  },
  studentInfo: {
    flex: 1,
    marginRight: 8,
  },
  studentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  nameWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  userIcon: {
    fontSize: 16,
    opacity: 0.7,
    flexShrink: 0,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    flexShrink: 1,
  },
  statusEmoji: {
    fontSize: 16,
  },
  studentEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  attendanceButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 80,
    alignItems: 'center',
  },
  presentButton: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  presentActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  absentButton: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  absentActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  buttonTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonGradientDisabled: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  lockedBadgeContainer: {
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fbbf24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexShrink: 0,
  },
  lockedBadge: {
    fontSize: 12,
    color: '#fbbf24',
  },
  lockedStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 130,
  },
  lockedStatusPresent: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  lockedStatusAbsent: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  lockedStatusDefault: {
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
    borderWidth: 2,
    borderColor: '#94a3b8',
  },
  lockedStatusIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  lockedStatusIconAbsent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  lockedStatusIconDefault: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  lockedStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10b981',
  },
  lockedStatusTextAbsent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
  },
  lockedStatusTextDefault: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
  },
  lockedMessageContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6b7280',
  },
  lockedMessageIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  lockedMessageText: {
    fontSize: 14,
    color: '#e5e7eb',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 48,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default AttendanceManagementScreen;
