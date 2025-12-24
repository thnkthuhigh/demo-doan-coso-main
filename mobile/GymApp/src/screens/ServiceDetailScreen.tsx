import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ServiceDetail {
  _id: string;
  name: string;
  description: string;
  image: string;
  price?: number;
  duration?: string;
  features?: string[];
}

const ServiceDetailScreen = ({ route, navigation }: any) => {
  const { serviceId } = route.params;
  const { user } = useAuth();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const fetchServiceDetail = useCallback(async () => {
    try {
      const response = await apiService.get(`/services/${serviceId}`);
      setService(response as ServiceDetail);
    } catch (error) {
      console.error('Error fetching service detail:', error);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchServiceDetail();
  }, [fetchServiceDetail]);

  const handleRegister = async () => {
    if (!user?._id) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để đăng ký dịch vụ');
      return;
    }

    Alert.alert(
      'Thêm vào giỏ hàng',
      `Thêm dịch vụ "${service?.name}" vào giỏ hàng?\n\nGiá: ${service?.price?.toLocaleString('vi-VN') || 'Liên hệ'}đ`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thêm vào giỏ',
          onPress: async () => {
            try {
              setRegistering(true);
              
              // Thêm dịch vụ vào giỏ hàng (tạo đăng ký chưa thanh toán)
              await apiService.post('/services/register', {
                serviceId: service?._id,
                userId: user._id,
              });
              
              Alert.alert(
                'Thành công',
                'Đã thêm dịch vụ vào giỏ hàng!',
                [
                  { text: 'Tiếp tục xem', style: 'cancel' },
                  { 
                    text: 'Xem giỏ hàng', 
                    onPress: () => navigation.navigate('Cart')
                  }
                ]
              );
            } catch (error: any) {
              console.error('Add to cart error:', error);
              Alert.alert(
                'Lỗi',
                error?.response?.data?.message || 'Không thể thêm vào giỏ hàng'
              );
            } finally {
              setRegistering(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy dịch vụ</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: service.image }}
        style={styles.headerImage}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <Text style={styles.serviceName}>{service.name}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{service.description}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="cube-outline" size={24} color="#581c87" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Dịch vụ</Text>
              <Text style={styles.infoValue}>{service.name}</Text>
            </View>
          </View>
          
          {service.price && (
            <View style={styles.infoRow}>
              <Icon name="pricetag-outline" size={24} color="#10b981" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Giá dịch vụ</Text>
                <Text style={styles.priceValue}>
                  {service.price.toLocaleString('vi-VN')}đ
                </Text>
              </View>
            </View>
          )}
          
          {service.duration && (
            <View style={styles.infoRow}>
              <Icon name="time-outline" size={24} color="#3b82f6" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Thời gian</Text>
                <Text style={styles.infoValue}>{service.duration}</Text>
              </View>
            </View>
          )}
        </View>

        {service.features && service.features.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Đặc điểm nổi bật</Text>
            {service.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Icon name="checkmark-circle" size={20} color="#10b981" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          onPress={handleRegister}
          disabled={registering}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#ec4899', '#ef4444', '#f97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.registerButton}
          >
            {registering ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon name="cart" size={24} color="#FFFFFF" />
                <Text style={styles.registerButtonText}>Thêm vào giỏ hàng</Text>
                <Icon name="arrow-forward" size={24} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#E0E0E0',
  },
  content: {
    padding: 20,
  },
  serviceName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 20,
    color: '#10b981',
    fontWeight: 'bold',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 8,
  },
  featureText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  registerButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
    gap: 12,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ServiceDetailScreen;
