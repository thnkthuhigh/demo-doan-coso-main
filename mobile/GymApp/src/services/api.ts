import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: CONFIG.API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            console.warn('No token found in AsyncStorage');
          }
        } catch (error) {
          console.error('Error getting token from AsyncStorage:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          // You can navigate to login screen here
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      console.log('🚀 API Request:', config.method, config.url);
      console.log('📍 Base URL:', CONFIG.API_BASE_URL);
      const response = await this.api.request<T>(config);
      console.log('✅ API Response:', config.method, config.url, '- Status:', response.status);
      return response.data;
    } catch (error: any) {
      console.error('❌ API Request Error:', error);
      console.error('🔍 Error details:', {
        url: config.url,
        method: config.method,
        hasResponse: !!error.response,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      
      // Extract meaningful error message
      if (error.response) {
        // Server responded with error
        const message = error.response.data?.message || error.response.data?.error || 'Lỗi từ server';
        console.error('Server Error:', message);
        throw new Error(message);
      } else if (error.request) {
        // Request made but no response
        console.error('No response received');
        console.error('Request details:', error.request);
        throw new Error('Không thể kết nối đến server');
      } else {
        // Error setting up request
        console.error('Request setup error:', error.message);
        throw new Error(error.message || 'Lỗi không xác định');
      }
    }
  }

  // GET request
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  // POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  // PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  // PATCH request
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  // DELETE request
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}

export default new ApiService();
