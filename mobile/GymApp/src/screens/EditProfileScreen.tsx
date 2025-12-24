import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import imageUploadService from '../services/imageUpload';

const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Get avatar URI and ensure it's a string
  const getAvatarUri = () => {
    const avatar = (user as any)?.avatar || (user as any)?.profilePicture;
    if (!avatar) return null;
    if (typeof avatar === 'string') return avatar;
    if (typeof avatar === 'object' && avatar.uri) return avatar.uri;
    if (typeof avatar === 'object' && avatar.url) return avatar.url;
    return null;
  };
  
  const [avatarUri, setAvatarUri] = useState<string | null>(getAvatarUri());
  
  const [formData, setFormData] = useState({
    fullName: (user as any)?.fullName || user?.name || '',
    email: user?.email || '',
    phone: (user as any)?.phone || '',
    dob: (user as any)?.dob || '',
    gender: (user as any)?.gender || '',
  });

  const handlePickAvatar = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Lỗi', 'Không thể chọn ảnh');
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        return;
      }

      setUploadingAvatar(true);
      
      // Upload lên Cloudinary qua backend
      const avatarUrl = await imageUploadService.uploadAvatar(asset.uri);
      
      // Cập nhật user profile với avatar mới
      const userId = (user as any)?._id || (user as any)?.id;
      await imageUploadService.updateUserAvatar(userId, avatarUrl);
      
      // Cập nhật local state
      setAvatarUri(avatarUrl);
      
      // Cập nhật context
      if (updateUser) {
        updateUser({ ...user, avatar: avatarUrl } as any);
      }
      
      Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải ảnh lên');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Sử dụng endpoint /profile để user tự cập nhật profile (không cần quyền admin)
      await apiService.put('/users/profile', formData);
      
      // Cập nhật context với thông tin mới
      if (updateUser) {
        updateUser({ ...user, ...formData } as any);
      }
      
      Alert.alert('Thành công', 'Đã cập nhật thông tin cá nhân', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật thông tin';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#581c87', '#1e40af']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {((user as any)?.fullName || user?.name)?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            {uploadingAvatar && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color="#fff" size="large" />
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.changeAvatarButton}
            onPress={handlePickAvatar}
            disabled={uploadingAvatar}
          >
            <LinearGradient
              colors={['#ec4899', '#ef4444']}
              style={styles.changeAvatarGradient}
            >
              <Text style={styles.changeAvatarIcon}>📷</Text>
              <Text style={styles.changeAvatarText}>Đổi ảnh</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Thông tin cá nhân</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              placeholder="Nhập họ tên"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="default"
              underlineColorAndroid="transparent"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Nhập email"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="phone-pad"
              underlineColorAndroid="transparent"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày sinh</Text>
            <TextInput
              style={styles.input}
              value={formData.dob}
              onChangeText={(text) => setFormData({ ...formData, dob: text })}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              underlineColorAndroid="transparent"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'male' && styles.genderButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, gender: 'male' })}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    formData.gender === 'male' && styles.genderButtonTextActive,
                  ]}
                >
                  👨 Nam
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'female' && styles.genderButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, gender: 'female' })}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    formData.gender === 'female' && styles.genderButtonTextActive,
                  ]}
                >
                  👩 Nữ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderButton,
                  formData.gender === 'other' && styles.genderButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, gender: 'other' })}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    formData.gender === 'other' && styles.genderButtonTextActive,
                  ]}
                >
                  ⚧ Khác
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Bảo mật</Text>
          
          <TouchableOpacity
            style={styles.securityButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.securityButtonIcon}>🔑</Text>
            <Text style={styles.securityButtonText}>Đổi mật khẩu</Text>
            <Text style={styles.securityButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.saveButtonIcon}>💾</Text>
                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
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
    backgroundColor: '#0f172a',
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  changeAvatarGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  changeAvatarIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  changeAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  genderButtonActive: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  genderButtonTextActive: {
    color: '#FFF',
  },
  securityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  securityButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  securityButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  securityButtonArrow: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  saveButton: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
