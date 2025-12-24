import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../services/api';

const { width } = Dimensions.get('window');
const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

interface CalendarEvent {
  _id: string;
  date: string;
  type: 'class' | 'attendance' | 'membership';
  title: string;
  time?: string;
  status?: string;
  location?: string;
  className?: string;
  sessionNumber?: number;
}

const CalendarScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug: Check token
      const token = await AsyncStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('User:', user);
      
      if (!token) {
        console.warn('No token found - user may not be logged in');
        setError(null); // Don't show error, just show empty calendar
        setEvents([]);
        setLoading(false);
        return;
      }
      
      const userId = (user as any)?._id || (user as any)?.id;
      
      if (!userId) {
        console.warn('No user ID found');
        setError(null); // Don't show error for guest users
        setEvents([]);
        setLoading(false);
        return;
      }

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      console.log('Fetching calendar events for:', { userId, year, month });
      const response = await apiService.get(`/calendar/user/${userId}?year=${year}&month=${month}`);
      console.log('Calendar events received:', response);
      setEvents(response as CalendarEvent[]);
    } catch (err: any) {
      console.error('Error fetching calendar events:', err);
      console.error('Error details:', err?.message || err);
      
      let errorMessage = 'Không thể tải lịch tập';
      if (err?.message?.includes('Token') || err?.message?.includes('token')) {
        errorMessage = 'Phiên đăng nhập hết hạn';
      } else if (err?.message?.includes('kết nối') || err?.message?.includes('Network')) {
        errorMessage = 'Không thể kết nối đến server';
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user, currentDate]);

  useEffect(() => {
    fetchCalendarEvents();
  }, [fetchCalendarEvents]);

  // Refresh calendar khi quay lại màn hình (sau khi điểm danh)
  useFocusEffect(
    useCallback(() => {
      console.log('Calendar screen focused - refreshing events...');
      fetchCalendarEvents();
    }, [fetchCalendarEvents])
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelectedDate = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const calendarDays = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const hasEvents = dayEvents.length > 0;
      const hasAttendance = dayEvents.some(e => e.type === 'attendance');

      calendarDays.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isToday(date) && styles.todayCell,
            isSelectedDate(date) && styles.selectedCell,
          ]}
          onPress={() => setSelectedDate(date)}
        >
          <Text
            style={[
              styles.dayText,
              isToday(date) && styles.todayText,
              isSelectedDate(date) && styles.selectedText,
            ]}
          >
            {day}
          </Text>
          {hasEvents && (
            <View style={styles.eventIndicator}>
              {hasAttendance && <View style={styles.attendanceDot} />}
              {dayEvents.length > 1 && (
                <Text style={styles.eventCount}>{dayEvents.length}</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return calendarDays;
  };

  const changeMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const renderEventsList = () => {
    if (!selectedDate) {
      // Không hiển thị gì khi chưa chọn ngày
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyText}>Chọn một ngày để xem lịch dạy</Text>
          <Text style={styles.emptySubText}>
            Nhấn vào ngày trên lịch để xem chi tiết
          </Text>
        </View>
      );
    }

    // Show events for selected date
    const dayEvents = getEventsForDate(selectedDate);

    if (dayEvents.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyText}>
            Không có sự kiện vào ngày {selectedDate.getDate()}/{selectedDate.getMonth() + 1}
          </Text>
          <TouchableOpacity 
            style={styles.clearSelectionButton}
            onPress={() => setSelectedDate(null)}
          >
            <Text style={styles.clearSelectionText}>Xem sự kiện sắp tới</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        <View style={styles.selectedDateHeader}>
          <Text style={styles.selectedDateTitle}>
            📅 Ngày {selectedDate.getDate()}/{selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => setSelectedDate(null)}>
            <Text style={styles.clearSelectionButton2}>✕</Text>
          </TouchableOpacity>
        </View>
        {dayEvents.map(renderEventItem)}
      </View>
    );
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'class': return '📚';
      case 'attendance': return '✅';
      case 'membership': return '💳';
      default: return '📌';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'class': return '#2196F3';
      case 'attendance': return '#4CAF50';
      case 'membership': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const renderEventItem = (event: CalendarEvent) => {
    const eventDate = new Date(event.date);
    const isTodayEvent = new Date().toDateString() === eventDate.toDateString();

    const handleEventPress = async () => {
      // Nếu là lớp dạy, hiển thị chi tiết
      if (event.title.startsWith('Dạy:')) {
        const className = event.title.replace('Dạy: ', '');
        
        // Extract class ID from event._id (format: classId-date-class)
        const classId = event._id.split('-')[0];
        
        // Get date from selectedDate instead of event.date to avoid timezone issues
        const dateOnly = selectedDate 
          ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
          : event.date.split('T')[0];
        
        // Nếu đã điểm danh, hiển thị chi tiết điểm danh
        if (event.type === 'attendance') {
          // Navigate to AttendanceDetailScreen
          navigation.navigate('AttendanceDetail', {
            classId: classId,
            className: className,
            date: dateOnly,
            sessionNumber: event.sessionNumber || 1,
          });
        } else {
          // Chưa điểm danh, hiển thị thông tin lớp học
          Alert.alert(
            `📚 ${className}`,
            `📍 Địa điểm: ${event.location || 'Phòng tập chính'}\n` +
            `⏰ Thời gian: ${event.time || 'Chưa xác định'}\n` +
            `📅 Ngày: ${eventDate.getDate()}/${eventDate.getMonth() + 1}/${eventDate.getFullYear()}`,
            [
              {
                text: 'Xem điểm danh',
                onPress: () => {
                  // Vẫn đến AttendanceDetailScreen để xem và sửa
                  navigation.navigate('AttendanceDetail', {
                    classId: classId,
                    className: className,
                    date: dateOnly,
                    sessionNumber: event.sessionNumber || 1,
                  });
                }
              },
              { text: 'Đóng', style: 'cancel' }
            ]
          );
        }
      } else {
        // Hiển thị thông tin event khác
        Alert.alert(
          event.title,
          `📅 ${eventDate.getDate()}/${eventDate.getMonth() + 1}/${eventDate.getFullYear()}\n` +
          `⏰ ${event.time || 'Cả ngày'}`,
          [{ text: 'OK' }]
        );
      }
    };

    return (
      <TouchableOpacity
        key={event._id}
        style={styles.eventItem}
        onPress={handleEventPress}
      >
        <View style={[styles.eventIconContainer, { backgroundColor: getEventColor(event.type) }]}>
          <Text style={styles.eventIcon}>{getEventIcon(event.type)}</Text>
        </View>
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.eventMeta}>
            <Text style={styles.eventDate}>
              {eventDate.getDate()}/{eventDate.getMonth() + 1}/{eventDate.getFullYear()}
              {isTodayEvent && ' • Hôm nay'}
            </Text>
            {event.time && (
              <Text style={styles.eventTime}> • {event.time}</Text>
            )}
          </View>
          {event.status && (
            <View style={[styles.statusBadge, event.status === 'completed' && styles.completedBadge]}>
              <Text style={styles.statusText}>
                {event.status === 'completed' ? '✓ Đã hoàn thành' : event.status}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && events.length === 0 && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Đang tải lịch...</Text>
      </View>
    );
  }

  if (error && !loading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Không thể tải lịch</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchCalendarEvents}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#581c87', '#1e40af', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>📅 Lịch Tập</Text>
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>Hôm nay</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthButton}>
          <Text style={styles.monthButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthButton}>
          <Text style={styles.monthButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarContainer}>
        {/* Day Headers */}
        <View style={styles.daysHeader}>
          {DAYS.map(day => (
            <View key={day} style={styles.dayHeaderCell}>
              <Text style={styles.dayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Days */}
        <View style={styles.calendarGrid}>
          {renderCalendar()}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          {/* eslint-disable-next-line react-native/no-inline-styles */}
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Đã điểm danh</Text>
        </View>
        <View style={styles.legendItem}>
          {/* eslint-disable-next-line react-native/no-inline-styles */}
          <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
          <Text style={styles.legendText}>Lớp học</Text>
        </View>
        <View style={styles.legendItem}>
          {/* eslint-disable-next-line react-native/no-inline-styles */}
          <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.legendText}>Membership</Text>
        </View>
      </View>

      {/* Events List */}
      <View style={styles.eventsContainer}>
        {renderEventsList()}
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
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
    color: 'rgba(255,255,255,0.7)',
  },
  header: {
    padding: 16,
    paddingTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  todayButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  todayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1e1b4b',
  },
  monthButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  monthButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  calendarContainer: {
    backgroundColor: '#1e1b4b',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderCell: {
    width: (width - 80) / 7,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (width - 80) / 7,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  todayCell: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    borderWidth: 2,
    borderColor: '#ec4899',
  },
  selectedCell: {
    backgroundColor: '#ec4899',
  },
  dayText: {
    fontSize: 14,
    color: '#fff',
  },
  todayText: {
    color: '#ec4899',
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  attendanceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10b981',
  },
  eventCount: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1e1b4b',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  eventsContainer: {
    paddingHorizontal: 16,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  upcomingEventsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a78bfa',
    marginBottom: 12,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ec4899',
  },
  clearSelectionButton: {
    marginTop: 12,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearSelectionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearSelectionButton2: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 12,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  eventIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventIcon: {
    fontSize: 24,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  eventTime: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
  },
  completedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 8,
  },
  bottomSpacing: {
    height: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 20,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fetchingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

export default CalendarScreen;
