import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import apiService from '../services/api';

interface Club {
  _id: string;
  name: string;
  address: string;
  description: string;
  image: string;
}

const ClubsScreen = ({ navigation }: any) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await apiService.get('/clubs');
      setClubs(response as Club[]);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClubs();
  };

  const handleClubPress = (club: Club) => {
    navigation.navigate('ClubDetail', { clubId: club._id });
  };

  const renderClubCard = (club: Club) => (
    <TouchableOpacity
      key={club._id}
      style={styles.clubCard}
      onPress={() => handleClubPress(club)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: club.image }}
        style={styles.clubImage}
        resizeMode="cover"
      />
      <View style={styles.clubInfo}>
        <Text style={styles.clubName}>{club.name}</Text>
        <View style={styles.addressContainer}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.clubAddress} numberOfLines={1}>
            {club.address}
          </Text>
        </View>
        <Text style={styles.clubDescription} numberOfLines={2}>
          {club.description}
        </Text>
        <View style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Đang tải câu lạc bộ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Câu Lạc Bộ</Text>
        <Text style={styles.headerSubtitle}>
          Khám phá các chi nhánh của chúng tôi
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {clubs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có câu lạc bộ nào</Text>
          </View>
        ) : (
          clubs.map(renderClubCard)
        )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 48,
  },
  clubCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clubImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E0E0E0',
  },
  clubInfo: {
    padding: 16,
  },
  clubName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  clubAddress: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
    flex: 1,
  },
  clubDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  viewDetailsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  arrow: {
    fontSize: 20,
    color: '#FF6B35',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default ClubsScreen;
