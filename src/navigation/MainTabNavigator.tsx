import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { TabParamList } from '../types';
import { useSelector } from 'react-redux';

// Direct imports - no lazy loading to prevent download indicators
import HomeScreen from '../screens/HomeScreen';
import TasksScreen from '../screens/TasksScreen';
import HabitsScreen from '../screens/HabitsScreen';
import MeditationScreen from '../screens/MeditationScreenNew';
import ProfileScreen from '../screens/ProfileScreen';
import ProgressScreen from '../screens/ProgressScreen';

// Types for the store state
type RootState = {
  user: {
    user: any;
  };
};

const Tab = createBottomTabNavigator<TabParamList>();

const MainTabNavigator: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const isDarkMode = user?.preferences?.theme === 'dark';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Tasks':
              iconName = 'check-circle';
              break;
            case 'Habits':
              iconName = 'timeline';
              break;
            case 'Meditation':
              iconName = 'spa';
              break;
            case 'Progress':
              iconName = 'show-chart';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'home';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4ECDC4',
        tabBarInactiveTintColor: isDarkMode ? '#999' : 'gray',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#2A2A2A' : 'white',
          borderTopWidth: 1,
          borderTopColor: isDarkMode ? '#3A3A3A' : '#f0f0f0',
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Habits" component={HabitsScreen} />
      <Tab.Screen name="Meditation" component={MeditationScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
