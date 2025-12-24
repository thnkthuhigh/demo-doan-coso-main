import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

interface Goal {
  _id: string;
  title: string;
  description?: string;
  type: 'attendance' | 'weight' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  progress: number;
}

interface GoalStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  failedGoals: number;
  completionRate: number;
}

const GoalsScreen = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [updateValue, setUpdateValue] = useState('');

  // New goal form
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'custom',
    targetValue: '',
    unit: 'buổi',
    endDate: '',
  });

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const userId = (user as any)?._id || (user as any)?.id;
      if (!userId) return;

      const statusQuery = filterStatus === 'all' ? '' : `?status=${filterStatus}`;
      const response = await apiService.get(`/goals/user/${userId}${statusQuery}`);
      setGoals(response as Goal[]);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [user, filterStatus]);

  const fetchStats = useCallback(async () => {
    try {
      const userId = (user as any)?._id || (user as any)?.id;
      if (!userId) return;

      const response = await apiService.get(`/goals/user/${userId}/stats`);
      setStats(response as GoalStats);
    } catch (error) {
      console.error('Error fetching goal stats:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
    fetchStats();
  }, [fetchGoals, fetchStats]);

  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.targetValue || !newGoal.endDate) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const targetNum = parseFloat(newGoal.targetValue);
    if (isNaN(targetNum) || targetNum <= 0) {
      Alert.alert('Lỗi', 'Mục tiêu phải là số dương');
      return;
    }

    try {
      await apiService.post('/goals', {
        title: newGoal.title,
        description: newGoal.description,
        type: newGoal.type,
        targetValue: targetNum,
        unit: newGoal.unit,
        endDate: new Date(newGoal.endDate).toISOString(),
      });

      Alert.alert('Thành công', 'Mục tiêu đã được tạo!');
      setShowAddModal(false);
      setNewGoal({
        title: '',
        description: '',
        type: 'custom',
        targetValue: '',
        unit: 'buổi',
        endDate: '',
      });
      fetchGoals();
      fetchStats();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo mục tiêu');
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedGoal) return;

    const num = parseFloat(updateValue);
    if (isNaN(num) || num < 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số hợp lệ');
      return;
    }

    try {
      await apiService.patch(`/goals/${selectedGoal._id}/progress`, { currentValue: num });
      Alert.alert('Thành công', 'Đã cập nhật tiến độ');
      setShowUpdateModal(false);
      setSelectedGoal(null);
      setUpdateValue('');
      fetchGoals();
      fetchStats();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật tiến độ');
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa mục tiêu này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.delete(`/goals/${goalId}`);
              Alert.alert('Thành công', 'Đã xóa mục tiêu');
              fetchGoals();
              fetchStats();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa mục tiêu');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'active': return '#2196F3';
      default: return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'failed': return 'Thất bại';
      case 'active': return 'Đang thực hiện';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const renderGoalCard = (goal: Goal) => {
    const daysLeft = Math.ceil((new Date(goal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;

    return (
      <View key={goal._id} style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalTitleContainer}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(goal.status) }]}>
              <Text style={styles.statusText}>{getStatusText(goal.status)}</Text>
            </View>
          </View>
          {goal.status === 'active' && (
            <TouchableOpacity onPress={() => handleDeleteGoal(goal._id)}>
              <Text style={styles.deleteButton}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>

        {goal.description && (
          <Text style={styles.goalDescription}>{goal.description}</Text>
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${goal.progress}%`, backgroundColor: getStatusColor(goal.status) }]} />
          </View>
          <Text style={styles.progressText}>{goal.progress}%</Text>
        </View>

        <View style={styles.goalStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Hiện tại</Text>
            <Text style={styles.statValue}>{goal.currentValue} {goal.unit}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Mục tiêu</Text>
            <Text style={styles.statValue}>{goal.targetValue} {goal.unit}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Thời hạn</Text>
            <Text style={[styles.statValue, isExpiringSoon && styles.warningText]}>
              {daysLeft > 0 ? `${daysLeft} ngày` : 'Hết hạn'}
            </Text>
          </View>
        </View>

        {goal.status === 'active' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => {
                setSelectedGoal(goal);
                setUpdateValue(goal.currentValue.toString());
                setShowUpdateModal(true);
              }}
            >
              <Text style={styles.updateButtonText}>📊 Cập nhật tiến độ</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading && goals.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Đang tải mục tiêu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#581c87', '#1e40af', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🎯 Mục Tiêu Của Tôi</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Thêm</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Overview */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeGoals}</Text>
            <Text style={styles.statCardLabel}>Đang thực hiện</Text>
          </View>
          <View style={styles.statCard}>
            {/* eslint-disable-next-line react-native/no-inline-styles */}
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.completedGoals}</Text>
            <Text style={styles.statCardLabel}>Hoàn thành</Text>
          </View>
          <View style={styles.statCard}>
            {/* eslint-disable-next-line react-native/no-inline-styles */}
            <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.completionRate}%</Text>
            <Text style={styles.statCardLabel}>Tỷ lệ thành công</Text>
          </View>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'active' && styles.filterTabActive]}
          onPress={() => setFilterStatus('active')}
        >
          <Text style={[styles.filterText, filterStatus === 'active' && styles.filterTextActive]}>
            Đang thực hiện
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'completed' && styles.filterTabActive]}
          onPress={() => setFilterStatus('completed')}
        >
          <Text style={[styles.filterText, filterStatus === 'completed' && styles.filterTextActive]}>
            Hoàn thành
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'all' && styles.filterTabActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {goals.length > 0 ? (
          goals.map(renderGoalCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>Chưa có mục tiêu nào</Text>
            <Text style={styles.emptySubtext}>Hãy tạo mục tiêu đầu tiên của bạn!</Text>
          </View>
        )}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo mục tiêu mới</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.inputLabel}>Tiêu đề *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Tập 20 buổi trong tháng"
                value={newGoal.title}
                onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
              />

              <Text style={styles.inputLabel}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả chi tiết về mục tiêu..."
                multiline
                numberOfLines={3}
                value={newGoal.description}
                onChangeText={(text) => setNewGoal({ ...newGoal, description: text })}
              />

              <Text style={styles.inputLabel}>Giá trị mục tiêu *</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="20"
                  keyboardType="numeric"
                  value={newGoal.targetValue}
                  onChangeText={(text) => setNewGoal({ ...newGoal, targetValue: text })}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="buổi"
                  value={newGoal.unit}
                  onChangeText={(text) => setNewGoal({ ...newGoal, unit: text })}
                />
              </View>

              <Text style={styles.inputLabel}>Thời hạn *</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY (31/12/2025)"
                value={newGoal.endDate}
                onChangeText={(text) => setNewGoal({ ...newGoal, endDate: text })}
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateGoal}
              >
                <Text style={styles.submitButtonText}>Tạo mục tiêu</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Update Progress Modal */}
      <Modal
        visible={showUpdateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUpdateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.updateModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cập nhật tiến độ</Text>
              <TouchableOpacity onPress={() => setShowUpdateModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {selectedGoal && (
                <>
                  <Text style={styles.updateModalLabel}>
                    {selectedGoal.title}
                  </Text>
                  <Text style={styles.updateModalSubtext}>
                    Nhập giá trị hiện tại ({selectedGoal.unit}):
                  </Text>
                  <TextInput
                    style={styles.updateInput}
                    placeholder={selectedGoal.currentValue.toString()}
                    keyboardType="numeric"
                    value={updateValue}
                    onChangeText={setUpdateValue}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleUpdateProgress}
                  >
                    <Text style={styles.submitButtonText}>Cập nhật</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
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
    color: 'rgba(255,255,255,0.7)',
  },
  header: {
    padding: 20,
    paddingTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e1b4b',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterTabActive: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  filterText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  goalCard: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    fontSize: 20,
    padding: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    width: 45,
    textAlign: 'right',
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  warningText: {
    color: '#f59e0b',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  bottomSpacing: {
    height: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1e1b4b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.7)',
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#ec4899',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  updateModalContainer: {
    backgroundColor: '#1e1b4b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  updateModalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  updateModalSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
  },
  updateInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
});

export default GoalsScreen;
