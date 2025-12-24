import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

interface BodyMetrics {
  _id: string;
  date: string;
  weight: number;
  height?: number;
  bmi?: number;
  bodyFat?: number;
  muscleMass?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    biceps?: number;
    thighs?: number;
    calves?: number;
  };
  notes?: string;
}

interface Stats {
  totalEntries: number;
  currentWeight: number;
  currentBMI: number;
  currentBMICategory: string;
  totalWeightChange: number;
  lowestWeight: number;
  highestWeight: number;
}

const BodyMetricsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<BodyMetrics[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    bodyFat: '',
    muscleMass: '',
    chest: '',
    waist: '',
    hips: '',
    biceps: '',
    thighs: '',
    calves: '',
    notes: '',
  });

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const userId = (user as any)?._id || (user as any)?.id;
      const response = await apiService.get(`/body-metrics/user/${userId}?limit=30`);
      const data = response as any;
      
      setMetrics(data.data || []);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching body metrics:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu số đo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
  };

  const handleSubmit = async () => {
    if (!formData.weight) {
      Alert.alert('Lỗi', 'Vui lòng nhập cân nặng');
      return;
    }

    try {
      const payload: any = {
        weight: parseFloat(formData.weight),
        date: new Date(),
      };

      if (formData.height) payload.height = parseFloat(formData.height);
      if (formData.bodyFat) payload.bodyFat = parseFloat(formData.bodyFat);
      if (formData.muscleMass) payload.muscleMass = parseFloat(formData.muscleMass);
      if (formData.notes) payload.notes = formData.notes;

      const measurements: any = {};
      if (formData.chest) measurements.chest = parseFloat(formData.chest);
      if (formData.waist) measurements.waist = parseFloat(formData.waist);
      if (formData.hips) measurements.hips = parseFloat(formData.hips);
      if (formData.biceps) measurements.biceps = parseFloat(formData.biceps);
      if (formData.thighs) measurements.thighs = parseFloat(formData.thighs);
      if (formData.calves) measurements.calves = parseFloat(formData.calves);

      if (Object.keys(measurements).length > 0) {
        payload.measurements = measurements;
      }

      await apiService.post('/body-metrics', payload);
      
      Alert.alert('Thành công', 'Đã lưu số đo thành công');
      setShowAddForm(false);
      resetForm();
      fetchMetrics();
    } catch (error) {
      console.error('Error saving body metrics:', error);
      Alert.alert('Lỗi', 'Không thể lưu số đo');
    }
  };

  const resetForm = () => {
    setFormData({
      weight: '',
      height: '',
      bodyFat: '',
      muscleMass: '',
      chest: '',
      waist: '',
      hips: '',
      biceps: '',
      thighs: '',
      calves: '',
      notes: '',
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa số đo này?',
      [
        { 
          text: 'Hủy', 
          style: 'cancel',
          onPress: () => console.log('Cancel delete')
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting metric ID:', id);
              await apiService.delete(`/body-metrics/${id}`);
              Alert.alert('Thành công', 'Đã xóa số đo');
              fetchMetrics();
            } catch (error) {
              console.error('❌ Error deleting metric:', error);
              Alert.alert('Lỗi', 'Không thể xóa số đo');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getBMIColor = (bmi?: number) => {
    if (!bmi) return '#999';
    if (bmi < 18.5) return '#3b82f6'; // Thiếu cân
    if (bmi < 25) return '#10b981'; // Bình thường
    if (bmi < 30) return '#f59e0b'; // Thừa cân
    return '#ef4444'; // Béo phì
  };

  const getRecommendations = () => {
    if (!stats) return null;

    const { currentBMI, totalWeightChange } = stats;
    const recommendations = {
      status: '',
      color: '',
      icon: '',
      exercises: [] as string[],
      nutrition: [] as string[],
      tips: [] as string[],
    };

    if (currentBMI < 18.5) {
      // Thiếu cân
      recommendations.status = 'Thiếu cân - Cần tăng cơ bắp';
      recommendations.color = '#3b82f6';
      recommendations.icon = '📈';
      recommendations.exercises = [
        '🏋️ Tập tạ tập trung vào nhóm cơ lớn (squat, deadlift, bench press)',
        '💪 Tập với trọng lượng nặng, ít hiệp (8-12 lần/hiệp)',
        '🎯 Giảm cardio, tập trung xây dựng cơ bắp',
      ];
      recommendations.nutrition = [
        '🍗 Ăn thặng calories (+300-500 cal/ngày)',
        '🥩 Protein cao (1.6-2.2g/kg cơ thể)',
        '🍚 Carb phức hợp (gạo lứt, yến mạch, khoai lang)',
      ];
      recommendations.tips = [
        '💤 Ngủ đủ 7-9 tiếng để cơ phục hồi',
        '📊 Theo dõi calories và tăng dần',
      ];
    } else if (currentBMI >= 18.5 && currentBMI < 25) {
      // Bình thường
      recommendations.status = 'Cân nặng lý tưởng - Duy trì & Săn chắc';
      recommendations.color = '#10b981';
      recommendations.icon = '✨';
      recommendations.exercises = [
        '🏋️ Kết hợp tập tạ và cardio cân bằng',
        '🔥 HIIT 2-3 lần/tuần để đốt mỡ',
        '💪 Tập cơ toàn thân 3-4 lần/tuần',
      ];
      recommendations.nutrition = [
        '⚖️ Ăn đủ calories duy trì (TDEE)',
        '🥗 Cân bằng protein, carb, fat',
        '🥤 Uống đủ nước 2-3 lít/ngày',
      ];
      recommendations.tips = [
        '📈 Tập trung tăng sức mạnh và sức bền',
        '🎯 Đặt mục tiêu nâng tạ nặng hơn',
      ];
    } else if (currentBMI >= 25 && currentBMI < 30) {
      // Thừa cân
      recommendations.status = 'Thừa cân - Cần giảm mỡ';
      recommendations.color = '#f59e0b';
      recommendations.icon = '⚠️';
      recommendations.exercises = [
        '🏃 Cardio 4-5 lần/tuần (chạy, đạp xe, bơi)',
        '🔥 HIIT để tăng tốc đốt mỡ',
        '💪 Tập tạ duy trì cơ bắp (3 lần/tuần)',
      ];
      recommendations.nutrition = [
        '📉 Ăn thiếu calories (-300-500 cal/ngày)',
        '🥗 Tăng rau xanh, giảm carb tinh chế',
        '🥩 Giữ protein cao để bảo vệ cơ',
        '🚫 Tránh đồ ngọt, đồ chiên, nước ngọt',
      ];
      recommendations.tips = [
        '📊 Theo dõi calories mỗi ngày',
        '⏰ Ăn đúng giờ, không bỏ bữa',
        '🚶 Tăng hoạt động hàng ngày (đi bộ, leo cầu thang)',
      ];
    } else {
      // Béo phì
      recommendations.status = 'Béo phì - Ưu tiên giảm cân';
      recommendations.color = '#ef4444';
      recommendations.icon = '🚨';
      recommendations.exercises = [
        '🚶 Bắt đầu với đi bộ nhanh 30-45 phút/ngày',
        '🏊 Bơi lội, đạp xe (ít tác động lên khớp)',
        '💪 Tập tạ nhẹ để duy trì cơ',
        '⚠️ Tránh tập quá sức, tăng dần cường độ',
      ];
      recommendations.nutrition = [
        '🥗 Ăn thiếu calories (-500-700 cal/ngày)',
        '🥩 Protein rất cao để giữ cơ',
        '🥦 Nhiều rau xanh, ít tinh bột',
        '🚫 Cắt hoàn toàn đồ chiên, fastfood, nước ngọt',
      ];
      recommendations.tips = [
        '👨‍⚕️ Nên tham khảo ý kiến chuyên gia dinh dưỡng',
        '📊 Theo dõi cân nặng hàng tuần',
        '🎯 Mục tiêu giảm 0.5-1kg/tuần là an toàn',
        '💪 Kiên trì là chìa khóa thành công!',
      ];
    }

    return recommendations;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#581c87', '#1e40af', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Số đo cơ thể</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text style={styles.addButtonText}>{showAddForm ? '✕' : '+'}</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Add Form */}
        {showAddForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>➕ Thêm số đo mới</Text>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>⚖️ Cân nặng (kg) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.weight}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  keyboardType="numeric"
                  placeholder="70"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>📏 Chiều cao (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.height}
                  onChangeText={(text) => setFormData({ ...formData, height: text })}
                  keyboardType="numeric"
                  placeholder="170"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>💧 Body Fat (%)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.bodyFat}
                  onChangeText={(text) => setFormData({ ...formData, bodyFat: text })}
                  keyboardType="numeric"
                  placeholder="18"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>💪 Cơ bắp (%)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.muscleMass}
                  onChangeText={(text) => setFormData({ ...formData, muscleMass: text })}
                  keyboardType="numeric"
                  placeholder="40"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>📐 Số đo vòng (cm)</Text>
            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ngực</Text>
                <TextInput
                  style={styles.input}
                  value={formData.chest}
                  onChangeText={(text) => setFormData({ ...formData, chest: text })}
                  keyboardType="numeric"
                  placeholder="95"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Eo</Text>
                <TextInput
                  style={styles.input}
                  value={formData.waist}
                  onChangeText={(text) => setFormData({ ...formData, waist: text })}
                  keyboardType="numeric"
                  placeholder="75"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Mông</Text>
                <TextInput
                  style={styles.input}
                  value={formData.hips}
                  onChangeText={(text) => setFormData({ ...formData, hips: text })}
                  keyboardType="numeric"
                  placeholder="95"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tay</Text>
                <TextInput
                  style={styles.input}
                  value={formData.biceps}
                  onChangeText={(text) => setFormData({ ...formData, biceps: text })}
                  keyboardType="numeric"
                  placeholder="35"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Đùi</Text>
                <TextInput
                  style={styles.input}
                  value={formData.thighs}
                  onChangeText={(text) => setFormData({ ...formData, thighs: text })}
                  keyboardType="numeric"
                  placeholder="55"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Bắp chân</Text>
                <TextInput
                  style={styles.input}
                  value={formData.calves}
                  onChangeText={(text) => setFormData({ ...formData, calves: text })}
                  keyboardType="numeric"
                  placeholder="38"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <Text style={styles.label}>📝 Ghi chú</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
              numberOfLines={3}
              placeholder="Ghi chú về chế độ ăn, tập luyện..."
              placeholderTextColor="#999"
            />

            <View style={styles.formButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddForm(false)}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>💾 Lưu số đo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Stats Summary */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.currentWeight} kg</Text>
              <Text style={styles.statLabel}>Cân nặng hiện tại</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: getBMIColor(stats.currentBMI) }]}>
                {stats.currentBMI?.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>{stats.currentBMICategory}</Text>
            </View>
            <View style={styles.statCard}>
              <Text
                style={[
                  styles.statValue,
                  stats.totalWeightChange < 0 ? styles.weightDecrease : styles.weightIncrease,
                ]}
              >
                {stats.totalWeightChange > 0 ? '+' : ''}
                {stats.totalWeightChange.toFixed(1)} kg
              </Text>
              <Text style={styles.statLabel}>Thay đổi</Text>
            </View>
          </View>
        )}

        {/* Recommendations Section */}
        {stats && getRecommendations() && (
          <View style={styles.recommendationsContainer}>
            <View style={styles.recommendationsHeader}>
              <Text style={styles.recommendationsIcon}>{getRecommendations()!.icon}</Text>
              <Text style={[styles.recommendationsTitle, { color: getRecommendations()!.color }]}>
                {getRecommendations()!.status}
              </Text>
            </View>

            {/* Exercises */}
            <View style={styles.recommendationSection}>
              <Text style={styles.recommendationSectionTitle}>🏋️ Gợi ý tập luyện:</Text>
              {getRecommendations()!.exercises.map((exercise, index) => (
                <Text key={index} style={styles.recommendationItem}>
                  • {exercise}
                </Text>
              ))}
            </View>

            {/* Nutrition */}
            <View style={styles.recommendationSection}>
              <Text style={styles.recommendationSectionTitle}>🍽️ Dinh dưỡng:</Text>
              {getRecommendations()!.nutrition.map((item, index) => (
                <Text key={index} style={styles.recommendationItem}>
                  • {item}
                </Text>
              ))}
            </View>

            {/* Tips */}
            <View style={styles.recommendationSection}>
              <Text style={styles.recommendationSectionTitle}>💡 Lời khuyên:</Text>
              {getRecommendations()!.tips.map((tip, index) => (
                <Text key={index} style={styles.recommendationItem}>
                  • {tip}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* History List */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>📊 Lịch sử số đo</Text>
          {metrics.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📏</Text>
              <Text style={styles.emptyText}>Chưa có dữ liệu số đo</Text>
              <Text style={styles.emptySubText}>Thêm số đo đầu tiên của bạn!</Text>
            </View>
          ) : (
            metrics.map((metric) => (
              <View key={metric._id} style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricDate}>📅 {formatDate(metric.date)}</Text>
                  <TouchableOpacity 
                    onPress={() => {
                      console.log('🔴 DELETE PRESSED:', metric._id);
                      handleDelete(metric._id);
                    }}
                    style={styles.deleteButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.metricBody}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>⚖️ Cân nặng:</Text>
                    <Text style={styles.metricValue}>{metric.weight} kg</Text>
                  </View>
                  {metric.bmi && (
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>📊 BMI:</Text>
                      <Text style={[styles.metricValue, { color: getBMIColor(metric.bmi) }]}>
                        {metric.bmi.toFixed(1)}
                      </Text>
                    </View>
                  )}
                  {metric.bodyFat && (
                    <View style={styles.metricRow}>
                      <Text style={styles.metricLabel}>💧 Body Fat:</Text>
                      <Text style={styles.metricValue}>{metric.bodyFat}%</Text>
                    </View>
                  )}
                  {metric.measurements && (
                    <View style={styles.measurements}>
                      {metric.measurements.chest && (
                        <Text style={styles.measurementText}>
                          Ngực: {metric.measurements.chest}cm
                        </Text>
                      )}
                      {metric.measurements.waist && (
                        <Text style={styles.measurementText}>
                          Eo: {metric.measurements.waist}cm
                        </Text>
                      )}
                      {metric.measurements.hips && (
                        <Text style={styles.measurementText}>
                          Mông: {metric.measurements.hips}cm
                        </Text>
                      )}
                    </View>
                  )}
                  {metric.notes && (
                    <Text style={styles.metricNotes}>📝 {metric.notes}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 28,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#1e1b4b',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 10,
    marginBottom: 10,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  formGroup: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ec4899',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e1b4b',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  weightDecrease: {
    color: '#10b981',
  },
  weightIncrease: {
    color: '#ef4444',
  },
  historyContainer: {
    padding: 15,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  metricCard: {
    backgroundColor: '#1e1b4b',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  metricDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  deleteButton: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 20,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  deleteButtonPressed: {
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
  },
  metricBody: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  measurements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  measurementText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metricNotes: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    marginTop: 8,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  recommendationsContainer: {
    margin: 16,
    marginTop: 0,
    backgroundColor: 'rgba(30, 27, 75, 0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  recommendationsIcon: {
    fontSize: 28,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  recommendationSection: {
    marginBottom: 16,
  },
  recommendationSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    marginBottom: 6,
    paddingLeft: 8,
  },
});

export default BodyMetricsScreen;
