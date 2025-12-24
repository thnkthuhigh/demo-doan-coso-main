import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

interface Stats {
  totalClasses: number;
  totalAttendance: number;
  attendanceRate: number;
  totalPayments: number;
  totalSpent: number;
  currentStreak: number;
  longestStreak: number;
  monthlyAttendance: Array<{ month: string; count: number }>;
  recentActivities: Array<{
    date: string;
    type: string;
    description: string;
  }>;
}

const StatisticsScreen = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const userId = (user as any)?._id || (user as any)?.id;
      const userRole = (user as any)?.role;
      
      if (!userId) return;

      // Call different API based on role
      const endpoint = userRole === 'trainer' 
        ? `/stats/instructor/${userId}`
        : `/stats/user/${userId}`;

      console.log('Fetching stats for role:', userRole, 'from:', endpoint);
      const response = await apiService.get(endpoint);
      setStats(response as Stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default empty stats
      setStats({
        totalClasses: 0,
        totalAttendance: 0,
        attendanceRate: 0,
        totalPayments: 0,
        totalSpent: 0,
        currentStreak: 0,
        longestStreak: 0,
        monthlyAttendance: [],
        recentActivities: [],
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const renderStatCard = (icon: string, title: string, value: string | number, subtitle?: string) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderProgressBar = (percentage: number, color: string) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${Math.min(percentage, 100)}%`, backgroundColor: color }]} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Đang tải thống kê...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
   
    
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'week' && styles.periodTextActive]}>
            Tuần
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'month' && styles.periodTextActive]}>
            Tháng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'year' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('year')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'year' && styles.periodTextActive]}>
            Năm
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        {renderStatCard(
          '💪', 
          (user as any)?.role === 'trainer' ? 'Lớp đã dạy' : 'Lớp đã đăng ký', 
          stats?.totalClasses || 0
        )}
        {renderStatCard(
          '✅', 
          (user as any)?.role === 'trainer' ? 'Buổi đã dạy' : 'Buổi đã tập', 
          stats?.totalAttendance || 0
        )}
        {renderStatCard('🔥', 'Streak hiện tại', `${stats?.currentStreak || 0} ngày`)}
        {renderStatCard(
          '💰', 
          (user as any)?.role === 'trainer' ? 'Tổng thu nhập' : 'Tổng chi tiêu', 
          `${(stats?.totalSpent || 0).toLocaleString('vi-VN')}đ`
        )}
      </View>

      {/* Attendance Rate */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Tỷ Lệ Tham Gia</Text>
        <View style={styles.attendanceCard}>
          <View style={styles.attendanceHeader}>
            <Text style={styles.attendancePercentage}>
              {Math.round(stats?.attendanceRate || 0)}%
            </Text>
            <Text style={styles.attendanceLabel}>
              {stats?.totalAttendance || 0}/{stats?.totalClasses || 0} buổi
            </Text>
          </View>
          {renderProgressBar(stats?.attendanceRate || 0, '#4CAF50')}
          <Text style={styles.attendanceNote}>
            {(stats?.attendanceRate || 0) >= 80 
              ? '🎉 Tuyệt vời! Bạn rất chăm chỉ!'
              : (stats?.attendanceRate || 0) >= 50
              ? '💪 Tốt lắm! Tiếp tục phát huy!'
              : '📢 Hãy cố gắng tham gia nhiều hơn nhé!'}
          </Text>
        </View>
      </View>

      {/* Streak Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Chuỗi Ngày Tập</Text>
        <View style={styles.streakCard}>
          <View style={styles.streakItem}>
            <Text style={styles.streakIcon}>🔥</Text>
            <View>
              <Text style={styles.streakValue}>{stats?.currentStreak || 0} ngày</Text>
              <Text style={styles.streakLabel}>Streak hiện tại</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.streakItem}>
            <Text style={styles.streakIcon}>🏆</Text>
            <View>
              <Text style={styles.streakValue}>{stats?.longestStreak || 0} ngày</Text>
              <Text style={styles.streakLabel}>Kỷ lục của bạn</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Monthly Chart (Simple Bar Chart) */}
      {stats?.monthlyAttendance && stats.monthlyAttendance.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Hoạt Động Theo Tháng</Text>
          <View style={styles.chartContainer}>
            {stats.monthlyAttendance.slice(-6).map((item, index) => {
              const maxCount = Math.max(...stats.monthlyAttendance.map(m => m.count), 1);
              const heightPercentage = (item.count / maxCount) * 100;
              
              return (
                <View key={index} style={styles.chartBar}>
                  <Text style={styles.chartValue}>{item.count}</Text>
                  <View style={styles.chartBarWrapper}>
                    <View 
                      style={[
                        styles.chartBarFill, 
                        { height: `${heightPercentage}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.chartLabel}>{item.month}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Recent Activities */}
      {stats?.recentActivities && stats.recentActivities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 Hoạt Động Gần Đây</Text>
          {stats.recentActivities.slice(0, 5).map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>
                  {activity.type === 'attendance' ? '✅' : 
                   activity.type === 'payment' ? '💰' : 
                   activity.type === 'enrollment' ? '📚' : '📌'}
                </Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityDate}>
                  {new Date(activity.date).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Thành Tích</Text>
        <View style={styles.achievementsGrid}>
          <View style={[styles.achievementCard, (stats?.totalAttendance || 0) >= 10 && styles.achievementUnlocked]}>
            <Text style={styles.achievementIcon}>🥉</Text>
            <Text style={styles.achievementText}>10 buổi</Text>
          </View>
          <View style={[styles.achievementCard, (stats?.totalAttendance || 0) >= 50 && styles.achievementUnlocked]}>
            <Text style={styles.achievementIcon}>🥈</Text>
            <Text style={styles.achievementText}>50 buổi</Text>
          </View>
          <View style={[styles.achievementCard, (stats?.totalAttendance || 0) >= 100 && styles.achievementUnlocked]}>
            <Text style={styles.achievementIcon}>🥇</Text>
            <Text style={styles.achievementText}>100 buổi</Text>
          </View>
          <View style={[styles.achievementCard, (stats?.currentStreak || 0) >= 7 && styles.achievementUnlocked]}>
            <Text style={styles.achievementIcon}>🔥</Text>
            <Text style={styles.achievementText}>7 ngày liên tiếp</Text>
          </View>
          <View style={[styles.achievementCard, (stats?.currentStreak || 0) >= 30 && styles.achievementUnlocked]}>
            <Text style={styles.achievementIcon}>💎</Text>
            <Text style={styles.achievementText}>30 ngày liên tiếp</Text>
          </View>
          <View style={[styles.achievementCard, (stats?.totalClasses || 0) >= 5 && styles.achievementUnlocked]}>
            <Text style={styles.achievementIcon}>📚</Text>
            <Text style={styles.achievementText}>5 lớp học</Text>
          </View>
        </View>
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
  header: {    padding: 16,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#ec4899',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  periodTextActive: {
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  attendanceCard: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  attendancePercentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10b981',
  },
  attendanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  attendanceNote: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  streakCard: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakIcon: {
    fontSize: 36,
  },
  streakValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  streakLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  chartContainer: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 220,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  chartValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  chartBarWrapper: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBarFill: {
    width: '70%',
    backgroundColor: '#10b981',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: (width - 48) / 3,
    aspectRatio: 1,
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  achievementUnlocked: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOpacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 24,
  },
});

export default StatisticsScreen;
