import apiService from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';
import { AuthResponse, User } from '../types';

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        CONFIG.ENDPOINTS.AUTH.LOGIN,
        { email, password }
      );

      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(name: string, email: string, password: string, phone?: string): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        CONFIG.ENDPOINTS.AUTH.REGISTER,
        { name, email, password, phone }
      );

      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  }

  async getProfile(): Promise<User> {
    try {
      const response = await apiService.get<{ user: User }>(
        CONFIG.ENDPOINTS.AUTH.PROFILE
      );
      
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      throw error;
    }
  }

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token');
  }

  async getStoredUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  async storeUser(user: User): Promise<void> {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }
}

export default new AuthService();
