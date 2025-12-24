import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import authService from '../services/auth';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    fullName: string,
    email: string,
    password: string,
    phone: string,
    address: string,
    dob: string,
    gender: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = await authService.getStoredToken();
      console.log('checkAuth - Token exists:', !!token);
      
      if (token) {
        // Try to get profile from server to verify token
        try {
          const userData = await authService.getProfile();
          console.log('checkAuth - Profile fetched successfully:', userData);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('checkAuth - Profile fetch failed, token may be invalid:', error);
          // Token is invalid, clear storage
          await authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('checkAuth - No token found');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Check auth error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    username: string,
    fullName: string,
    email: string,
    password: string,
    phone: string,
    address: string,
    dob: string,
    gender: string
  ) => {
    try {
      const response = await authService.register(
        username,
        fullName,
        email,
        password,
        phone,
        address,
        dob,
        gender
      );
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const updatedUser = await authService.getProfile();
      setUser(updatedUser);
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      setUser(updatedUser);
      // Also save to AsyncStorage for persistence
      await authService.storeUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
