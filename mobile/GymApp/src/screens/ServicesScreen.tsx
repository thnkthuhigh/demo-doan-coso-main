import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../services/api';

interface Service {
  _id: string;
  name: string;
  description: string;
  image: string;
}

const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: '🏋️', colors: ['#ec4899', '#ef4444'] },
  { id: 'gym', name: 'Gym', icon: '💪', colors: ['#3b82f6', '#6366f1'] },
  { id: 'yoga', name: 'Yoga', icon: '🧘', colors: ['#10b981', '#059669'] },
  { id: 'cardio', name: 'Cardio', icon: '🏃', colors: ['#f59e0b', '#ea580c'] },
  { id: 'boxing', name: 'Boxing', icon: '🥊', colors: ['#ef4444', '#dc2626'] },
  { id: 'dance', name: 'Dance', icon: '💃', colors: ['#8b5cf6', '#7c3aed'] },
];

const ServicesScreen = ({ navigation }: any) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await apiService.get('/services');
      setServices(response as Service[]);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const filteredServices = useMemo(() => {
    let filtered = services;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          service.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      const categoryKeyword = selectedCategory.toLowerCase();
      filtered = filtered.filter((service) =>
        service.name.toLowerCase().includes(categoryKeyword) ||
        service.description?.toLowerCase().includes(categoryKeyword)
      );
    }

    return filtered;
  }, [services, searchQuery, selectedCategory]);

  const handleServicePress = (service: Service) => {
    // Navigate to Classes tab with service filter
    console.log('🎯 Navigating to Classes with service:', service._id, service.name);
    navigation.navigate('Classes', {
      selectedService: service._id,
      serviceName: service.name,
    });
  };

  const renderServiceCard = (service: Service, index: number) => {
    const gradients = [
      ['#ec4899', '#ef4444'],
      ['#3b82f6', '#8b5cf6'],
      ['#10b981', '#059669'],
      ['#fbbf24', '#f59e0b'],
    ];
    const gradient = gradients[index % gradients.length];

    return (
      <TouchableOpacity
        key={service._id}
        onPress={() => handleServicePress(service)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.serviceCard}
        >
          <Image
            source={{ uri: service.image }}
            style={styles.serviceImage}
            resizeMode="cover"
          />
          <View style={styles.serviceOverlay} />
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDescription} numberOfLines={2}>
              {service.description}
            </Text>
            <View style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>Xem lớp học →</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Đang tải dịch vụ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.mainScrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#ec4899"
          />
        }
      >
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm dịch vụ..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedCategory === category.id ? category.colors : ['#1e1b4b', '#1e1b4b']}
                style={styles.categoryChip}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryText}>{category.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            🎯 Tìm thấy {filteredServices.length} dịch vụ
          </Text>
        </View>

        <View style={styles.servicesContainer}>
          {filteredServices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>Không tìm thấy dịch vụ nào</Text>
              <Text style={styles.emptySubtext}>Thử tìm kiếm với từ khóa khác</Text>
            </View>
          ) : (
            filteredServices.map((service, index) => renderServiceCard(service, index))
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
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
  },
  mainScrollContent: {
    paddingTop: 16,
  },
  servicesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  serviceCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  serviceImage: {
    width: '100%',
    height: 220,
  },
  serviceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  serviceInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 48,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  serviceDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 12,
  },
  viewDetailsButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  viewDetailsText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  clearIcon: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.6)',
    padding: 6,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  resultsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
});

export default ServicesScreen;
