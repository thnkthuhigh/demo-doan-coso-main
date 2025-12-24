import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../screens/ProfileScreen';
import TrainerClassesScreen from '../screens/TrainerClassesScreen';
import CalendarScreen from '../screens/CalendarScreen';
import StatisticsScreen from '../screens/StatisticsScreen';

const Tab = createBottomTabNavigator();

const iconStyles = StyleSheet.create({
  icon: {
    fontSize: 24,
  },
});

const ClassesIcon = () => <Text style={iconStyles.icon}>📚</Text>;
const CalendarIcon = () => <Text style={iconStyles.icon}>📅</Text>;
const StatsIcon = () => <Text style={iconStyles.icon}>📊</Text>;
const ProfileIcon = () => <Text style={iconStyles.icon}>👤</Text>;

const TrainerNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#d946ef',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarStyle: {
          backgroundColor: '#1e1b4b',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: '#1e1b4b',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="TrainerClasses"
        component={TrainerClassesScreen}
        options={{
          title: 'Lớp học',
          tabBarIcon: ClassesIcon,
          headerTitle: 'Quản lý lớp học',
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: 'Lịch dạy',
          tabBarIcon: CalendarIcon,
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: 'Thống kê',
          tabBarIcon: StatsIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export default TrainerNavigator;
