import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import TrainerNavigator from './TrainerNavigator';
import ClassDetailScreen from '../screens/ClassDetailScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import ClubDetailScreen from '../screens/ClubDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AttendanceCheckInScreen from '../screens/AttendanceCheckInScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import GymFinderScreen from '../screens/GymFinderScreen';
import BodyMetricsScreen from '../screens/BodyMetricsScreen';
import CartScreen from '../screens/CartScreen';
import TrainerClassesScreen from '../screens/TrainerClassesScreen';
import AttendanceManagementScreen from '../screens/AttendanceManagementScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import AttendanceDetailScreen from '../screens/AttendanceDetailScreen';
import MyClassesScreen from '../screens/MyClassesScreen';
import { RootStackParamList } from './types';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen 
              name="Main" 
              component={user?.role === 'trainer' ? TrainerNavigator : MainNavigator} 
            />
            <Stack.Screen name="ClassDetail" component={ClassDetailScreen} />
            <Stack.Screen 
              name="ServiceDetail" 
              component={ServiceDetailScreen}
              options={{ headerShown: true, title: 'Chi tiết dịch vụ' }}
            />
            <Stack.Screen 
              name="ClubDetail" 
              component={ClubDetailScreen}
              options={{ headerShown: true, title: 'Chi tiết câu lạc bộ' }}
            />
            <Stack.Screen 
              name="History" 
              component={HistoryScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AttendanceCheckIn" 
              component={AttendanceCheckInScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Statistics" 
              component={StatisticsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Calendar" 
              component={CalendarScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="QRScanner" 
              component={QRScannerScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="ChatList" 
              component={ChatListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="ChatDetail" 
              component={ChatDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="GymFinder" 
              component={GymFinderScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="BodyMetrics" 
              component={BodyMetricsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Cart" 
              component={CartScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
              options={{ headerShown: true, title: 'Chỉnh sửa hồ sơ' }}
            />
            <Stack.Screen 
              name="ChangePassword" 
              component={ChangePasswordScreen}
              options={{ headerShown: true, title: 'Đổi mật khẩu' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ headerShown: true, title: 'Cài đặt' }}
            />
            <Stack.Screen 
              name="TrainerClasses" 
              component={TrainerClassesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AttendanceManagement" 
              component={AttendanceManagementScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AttendanceHistory" 
              component={AttendanceHistoryScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AttendanceDetail" 
              component={AttendanceDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="MyClasses" 
              component={MyClassesScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
